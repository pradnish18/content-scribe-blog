#!/bin/bash

# Automated Daily Backup Script for Content Scribe Blog
# Add to crontab: 0 2 * * * /path/to/cron-backup.sh

# Navigate to server directory
cd "$(dirname "$0")"

# Run backup
node backup.js create

# Optional: Upload to cloud storage (uncomment and configure)
# aws s3 sync backups/ s3://your-bucket/blog-backups/
# or
# rclone sync backups/ remote:blog-backups/

# Log completion
echo "Backup completed at $(date)" >> backup.log
