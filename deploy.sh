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

# Define the directory where XML and HTML files are located
directory="./docs"

# Define the text to search for and the replacement text
search="example.org"
replace="repasscloud.com"

# Use grep to find all XML and HTML files in the specified directory
# Then use sed to perform the replacement in-place
grep -rl "$search" "$directory" | xargs sed -i "s/$search/$replace/g"

echo "Replacement complete."

# Update CNAME
cp ./CNAME ./docs/CNAME

# Remove legacy love line
sed -i '/Made with &#10084;&#65039; using <a target="_blank" href="https:\/\/github.com\/526avijitgupta\/gokarna">Gokarna<\/a>/d' ./docs/*.html


# Update github repo
git add .
git commit -m 'republish site'
git push

echo "Replacement complete."
