import * as vscode from "vscode";

export class NotificationManager {
  private static getConfig(setting: string): boolean {
    return vscode.workspace
      .getConfiguration("quickrun.notifications")
      .get(setting, false);
  }

  private static showInfoMessage(message: string): void {
    if (this.getConfig("showInfo")) {
      vscode.window.showInformationMessage(message);
    }
  }

  private static showErrorMessage(message: string): void {
    if (this.getConfig("showErrors")) {
      vscode.window.showErrorMessage(message);
    }
  }

  static showInfo(message: string): void {
    this.showInfoMessage(message);
  }

  static showError(message: string): void {
    this.showErrorMessage(message);
  }

  static showWarning(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined> {
    if (this.getConfig("showErrors")) {
      return vscode.window.showWarningMessage(message, ...items);
    }
    return Promise.resolve(undefined);
  }
}
