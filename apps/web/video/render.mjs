// Renders video/story.html frame by frame and encodes the homepage video.
//   NODE_PATH=$(npm root -g) node video/render.mjs
// Needs Playwright (with Chromium) and ffmpeg. Writes assets/video/askcompass-story.{mp4,webm,jpg}.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, 'assets/video');
const FPS = 30;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(pathToFileURL(join(ROOT, 'video/story.html')).href + '?capture');
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
const duration = await page.evaluate(() => window.DURATION);
const frames = Math.round(duration * FPS);

const raw = join(OUT, '.master.mp4');
const enc = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-crf', '12', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', raw], { stdio: ['pipe', 'inherit', 'inherit'] });
for (let i = 0; i < frames; i++) {
  await page.evaluate((t) => window.render(t), i / FPS);
  const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
  if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
  if (i % 150 === 0) console.log(`frame ${i}/${frames}`);
}
enc.stdin.end();
await new Promise((r) => enc.on('close', r));
await page.evaluate((t) => window.render(t), 14.6);
await page.screenshot({ path: join(OUT, 'askcompass-story.jpg'), type: 'jpeg', quality: 82 });
await browser.close();

const run = (args) => new Promise((res, rej) => spawn('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: 'inherit' }).on('close', (c) => (c ? rej(new Error('ffmpeg ' + c)) : res())));
await run(['-i', raw, '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', join(OUT, 'askcompass-story.mp4')]);
await run(['-i', raw, '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', '-an', join(OUT, 'askcompass-story.webm')]);
(await import('node:fs')).rmSync(raw);
console.log('done');
