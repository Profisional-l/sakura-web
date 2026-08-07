import { spawn } from "node:child_process";
import { connect } from "node:net";
import { rmSync } from "node:fs";

const DEV_PORTS = [3000, 3001, 3002, 3003];

function isPortServing(port) {
  return new Promise((resolve) => {
    const socket = connect({ port, host: "127.0.0.1" });
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(700);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

const serving = await Promise.all(DEV_PORTS.map(isPortServing));
let devServerRunning = serving.some(Boolean);

// On Windows a running dev server keeps a lock on `.next`, so wiping it
// mid-build leaves the build hanging on files it can no longer read.
if (!devServerRunning) {
  try {
    rmSync(".next", { recursive: true, force: true });
    console.log("Cleaned .next cache");
  } catch {
    // Something still holds the folder — treat it like a live dev server.
    devServerRunning = true;
  }
}

const distDir = devServerRunning ? ".next-build" : ".next";

if (devServerRunning) {
  console.log(`.next is in use — building into ${distDir} instead`);
}

const child = spawn("next", ["build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: distDir },
});

child.on("exit", (code) => process.exit(code ?? 0));
