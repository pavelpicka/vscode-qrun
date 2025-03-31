import * as vscode from "vscode";
import { Task } from "./task";

export class TaskTreeItem extends vscode.TreeItem {
  constructor(
    public readonly task: Task,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(task.name, collapsibleState);
    this.tooltip = task.description;
    this.contextValue = "task";
    this.command = undefined;
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

  public setTasks(tasks: Task[]): void {
    this.tasks = tasks;
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
          new TaskTreeItem(task, vscode.TreeItemCollapsibleState.None),
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
            new TaskTreeItem(task, vscode.TreeItemCollapsibleState.None),
        ),
      );
    }

    return Promise.resolve([]);
  }

  public updateTaskState(task: Task): void {
    this.refresh();
  }
}
