import * as vscode from "vscode";
import { ConfigLoader } from "./configLoader";
import { Task } from "./task";
import { TaskRunner } from "./taskRunner";
import { TaskTreeProvider, TaskTreeItem } from "./taskTreeProvider";
import { NotificationManager } from "./notifications";

export async function activate(context: vscode.ExtensionContext) {
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    NotificationManager.showError(
      "QRun requires a workspace folder to operate."
    );
    return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders[0];

  const treeProvider = new TaskTreeProvider();
  const treeView = vscode.window.createTreeView("qrunTasks", {
    treeDataProvider: treeProvider,
  });

  const tasks: Task[] = [];
  const taskRunner = new TaskRunner(tasks);
  treeProvider.setTasks(tasks);

  await loadConfiguration();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "qrun.runTask",
      async (item: TaskTreeItem) => {
        if (taskRunner.isTaskRunning(item.task)) {
          NotificationManager.showInfo(
            `Task "${item.task.name}" is already running`
          );
          return;
        }
        await taskRunner.runTask(item.task);
        treeProvider.updateTaskState(item.task);
      }
    ),

    vscode.commands.registerCommand(
      "qrun.stopTask",
      async (item: TaskTreeItem) => {
        if (!taskRunner.isTaskRunning(item.task)) {
          NotificationManager.showInfo(
            `Task "${item.task.name}" is not running`
          );
          return;
        }
        taskRunner.stopTask(item.task);
        treeProvider.updateTaskState(item.task);
      }
    ),

    vscode.commands.registerCommand(
      "qrun.focusTerminal",
      (item: TaskTreeItem) => {
        if (!taskRunner.isTaskRunning(item.task)) {
          NotificationManager.showInfo(
            `Task "${item.task.name}" is not running`
          );
          return;
        }
        taskRunner.focusTerminal(item.task);
      }
    ),

    vscode.commands.registerCommand("qrun.stopAllTasks", async () => {
      if (!taskRunner.hasRunningTasks()) {
        NotificationManager.showInfo("No tasks are running");
        return;
      }
      taskRunner.stopAllTasks();
      treeProvider.refresh();
    }),

    vscode.commands.registerCommand("qrun.closeAllTerminals", async () => {
      const hasRunningTasks = taskRunner.hasRunningTasks();
      if (hasRunningTasks) {
        const result = await NotificationManager.showWarning(
          "There are running tasks. Do you want to stop them and close all terminals?",
          "Yes",
          "No"
        );

        if (result === "Yes") {
          taskRunner.stopAllTasks();
          taskRunner.closeAllTerminals();
          treeProvider.refresh();
        }
      } else {
        taskRunner.closeAllTerminals();
      }
    }),

    vscode.commands.registerCommand("qrun.reloadConfig", async () => {
      await loadConfiguration();
      NotificationManager.showInfo("QRun configuration reloaded");
    }),

    vscode.commands.registerCommand("qrun.openConfig", async () => {
      const configPath = await ConfigLoader.getConfigPath();
      if (configPath) {
        const doc = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(doc);
      }
    })
  );

  context.subscriptions.push(treeView);

  async function loadConfiguration() {
    try {
      const loadedTasks = await ConfigLoader.loadConfig();

      if (!loadedTasks || loadedTasks.length === 0) {
        const createConfig = "Create Configuration";
        const response = await NotificationManager.showWarning(
          "No QRun configuration found in this workspace.",
          createConfig
        );

        if (response === createConfig) {
          await ConfigLoader.createDefaultConfig(workspaceFolder);
          const newTasks = await ConfigLoader.loadConfig();
          if (newTasks && newTasks.length > 0) {
            tasks.length = 0;
            tasks.push(...newTasks);
            treeProvider.setTasks(tasks);
            taskRunner.setTasks(tasks);
          }
        }
      } else {
        tasks.length = 0;
        tasks.push(...loadedTasks);
        treeProvider.setTasks(tasks);
        taskRunner.setTasks(tasks);
      }
    } catch (error) {
      NotificationManager.showError(
        `Failed to load QRun configuration: ${error}`
      );
    }
  }
}

export function deactivate() {}
