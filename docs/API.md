# API Documentation

This document describes the JSON data structures used in the Dev Card Showcase application.

## contributors.json

The `contributors.json` file contains information about project contributors. It is a JSON object where each key is a contributor's GitHub login and the value is their profile data.

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| login | string | Yes | GitHub username (login) - also used as the key |
| name | string | Yes | Full name or display name |
| bio | string/null | No | Short bio or description |
| avatar_url | string | Yes | URL to avatar image |
| html_url | string | Yes | URL to GitHub profile |
| followers | integer | Yes | Number of GitHub followers |
| following | integer | Yes | Number of GitHub accounts following |
| public_repos | integer | Yes | Number of public GitHub repositories |
| public_gists | integer | Yes | Number of public gists |
| company | string/null | No | Company or organization name |
| location | string/null | No | User's location |
| blog | string | No | URL to personal blog or website |
| twitter_username | string/null | No | Twitter handle (without @) |
| created_at | string | Yes | Account creation timestamp (ISO 8601 format) |
| updated_at | string | Yes | Last profile update timestamp (ISO 8601 format) |
| last_synced | string | Yes | Last data sync timestamp (ISO 8601 format) |
| total_repos | integer | Yes | Total number of repositories |
| total_stars | integer | Yes | Total stars across all repositories |
| total_forks | integer | Yes | Total forks across all repositories |
| projects | array | Yes | List of project titles contributed to |

### Example

```json
{
  "Jayanta2004": {
    "login": "Jayanta2004",
    "name": "JAYANTA GHOSH",
    "bio": null,
    "avatar_url": "https://avatars.githubusercontent.com/u/82716331?v=4",
    "html_url": "https://github.com/Jayanta2004",
    "followers": 9,
    "following": 19,
    "public_repos": 21,
    "public_gists": 0,
    "company": null,
    "location": "Kolkata",
    "blog": "",
    "twitter_username": null,
    "created_at": "2021-04-17T14:36:19Z",
    "updated_at": "2026-01-21T21:29:38Z",
    "last_synced": "2026-01-22T10:04:50.834789",
    "total_repos": 21,
    "total_stars": 35,
    "total_forks": 95,
    "projects": []
  }
}
```

## projects.json

The `projects.json` file contains an array of project objects representing showcased projects.

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Project title |
| description | string | Yes | Detailed project description |
| tags | array | Yes | List of project tags/technologies |
| links | object | Yes | Project links (live demo, GitHub, etc.) |
| author | object | Yes | Author information |

### links Object Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| live | string | No | URL to live demo (relative path recommended) |
| github | string | No | URL to GitHub repository |
| demo | string | No | Alternative demo URL |

### author Object Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Author's name or GitHub username |
| github | string | Yes | GitHub profile URL |

### Example

```json
[
  {
    "title": "Example Project",
    "description": "A sample project description",
    "tags": [
      "HTML",
      "CSS",
      "JavaScript",
      "Web Development"
    ],
    "links": {
      "live": "./projects/example-project/index.html",
      "github": "https://github.com/username/example-project"
    },
    "author": {
      "name": "John Doe",
      "github": "https://github.com/johndoe"
    }
  }
]
```

## Validation Rules

### contributors.json

- All timestamp fields must be in ISO 8601 format (e.g., "2021-04-17T14:36:19Z")
- The object key must match the `login` field value
- Numeric fields (followers, following, repos, etc.) must be non-negative integers
- `projects` array can be empty if no projects are linked

### projects.json

- `title` must be a non-empty string
- `tags` must be a non-empty array of strings
- At least one link (`live` or `github`) is recommended in the `links` object
- Tags should use consistent capitalization (PascalCase recommended)

## Data Relationships

- Contributors in `contributors.json` can be linked to projects via the `projects` array
- Projects in `projects.json` reference contributors via the `author` object
- The `author.github` URL should correspond to a valid `html_url` in `contributors.json`

## JSON Schema Validation

To validate JSON files using the provided schemas:

```bash
# Install ajv-cli (optional)
npm install -g ajv-cli

# Validate contributors.json
ajv validate -s schemas/contributors.schema.json -d contributors.json --data=*

# Validate projects.json
ajv validate -s schemas/projects.schema.json -d projects.json
```

Or using Python:

```python
import json
from jsonschema import validate

# Load schema and data
with open('schemas/contributors.schema.json') as f:
    schema = json.load(f)
with open('contributors.json') as f:
    data = json.load(f)

# Validate
validate(instance=data, schema=schema)
```

## JavaScript Usage

### Loading the Data

```javascript
// Load contributors
const contributors = require('./contributors.json');

// Load projects
const projects = require('./projects.json');
```

### Helper Functions

```javascript
// Get contributor by login
function getContributor(login) {
  return contributors[login];
}

// Get all project titles for a contributor
function getContributorProjects(login) {
  return contributors[login]?.projects || [];
}

// Search projects by tag
function searchProjectsByTag(tag) {
  return projects.filter(project => 
    project.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

// Search projects by author
function searchProjectsByAuthor(authorName) {
  return projects.filter(project => 
    project.author.name === authorName
  );
}

// Get projects with live demos
function getProjectsWithLiveDemos() {
  return projects.filter(project => project.links?.live);
}
```

## Adding New Data

### Adding a Contributor

1. Add your image to the `images/` folder
2. Add your entry to `contributors.json` following the schema
3. Ensure your `login` is used as the object key
4. Update `index.html` to add your profile card

### Adding a Project

1. Create your project files in the `projects/` directory
2. Add your project entry to `projects.json` following the schema
3. Include relevant tags for discoverability
4. Update the `projects` array in your contributor entry if applicable

## Best Practices

- Use PascalCase for tags (e.g., "JavaScript" not "javascript")
- Keep descriptions concise but informative (50-200 words recommended)
- Use relative paths for `links.live` when the project is hosted in this repository
- Include at least 3-5 relevant tags per project
- Sync `contributors.json` data with GitHub API periodically
- Validate JSON files after editing to prevent syntax errors
