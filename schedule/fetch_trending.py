#!/usr/bin/env python3
import os
import sys
import datetime
import uuid
import json
import requests
import psycopg2
from dotenv import load_dotenv

# 1. Load environment variables from script directory, CWD, or project root
script_dir = os.path.dirname(os.path.abspath(__file__))
cwd = os.getcwd()
parent_dir = os.path.dirname(script_dir)

load_dotenv(os.path.join(script_dir, '.env'))
load_dotenv(os.path.join(cwd, '.env'))
load_dotenv(os.path.join(parent_dir, '.env'))

def clean_env(name, default=""):
    val = os.getenv(name, default)
    if not val:
        return default
    val = val.strip()
    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
        val = val[1:-1]
    return val.strip()

DATABASE_URL = clean_env('DATABASE_URL')
GITHUB_TOKEN = clean_env('GITHUB_TOKEN')
AI_API_KEY = clean_env('AI_API_KEY')
AI_API_BASE = clean_env('AI_API_BASE', 'https://api.openai.com/v1')
AI_MODEL = clean_env('AI_MODEL', 'gpt-4o-mini')

if not DATABASE_URL:
    print("Error: DATABASE_URL env variable not found.")
    sys.exit(1)

# Clean up schema query param for psycopg2 compatibility (e.g. ?schema=public -> throws invalid dsn)
if '?' in DATABASE_URL:
    base_url, query_str = DATABASE_URL.split('?', 1)
    params = query_str.split('&')
    cleaned_params = [p for p in params if not p.startswith('schema=')]
    if cleaned_params:
        DATABASE_URL = base_url + '?' + '&'.join(cleaned_params)
    else:
        DATABASE_URL = base_url

def get_monday_utc():
    now = datetime.datetime.now(datetime.timezone.utc)
    weekday = now.weekday()
    monday = now - datetime.timedelta(days=weekday)
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)

def generate_summaries(repo_name, description, topics, api_key, api_base, model):
    try:
        prompt = f"""You are an expert software engineer. Summarize the following trending GitHub repository.
Repository: {repo_name}
Description: {description or 'No description.'}
Topics: {', '.join(topics) if topics else 'None'}

Provide:
1. A concise, professional summary in Chinese (summaryZh) of what this repository does and why it is trending (maximum 2 sentences, 80 characters).
2. A concise, professional summary in English (summaryEn) of what this repository does and why it is trending (maximum 2 sentences, 150 characters).

Response format: Return ONLY a valid JSON object with keys "summaryZh" and "summaryEn". No markdown wrapping or other text."""

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "response_format": {"type": "json_object"}
        }
        
        url = f"{api_base.rstrip('/')}/chat/completions"
        res = requests.post(url, headers=headers, json=payload, timeout=20)
        
        if res.status_code != 200:
            print(f"  [AI Summary] API returned error {res.status_code}: {res.text}")
            return None, None
            
        data = res.json()
        content = data['choices'][0]['message']['content'].strip()
        
        # Clean markdown wrapper if any
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        parsed = json.loads(content)
        return parsed.get("summaryZh"), parsed.get("summaryEn")
    except Exception as e:
        print(f"  [AI Summary] Error generating summary for {repo_name}: {e}")
        return None, None

