#!/usr/bin/env python3
"""
Test script for GitHub Profile Synchronization
This creates mock data for testing the frontend functionality
"""

import json
import os
from datetime import datetime

def create_mock_contributor_data():
    """Create mock contributor data for testing"""

    mock_contributors = {
        "Jayanta2004": {
            "login": "Jayanta2004",
            "name": "Jayanta Pandey",
            "bio": "Full Stack Developer | Open Source Enthusiast | Building amazing web experiences",
            "avatar_url": "https://avatars.githubusercontent.com/u/12345678?v=4",
            "html_url": "https://github.com/Jayanta2004",
            "followers": 245,
            "following": 89,
            "public_repos": 42,
            "public_gists": 12,
            "company": "@OpenSourceCommunity",
            "location": "India",
            "blog": "https://jayantapandey.dev",
            "twitter_username": "jayanta_codes",
            "created_at": "2020-03-15T10:30:00Z",
            "updated_at": "2024-01-01T15:45:00Z",
            "total_stars": 156,
            "total_forks": 89,
            "last_synced": "2024-01-01T16:00:00"
        },
        "19-mohityadav": {
            "login": "19-mohityadav",
            "name": "Mohit Yadav",
            "bio": "Frontend Developer passionate about creating beautiful user interfaces",
            "avatar_url": "https://avatars.githubusercontent.com/u/87654321?v=4",
            "html_url": "https://github.com/19-mohityadav",
            "followers": 67,
            "following": 45,
            "public_repos": 23,
            "public_gists": 5,
            "company": "Tech Startup",
            "location": "Delhi, India",
            "blog": "",
            "twitter_username": "",
            "created_at": "2021-01-20T08:15:00Z",
            "updated_at": "2024-01-01T14:30:00Z",
            "total_stars": 78,
            "total_forks": 34,
            "last_synced": "2024-01-01T16:00:00"
        },
        "SameerBaral": {
            "login": "SameerBaral",
            "name": "Sameer Baral",
            "bio": "Backend Developer | Python Enthusiast | Love solving complex problems",
            "avatar_url": "https://avatars.githubusercontent.com/u/11223344?v=4",
            "html_url": "https://github.com/SameerBaral",
            "followers": 123,
            "following": 67,
            "public_repos": 31,
            "public_gists": 8,
            "company": "Software Solutions Inc",
            "location": "Kathmandu, Nepal",
            "blog": "https://sameerbaral.dev",
            "twitter_username": "sameer_codes",
            "created_at": "2019-11-10T12:00:00Z",
            "updated_at": "2024-01-01T13:20:00Z",
            "total_stars": 234,
            "total_forks": 145,
            "last_synced": "2024-01-01T16:00:00"
        }
    }

    return mock_contributors

def create_test_data():
    """Create test data file for frontend testing"""

    data = {
        "_metadata": {
            "description": "Test GitHub contributor profile data",
            "last_updated": datetime.now().isoformat(),
            "version": "1.0",
            "note": "This is test data for frontend functionality demonstration"
        },
        "contributors": create_mock_contributor_data()
    }

    # Write to contributors.json
    with open('contributors.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("✅ Test data created successfully!")
    print(f"📁 File: contributors.json")
    print(f"👥 Contributors: {len(data['contributors'])}")
    print(f"📅 Last updated: {data['_metadata']['last_updated']}")

    return data

if __name__ == "__main__":
    print("🚀 Creating test data for GitHub Profile Synchronization...")
    print("=" * 60)

    test_data = create_test_data()

    print("\n📊 Test Data Summary:")
    for username, data in test_data['contributors'].items():
        print(f"  • {username}: {data['name']} ({data['followers']} followers, {data['public_repos']} repos)")

    print("\n🎯 Next Steps:")
    print("  1. Open index.html in your browser")
    print("  2. Click the purple 'Sync' button in the navbar")
    print("  3. Cards should load with the test data")
    print("  4. Look for green checkmarks on synced cards")

    print("\n💡 Note: This test data simulates real GitHub API responses")
    print("   For production use, run: python github_sync.py")
