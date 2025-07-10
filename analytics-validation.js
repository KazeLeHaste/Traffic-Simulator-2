/**
 * Analytics Implementation Validation Script
 * 
 * This script can be run in the browser console to validate
 * that the analytics implementation is working correctly.
 */

function validateAnalyticsImplementation() {
    console.log('🔍 Starting Analytics Implementation Validation...\n');
    
    const results = [];
    
    // Test 1: Check if SessionAnalyticsStorage is available
    try {
        const storageAvailable = typeof window !== 'undefined' && 
                                window.sessionStorage !== undefined;
        results.push({
            test: 'SessionStorage Availability',
            passed: storageAvailable,
            message: storageAvailable ? 'SessionStorage is available' : 'SessionStorage not available'
        });
    } catch (error) {
        results.push({
            test: 'SessionStorage Availability',
            passed: false,
            message: 'Error checking sessionStorage: ' + error.message
        });
    }
    
    // Test 2: Check if analytics route exists
    const currentUrl = window.location.href;
    const hasAnalyticsRoute = currentUrl.includes('/analytics') || 
                             document.querySelector('a[href*="analytics"]') !== null;
    results.push({
        test: 'Analytics Route/Navigation',
        passed: hasAnalyticsRoute,
        message: hasAnalyticsRoute ? 'Analytics navigation found' : 'Analytics navigation not found'
    });
    
    // Test 3: Check if analytics CSS is loaded
    const analyticsStyles = Array.from(document.styleSheets).some(sheet => {
        try {
            return sheet.href && sheet.href.includes('analytics.css');
        } catch (e) {
            return false;
        }
    });
    results.push({
        test: 'Analytics CSS Loading',
        passed: analyticsStyles,
        message: analyticsStyles ? 'Analytics CSS is loaded' : 'Analytics CSS not found'
    });
    
    // Test 4: Test sessionStorage functionality
    try {
        const testKey = 'analyticsValidationTest';
        const testData = { test: true, timestamp: Date.now() };
        
        // Write test data
        sessionStorage.setItem(testKey, JSON.stringify(testData));
        
        // Read test data
        const retrieved = JSON.parse(sessionStorage.getItem(testKey));
        const writeReadWorks = retrieved && retrieved.test === true;
        
        // Clean up
        sessionStorage.removeItem(testKey);
        
        results.push({
            test: 'SessionStorage Read/Write',
            passed: writeReadWorks,
            message: writeReadWorks ? 'SessionStorage read/write works' : 'SessionStorage read/write failed'
        });
    } catch (error) {
        results.push({
            test: 'SessionStorage Read/Write',
            passed: false,
            message: 'Error testing sessionStorage: ' + error.message
        });
    }
    
    // Test 5: Check for existing analytics data structure
    try {
        const existingData = sessionStorage.getItem('trafficAnalytics');
        const isValidStructure = existingData === null || 
                                (Array.isArray(JSON.parse(existingData)));
        results.push({
            test: 'Analytics Data Structure',
            passed: isValidStructure,
            message: isValidStructure ? 'Analytics data structure is valid' : 'Invalid analytics data structure'
        });
    } catch (error) {
        results.push({
            test: 'Analytics Data Structure',
            passed: false,
            message: 'Error checking analytics data structure: ' + error.message
        });
    }
    
    // Display results
    console.log('📊 Validation Results:\n');
    results.forEach((result, index) => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${result.test}: ${result.message}`);
    });
    
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    
    console.log(`\n📈 Summary: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All validation tests passed! Analytics implementation looks good.');
    } else {
        console.log('⚠️  Some tests failed. Please check the implementation.');
    }
    
    return results;
}

// Helper function to simulate adding analytics data for testing
function addTestAnalyticsData() {
    const testData = {
        id: 'test-' + Date.now(),
        timestamp: new Date().toISOString(),
        intersectionName: 'Test Intersection ' + Math.floor(Math.random() * 100),
        kpiData: {
            totalVehicles: Math.floor(Math.random() * 200) + 50,
            averageWaitTime: Math.round((Math.random() * 50 + 10) * 10) / 10,
            throughput: Math.round((Math.random() * 40 + 60) * 10) / 10,
            averageSpeed: Math.round((Math.random() * 30 + 20) * 10) / 10,
            maxQueueLength: Math.floor(Math.random() * 20) + 5,
            greenTimeEfficiency: Math.round((Math.random() * 30 + 70) * 10) / 10
        }
    };
    
    try {
        const existing = JSON.parse(sessionStorage.getItem('trafficAnalytics') || '[]');
        existing.push(testData);
        sessionStorage.setItem('trafficAnalytics', JSON.stringify(existing));
        console.log('✅ Test analytics data added:', testData);
        return testData;
    } catch (error) {
        console.error('❌ Failed to add test analytics data:', error);
        return null;
    }
}

// Helper function to clear all analytics data
function clearAnalyticsData() {
    try {
        sessionStorage.removeItem('trafficAnalytics');
        console.log('✅ Analytics data cleared');
    } catch (error) {
        console.error('❌ Failed to clear analytics data:', error);
    }
}

// Helper function to view current analytics data
function viewAnalyticsData() {
    try {
        const data = JSON.parse(sessionStorage.getItem('trafficAnalytics') || '[]');
        console.log('📊 Current analytics data:', data);
        return data;
    } catch (error) {
        console.error('❌ Failed to retrieve analytics data:', error);
        return null;
    }
}

// Auto-run validation when script is loaded in browser console
if (typeof window !== 'undefined') {
    console.log('🔧 Analytics Validation Script Loaded');
    console.log('Available functions:');
    console.log('- validateAnalyticsImplementation() - Run all validation tests');
    console.log('- addTestAnalyticsData() - Add sample analytics data');
    console.log('- clearAnalyticsData() - Clear all analytics data');
    console.log('- viewAnalyticsData() - View current analytics data');
    console.log('\nRun validateAnalyticsImplementation() to start testing.\n');
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
    window.analyticsValidation = {
        validate: validateAnalyticsImplementation,
        addTestData: addTestAnalyticsData,
        clearData: clearAnalyticsData,
        viewData: viewAnalyticsData
    };
}
