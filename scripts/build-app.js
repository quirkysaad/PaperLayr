import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

console.log('🚀 Starting PaperLayr Production Build...\n');

// 1. Check for signing key
let hasKey = Boolean(process.env.TAURI_SIGNING_PRIVATE_KEY);
const possibleKeyPaths = [
  path.join(os.homedir(), '.tauri', 'paperlayr.key'),
  path.join(process.cwd(), 'paperlayr.key'),
  path.join(process.cwd(), 'src-tauri', 'paperlayr.key'),
];

if (!hasKey) {
  for (const keyPath of possibleKeyPaths) {
    if (fs.existsSync(keyPath)) {
      console.log(`🔑 Detected private signing key at: ${keyPath}`);
      process.env.TAURI_SIGNING_PRIVATE_KEY = fs.readFileSync(keyPath, 'utf8').trim();
      if (process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD === undefined) {
        process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD = '';
      }
      hasKey = true;
      break;
    }
  }
}

let tauriArgs = 'tauri build';
if (!hasKey) {
  console.log('⚠️  No updater signing key detected. Building without updater artifacts...');
  tauriArgs = 'tauri build -c \'{"bundle":{"createUpdaterArtifacts":false}}\'';
} else {
  console.log('✅ Signing key configured for auto-updater artifacts.');
}

// 2. Run Tauri build
console.log('\n📦 Compiling frontend and native binaries...');
try {
  execSync(`npx ${tauriArgs}`, { stdio: 'inherit', env: process.env });
} catch (error) {
  console.error('\n❌ Tauri build failed.');
  process.exit(1);
}

// 3. Post-build macOS codesigning fix
if (process.platform === 'darwin') {
  const appPath = path.resolve('src-tauri/target/release/bundle/macos/PaperLayr.app');
  const dmgDir = path.resolve('src-tauri/target/release/bundle/dmg');
  const dmgScript = path.join(dmgDir, 'bundle_dmg.sh');

  if (fs.existsSync(appPath)) {
    console.log('\n🔏 Applying ad-hoc codesign to PaperLayr.app...');
    try {
      execSync(`codesign --force --deep -s - "${appPath}"`, { stdio: 'inherit' });
      execSync(`codesign --verify --deep --strict --verbose=1 "${appPath}"`, { stdio: 'inherit' });
      console.log('✅ App bundle signature successfully validated.');
    } catch (err) {
      console.warn('⚠️  Warning: codesign step had an issue:', err.message);
    }

    if (fs.existsSync(dmgDir)) {
      console.log('\n📀 Packaging signed application into DMG...');
      try {
        const dmgFiles = fs.readdirSync(dmgDir).filter(f => f.endsWith('.dmg') && !f.startsWith('rw.'));
        const dmgName = dmgFiles[0] || 'PaperLayr_0.1.0_aarch64.dmg';
        const dmgPath = path.join(dmgDir, dmgName);
        execSync(`hdiutil create -volname "PaperLayr" -srcfolder "${appPath}" -ov -format UDZO "${dmgPath}"`, {
          stdio: 'inherit',
        });
        console.log('✅ DMG installer updated with signed bundle.');
      } catch (err) {
        console.warn('⚠️  Warning: DMG packaging issue:', err.message);
      }
    }
  }
}

console.log('\n🎉 Production build complete!');
