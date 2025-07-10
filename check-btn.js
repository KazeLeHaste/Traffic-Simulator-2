console.log("Checking for compare-runs-btn in the template");
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'KPIVisualizationComponent.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Check if there is a compare-runs-btn in the template
if (content.includes('compare-runs-btn')) {
  console.log('Found compare-runs-btn in the template');
  // Extract the line
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('compare-runs-btn')) {
      console.log(`Line ${i+1}: ${lines[i]}`);
    }
  }
} else {
  console.log('compare-runs-btn not found in the template');
}

// Check for showComparisonPanel method
if (content.includes('showComparisonPanel')) {
  console.log('showComparisonPanel method found');
}
