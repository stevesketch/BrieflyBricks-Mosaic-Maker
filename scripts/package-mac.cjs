const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { packager } = require('@electron/packager');

async function main() {
  const targetArch = process.argv[2] || 'arm64'; // Default to modern Apple Silicon (M1/M2/M3/M4) or x64
  console.log('🚀 Building web application with Vite...');
  execSync('npm run build', { stdio: 'inherit' });

  const rootDir = path.resolve(__dirname, '..');
  const outDir = path.join(rootDir, 'dist-mac');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const arches = targetArch === 'all' ? ['arm64', 'x64'] : [targetArch];

  for (const arch of arches) {
    console.log(`\n📦 Packaging BrickMosaic Studio for macOS (${arch})...`);
    const appPaths = await packager({
      dir: rootDir,
      name: 'BrickMosaic Studio',
      platform: 'darwin',
      arch: arch,
      out: outDir,
      overwrite: true,
      appBundleId: 'com.brickmosaic.studio',
      appCategoryType: 'public.app-category.graphics-design',
      appVersion: '1.0.0',
      buildVersion: '1.0.0',
      prune: false,
      ignore: [
        /^\/src/,
        /^\/\.git/,
        /^\/dist-mac/,
        /^\/scripts/,
        /\.md$/,
        /tsconfig.*\.json$/,
      ],
    });

    for (const appPath of appPaths) {
      console.log(`✅ Successfully built: ${appPath}`);
      const appFolderName = path.basename(appPath);
      const tarName = `BrickMosaic-Studio-macOS-${arch}.tar.gz`;
      const zipName = `BrickMosaic-Studio-macOS-${arch}.zip`;
      const tarPath = path.join(outDir, tarName);
      const zipPath = path.join(outDir, zipName);

      console.log(`🗜️ Creating distribution archive: ${tarName}...`);
      try {
        execSync(`cd "${outDir}" && tar -czf "${tarName}" "${appFolderName}"`, { stdio: 'inherit' });
        console.log(`🎉 Standalone tar.gz archive ready: ${tarPath}`);
      } catch (tarErr) {
        console.warn(`Could not create tar.gz archive: ${tarErr.message}`);
      }

      console.log(`🗜️ Creating distribution archive: ${zipName}...`);
      try {
        execSync(`python3 -c "import shutil, sys; shutil.make_archive(sys.argv[1], 'zip', sys.argv[2], sys.argv[3])" "${path.join(outDir, 'BrickMosaic-Studio-macOS-' + arch)}" "${outDir}" "${appFolderName}"`, { stdio: 'inherit' });
        console.log(`🎉 Standalone zip archive ready: ${zipPath}`);
      } catch (zipErr) {
        console.warn(`Could not create zip archive: ${zipErr.message}`);
      }
    }
  }

  console.log('\n✨ All macOS standalone builds completed in dist-mac/ !');
}

main().catch((err) => {
  console.error('Packaging failed:', err);
  process.exit(1);
});
