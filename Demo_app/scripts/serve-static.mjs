import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";

const root = await realpath(resolve("out")).catch(() => { throw new Error("Run npm run build before starting the static preview."); });
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".ttf": "font/ttf", ".txt": "text/plain; charset=utf-8" };

createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405, { Allow: "GET, HEAD" }).end(); return; }
  let filename;
  try { filename = resolve(root, `.${decodeURIComponent(new URL(request.url, "http://localhost").pathname)}`); }
  catch { response.writeHead(400).end(); return; }
  if (filename !== root && !filename.startsWith(root + sep)) { response.writeHead(403).end(); return; }
  let status = 200;
  try {
    if ((await stat(filename)).isDirectory()) filename = join(filename, "index.html");
    filename = await realpath(filename);
    if (!filename.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    if (!(await stat(filename)).isFile()) throw new Error("Not a file");
  } catch { filename = join(root, "404.html"); status = 404; }
  response.writeHead(status, { "Content-Type": types[extname(filename)] ?? "application/octet-stream", "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff" });
  if (request.method === "HEAD") { response.end(); return; }
  createReadStream(filename).on("error", () => response.destroy()).pipe(response);
}).listen(Number(process.env.PORT ?? 3000), "127.0.0.1", () => {
  console.log(`Static demo: http://127.0.0.1:${process.env.PORT ?? 3000} (no API server)`);
});
