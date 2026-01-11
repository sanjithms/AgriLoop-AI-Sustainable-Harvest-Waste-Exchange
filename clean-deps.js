const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Delete node_modules and package-lock.json
console.log('Cleaning up node_modules and package-lock.json...');

const directories = [
  './',
  './frontend',
  './backend'
];

directories.forEach(dir => {
  const nodeModulesPath = path.join(__dirname, dir, 'node_modules');
  const packageLockPath = path.join(__dirname, dir, 'package-lock.json');
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log(`Removing ${nodeModulesPath}...`);
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
  }
  
  if (fs.existsSync(packageLockPath)) {
    console.log(`Removing ${packageLockPath}...`);
    fs.unlinkSync(packageLockPath);
  }
});

console.log('Cleanup complete!');
console.log('Now run: npm install && cd frontend && npm install && cd ../backend && npm install');