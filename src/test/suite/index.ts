import * as path from "path";

export function run(): Promise<void> {
  const Mocha = require("mocha");
  const mocha = new Mocha({ ui: "tdd", color: true });
  const testsRoot = path.resolve(__dirname, "..");

  return new Promise((resolve, reject) => {
    mocha.addFile(path.resolve(testsRoot, "suite/extension.test.js"));

    mocha.run((failures: number) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve();
      }
    });
  });
}
