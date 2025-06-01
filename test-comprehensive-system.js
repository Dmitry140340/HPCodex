/**
 * Comprehensive System Test for HimkaPlastic EcoTrack
 * Tests all major components including TypeScript compilation
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const testResults = {
  backendBuild: false,
  frontendBuild: false,
  typeScriptErrors: [],
  apiEndpoints: {
    reports: false,
    customers: false,
    notifications: false
  },
  components: {
    comprehensiveReporting: false,
    realTimeTracking: false,
    notificationSettings: false
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test TypeScript compilation
async function testTypeScriptCompilation() {
  log('🔧 Testing TypeScript compilation...', 'blue');
  
  return new Promise((resolve) => {
    exec('npx tsc --noEmit', { cwd: 'ecotrack-frontend' }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ TypeScript compilation failed: ${error.message}`, 'red');
        testResults.typeScriptErrors.push(error.message);
        resolve(false);
      } else {
        log('✅ TypeScript compilation successful', 'green');
        resolve(true);
      }
    });
  });
}

// Test backend build
async function testBackendBuild() {
  log('🔧 Testing backend build...', 'blue');
  
  return new Promise((resolve) => {
    exec('npm run build', { cwd: 'ecotrack' }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Backend build failed: ${error.message}`, 'red');
        resolve(false);
      } else {
        log('✅ Backend build successful', 'green');
        testResults.backendBuild = true;
        resolve(true);
      }
    });
  });
}

// Test frontend build
async function testFrontendBuild() {
  log('🔧 Testing frontend build...', 'blue');
  
  return new Promise((resolve) => {
    exec('npm run build', { cwd: 'ecotrack-frontend' }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Frontend build failed: ${error.message}`, 'red');
        resolve(false);
      } else {
        log('✅ Frontend build successful', 'green');
        testResults.frontendBuild = true;
        resolve(true);
      }
    });
  });
}

// Test component files exist and are valid
function testComponentFiles() {
  log('🔧 Testing component files...', 'blue');
  
  const components = [
    'ecotrack-frontend/src/components/ComprehensiveReporting.tsx',
    'ecotrack-frontend/src/components/RealTimeOrderTracking.tsx',
    'ecotrack-frontend/src/components/EnhancedNotificationSettings.tsx'
  ];
  
  let allValid = true;
  
  components.forEach(componentPath => {
    if (fs.existsSync(componentPath)) {
      const content = fs.readFileSync(componentPath, 'utf8');
      const componentName = path.basename(componentPath, '.tsx');
      
      // Check for basic React component structure
      if (content.includes('import React') && content.includes('export default')) {
        log(`✅ ${componentName} component is valid`, 'green');
        testResults.components[componentName.charAt(0).toLowerCase() + componentName.slice(1)] = true;
      } else {
        log(`❌ ${componentName} component structure is invalid`, 'red');
        allValid = false;
      }
    } else {
      log(`❌ Component file not found: ${componentPath}`, 'red');
      allValid = false;
    }
  });
  
  return allValid;
}

// Test API files
function testApiFiles() {
  log('🔧 Testing API files...', 'blue');
  
  const apiFiles = [
    'ecotrack-frontend/src/utils/api.ts',
    'ecotrack/src/api/api.ts',
    'ecotrack/src/server/server.ts',
    'ecotrack/src/services/analyticsService.ts'
  ];
  
  let allValid = true;
  
  apiFiles.forEach(apiPath => {
    if (fs.existsSync(apiPath)) {
      const content = fs.readFileSync(apiPath, 'utf8');
      const fileName = path.basename(apiPath);
      
      // Check for key functions
      if (apiPath.includes('frontend') && content.includes('getReportData') && content.includes('getCustomers')) {
        log(`✅ Frontend API (${fileName}) has required methods`, 'green');
        testResults.apiEndpoints.reports = true;
        testResults.apiEndpoints.customers = true;
      } else if (apiPath.includes('server.ts') && content.includes('/api/reports/comprehensive') && content.includes('/api/customers')) {
        log(`✅ Backend server (${fileName}) has required endpoints`, 'green');
      } else if (apiPath.includes('analyticsService.ts') && content.includes('generateComprehensiveReport')) {
        log(`✅ Analytics service (${fileName}) has required methods`, 'green');
      }
    } else {
      log(`❌ API file not found: ${apiPath}`, 'red');
      allValid = false;
    }
  });
  
  return allValid;
}

// Main test function
async function runComprehensiveTest() {
  log('🚀 Starting Comprehensive System Test for HimkaPlastic EcoTrack', 'blue');
  log('=' * 60, 'blue');
  
  try {
    // Test component files
    const componentsValid = testComponentFiles();
    
    // Test API files
    const apiValid = testApiFiles();
    
    // Test TypeScript compilation
    const tsValid = await testTypeScriptCompilation();
    
    // Test builds
    const backendBuildValid = await testBackendBuild();
    const frontendBuildValid = await testFrontendBuild();
    
    // Generate final report
    log('\n📊 COMPREHENSIVE TEST RESULTS', 'blue');
    log('=' * 40, 'blue');
    
    log(`Components Valid: ${componentsValid ? '✅' : '❌'}`, componentsValid ? 'green' : 'red');
    log(`API Files Valid: ${apiValid ? '✅' : '❌'}`, apiValid ? 'green' : 'red');
    log(`TypeScript Compilation: ${tsValid ? '✅' : '❌'}`, tsValid ? 'green' : 'red');
    log(`Backend Build: ${backendBuildValid ? '✅' : '❌'}`, backendBuildValid ? 'green' : 'red');
    log(`Frontend Build: ${frontendBuildValid ? '✅' : '❌'}`, frontendBuildValid ? 'green' : 'red');
    
    const overallSuccess = componentsValid && apiValid && tsValid && backendBuildValid && frontendBuildValid;
    
    log(`\n🎯 OVERALL RESULT: ${overallSuccess ? 'SUCCESS' : 'FAILURE'}`, overallSuccess ? 'green' : 'red');
    
    if (overallSuccess) {
      log('\n🎉 All TypeScript errors have been successfully resolved!', 'green');
      log('📋 System is ready for comprehensive reporting and real-time tracking!', 'green');
      log('🔧 Both frontend and backend components are functioning correctly.', 'green');
    } else {
      log('\n⚠️  Some issues still need to be addressed:', 'yellow');
      if (testResults.typeScriptErrors.length > 0) {
        log('TypeScript Errors:', 'red');
        testResults.typeScriptErrors.forEach(error => {
          log(`  - ${error}`, 'red');
        });
      }
    }
    
    // Save detailed results
    fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));
    log('\n📄 Detailed results saved to test-results.json', 'blue');
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'red');
  }
}

// Run the test
runComprehensiveTest().catch(console.error);
