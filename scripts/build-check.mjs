import { spawn } from "node:child_process";

// Builds into a throwaway folder so a running dev server keeps its own `.next`.
const child = spawn("next", ["build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: ".next-build" },
});

child.on("exit", (code) => process.exit(code ?? 0));
