import requests

# Replace 'YOUR_SITEMAP_URL' with the URL of your sitemap.xml
sitemap_url = 'https://repasscloud.com/sitemap.xml'

# Bing URL for sitemap submission
bing_url = f'http://www.bing.com/ping?sitemap={sitemap_url}'

try:
    # Submit sitemap to Bing
    response = requests.get(bing_url)
    if response.status_code == 200:
        print("Sitemap submitted to Bing successfully.")
    else:
        print(f"Failed to submit sitemap to Bing. Status Code: {response.status_code}")

except Exception as e:
    print(f"An error occurred: {e}")
