---
name: Download Image
description: Search for an image on the web and download it to ~/Downloads
---

# Download Image Skill

This skill allows you to download an image from the internet based on a search query.

## Instructions

When the user asks you to download an image based on a search query:

1.  **Search and Extract Image URL**:
    *   Use the `browser_subagent` tool.
    *   Pass the search query as part of the `Task` description. For example: "Search for '[Search Query]' on Google Images or Bing Images. Find a high resolution, clear, and relevant image. Extract and return the direct URL of the high-resolution image."
    *   Set `RecordingName` to something like `search_image_[keyword]`.
2.  **Download the Image**:
    *   Once the `browser_subagent` returns the direct image URL, use the `run_command` tool to download it using `curl` to the `~/Downloads` directory.
    *   Construct the filename using the search query, replacing spaces with underscores or hyphens.
    *   **Conflict Resolution**: Check if the file already exists (e.g., using `[ -f "$filename" ]` in bash). If it does, append the current timestamp to the filename before downloading.
    *   Example bash snippet to handle downloading and renaming (you can run this directly with `run_command`):
        ```bash
        # Variables
        URL="<IMAGE_URL>"
        SEARCH_QUERY="<SEARCH_QUERY>"
        DIR="$HOME/Downloads"
        
        # Sanitize filename
        SAFE_NAME=$(echo "$SEARCH_QUERY" | tr ' ' '_')
        
        # Determine extension from URL, default to jpg
        EXT="${URL##*.}"
        # Keep extension simple if it contains query params
        EXT=$(echo "$EXT" | cut -d'?' -f1)
        if [[ ! "$EXT" =~ ^(jpg|jpeg|png|webp|gif|svg)$ ]]; then
            EXT="jpg"
        fi

        FILEPATH="$DIR/${SAFE_NAME}.${EXT}"

        # Conflict resolution
        if [ -f "$FILEPATH" ]; then
            TIMESTAMP=$(date +%Y%m%d%H%M%S)
            FILEPATH="$DIR/${SAFE_NAME}_${TIMESTAMP}.${EXT}"
        fi

        echo "Downloading to $FILEPATH"
        curl -s -L "$URL" -o "$FILEPATH"
        ```
3.  **Confirm Execution**: Let the user know the file has been downloaded and provide the final file path.
