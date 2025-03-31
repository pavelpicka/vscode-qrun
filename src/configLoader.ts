import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Task, QRunConfig, TaskConfig } from "./task";

export class ConfigLoader {
  private static readonly CONFIG_FILENAME = "qrun.json";
  private static readonly CONFIG_FOLDER = ".vscode";

  public static async getConfigPath(): Promise<string | undefined> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return undefined;
    }

    return path.join(
      workspaceFolder.uri.fsPath,
      this.CONFIG_FOLDER,
      this.CONFIG_FILENAME
    );
  }

  public static async loadConfig(): Promise<Task[]> {
    const configPath = await ConfigLoader.getConfigPath();
    if (!configPath) {
      throw new Error("No workspace folder found");
    }

    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found at ${configPath}`);
    }

    const configContent = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configContent) as QRunConfig;

    return this.parseConfig(config);
  }

  public static parseConfig(config: QRunConfig): Task[] {
    const tasks: Task[] = [];

    if (config.tasks) {
      Object.entries(config.tasks).forEach(([taskName, taskConfig]) => {
        if (this.isValidTaskConfig(taskConfig)) {
          tasks.push(
            new Task(
              taskName,
              taskConfig.run,
              taskConfig.pre || [],
              undefined,
              taskConfig.cwd
            )
          );
        }
      });
    }

    if (config.groups) {
      Object.entries(config.groups).forEach(([groupName, groupTasks]) => {
        if (typeof groupTasks === "object" && groupTasks !== null) {
          Object.entries(groupTasks).forEach(([taskName, taskConfig]) => {
            if (this.isValidTaskConfig(taskConfig)) {
              tasks.push(
                new Task(
                  taskName,
                  taskConfig.run,
                  taskConfig.pre || [],
                  groupName,
                  taskConfig.cwd
                )
              );
            }
          });
        }
      });
    }

    return tasks;
  }

  private static isValidTaskConfig(config: unknown): config is TaskConfig {
    return (
      typeof config === "object" &&
      config !== null &&
      "run" in config &&
      typeof (config as TaskConfig).run === "string" &&
      (!("cwd" in config) || typeof (config as TaskConfig).cwd === "string")
    );
  }

  public static async createDefaultConfig(
    workspaceFolder: vscode.WorkspaceFolder
  ): Promise<void> {
    const vscodeFolder = path.join(
      workspaceFolder.uri.fsPath,
      this.CONFIG_FOLDER
    );
    const configPath = path.join(vscodeFolder, this.CONFIG_FILENAME);

    if (!fs.existsSync(vscodeFolder)) {
      fs.mkdirSync(vscodeFolder, { recursive: true });
    }

    if (!fs.existsSync(configPath)) {
      const defaultConfig: QRunConfig = {
        tasks: {
          serve: { run: "npm start", pre: [], cwd: "${workspaceFolder}" },
          build: { run: "npm run build", pre: [] },
        },
        groups: {
          Frontend: {
            dev: {
              run: "npm run dev",
              pre: ["install"],
              cwd: "${workspaceFolder}/frontend",
            },
            install: { run: "npm install", pre: [] },
          },
        },
      };

      fs.writeFileSync(
        configPath,
        JSON.stringify(defaultConfig, null, 2),
        "utf8"
      );
    }

    const document = await vscode.workspace.openTextDocument(configPath);
    await vscode.window.showTextDocument(document);
  }
}
