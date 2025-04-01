import * as vscode from "vscode";
import { ConfigLoader } from "./configLoader";
import { Task } from "./task";
import { TaskRunner } from "./taskRunner";
import { TaskTreeProvider, TaskTreeItem } from "./taskTreeProvider";
import { NotificationManager } from "./notifications";
import * as fs from "fs";

export async function activate(context: vscode.ExtensionContext) {
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    NotificationManager.showInfo(
      "QRun requires a workspace folder to operate."
    );
    return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders[0];

  const treeProvider = new TaskTreeProvider();
  const treeView = vscode.window.createTreeView("qrunTasks", {
    treeDataProvider: treeProvider,
    canSelectMany: false,
  });

  treeView.onDidChangeSelection((e) => {
    if (e.selection.length === 1 && e.selection[0] instanceof TaskTreeItem) {
      const item = e.selection[0] as TaskTreeItem;
      if (taskRunner.isTaskRunning(item.task)) {
        taskRunner.focusTerminal(item.task);
      }
    }
  });

  const tasks: Task[] = [];
  const taskRunner = new TaskRunner(tasks);
  treeProvider.setTasks(tasks);

  await loadConfiguration();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "qrun.runTask",
      async (item: TaskTreeItem) => {
        await taskRunner.runTask(item.task);
        treeProvider.updateTaskState(item.task);
      }
    ),

    vscode.commands.registerCommand(
      "qrun.reloadTask",
      async (item: TaskTreeItem) => {
        if (taskRunner.isTaskRunning(item.task)) {
          taskRunner.stopTask(item.task);

          await new Promise((resolve) => setTimeout(resolve, 300));

          await taskRunner.runTask(item.task);
          NotificationManager.showInfo(`Task "${item.task.name}" reloaded`);
        } else {
          await taskRunner.runTask(item.task);
          NotificationManager.showInfo(`Task "${item.task.name}" started`);
        }

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

    vscode.commands.registerCommand("qrun.stopAllTasks", async () => {
      if (!taskRunner.hasRunningTasks()) {
        NotificationManager.showInfo("No tasks are running");
        return;
      }

      const result = await NotificationManager.showWarning(
        "Are you sure you want to stop all running tasks?",
        "Yes",
        "No"
      );

      if (result === "Yes") {
        taskRunner.stopAllTasks();
        treeProvider.refresh();
      }
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
      if (!configPath) {
        NotificationManager.showError("No workspace folder found");
        return;
      }

      try {
        const fileExists = await new Promise<boolean>((resolve) => {
          fs.access(configPath, fs.constants.F_OK, (err) => {
            resolve(!err);
          });
        });

        if (!fileExists) {
          await ConfigLoader.createDefaultConfig(workspaceFolder);
        }

        const doc = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(doc);
      } catch (error) {
        NotificationManager.showError(`Failed to open configuration: ${error}`);
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
      if (
        error instanceof Error &&
        error.message.includes("Configuration file not found")
      ) {
        NotificationManager.showInfo(
          `No QRun configuration found at ${await ConfigLoader.getConfigPath()}. Use the settings icon to create one.`
        );
      } else {
        NotificationManager.showError(
          `Failed to load QRun configuration: ${error}`
        );
      }
    }
  }
}

export function deactivate() {}
