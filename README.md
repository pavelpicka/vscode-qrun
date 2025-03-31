# QuickRun

A VS Code extension that enables users to run configured tasks directly from the activity panel using a TreeView UI.

## Features

- 🏃 Run tasks with a single click
- 📊 Organize tasks in groups
- 🔄 Set task dependencies with pre-tasks
- 🖱️ Simple UI: one-click to run, double-click to focus terminal
- 🛑 Stop tasks with a click

## Getting Started

1. Install the extension
2. Open a workspace/folder in VS Code
3. Configure tasks in `.vscode/quickrun.json` (create it if it doesn't exist)
4. Access tasks through the QuickRun activity panel

## Configuration

QuickRun uses a configuration file located at `.vscode/quickrun.json` in your workspace. 

### Example Configuration

```json
{
  "tasks": {
    "serve": {"run": "npm start", "pre": []},
    "build": {"run": "npm run build", "pre": []},
    "deploy": {"run": "npm run deploy", "pre": ["build"]}
  },
  "groups": {
    "Frontend": {
      "dev": {"run": "npm run dev", "pre": ["install"]},
      "install": {"run": "npm install", "pre": []}
    },
    "Backend": {
      "start": {"run": "python app.py", "pre": ["prepare", "Frontend.build"]},
      "prepare": {"run": "pip install -r requirements.txt", "pre": []}
    }
  }
}
```

### Configuration Structure

- `tasks`: Root-level tasks
- `groups`: Tasks organized into groups
- Each task has:
  - `run`: The command to execute
  - `pre`: Array of task names that should run before this task

### Task Dependencies

You can specify task dependencies using the `pre` field in each task configuration. A task listed in `pre` will run before the main task.

- References to root tasks: just use the task name (e.g., `"build"`)
- References to grouped tasks: use dot notation (e.g., `"Frontend.install"`)

## Usage

### Task Management

- **Run a task**: Click the play button next to a task
- **Stop a task**: Click the stop button next to a task
- **Focus terminal**: Double-click on a task
- **Stop all tasks**: Click the stop button in the panel title
- **Close all terminals**: Click the close button in the panel title
- **Reload configuration**: Click the refresh button in the panel title
- **Open/create configuration**: Click the settings button in the panel title

## License

BSD-3 Clause License
