# Change Log

All notable changes to the "QRun" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.2.2] - 2024-04-01

### Added

- Reload button for tasks to quickly stop and restart a task

## [0.2.1] - 2024-04-01

### Changed

- Improved logging messages for better user experience

## [0.2.0] - 2024-04-01

### Added

- Terminal icon for task items in the tree view
- "Oneshot" option for tasks that can be run multiple times
- Confirmation dialog for "Stop All Tasks" button

### Changed

- Task selection now focuses the terminal if the task is running
- Improved user experience by showing info messages instead of errors for missing configuration

## [0.1.0] - 2024-03-31

### Added

- Initial release
- Basic task running functionality
- Task organization in groups
- Task dependencies with pre-tasks
- UI for managing tasks
- Commands for running, stopping, and focusing tasks
- Configuration via `.vscode/qrun.json`
