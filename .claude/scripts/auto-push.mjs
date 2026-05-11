import { execSync } from "child_process";
import { readFileSync } from "fs";

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(raw);
    const filePath =
      data.tool_input?.file_path || data.tool_input?.filePath || "";
    if (!filePath) return;

    const projectRoot = "C:/Users/Administrator/.openclaw/workspace/profitscope";
    const basename = filePath.replace(/\\/g, "/").split("/").pop();

    execSync(`git add "${filePath}"`, { cwd: projectRoot, stdio: "pipe" });
    execSync(`git commit -m "auto: update ${basename}"`, {
      cwd: projectRoot,
      stdio: "pipe",
    });
    execSync(`git push`, { cwd: projectRoot, stdio: "pipe" });
  } catch {
    // No changes to commit, or push failed — silently ignore
  }
});
