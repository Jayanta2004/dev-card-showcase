# Project Management Scripts

This directory contains several Python scripts to help manage projects in the dev-card-showcase.

## Scripts

### 1. add_project.py

**Purpose:** Interactive script to add a new project to the showcase.

**Usage:**

```bash
python add_project.py
```

**Features:**

- Interactive prompts for all project details
- Validates folder existence
- Creates project.json file
- Automatically adds project to projects.html
- Shows preview before confirming

**Example:**

```bash
$ python add_project.py

==================================================================
Add New Project to Dev-Card-Showcase
==================================================================

Step 1: Project Folder
Enter your project folder name: my-awesome-project

Step 2: Project Details
Project title [My Awesome Project]:
Project description: A cool project that does amazing things

Step 3: Tags
Enter tags (comma-separated, e.g., HTML, CSS, JavaScript):
> HTML, CSS, JavaScript, React

...
```

### 2. verify_project_files.py

**Purpose:** Verify all project.json files are valid and complete.

**Usage:**

```bash
python verify_project_files.py
```

**Features:**

- Counts folders with and without project.json
- Validates JSON syntax
- Checks for required fields (title, description, tags, author)
- Reports detailed statistics
- Lists any invalid files

**Output:**

```
================================================================================
PROJECT.JSON FILES VERIFICATION
================================================================================

Total project folders: 263
Folders with project.json: 141
Folders without project.json: 122

✅ All project folders have project.json files!

================================================================================
VALIDATING JSON FILES
================================================================================

Valid project.json files: 141
Invalid project.json files: 0

✅ All project.json files are valid!
```

### 3. generate_folder_list.py

**Purpose:** Generate JavaScript array of all folders with project.json files.

**Usage:**

```bash
python generate_folder_list.py
```

**Features:**

- Scans projects directory
- Finds all folders with project.json
- Outputs JavaScript array format
- Can be copied directly into projects.html

**Output:**

```javascript
const projectFolders = [
  "15 Sliding Puzzle",
  "advanced-text-case-converter",
  "chess",
  ...
];

// Total: 141 project folders
```

### 4. create_project_json_files.py

**Purpose:** Initial migration script (already run).

**Usage:**

```bash
python create_project_json_files.py
```

**Features:**

- Reads old projects.json file
- Matches projects to folder names
- Creates individual project.json files
- Reports matched and unmatched projects

**Note:** This was used for the initial migration and doesn't need to be run again.

### 5. create_remaining_project_files.py

**Purpose:** Handles manual mappings for unmatched projects (already run).

**Usage:**

```bash
python create_remaining_project_files.py
```

**Features:**

- Uses manual mapping dictionary
- Creates project.json for edge cases
- Handles special characters and naming variations

**Note:** This was used for the initial migration and doesn't need to be run again.

## Common Tasks

### Adding a New Project

```bash
# 1. Create your project folder
mkdir projects/my-new-project

# 2. Add your project files
cd projects/my-new-project
# ... add your HTML, CSS, JS files ...

# 3. Run the add_project script
cd ../..
python add_project.py

# 4. Test in browser
# Open projects.html and verify your project appears
```

### Verifying All Projects

```bash
python verify_project_files.py
```

### Regenerating Folder List

```bash
# If you manually added project.json files and need to update projects.html
python generate_folder_list.py

# Copy the output and replace the projectFolders array in projects.html
```

## project.json Structure

Each project.json file should follow this structure:

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

## Requirements

All scripts require Python 3.6+. No additional packages needed - only standard library.

## Troubleshooting

### Script Can't Find projects Folder

Make sure you're running the script from the root of the dev-card-showcase directory:

```bash
cd /path/to/dev-card-showcase
python add_project.py
```

### JSON Validation Errors

Use verify_project_files.py to identify which files have issues:

```bash
python verify_project_files.py
```

### Project Doesn't Appear on Page

1. Check if project.json exists: `ls projects/your-folder/project.json`
2. Validate JSON: `python -m json.tool projects/your-folder/project.json`
3. Check if folder is in projectFolders array in projects.html
4. Check browser console for errors

## Contributing

When adding scripts:

1. Add clear documentation at the top of the file
2. Use descriptive function and variable names
3. Include error handling
4. Update this README with usage instructions
