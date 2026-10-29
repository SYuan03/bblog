import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
const modulePath=process.env.PLAYWRIGHT_MODULE_PATH||'playwright';
const {chromium}=await import(modulePath);
const [source,destination,frameFolder]=process.argv.slice(2),fps=24;
if(!source||!destination)throw Error('Usage: node render.mjs index.html reconstructed.mp4 [frame-folder]');
const run=(program,args)=>new Promise((resolve,reject)=>{const p=spawn(program,args,{stdio:['ignore','inherit','inherit']});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(Error(program+' exited '+code)));});
const browser=await chromium.launch({headless:true});const root=await fs.mkdtemp(path.join(os.tmpdir(),'codecap-isolated-'));
const frames=frameFolder?path.resolve(frameFolder):await fs.mkdtemp(path.join(os.tmpdir(),'codecap-frames-'));
const report={fps,entry:path.resolve(source),isolatedFiles:['index.html'],browserErrors:[],unexpectedRequests:[],frames:0};
try{
  await fs.copyFile(path.resolve(source),path.join(root,'index.html'));await fs.mkdir(frames,{recursive:true});
  const page=await browser.newPage();page.on('pageerror',e=>report.browserErrors.push(String(e)));page.on('request',r=>{if(r.url()!==pathToFileURL(path.join(root,'index.html')).href)report.unexpectedRequests.push(r.url());});
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.evaluate(()=>document.fonts.ready);
  const info=await page.evaluate(()=>({duration:videoCompare.duration,width:videoCompare.width,height:videoCompare.height}));
  if(!Object.values(info).every(Number.isFinite)||info.duration<=0)throw Error('Invalid videoCompare metadata');Object.assign(report,info);await page.setViewportSize({width:info.width,height:info.height});
  const count=Math.ceil(info.duration*fps);report.frames=count;
  for(let i=0;i<count;i++){
    await page.evaluate(t=>videoCompare.seek(t),i/fps);
    await page.screenshot({path:path.join(frames,String(i).padStart(6,'0')+'.png')});
    if(i%96===0)console.log(`Captured ${i}/${count} frames at t=${(i/fps).toFixed(2)}s`);
  }
  if(report.browserErrors.length||report.unexpectedRequests.length)throw Error('Unexpected browser error or dependency');
  await fs.mkdir(path.dirname(path.resolve(destination)),{recursive:true});
  await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(fps),'-start_number','0','-i',path.join(frames,'%06d.png'),'-frames:v',String(count),'-an','-c:v','libx264','-crf','12','-pix_fmt','yuv420p','-movflags','+faststart',path.resolve(destination)]);
  report.output=path.resolve(destination);report.completed=true;await fs.writeFile(destination+'.render.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await fs.rm(root,{recursive:true,force:true});if(!frameFolder)await fs.rm(frames,{recursive:true,force:true});}
