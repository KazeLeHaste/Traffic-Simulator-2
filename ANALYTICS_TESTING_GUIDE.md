# Analytics Page Testing Guide

## Overview
This guide provides step-by-step instructions to test the Analytics page functionality.

## Prerequisites
- Traffic simulator should be running at http://localhost:3000
- Browser with Developer Tools available for testing sessionStorage

## Test Scenarios

### 1. Navigation Test
**Objective**: Verify the Analytics page is accessible from the main navigation
**Steps**:
1. Open the traffic simulator in your browser
2. Look for "Analytics" in the main navigation menu
3. Click on "Analytics"
4. Verify you're redirected to the Analytics page
5. Confirm the page displays "No analytics data available for this session" initially

### 2. Session Storage Test
**Objective**: Verify analytics data is session-only and not persistent
**Steps**:
1. Open browser Developer Tools (F12)
2. Go to Application/Storage tab → Session Storage
3. Look for analytics entries (should be empty initially)
4. Run the test below to add data
5. Refresh the page - data should be cleared
6. Close and reopen the tab - data should be cleared

### 3. KPI Benchmark Integration Test
**Objective**: Test the "Add to Analytics" functionality
**Steps**:
1. Navigate to the simulation page
2. Set up a simple intersection (if not already configured)
3. Run a KPI Benchmark Test:
   - Look for the KPI Benchmark section
   - Click "Run Benchmark"
   - Wait for the benchmark to complete
4. After completion, verify:
   - "Add to Analytics" button appears and is enabled
   - Click "Add to Analytics"
   - Button becomes disabled with text "Added to Analytics"
   - Success message appears

### 4. Analytics Page Display Test
**Objective**: Verify analytics data is properly displayed
**Steps**:
1. After adding benchmark data (from test 3), navigate to Analytics page
2. Verify:
   - Analytics entry is displayed in a card format
   - Entry shows timestamp, intersection name, and KPI values
   - "Compare" checkbox is available
   - "Remove" button is available

### 5. Multi-Entry Comparison Test
**Objective**: Test side-by-side comparison of multiple analytics entries
**Steps**:
1. Add multiple benchmark results to analytics (repeat test 3 with different configurations)
2. Go to Analytics page
3. Select multiple entries using checkboxes
4. Verify comparison view shows:
   - Side-by-side layout of selected entries
   - Clear labeling of each entry
   - Proper KPI value formatting

### 6. Data Management Test
**Objective**: Test removing analytics entries
**Steps**:
1. Have at least one analytics entry
2. Click "Remove" button on an entry
3. Verify entry is immediately removed from the display
4. Confirm sessionStorage is updated (check in Developer Tools)

### 7. Responsive Design Test
**Objective**: Verify analytics page works on different screen sizes
**Steps**:
1. Test on desktop browser (full width)
2. Resize browser window to tablet size
3. Resize to mobile size
4. Verify layout adapts properly and remains usable

### 8. Dark Theme Consistency Test
**Objective**: Verify analytics page respects the application's dark theme
**Steps**:
1. If the app has dark theme enabled, verify analytics page uses dark styling
2. Check that colors, contrast, and readability are appropriate
3. Verify consistency with other pages in the application

## Expected Results

### Successful Implementation Should Show:
- ✅ Analytics page accessible via main navigation
- ✅ Data stored only in sessionStorage, cleared on refresh/tab close
- ✅ "Add to Analytics" button works correctly with state management
- ✅ Analytics entries display properly with all KPI data
- ✅ Multi-selection and comparison functionality works
- ✅ Remove functionality works correctly
- ✅ Responsive design adapts to different screen sizes
- ✅ Dark theme consistency maintained
- ✅ No console errors during normal operation

### Common Issues to Check:
- ❌ Analytics link missing from navigation
- ❌ "Add to Analytics" button not appearing after benchmark
- ❌ Data persisting after page refresh (should not happen)
- ❌ Console errors when navigating to analytics page
- ❌ Styling inconsistencies with the rest of the application
- ❌ Comparison view not working properly
- ❌ Remove functionality not working

## Browser Developer Tools Commands

To manually test sessionStorage functionality:

```javascript
// Check current analytics data
console.log(JSON.parse(sessionStorage.getItem('trafficAnalytics') || '[]'));

// Clear analytics data
sessionStorage.removeItem('trafficAnalytics');

// Add test data
const testData = {
    id: 'test-' + Date.now(),
    timestamp: new Date().toISOString(),
    intersectionName: 'Test Intersection',
    kpiData: {
        totalVehicles: 100,
        averageWaitTime: 25.5,
        throughput: 85.2,
        averageSpeed: 45.3
    }
};
const existing = JSON.parse(sessionStorage.getItem('trafficAnalytics') || '[]');
existing.push(testData);
sessionStorage.setItem('trafficAnalytics', JSON.stringify(existing));
```

## Notes
- All analytics data should be temporary and session-only
- Data should NOT persist between browser sessions
- The feature should integrate seamlessly with existing KPI benchmarking
- UI should be consistent with the rest of the application
