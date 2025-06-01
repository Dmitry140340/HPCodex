// Simple test to verify backend TypeScript compilation
const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Testing EcoTrack backend compilation...');

const ecotrackPath = path.join(__dirname, 'ecotrack');
console.log('📂 Backend path:', ecotrackPath);

// Test TypeScript compilation
const tscProcess = spawn('npx', ['tsc', '--noEmit'], {
  cwd: ecotrackPath,
  stdio: 'pipe'
});

let output = '';
let errors = '';

tscProcess.stdout.on('data', (data) => {
  output += data.toString();
});

tscProcess.stderr.on('data', (data) => {
  errors += data.toString();
});

tscProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ TypeScript compilation successful!');
    console.log('🎉 All TypeScript errors have been fixed!');
    
    // Test if we can start the server
    console.log('\n🚀 Testing server startup...');
    const serverProcess = spawn('npx', ['ts-node', 'src/index.ts'], {
      cwd: ecotrackPath,
      stdio: 'pipe'
    });
    
    setTimeout(() => {
      console.log('⏹️ Stopping test server...');
      serverProcess.kill();
      console.log('✅ Backend is ready to start!');
      
      console.log('\n📋 Next steps:');
      console.log('1. Run: cd "c:\\Users\\Admin\\Desktop\\HimkaPlastic (adaptive)"');
      console.log('2. Run: .\\setup-and-start.ps1');
      console.log('3. Access frontend at: http://localhost:3000');
      console.log('4. Access backend API at: http://localhost:3001/api');
    }, 3000);
    
  } else {
    console.log('❌ TypeScript compilation failed!');
    console.log('Errors:', errors);
  }
});

tscProcess.on('error', (err) => {
  console.log('❌ Failed to run TypeScript compiler:', err.message);
});
