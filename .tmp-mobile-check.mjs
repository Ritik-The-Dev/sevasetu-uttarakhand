import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import WebSocket from "ws";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = "C:\\Users\\hp\\AppData\\Local\\Temp\\opencode\\sevasetu-shots";
const profile = path.join(outDir, "cdp-profile");
const port = 9223;
fs.mkdirSync(outDir, { recursive: true });

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--window-size=800,900",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForVersion() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) return r.json();
    } catch {
      // Chrome is still starting.
    }
    await sleep(200);
  }
  throw new Error("Chrome did not start");
}

await waitForVersion();
const targetRes = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
const target = await targetRes.json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.once("open", resolve);
  ws.once("error", reject);
});

let nextId = 1;
const pending = new Map();
const events = new Map();
ws.on("message", (raw) => {
  const m = JSON.parse(raw.toString());
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method && events.has(m.method)) {
    events.get(m.method)(m.params);
    events.delete(m.method);
  }
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, (m) => (m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
}
function once(method) {
  return new Promise((resolve) => events.set(method, resolve));
}

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
  screenWidth: 390,
  screenHeight: 844,
});
await send("Emulation.setUserAgentOverride", {
  userAgent:
    "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
  platform: "Android",
});

const pages = [
  ["home", "http://localhost:8080/"],
  ["services", "http://localhost:8080/services"],
  ["assistant", "http://localhost:8080/assistant"],
  ["detail", "http://localhost:8080/services/income-certificate"],
  ["dashboard", "http://localhost:8080/dashboard"],
  ["about", "http://localhost:8080/about"],
];

const report = [];
for (const [name, url] of pages) {
  const loaded = once("Page.loadEventFired");
  await send("Page.navigate", { url });
  await loaded;
  await sleep(1800);
  const info = await send("Runtime.evaluate", {
    expression: `(() => {
      const vw = window.innerWidth;
      const all = [...document.querySelectorAll('body *')];
      const over = all.map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: typeof el.className === 'string' ? el.className.slice(0, 100) : '',
          right: Math.round(r.right),
          width: Math.round(r.width),
          text: (el.textContent || '').trim().slice(0, 50)
        };
      }).filter(x => x.right > vw + 1 || x.width > vw + 1).slice(0, 15);
      return JSON.stringify({
        title: document.title,
        vw,
        scrollY: Math.round(window.scrollY),
        scrollWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        h1: document.querySelector('h1')?.innerText || '',
        over
      });
    })()`,
    returnByValue: true,
  });
  report.push({ name, ...JSON.parse(info.result.value) });
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  fs.writeFileSync(path.join(outDir, `${name}-mobile.png`), Buffer.from(shot.data, "base64"));
}

fs.writeFileSync(path.join(outDir, "mobile-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

ws.close();
chrome.kill();
process.exit(0);
