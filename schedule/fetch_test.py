
import os
import datetime
import requests
from dotenv import load_dotenv
load_dotenv()

half_year_ago = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=180)
date_str = half_year_ago.strftime('%Y-%m-%d')
terms = 'ai OR llm OR "large language model" OR "generative ai" OR "SpaceXAI\'s"'
search_terms1 = 'ai OR llm OR "large language model" OR "generative ai" OR "generative-ai"'

query = f"{search_terms1} created:>{date_str}"
url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc&per_page=100"
headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "Portal-Trending-Bot"
}
headers["Authorization"] = f"Bearer {os.getenv('GITHUB_TOKEN')}"
res = requests.get(url, headers=headers)
items = res.json().get("items", [])

sorted_items = sorted(items, key=lambda x: x['stargazers_count'], reverse=True)
for index, item in enumerate(sorted_items):
    print(f'{index+1}: {item["full_name"]}:\t{item["stargazers_count"]}')
    
    