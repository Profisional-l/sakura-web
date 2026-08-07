import { rmSync } from "node:fs";
import { execSync, spawn } from "node:child_process";

const ports = [3000, 3001, 3002, 3003];

if (process.platform === "win32") {
  for (const port of ports) {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      const pids = [...output.matchAll(/LISTENING\s+(\d+)/g)].map((m) => Number(m[1]));
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        } catch {
          // ignore
        }
      }
    } catch {
      // port not in use
    }
  }
}

try {
  rmSync(".next", { recursive: true, force: true });
  console.log("Cleaned .next cache");
} catch {
  // ignore
}

const child = spawn("next", ["dev"], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
