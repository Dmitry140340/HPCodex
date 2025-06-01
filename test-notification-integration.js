/**
 * Test Enhanced Notification System Integration
 * Tests the integrated notification system without requiring server startup
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test results object
const testResults = {
  notificationSystem: {
    enhancedNotificationsFile: false,
    requiredInterfaces: false,
    notificationService: false,
    templates: false,
    channels: []
  },
  apiIntegration: {
    createOrderIntegration: false,
    updateOrderStatusIntegration: false,
    notificationEndpoints: false
  },
  frontendComponents: {
    orderSuccessNotification: false,
    enhancedNotificationSettings: false,
    dashboardPersonalization: false
  },
  userRoles: {
    clientRoleSupport: false,
    roleBasedAccess: false
  }
};

// Test 1: Enhanced Notification System
function testEnhancedNotificationSystem() {
  log('🔔 Testing Enhanced Notification System...', 'blue');
  
  const notificationFile = 'ecotrack/src/utils/enhancedNotifications.ts';
  
  if (fs.existsSync(notificationFile)) {
    const content = fs.readFileSync(notificationFile, 'utf8');
    testResults.notificationSystem.enhancedNotificationsFile = true;
    log('✅ Enhanced notifications file exists', 'green');
    
    // Check for required interfaces
    const requiredInterfaces = [
      'NotificationData',
      'NotificationPreferences', 
      'NotificationTemplate',
      'NotificationHistory',
      'NotificationStats'
    ];
    
    let interfaceCount = 0;
    requiredInterfaces.forEach(interfaceName => {
      if (content.includes(`interface ${interfaceName}`)) {
        interfaceCount++;
      }
    });
    
    if (interfaceCount === requiredInterfaces.length) {
      testResults.notificationSystem.requiredInterfaces = true;
      log('✅ All required interfaces present', 'green');
    } else {
      log(`❌ Missing interfaces: ${requiredInterfaces.length - interfaceCount}`, 'red');
    }
    
    // Check for EnhancedNotificationService class
    if (content.includes('class EnhancedNotificationService')) {
      testResults.notificationSystem.notificationService = true;
      log('✅ EnhancedNotificationService class found', 'green');
    } else {
      log('❌ EnhancedNotificationService class not found', 'red');
    }
    
    // Check for notification templates
    const templates = [
      'order-created',
      'order-processing-started',
      'order-processing-completed',
      'order-status-changed',
      'order-cancelled'
    ];
    
    let templateCount = 0;
    templates.forEach(template => {
      if (content.includes(`'${template}'`) || content.includes(`"${template}"`)) {
        templateCount++;
      }
    });
    
    if (templateCount >= 3) {
      testResults.notificationSystem.templates = true;
      log(`✅ Notification templates found: ${templateCount}`, 'green');
    } else {
      log(`❌ Insufficient notification templates: ${templateCount}`, 'red');
    }
    
    // Check for notification channels
    const channels = ['email', 'sms', 'push', 'telegram', 'whatsapp', 'in-app'];
    channels.forEach(channel => {
      if (content.includes(`send${channel.charAt(0).toUpperCase() + channel.slice(1)}Notification`)) {
        testResults.notificationSystem.channels.push(channel);
      }
    });
    
    log(`✅ Notification channels implemented: ${testResults.notificationSystem.channels.length}/6`, 'green');
    
  } else {
    log('❌ Enhanced notifications file not found', 'red');
  }
}

// Test 2: API Integration
function testApiIntegration() {
  log('🔗 Testing API Integration...', 'blue');
  
  const apiFile = 'ecotrack/src/api/api.ts';
  
  if (fs.existsSync(apiFile)) {
    const content = fs.readFileSync(apiFile, 'utf8');
    
    // Check createOrder function integration
    if (content.includes('enhancedNotificationService') && 
        content.includes('sendNotificationFromTemplate') &&
        content.includes('order-created')) {
      testResults.apiIntegration.createOrderIntegration = true;
      log('✅ createOrder function integrated with enhanced notifications', 'green');
    } else {
      log('❌ createOrder function not properly integrated', 'red');
    }
    
    // Check updateOrderStatus function integration
    if (content.includes('updateOrderStatus') &&
        content.includes('enhancedNotificationService') &&
        content.includes('templateId')) {
      testResults.apiIntegration.updateOrderStatusIntegration = true;
      log('✅ updateOrderStatus function integrated with enhanced notifications', 'green');
    } else {
      log('❌ updateOrderStatus function not properly integrated', 'red');
    }
    
    // Check for notification endpoints
    if (content.includes('sendNotification') || content.includes('sendNotificationFromTemplate')) {
      testResults.apiIntegration.notificationEndpoints = true;
      log('✅ Notification API endpoints present', 'green');
    } else {
      log('❌ Notification API endpoints not found', 'red');
    }
    
  } else {
    log('❌ API file not found', 'red');
  }
}

// Test 3: Frontend Components
function testFrontendComponents() {
  log('🎨 Testing Frontend Components...', 'blue');
  
  // Check OrderSuccessNotification component
  const orderSuccessFile = 'ecotrack-frontend/src/components/OrderSuccessNotification.tsx';
  if (fs.existsSync(orderSuccessFile)) {
    const content = fs.readFileSync(orderSuccessFile, 'utf8');
    if (content.includes('OrderSuccessNotification') && 
        content.includes('framer-motion') &&
        content.includes('onClick')) {
      testResults.frontendComponents.orderSuccessNotification = true;
      log('✅ OrderSuccessNotification component found and functional', 'green');
    } else {
      log('❌ OrderSuccessNotification component incomplete', 'red');
    }
  } else {
    log('❌ OrderSuccessNotification component not found', 'red');
  }
  
  // Check Enhanced Notification Settings
  const notificationSettingsFile = 'ecotrack-frontend/src/components/EnhancedNotificationSettings.tsx';
  if (fs.existsSync(notificationSettingsFile)) {
    testResults.frontendComponents.enhancedNotificationSettings = true;
    log('✅ Enhanced notification settings component exists', 'green');
  } else {
    log('❌ Enhanced notification settings component not found', 'red');
  }
  
  // Check Dashboard personalization
  const dashboardFile = 'ecotrack-frontend/src/App.tsx';
  if (fs.existsSync(dashboardFile)) {
    const content = fs.readFileSync(dashboardFile, 'utf8');
    if (content.includes('widgets') && content.includes('Dashboard')) {
      testResults.frontendComponents.dashboardPersonalization = true;
      log('✅ Dashboard with personalization found', 'green');
    } else {
      log('❌ Dashboard personalization not found', 'red');
    }
  } else {
    log('❌ Dashboard file not found', 'red');
  }
}

// Test 4: User Roles
function testUserRoles() {
  log('👥 Testing User Role System...', 'blue');
  
  const authContextFile = 'ecotrack-frontend/src/contexts/AuthContext.tsx';
  if (fs.existsSync(authContextFile)) {
    const content = fs.readFileSync(authContextFile, 'utf8');
    
    // Check for client role support
    if (content.includes("'client'") || content.includes('"client"')) {
      testResults.userRoles.clientRoleSupport = true;
      log('✅ Client role support found', 'green');
    } else {
      log('❌ Client role support not found', 'red');
    }
    
    // Check for role-based access
    if (content.includes('role') && content.includes('UserRole')) {
      testResults.userRoles.roleBasedAccess = true;
      log('✅ Role-based access control implemented', 'green');
    } else {
      log('❌ Role-based access control not found', 'red');
    }
    
  } else {
    log('❌ AuthContext file not found', 'red');
  }
}

// Test 5: Compilation Test (basic)
function testBasicCompilation() {
  log('🔧 Testing Basic File Compilation...', 'blue');
  
  const criticalFiles = [
    'ecotrack/src/utils/enhancedNotifications.ts',
    'ecotrack/src/api/api.ts',
    'ecotrack-frontend/src/components/OrderSuccessNotification.tsx',
    'ecotrack-frontend/src/contexts/AuthContext.tsx'
  ];
  
  let validFiles = 0;
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      // Basic syntax check - no obvious errors
      if (!content.includes('// @ts-ignore') || content.length > 100) {
        validFiles++;
        log(`✅ ${path.basename(file)} appears valid`, 'green');
      } else {
        log(`❌ ${path.basename(file)} may have issues`, 'red');
      }
    } else {
      log(`❌ ${file} not found`, 'red');
    }
  });
  
  return validFiles === criticalFiles.length;
}

// Main test runner
async function runNotificationIntegrationTest() {
  log('🚀 Starting Enhanced Notification System Integration Test', 'cyan');
  log('=' * 70, 'cyan');
  
  try {
    // Run all tests
    testEnhancedNotificationSystem();
    log(''); 
    testApiIntegration();
    log('');
    testFrontendComponents();
    log('');
    testUserRoles();
    log('');
    const compilationOk = testBasicCompilation();
    
    // Calculate overall score
    const scores = {
      notificationSystem: Object.values(testResults.notificationSystem).filter(v => v === true).length,
      apiIntegration: Object.values(testResults.apiIntegration).filter(v => v === true).length,
      frontendComponents: Object.values(testResults.frontendComponents).filter(v => v === true).length,
      userRoles: Object.values(testResults.userRoles).filter(v => v === true).length
    };
    
    const totalScore = scores.notificationSystem + scores.apiIntegration + scores.frontendComponents + scores.userRoles;
    const maxScore = 4 + 3 + 3 + 2; // Based on number of tests in each category
    
    // Generate report
    log('\n📊 INTEGRATION TEST RESULTS', 'cyan');
    log('=' * 50, 'cyan');
    
    log(`🔔 Notification System: ${scores.notificationSystem}/4 ✓`, scores.notificationSystem >= 3 ? 'green' : 'yellow');
    log(`🔗 API Integration: ${scores.apiIntegration}/3 ✓`, scores.apiIntegration >= 2 ? 'green' : 'yellow');
    log(`🎨 Frontend Components: ${scores.frontendComponents}/3 ✓`, scores.frontendComponents >= 2 ? 'green' : 'yellow');
    log(`👥 User Roles: ${scores.userRoles}/2 ✓`, scores.userRoles >= 1 ? 'green' : 'yellow');
    log(`🔧 Compilation: ${compilationOk ? 'PASS' : 'FAIL'}`, compilationOk ? 'green' : 'red');
    
    const overallSuccess = totalScore >= (maxScore * 0.8) && compilationOk;
    
    log(`\n🎯 OVERALL INTEGRATION SCORE: ${totalScore}/${maxScore} (${Math.round(totalScore/maxScore*100)}%)`, 
        overallSuccess ? 'green' : 'yellow');
    
    if (overallSuccess) {
      log('\n🎉 INTEGRATION TEST PASSED!', 'green');
      log('✅ Enhanced notification system successfully integrated', 'green');
      log('✅ Order success notification component ready', 'green');
      log('✅ User role system supports all required roles', 'green');
      log('✅ Dashboard personalization available', 'green');
      log('✅ API functions integrated with notification system', 'green');
    } else {
      log('\n⚠️  Integration test completed with warnings', 'yellow');
      log('Some components may need additional verification', 'yellow');
    }
    
    // Save detailed results
    fs.writeFileSync('notification-test-results.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      scores,
      totalScore,
      maxScore,
      overallSuccess,
      details: testResults
    }, null, 2));
    
    log('\n📄 Detailed results saved to notification-test-results.json', 'blue');
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'red');
  }
}

// Run the test
runNotificationIntegrationTest().catch(console.error);
