# API Documentation

This document describes the JSON data structures used in the Dev Card Showcase application.

## contributors.json

The `contributors.json` file contains information about project contributors.

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | integer | Yes | Unique identifier |
| name | string | Yes | Full name |
| position | string | Yes | Job position |
| company | string | Yes | Company name |
| github | string | Yes | GitHub profile URL |
| linkedin | string | Yes | LinkedIn profile URL |
| twitter | string | Yes | Twitter handle |
| image | string | No | Profile image URL |

### Example

```json
{
  "id": 1,
  "name": "John Doe",
  "position": "Software Engineer",
  "company": "Tech Corp",
  "github": "https://github.com/johndoe",
  "linkedin": "https://linkedin.com/in/johndoe",
  "twitter": "johndoe",
  "image": "https://example.com/avatar.jpg"
}
```

## projects.json

The `projects.json` file contains information about showcase projects.

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Project title |
| description | string | Yes | Project description |
| author | string | Yes | Author name |
| tags | array | Yes | Project tags |
| language | string | Yes | Programming language |
| date | string | Yes | Creation date (YYYY-MM-DD) |
| url | string | No | Project URL |
| image | string | No | Thumbnail image URL |

### Example

```json
{
  "title": "My Awesome Project",
  "description": "A sample project description",
  "author": "Jane Doe",
  "tags": ["javascript", "web", "open-source"],
  "language": "JavaScript",
  "date": "2024-01-15",
  "url": "https://github.com/janedoe/project",
  "image": "https://example.com/thumbnail.jpg"
}
```

## Validation

To validate JSON files locally:

```bash
# Validate contributors.json
python3 -c "import json; json.load(open('contributors.json'))"

# Validate projects.json
python3 -c "import json; json.load(open('projects.json'))"
```

## JavaScript Usage

```javascript
// Load contributors
const contributors = require('./contributors.json');

// Find contributor by ID
const findById = (id) => contributors.find(c => c.id === id);

// Filter by company
const filterByCompany = (company) => 
  contributors.filter(c => c.company.toLowerCase().includes(company.toLowerCase()));
```
