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
find ./docs -type f -name "*.html" -exec sed -i '/Made with &#10084;&#65039; using <a target="_blank" href="https:\/\/github.com\/526avijitgupta\/gokarna">Gokarna<\/a>/d' {} \;

# ProductHunt launch issue
sed '/<p><!-- raw HTML omitted --><!-- raw HTML omitted --><!-- raw HTML omitted --><\/p>/c\<p><a href="https:\/\/www.producthunt.com\/posts\/lunavpn-co?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-lunavpn&#0045;co" target="_blank"><img src="https:\/\/api.producthunt.com\/widgets\/embed-image\/v1\/featured.svg?post_id=433536&theme=light" alt="LunaVPN&#0046;co - LunaVPN&#0058;&#0032;🔒&#0032;Secure&#0044;&#0032;⚡&#0032;Fast&#0044;&#0032;🌍&#0032;Global&#0032;Internet&#0032;Freedom | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /><\/a><\/p>' ./docs/posts/2024-01-08/index.html > tmpfile && mv tmpfile ./docs/posts/2024-01-08/index.html



# Update github repo
# git add .
# git commit -m 'republish site'
# git push

echo "Replacement complete."
