import * as assert from "assert";
import * as vscode from "vscode";
import { Task } from "../src/task";
import { ConfigLoader } from "../src/configLoader";
import { TaskRunner } from "../src/taskRunner";

suite("QuickRun Tests", () => {
  test("Task Model", () => {
    const task = new Task("test", 'echo "test"', ["pre1", "pre2"], "group1");
    assert.strictEqual(task.name, "test");
    assert.strictEqual(task.command, 'echo "test"');
    assert.deepStrictEqual(task.preTasks, ["pre1", "pre2"]);
    assert.strictEqual(task.groupName, "group1");
    assert.strictEqual(task.fullName, "group1.test");
  });

  test("Task without group", () => {
    const task = new Task("test", 'echo "test"');
    assert.strictEqual(task.fullName, "test");
  });

  test("Task model creates correct fullName and description", () => {
    const task = new Task("test", "npm test", ["prep1", "prep2"], "TestGroup");

    assert.strictEqual(task.fullName, "TestGroup.test");
    assert.strictEqual(task.description, "Run: npm test\nPre: prep1\nprep2");

    const rootTask = new Task("rootTask", "npm run build", []);
    assert.strictEqual(rootTask.fullName, "rootTask");
    assert.strictEqual(rootTask.description, "Run: npm run build");
  });

  test("ConfigLoader parses valid config correctly", () => {
    const jsonConfig = `{
			"tasks": {
				"build": {"run": "npm run build", "pre": []},
				"test": {"run": "npm test", "pre": ["build"]}
			},
			"groups": {
				"Frontend": {
					"dev": {"run": "npm run dev", "pre": ["install"]},
					"install": {"run": "npm install", "pre": []}
				}
			}
		}`;

    const config = JSON.parse(jsonConfig);
    const tasks = (ConfigLoader as any).parseConfig(config);

    assert.strictEqual(tasks.length, 4);

    const rootTasks = tasks.filter((t: Task) => !t.groupName);
    assert.strictEqual(rootTasks.length, 2);
    assert.ok(rootTasks.some((t: Task) => t.name === "build"));
    assert.ok(rootTasks.some((t: Task) => t.name === "test"));

    const groupedTasks = tasks.filter((t: Task) => t.groupName === "Frontend");
    assert.strictEqual(groupedTasks.length, 2);
    assert.ok(groupedTasks.some((t: Task) => t.name === "dev"));
    assert.ok(groupedTasks.some((t: Task) => t.name === "install"));
  });
});

suite("TaskRunner Tests", () => {
  test("Terminal reuse", async () => {
    const task = new Task("test-task", 'echo "test"', [], undefined, "/test");

    let createdTerminals: vscode.Terminal[] = [];
    const mockTerminal = {
      name: `QuickRun: ${task.fullName}`,
      show: () => {},
      sendText: () => {},
      dispose: () => {},
    };

    const originalWindow = vscode.window;
    (vscode.window as any) = {
      createTerminal: () => {
        createdTerminals.push(mockTerminal as any);
        return mockTerminal;
      },
      terminals: createdTerminals,
    };

    const taskRunner = new TaskRunner([task]);

    await taskRunner.runTask(task);
    assert.strictEqual(
      createdTerminals.length,
      1,
      "First run should create a new terminal",
    );

    await taskRunner.runTask(task);
    assert.strictEqual(
      createdTerminals.length,
      1,
      "Second run should reuse existing terminal",
    );

    (vscode.window as any) = originalWindow;
  });
});
