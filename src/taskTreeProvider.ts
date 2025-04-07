import * as vscode from "vscode";
import { Task } from "./task";
import { TaskRunner } from "./taskRunner";

export class TaskTreeItem extends vscode.TreeItem {
  constructor(
    public readonly task: Task,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    private readonly taskRunner?: TaskRunner,
  ) {
    super(task.name, collapsibleState);
    this.tooltip = task.description;
    this.contextValue = "task";
    this.command = {
      command: "qrun.treeItemDoubleClick",
      title: "Focus Terminal",
      arguments: [task.fullName],
    };
    this.updateIcon();
  }

  private updateIcon() {
    // Oneshot tasks use 'target' icon
    if (this.task.oneshot) {
      this.iconPath = new vscode.ThemeIcon("target");
      return;
    }

    // Running tasks use 'play' icon, otherwise use 'terminal'
    if (this.taskRunner && this.taskRunner.isTaskRunning(this.task)) {
      this.iconPath = new vscode.ThemeIcon("play");
    } else {
      this.iconPath = new vscode.ThemeIcon("terminal");
    }
  }

  public refreshIcon() {
    this.updateIcon();
  }
}

export class GroupTreeItem extends vscode.TreeItem {
  constructor(
    public readonly groupName: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(groupName, collapsibleState);
    this.contextValue = "group";
    this.command = undefined;
  }
}

export class TaskTreeProvider
  implements vscode.TreeDataProvider<TaskTreeItem | GroupTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    TaskTreeItem | GroupTreeItem | undefined | null | void
  > = new vscode.EventEmitter<
    TaskTreeItem | GroupTreeItem | undefined | null | void
  >();
  readonly onDidChangeTreeData: vscode.Event<
    TaskTreeItem | GroupTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private tasks: Task[] = [];
  private taskRunner?: TaskRunner;

  constructor(taskRunner?: TaskRunner) {
    this.taskRunner = taskRunner;
  }

  public setTasks(tasks: Task[]): void {
    this.tasks = tasks;
    this.refresh();
  }

  public setTaskRunner(taskRunner: TaskRunner): void {
    this.taskRunner = taskRunner;
    this.refresh();
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TaskTreeItem | GroupTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: TaskTreeItem | GroupTreeItem,
  ): Thenable<(TaskTreeItem | GroupTreeItem)[]> {
    if (!this.tasks || this.tasks.length === 0) {
      return Promise.resolve([]);
    }

    if (!element) {
      const groups = new Map<string, Task[]>();
      const ungroupedTasks: Task[] = [];

      for (const task of this.tasks) {
        if (task.groupName) {
          if (!groups.has(task.groupName)) {
            groups.set(task.groupName, []);
          }
          groups.get(task.groupName)!.push(task);
        } else {
          ungroupedTasks.push(task);
        }
      }

      const items: (TaskTreeItem | GroupTreeItem)[] = [];

      for (const task of ungroupedTasks) {
        items.push(
          new TaskTreeItem(
            task,
            vscode.TreeItemCollapsibleState.None,
            this.taskRunner,
          ),
        );
      }

      for (const [groupName, groupTasks] of groups) {
        items.push(
          new GroupTreeItem(
            groupName,
            vscode.TreeItemCollapsibleState.Expanded,
          ),
        );
      }

      return Promise.resolve(items);
    }

    if (element instanceof GroupTreeItem) {
      const groupTasks = this.tasks.filter(
        (task) => task.groupName === element.groupName,
      );
      return Promise.resolve(
        groupTasks.map(
          (task) =>
            new TaskTreeItem(
              task,
              vscode.TreeItemCollapsibleState.None,
              this.taskRunner,
            ),
        ),
      );
    }

    return Promise.resolve([]);
  }

  public updateTaskState(task: Task): void {
    this.refresh();
  }
}
