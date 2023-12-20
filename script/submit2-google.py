import requests

# Replace 'YOUR_SITEMAP_URL' with the URL of your sitemap.xml
sitemap_url = 'https://repasscloud.com/sitemap.xml'

# Google Search Console URL for sitemap submission
google_url = f'https://www.google.com/ping?sitemap={sitemap_url}'

try:
    # Submit sitemap to Google
    response = requests.get(google_url)
    if response.status_code == 200:
        print("Sitemap submitted to Google successfully.")
    else:
        print(f"Failed to submit sitemap to Google. Status Code: {response.status_code}")

except Exception as e:
    print(f"An error occurred: {e}")
