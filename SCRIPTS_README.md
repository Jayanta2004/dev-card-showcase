# Project Management Guide

This project previously used helper scripts for migration and validation, but all Python scripts have now been removed.

## How to Add a New Project

1. Create a new folder for your project inside the `projects` directory.
2. Add your project files (HTML, CSS, JS, etc.) to your new folder.
3. Create a `project.json` file in your project folder. Use the structure below.
4. Add your folder name to the `projectFolders` array in `projects.html`.
5. Test by opening `projects.html` in your browser and verify your project appears.

## project.json Structure

```json
{
  "title": "Project Name",
  "description": "Brief description of what the project does",
  "tags": ["HTML", "CSS", "JavaScript"],
  "links": {
    "live": "./projects/folder-name/index.html",
    "github": "https://github.com/username/repo"
  },
  "author": {
    "name": "Your Name",
    "github": "https://github.com/username"
  }
}
```

### Required Fields

- `title` (string): Project name
- `description` (string): Project description
- `tags` (array): Technology tags
- `author` (object): Author information
  - `name` (string): Author's name
  - `github` (string): GitHub profile URL

### Optional Fields

- `links.github` (string): GitHub repository URL (if different from author's profile)

## Manual Project Loading

No Python script is needed to load a new project. The site automatically loads all projects listed in the `projectFolders` array, each with its own `project.json` file.

If you add or remove a project, just update the `projectFolders` array in `projects.html` and make sure your `project.json` is valid.

## Troubleshooting

- Check your `project.json` for correct structure.
- Make sure your folder is listed in `projectFolders`.
