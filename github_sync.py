#!/usr/bin/env python3
"""
GitHub Profile Synchronization Script
Fetches and updates contributor profile data from GitHub API
"""

import json
import os
import time
import requests
from datetime import datetime, timedelta
import sys

class GitHubSync:
    def __init__(self, token=None):
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "dev-card-showcase-sync/1.0"
        }
        if token:
            self.headers["Authorization"] = f"token {token}"

        # Rate limiting: 5000 requests per hour for authenticated users
        self.rate_limit_remaining = 5000
        self.rate_limit_reset = None
        self.cache_duration = timedelta(hours=24)  # Cache for 24 hours

    def check_rate_limit(self):
        """Check if we can make API calls"""
        if self.rate_limit_remaining <= 10:  # Buffer for safety
            if self.rate_limit_reset:
                reset_time = datetime.fromtimestamp(self.rate_limit_reset)
                if datetime.now() < reset_time:
                    wait_seconds = (reset_time - datetime.now()).seconds
                    print(f"Rate limit exceeded. Waiting {wait_seconds} seconds...")
                    time.sleep(min(wait_seconds, 3600))  # Max wait 1 hour
            else:
                print("Rate limit exceeded. Please try again later.")
                return False
        return True

    def get_user_data(self, username):
        """Fetch user profile data from GitHub API"""
        if not self.check_rate_limit():
            return None

        try:
            response = requests.get(
                f"{self.base_url}/users/{username}",
                headers=self.headers,
                timeout=10
            )

            # Update rate limit info
            if 'X-RateLimit-Remaining' in response.headers:
                self.rate_limit_remaining = int(response.headers['X-RateLimit-Remaining'])
            if 'X-RateLimit-Reset' in response.headers:
                self.rate_limit_reset = int(response.headers['X-RateLimit-Reset'])

            if response.status_code == 200:
                user_data = response.json()
                return {
                    "login": user_data.get("login"),
                    "name": user_data.get("name") or user_data.get("login"),
                    "bio": user_data.get("bio"),
                    "avatar_url": user_data.get("avatar_url"),
                    "html_url": user_data.get("html_url"),
                    "followers": user_data.get("followers", 0),
                    "following": user_data.get("following", 0),
                    "public_repos": user_data.get("public_repos", 0),
                    "public_gists": user_data.get("public_gists", 0),
                    "company": user_data.get("company"),
                    "location": user_data.get("location"),
                    "blog": user_data.get("blog"),
                    "twitter_username": user_data.get("twitter_username"),
                    "created_at": user_data.get("created_at"),
                    "updated_at": user_data.get("updated_at"),
                    "last_synced": datetime.now().isoformat()
                }
            elif response.status_code == 404:
                print(f"User {username} not found")
                return None
            elif response.status_code == 403:
                print(f"Access forbidden for user {username}. May be private or rate limited.")
                return None
            else:
                print(f"Error fetching data for {username}: {response.status_code}")
                return None

        except requests.RequestException as e:
            print(f"Network error for {username}: {e}")
            return None

    def get_user_repos(self, username, max_repos=5):
        """Fetch user's top repositories"""
        if not self.check_rate_limit():
            return []

        try:
            response = requests.get(
                f"{self.base_url}/users/{username}/repos",
                headers=self.headers,
                params={
                    "sort": "updated",
                    "direction": "desc",
                    "per_page": max_repos
                },
                timeout=10
            )

            if response.status_code == 200:
                repos = response.json()
                return [{
                    "name": repo.get("name"),
                    "description": repo.get("description"),
                    "language": repo.get("language"),
                    "stars": repo.get("stargazers_count", 0),
                    "forks": repo.get("forks_count", 0),
                    "url": repo.get("html_url")
                } for repo in repos[:max_repos]]
            else:
                print(f"Error fetching repos for {username}: {response.status_code}")
                return []

        except requests.RequestException as e:
            print(f"Network error fetching repos for {username}: {e}")
            return []

    def get_contribution_stats(self, username):
        """Get basic contribution stats (simplified)"""
        # Note: GitHub doesn't provide contribution stats directly via API
        # This is a simplified version. For full stats, would need GitHub GraphQL API
        user_data = self.get_user_data(username)
        if not user_data:
            return None

        repos = self.get_user_repos(username, max_repos=10)

        total_stars = sum(repo.get("stars", 0) for repo in repos)
        total_forks = sum(repo.get("forks", 0) for repo in repos)

        return {
            "total_repos": user_data.get("public_repos", 0),
            "total_stars": total_stars,
            "total_forks": total_forks,
            "followers": user_data.get("followers", 0),
            "following": user_data.get("following", 0)
        }

    def extract_usernames_from_html(self, html_file="index.html"):
        """Extract GitHub usernames from HTML file"""
        usernames = []
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Find all GitHub profile links
            import re
            github_links = re.findall(r'https://github\.com/([^/"]+)', content)

            # Filter out non-user links (like repo links)
            for link in github_links:
                # Skip if it contains common non-user patterns
                if any(skip in link.lower() for skip in ['dev-card-showcase', 'fork', 'pull', 'issues', 'wiki']):
                    continue
                if link and link not in usernames:
                    usernames.append(link)

        except FileNotFoundError:
            print(f"HTML file {html_file} not found")
        except Exception as e:
            print(f"Error reading HTML file: {e}")

        return usernames

    def load_cached_data(self, cache_file="contributors.json"):
        """Load cached contributor data"""
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                print(f"Error loading cache: {e}")
        return {}

    def save_cached_data(self, data, cache_file="contributors.json"):
        """Save contributor data to cache"""
        try:
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Data saved to {cache_file}")
        except IOError as e:
            print(f"Error saving cache: {e}")

    def sync_contributors(self, usernames=None, force_update=False):
        """Sync contributor data from GitHub"""
        if usernames is None:
            usernames = self.extract_usernames_from_html()

        cached_data = self.load_cached_data()
        updated_data = {}

        print(f"Syncing {len(usernames)} contributors...")

        for i, username in enumerate(usernames, 1):
            print(f"[{i}/{len(usernames)}] Processing {username}...")

            # Check cache
            if not force_update and username in cached_data:
                cached_time = datetime.fromisoformat(cached_data[username].get("last_synced", "2000-01-01"))
                if datetime.now() - cached_time < self.cache_duration:
                    print(f"  Using cached data for {username}")
                    updated_data[username] = cached_data[username]
                    continue

            # Fetch fresh data
            user_data = self.get_user_data(username)
            if user_data:
                # Add contribution stats
                stats = self.get_contribution_stats(username)
                if stats:
                    user_data.update(stats)

                updated_data[username] = user_data
                print(f"  ✓ Updated {username}")
            else:
                # Keep old data if fetch failed
                if username in cached_data:
                    updated_data[username] = cached_data[username]
                    print(f"  ⚠ Kept cached data for {username}")

            # Small delay to be respectful to the API
            time.sleep(0.5)

        self.save_cached_data(updated_data)
        print(f"Sync complete! Updated {len(updated_data)} contributors.")
        return updated_data

def main():
    """Main function"""
    import argparse

    parser = argparse.ArgumentParser(description="Sync GitHub contributor profiles")
    parser.add_argument("--token", help="GitHub personal access token (optional)")
    parser.add_argument("--force", action="store_true", help="Force update all profiles")
    parser.add_argument("--usernames", nargs="*", help="Specific usernames to sync")
    parser.add_argument("--html-file", default="index.html", help="HTML file to parse for usernames")

    args = parser.parse_args()

    # Check if token is provided via environment variable
    token = args.token or os.getenv("GITHUB_TOKEN")

    sync = GitHubSync(token=token)

    if args.usernames:
        usernames = args.usernames
    else:
        usernames = sync.extract_usernames_from_html(args.html_file)

    if not usernames:
        print("No usernames found to sync. Please check the HTML file or provide usernames manually.")
        sys.exit(1)

    print(f"Found {len(usernames)} contributors to sync")
    sync.sync_contributors(usernames, force_update=args.force)

if __name__ == "__main__":
    main()
