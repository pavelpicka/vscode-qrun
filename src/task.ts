export interface TaskConfig {
  run: string;
  pre?: string[];
  cwd?: string;
}

export interface QRunConfig {
  tasks?: { [key: string]: TaskConfig };
  groups?: { [key: string]: { [key: string]: TaskConfig } };
}

export class Task {
  public readonly name: string;
  public readonly command: string;
  public readonly preTasks: string[];
  public readonly groupName?: string;
  public readonly cwd?: string;

  constructor(
    name: string,
    command: string,
    preTasks: string[] = [],
    groupName?: string,
    cwd?: string
  ) {
    this.name = name;
    this.command = command;
    this.preTasks = preTasks;
    this.groupName = groupName;
    this.cwd = cwd;
  }

  get fullName(): string {
    return this.groupName ? `${this.groupName}.${this.name}` : this.name;
  }

  get description(): string {
    const parts = [`Run: ${this.command}`];
    if (this.preTasks.length > 0) {
      parts.push(`Pre: ${this.preTasks.join("\n")}`);
    }
    if (this.cwd) {
      parts.push(`CWD: ${this.cwd}`);
    }
    return parts.join("\n");
  }
}