def main():
    # A. Calculate weeks (UTC to avoid timezone issues)
    monday = get_monday_utc()
    last_monday = monday - datetime.timedelta(days=7)
    
    print(f"--- AI Trending Fetcher ---")
    print(f"Target week: {monday.strftime('%Y-%m-%d')}")
    print(f"Compare week: {last_monday.strftime('%Y-%m-%d')}")
    
    # B. Fetch top 100 repositories from GitHub
    half_year_ago = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=180)
    date_str = half_year_ago.strftime('%Y-%m-%d')
    
    search_terms1 = 'ai OR llm OR "large language model" OR "generative ai" OR "generative-ai"'
    search_terms2 = '"ai agent" OR "ai-agent" OR "agentic ai" OR "agentic-ai"'
    
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "Portal-Trending-Bot"
    }
    if GITHUB_TOKEN and not GITHUB_TOKEN.startswith("your_"):
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
        print("Using GitHub Authorization Token.")
        
    def fetch_repos(terms):
        query = f"{terms} created:>{date_str}"
        url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc&per_page=100"
        print(f"[GitHub API] Fetching from: {url}")
        res = requests.get(url, headers=headers)
        if res.status_code != 200:
            raise Exception(f"GitHub API error {res.status_code}: {res.text}")
        return res.json().get("items", [])

    try:
        repos1 = fetch_repos(search_terms1)
        repos2 = fetch_repos(search_terms2)
    except Exception as e:
        print(f"GitHub fetch failed: {e}")
        sys.exit(1)
        
    # Merge and deduplicate by GitHub ID
    merged = {}
    for r in repos1 + repos2:
        merged[r["id"]] = r
        
    # Sort by stargazers desc and slice top 100
    final_items = sorted(merged.values(), key=lambda x: x["stargazers_count"], reverse=True)[:100]
    print(f"Successfully retrieved and merged {len(final_items)} candidate repositories.")
    
    # C. Database Connection
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
    except Exception as e:
        print(f"Database connection failed: {e}")
        sys.exit(1)
        
    upsert_count = 0
    try:
        for idx, repo in enumerate(final_items):
            repo_id = repo["id"]
            name = repo["name"]
            full_name = repo["full_name"]
            url = repo["html_url"]
            description = repo["description"]
            language = repo["language"]
            stars = repo["stargazers_count"]
            forks = repo["forks_count"]
            topics = repo.get("topics", [])
            
            # Format repository created_at date
            created_at_str = repo["created_at"]
            created_at = datetime.datetime.strptime(created_at_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc)
            
            print(f"[{idx+1}/100] Processing: {full_name} ({stars} stars)")
            
            # 1. Find last week's star count to calculate starsGrowth
            cur.execute(
                'SELECT "stars" FROM "TrendingRepo" WHERE "githubId" = %s AND "weekOf" = %s LIMIT 1;',
                (repo_id, last_monday)
            )
            last_week_row = cur.fetchone()
            
            if last_week_row:
                growth = stars - last_week_row[0]
            else:
                days_old = max(1, (datetime.datetime.now(datetime.timezone.utc) - created_at).days)
                growth = round((stars / days_old) * 7)
            growth = max(0, growth)
            
            # 2. Manage summaries: check if we already have summaries this week
            cur.execute(
                'SELECT "summaryZh", "summaryEn" FROM "TrendingRepo" WHERE "githubId" = %s AND "weekOf" = %s LIMIT 1;',
                (repo_id, monday)
            )
            this_week_row = cur.fetchone()
            
            summary_zh = this_week_row[0] if this_week_row else None
            summary_en = this_week_row[1] if this_week_row else None
            
            # If not this week, check last week to copy forward
            if not summary_zh or not summary_en:
                cur.execute(
                    'SELECT "summaryZh", "summaryEn" FROM "TrendingRepo" WHERE "githubId" = %s AND "weekOf" = %s LIMIT 1;',
                    (repo_id, last_monday)
                )
                last_week_sums = cur.fetchone()
                if last_week_sums:
                    if not summary_zh:
                        summary_zh = last_week_sums[0]
                    if not summary_en:
                        summary_en = last_week_sums[1]
                        
            # If still missing and AI config exists, generate new ones
            if (not summary_zh or not summary_en) and AI_API_KEY and not AI_API_KEY.startswith("your_"):
                print(f"  Generating AI bilingual summaries...")
                szh, sen = generate_summaries(full_name, description, topics, AI_API_KEY, AI_API_BASE, AI_MODEL)
                if szh:
                    summary_zh = szh
                if sen:
                    summary_en = sen
                    
            # 3. Perform Upsert
            uid_str = f"py_{uuid.uuid4().hex[:21]}"
            cur.execute("""
                INSERT INTO "TrendingRepo" (
                    id, "githubId", name, "fullName", url, description, language,
                    stars, forks, "starsGrowth", "repoCreatedAt", topics, "summaryZh", "summaryEn", "weekOf",
                    "updatedAt"
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
                )
                ON CONFLICT ("githubId", "weekOf") DO UPDATE SET
                    stars = EXCLUDED.stars,
                    forks = EXCLUDED.forks,
                    "starsGrowth" = EXCLUDED."starsGrowth",
                    description = EXCLUDED.description,
                    topics = EXCLUDED.topics,
                    "summaryZh" = COALESCE("TrendingRepo"."summaryZh", EXCLUDED."summaryZh"),
                    "summaryEn" = COALESCE("TrendingRepo"."summaryEn", EXCLUDED."summaryEn"),
                    "updatedAt" = NOW();
            """, (
                uid_str, repo_id, name, full_name, url, description, language,
                stars, forks, growth, created_at, topics, summary_zh, summary_en, monday
            ))
            upsert_count += 1
            
        conn.commit()
        print(f"Successfully saved/updated {upsert_count} repositories to database.")
    except Exception as e:
        conn.rollback()
        print(f"Database transaction error: {e}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    main()
