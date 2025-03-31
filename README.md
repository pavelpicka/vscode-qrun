# QRun

[![Version](https://img.shields.io/visual-studio-marketplace/v/pavelpicka.qrun)](https://marketplace.visualstudio.com/items?itemName=pavelpicka.qrun)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/pavelpicka.qrun)](https://marketplace.visualstudio.com/items?itemName=pavelpicka.qrun)
[![License](https://img.shields.io/github/license/pavelpicka/vscode-qrun)](https://github.com/pavelpicka/vscode-qrun/blob/main/LICENSE)

A VS Code extension that enables users to run configured tasks directly from the activity panel using a TreeView UI.

![QRun Demo](https://raw.githubusercontent.com/pavelpicka/vscode-qrun/main/resources/qrun-demo.gif)

## Features

- 🏃 Run tasks with a single click
- 📊 Organize tasks in groups
- 🔄 Set task dependencies with pre-tasks
- 🖱️ Simple UI: one-click to run, double-click to focus terminal
- 🛑 Stop tasks with a click

## Getting Started

1. Install the extension
2. Open a workspace/folder in VS Code
3. Configure tasks in `.vscode/qrun.json` (create it if it doesn't exist)
4. Access tasks through the QRun activity panel

## Configuration

QRun uses a configuration file located at `.vscode/qrun.json` in your workspace.

### Example Configuration

```json
{
  "tasks": {
    "serve": { "run": "npm start", "pre": [], "cwd": "${workspaceFolder}" },
    "build": { "run": "npm run build", "pre": [] },
    "deploy": { "run": "npm run deploy", "pre": ["build"] }
  },
  "groups": {
    "Frontend": {
      "dev": {
        "run": "npm run dev",
        "pre": ["install"],
        "cwd": "${workspaceFolder}/frontend"
      },
      "install": { "run": "npm install", "pre": [] }
    },
    "Backend": {
      "start": { "run": "python app.py", "pre": ["prepare", "Frontend.build"] },
      "prepare": { "run": "pip install -r requirements.txt", "pre": [] }
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
  - `cwd`: (optional) Working directory for the task. Supports VS Code variables like `${workspaceFolder}`

### Task Dependencies

You can specify task dependencies using the `pre` field in each task configuration. A task listed in `pre` will run before the main task.

- References to root tasks: just use the task name (e.g., `"build"`)
- References to grouped tasks: use dot notation (e.g., `"Frontend.install"`)

### Working Directory

You can specify a working directory for a task using the `cwd` parameter. This is useful when you need to run commands in different directories within your workspace.

The `cwd` parameter supports these VS Code variables:

- `${workspaceFolder}` - The path of the workspace folder

Other VS Code variables may work but aren't explicitly supported by the extension. The variable substitution is handled by VS Code's terminal API.

Examples:

```json
"build": {
  "run": "npm run build",
  "pre": [],
  "cwd": "${workspaceFolder}/client"
}
```

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

## Troubleshooting

### Configuration not loading

- Ensure your configuration file is correctly named `.vscode/qrun.json`
- Check the JSON syntax for errors
- Try clicking the refresh button in the panel title

### Tasks not running

- Check if the command is valid for your operating system
- Ensure you have the necessary dependencies installed
- Check the VS Code terminal for any error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/pavelpicka/vscode-qrun/issues).
