import archiver from 'archiver';
import fs from 'fs-extra';
import os from 'os';
import rcedit from 'rcedit';
import winInstaller from 'electron-windows-installer';
import packagejson from '../package.json';

async function winRcedit() {
  return await new Promise(resolve => {
    console.log(`[${new Date()}] Starting winRcedit ...`);
    rcedit('release/win32/Kakapo-win32-x64/Kakapo.exe', {
      icon: 'node_modules/kakapo-assets/images/desktop/app.ico',
      'file-version': packagejson.version,
      'product-version': packagejson.version,
      'version-string': {
        CompanyName: 'Kakapo',
        ProductVersion: packagejson.version,
        ProductName: 'Kakapo',
        FileDescription: 'Kakapo',
        InternalName: 'Kakapo.exe',
        OriginalFilename: 'Kakapo.exe'
      }
    }, () => resolve(console.log(`[${new Date()}] Finished winRcedit`)));
  });
}

async function winZip() {
  return await new Promise((resolve, reject) => {
    console.log(`[${new Date()}] Starting winZip ...`);
    const output = fs.createWriteStream('./release/Kakapo-' + packagejson.version + '-Win.zip');
    const archive = archiver('zip');

    output.on('close', () =>
      resolve(console.log(`[${new Date()}] Finished winZip, size is ${(archive.pointer() / 1000000).toFixed(1)}mb`)));

    archive.on('error', err => reject(err));
    archive.pipe(output);
    archive.bulk([ {
      expand: true,
      cwd: './release/win32/Kakapo-win32-x64',
      src: [ '**/*' ] }
    ]);
    archive.finalize();
  });
}

async function winSetupExe() {
  return await new Promise((resolve, reject) => {
    if (os.platform() === 'win32') {
      console.log(`[${new Date()}] Starting winSetupExe ...`);
      winInstaller({
        appDirectory: 'release/win32/Kakapo-win32-x64',
        outputDirectory: 'release',
        authors: 'Daniel Levitt',
        loadingGif: 'node_modules/kakapo-assets/images/desktop/loading.gif',
        setupIcon: 'node_modules/kakapo-assets/images/desktop/app.ico',
        iconUrl: 'https://raw.githubusercontent.com/bluedaniel/Kakapo-assets/master/images/desktop/app.ico',
        description: 'Kakapo',
        title: 'Kakapo',
        exe: 'Kakapo.exe',
        version: packagejson.version,
        setupExe: 'KakapoSetup-' + packagejson.version + '-Win.exe'
      }).then(resolve(console.log(`[${new Date()}] Finished winSetupExe`)));
    } else {
      reject(console.log('Error: `winSetupExe` can only be run on a Windows machine!'));
    }
  });
}

export default async function installerWin() {
  await winRcedit();
  await winZip();
  await winSetupExe();
}
