import * as vscode from "vscode";
import { Task } from "./task";
import { NotificationManager } from "./notifications";

export class TaskRunner {
  private tasks: Task[] = [];
  private runningTasks: Map<string, { terminal: vscode.Terminal }> = new Map();

  constructor(tasks: Task[]) {
    this.tasks = tasks;
    vscode.window.onDidCloseTerminal((terminal) => {
      for (const [taskName, taskInfo] of this.runningTasks.entries()) {
        if (taskInfo.terminal === terminal) {
          this.runningTasks.delete(taskName);
          break;
        }
      }
    });
  }

  setTasks(tasks: Task[]) {
    this.tasks = tasks;
  }

  private findTask(taskName: string): Task | undefined {
    let task = this.tasks.find((t) => t.fullName === taskName);
    if (task) {
      return task;
    }

    if (taskName.includes(".")) {
      const [groupName, name] = taskName.split(".");
      task = this.tasks.find(
        (t) => t.groupName === groupName && t.name === name
      );
      if (task) {
        return task;
      }
    }

    return this.tasks.find((t) => t.name === taskName);
  }

  async runTask(task: Task) {
    try {
      const terminal = this.getOrCreateTerminal(task);
      terminal.show();

      if (task.preTasks && task.preTasks.length > 0) {
        for (let i = 0; i < task.preTasks.length; i++) {
          const preTaskName = task.preTasks[i];
          const preTask = this.findTask(preTaskName);
          if (preTask) {
            terminal.sendText(preTask.command);
            await new Promise((resolve) => setTimeout(resolve, 500));
          } else {
            NotificationManager.showError(
              `Pre-task "${preTaskName}" not found`
            );
          }
        }
      }

      terminal.sendText(task.command);
      this.runningTasks.set(task.fullName, { terminal });
      NotificationManager.showInfo(`Task "${task.fullName}" started`);
    } catch (error) {
      NotificationManager.showError(
        `Failed to run task "${task.fullName}": ${error}`
      );
    }
  }

  stopTask(task: Task) {
    const runningTask = this.runningTasks.get(task.fullName);
    if (runningTask) {
      runningTask.terminal.sendText("\u0003");
      this.runningTasks.delete(task.fullName);
      NotificationManager.showInfo(`Task "${task.fullName}" stopped`);
    }
  }

  focusTerminal(task: Task) {
    const runningTask = this.runningTasks.get(task.fullName);
    if (runningTask) {
      runningTask.terminal.show();
    }
  }

  stopAllTasks() {
    this.runningTasks.forEach((value, taskName) => {
      value.terminal.sendText("\u0003");
      NotificationManager.showInfo(`Task "${taskName}" stopped`);
    });
    this.runningTasks.clear();
  }

  closeAllTerminals() {
    vscode.window.terminals.forEach((terminal) => terminal.dispose());
    this.runningTasks.clear();
  }

  isTaskRunning(task: Task): boolean {
    return this.runningTasks.has(task.fullName);
  }

  hasRunningTasks(): boolean {
    return this.runningTasks.size > 0;
  }

  private getOrCreateTerminal(task: Task): vscode.Terminal {
    const terminalName = `QRun: ${task.fullName}`;

    const existingTask = this.runningTasks.get(task.fullName);
    if (existingTask) {
      return existingTask.terminal;
    }

    const existingTerminal = vscode.window.terminals.find(
      (t) => t.name === terminalName
    );
    if (existingTerminal) {
      return existingTerminal;
    }

    return vscode.window.createTerminal({
      name: terminalName,
      cwd: task.cwd,
    });
  }
}
