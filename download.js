import https from 'https';
import JSZip from 'jszip';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

const url = 'https://github.com/ahanikotb/hemingway-clone/archive/refs/heads/main.zip';

// Download function
const download = () => {
  return new Promise((resolve, reject) => {
    let data = [];
    https.get(url, (response) => {
      response.on('data', chunk => data.push(chunk));
      response.on('end', () => resolve(Buffer.concat(data)));
      response.on('error', reject);
    });
  });
};

// Extract function
async function extractZip(buffer) {
  const zip = new JSZip();
  const contents = await zip.loadAsync(buffer);
  
  for (const [path, file] of Object.entries(contents.files)) {
    if (file.dir) continue;
    
    // Remove the root folder from path
    const newPath = path.split('/').slice(1).join('/');
    if (!newPath) continue;
    
    // Create directory if needed
    const dir = dirname(newPath);
    if (dir !== '.') {
      await mkdir(dir, { recursive: true }).catch(() => {});
    }
    
    // Write file
    const content = await file.async('nodebuffer');
    await writeFile(newPath, content);
  }
}

console.log('Downloading repository...');
const zipBuffer = await download();

console.log('Extracting files...');
await extractZip(zipBuffer);

console.log('Done! Now installing dependencies...');
