const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('💡 Initializing EXAM Preparation Hub dev environment...');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Spawning Tailwind CSS Builder
console.log('🎨 Starting Tailwind CSS builder in watch mode...');
const tailwind = spawn('npx', ['tailwindcss', '-i', './src/input.css', '-o', './dist/output.css', '--watch'], {
  stdio: 'inherit',
  shell: true
});

// 2. Spawning Native Node JS static web server
console.log('🚀 Starting Local Web Server on port 3000...');
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true
});

// Standard shutdown handling
const cleanup = () => {
  console.log('\n🛑 Shutting down dev environment...');
  try {
    tailwind.kill('SIGINT');
  } catch (e) {}
  try {
    server.kill('SIGINT');
  } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
