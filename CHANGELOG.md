# Change Log

## [0.2.3] - 2024-04-01

### Added

- Visual task status indicators:
  - Target icon for oneshot tasks
  - Play icon for running tasks
  - Terminal icon for standard tasks

### Fixed

- Fixed running task icon not showing correctly in the tree view

## [0.2.2] - 2024-04-01

### Fixed

- Corrected the order of task buttons to Start, Reload, Stop

## [0.2.1] - 2024-04-01

### Added

- Reload button for tasks to quickly stop and restart a task

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
