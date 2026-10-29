import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const modulePath=process.env.PLAYWRIGHT_MODULE_PATH||'playwright';
const {chromium}=await import(modulePath);
const [html,seconds,destination]=process.argv.slice(2);
if(!html||!destination||!Number.isFinite(Number(seconds)))throw Error('Usage: node capture.mjs index.html seconds output.png');
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage();await page.goto(pathToFileURL(path.resolve(html)).href);await page.evaluate(()=>document.fonts.ready);
  const size=await page.evaluate(()=>({width:videoCompare.width,height:videoCompare.height}));await page.setViewportSize(size);
  await page.evaluate(t=>videoCompare.seek(t),Number(seconds));await fs.mkdir(path.dirname(path.resolve(destination)),{recursive:true});await page.screenshot({path:destination});
}finally{await browser.close();}
