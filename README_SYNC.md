# GitHub Profile Synchronization Feature

This feature automatically fetches and updates contributor profile data from GitHub API, keeping the community card showcase current with real-time information.

## 🚀 Features

- **Automated Profile Sync**: Fetches bio, followers, repositories, and contribution stats from GitHub
- **Caching System**: Stores data for 24 hours to reduce API calls and improve performance
- **Rate Limiting**: Handles GitHub API rate limits gracefully
- **Dynamic Updates**: Cards display real-time GitHub data without manual updates
- **Sync Button**: Manual refresh option for immediate updates
- **Error Handling**: Graceful fallbacks when API calls fail

## 📋 Requirements

- Python 3.6+
- `requests` library (`pip install requests`)
- GitHub Personal Access Token (optional, for higher rate limits)

## 🛠️ Setup

### 1. Install Dependencies

```bash
pip install requests
```

### 2. (Optional) Set Up GitHub Token

For higher rate limits (5000 vs 60 requests per hour), create a GitHub Personal Access Token:

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `public_repo` scope
3. Set the token as an environment variable:

```bash
export GITHUB_TOKEN=your_token_here
```

Or pass it directly to the script:
```bash
python github_sync.py --token your_token_here
```

### 3. Run Initial Sync

```bash
python github_sync.py
```

This will:
- Extract GitHub usernames from `index.html`
- Fetch profile data for each contributor
- Save data to `contributors.json`
- Update cards with fresh data

## 📁 Files Created

- `github_sync.py` - Python script for GitHub API integration
- `contributors.json` - Cached contributor data
- `sync.js` - Frontend JavaScript for dynamic updates
- `README_SYNC.md` - This documentation

## 🎯 Usage

### Automatic Sync

The system automatically loads cached data when the page loads. Cards will display the most recent GitHub data available.

### Manual Sync

Click the "Sync" button in the navbar to manually refresh all profiles:

1. Click the purple "Sync" button in the top navigation
2. Wait for the sync process to complete
3. Cards will update with fresh GitHub data

### Command Line Options

```bash
# Basic sync
python github_sync.py

# Force update all profiles (ignore cache)
python github_sync.py --force

# Sync specific users
python github_sync.py --usernames user1 user2 user3

# Use custom HTML file
python github_sync.py --html-file custom.html

# Show help
python github_sync.py --help
```

## 🔧 Configuration

### Cache Duration

The default cache duration is 24 hours. To modify this, edit the `cache_duration` in `github_sync.py`:

```python
self.cache_duration = timedelta(hours=24)  # Change as needed
```

### API Rate Limits

- **Unauthenticated**: 60 requests per hour
- **Authenticated**: 5000 requests per hour

The script automatically handles rate limiting and will wait when necessary.

## 📊 Data Structure

The `contributors.json` file contains:

```json
{
  "_metadata": {
    "description": "Cached GitHub contributor profile data",
    "last_updated": "2024-01-01T00:00:00",
    "version": "1.0"
  },
  "contributors": {
    "username": {
      "login": "username",
      "name": "Display Name",
      "bio": "User bio from GitHub",
      "avatar_url": "https://...",
      "html_url": "https://github.com/username",
      "followers": 42,
      "following": 24,
      "public_repos": 15,
      "public_gists": 3,
      "company": "Company Name",
      "location": "Location",
      "blog": "https://blog.example.com",
      "twitter_username": "twitter_handle",
      "created_at": "2020-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "total_stars": 156,
      "total_forks": 89,
      "last_synced": "2024-01-01T12:00:00"
    }
  }
}
```

## 🎨 Frontend Integration

The `sync.js` file provides:

- **Dynamic Card Loading**: Loads contributor data from JSON
- **Sync Button Handler**: Triggers manual sync
- **Loading States**: Shows progress during sync
- **Error Handling**: Displays user-friendly error messages
- **Statistics Display**: Shows follower counts, repo counts, etc.

### Card Enhancements

Synced cards include:
- ✅ Checkmark indicator for successfully synced profiles
- Real-time follower/repository counts
- Updated profile images from GitHub
- Current bio information

## 🚨 Error Handling

### Common Issues

1. **Rate Limit Exceeded**
   - Script will automatically wait and retry
   - Use GitHub token for higher limits

2. **Network Errors**
   - Script retries failed requests
   - Falls back to cached data

3. **Private Profiles**
   - Skips users with private profiles
   - Keeps existing cached data

4. **API Changes**
   - Script handles API response variations
   - Logs warnings for unexpected data

### Troubleshooting

```bash
# Check sync status
python github_sync.py --usernames testuser

# Force refresh specific user
python github_sync.py --usernames testuser --force

# Debug mode (add to script)
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🔒 Security

- GitHub tokens are never stored in code
- API calls use HTTPS
- No sensitive data is exposed in frontend
- Rate limiting prevents abuse

## 📈 Performance

- **Caching**: Reduces API calls by 95%+ after initial sync
- **Batch Processing**: Handles multiple users efficiently
- **Lazy Loading**: Cards load data progressively
- **Compression**: JSON data is optimized

## 🤝 Contributing

To add new contributors:

1. Add their card to `index.html` with GitHub profile link
2. Run sync: `python github_sync.py`
3. The system will automatically detect and sync the new profile

## 📝 API Reference

### GitHubSync Class

```python
sync = GitHubSync(token="your_token")  # Optional token

# Sync all contributors
data = sync.sync_contributors()

# Sync specific users
data = sync.sync_contributors(["user1", "user2"])

# Force update (ignore cache)
data = sync.sync_contributors(force_update=True)
```

### Frontend Functions

```javascript
// Manual sync trigger
window.triggerSync();

// Load contributor data
window.loadContributorsData();

// Update specific card
window.updateCard("username", data);
```

## 🔄 Future Enhancements

- [ ] Webhook integration for automatic updates
- [ ] GitHub Actions workflow for scheduled sync
- [ ] Advanced contribution statistics
- [ ] Profile change notifications
- [ ] Bulk sync operations
- [ ] Admin dashboard for sync management

## 📞 Support

For issues or questions:

1. Check the console for error messages
2. Verify GitHub token permissions
3. Ensure Python dependencies are installed
4. Check network connectivity to GitHub API

## 📄 License

This feature is part of the dev-card-showcase project. See main LICENSE file for details.
