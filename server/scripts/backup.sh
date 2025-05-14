#!/bin/bash

# Get current timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Set backup directory
BACKUP_DIR="/app/backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Set backup filename
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"

# Create my.cnf file with SSL disabled
cat > /tmp/my.cnf << EOF
[client]
host=$DB_HOST
user=$DB_USER
password=$DB_PASSWORD
ssl=0
EOF

# Perform backup using environment variables with SSL disabled
mysqldump --defaults-file=/tmp/my.cnf "$DB_NAME" > "$BACKUP_FILE"

# Remove temporary config file
rm -f /tmp/my.cnf

# Check if backup was successful
if [ $? -eq 0 ]; then
    # Get file size
    FILESIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    
    # Output information for the Node.js process
    echo "FILENAME:backup_${TIMESTAMP}.sql"
    echo "FILESIZE:$FILESIZE"
    exit 0
else
    echo "Backup failed" >&2
    exit 1
fi