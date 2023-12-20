#!/bin/bash

# Define the directories to remove and create
remove_directories=("public" "docs")
create_directories=("public")

# Remove specified directories
for dir in "${remove_directories[@]}"; do
    if [ -d "$dir" ]; then
        rm -r "$dir"
        echo "Removed directory: $dir"
    fi
done

# Run "hugo" to build the site
hugo

# Move the "public" directory to "docs"
for dir in "${create_directories[@]}"; do
    if [ -d "$dir" ]; then
        mv "$dir" "docs"
        echo "Moved directory: $dir to docs"
    fi
done

# Define the directory where HTML files are located
directory="./docs"

# Define the text to search for and the replacement text
search="example.org"
replace="repasscloud.com"

# Loop through HTML files in the specified directory and replace the text
for file in "$directory"/*.html; do
    if [ -e "$file" ]; then
        # Use sed to perform the replacement in-place
        sed -i "s/$search/$replace/g" "$file"
        echo "Replaced in $file"
    fi
done

# Update github repo
git add .
git commit -m 'republish site'
git push

echo "Replacement complete."
