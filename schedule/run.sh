#!/bin/bash
set -e

# Get script folder path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Initializing Python environment..."

# 1. Create virtualenv if not exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment in .venv..."
    python3 -m venv .venv
fi

# 2. Activate virtualenv
source .venv/bin/activate

# 3. Install/update requirements
echo "Checking and installing dependencies..."
pip install -q -r requirements.txt

# 4. Run script
echo "Running fetch script..."
python fetch_trending.py

echo "Done!"
