# Portal AI Trending Cron / Schedule Task

This folder contains a standalone, fully self-contained Python script to fetch the top 100 trending AI/LLM repositories from GitHub, compute weekly star velocity, automatically generate/copy summaries, and write the data directly to the PostgreSQL database.

It is designed to be easily copied to any location/server and run independently of the main project files.

## Files

- `fetch_trending.py`: The main Python script.
- `requirements.txt`: Python package requirements.
- `run.sh`: Shell wrapper script that manages virtual environment creation, dependencies installation, and script execution automatically.

## Configuration (.env)

The script reads configurations from the following environment variables (which can be defined in a `.env` file either in the script directory, in the current working directory, or in the parent directory):

```env
# 1. PostgreSQL Database URL (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"

# 2. GitHub Token (Optional but highly recommended to avoid API rate limits)
GITHUB_TOKEN="your_github_personal_access_token"

# 3. AI Summarization Configuration (Optional, omit if you don't want automated summaries)
AI_API_KEY="your_openai_or_deepseek_api_key"
AI_API_BASE="https://api.openai.com/v1"  # Optional custom base (e.g. for DeepSeek, OpenRouter, etc.)
AI_MODEL="gpt-4o-mini"                   # Optional model designation
```

## How to Run

### 1. Manual Execution

Simply run the wrapper shell script:
```bash
./run.sh
```
This script will:
1. Automatically create a local virtual environment in `.venv/` if not present.
2. Install/update the dependencies listed in `requirements.txt`.
3. Load the `.env` configuration.
4. Execute `fetch_trending.py` to update your database.

---

### 2. Automating with System Crontab (后台定时任务)

To schedule this script to run automatically every **Sunday at 10:00 PM (22:00)**, you can register it as a system cron job.

1. Open your system crontab editor:
   ```bash
   crontab -e
   ```

2. Append the following line (make sure to replace `/absolute/path/to/schedule/run.sh` with the actual absolute path to the wrapper script on your system):
   ```text
   0 22 * * 0 /absolute/path/to/schedule/run.sh >> /absolute/path/to/schedule/cron.log 2>&1
   ```

3. Save and close. The system will now execute the script every Sunday at 22:00 and output all logs to `cron.log`.
