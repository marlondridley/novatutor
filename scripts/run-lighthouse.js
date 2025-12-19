#!/usr/bin/env node

/**
 * 🔍 Lighthouse Audit Script for BestTutorEver
 * 
 * Usage: node scripts/run-lighthouse.js
 * 
 * Make sure your dev server is running first:
 * npm run dev
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  url: 'http://localhost:3000/landing', // Public page (no login required)
  preset: process.argv.includes('--mobile') ? undefined : 'desktop', // undefined = mobile default
  formFactor: process.argv.includes('--mobile') ? 'mobile' : 'desktop',
  outputDir: './lighthouse-reports',
  thresholds: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 85,
  },
};

console.log('🔍 BestTutorEver Lighthouse Audit');
console.log('================================\n');

// Check if Lighthouse is installed
console.log('📦 Checking for Lighthouse...');
exec('lighthouse --version', (error, stdout) => {
  if (error) {
    console.error('❌ Lighthouse is not installed!');
    console.log('\n💡 Install it with:');
    console.log('   npm install -g lighthouse\n');
    process.exit(1);
  }
  
  console.log(`✅ Lighthouse ${stdout.trim()} found\n`);
  runAudit();
});

function runAudit() {
  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const formFactorSuffix = CONFIG.formFactor === 'mobile' ? '-mobile' : '';
  const outputPath = path.join(CONFIG.outputDir, `report-${timestamp}${formFactorSuffix}.html`);
  const jsonPath = path.join(CONFIG.outputDir, `report-${timestamp}${formFactorSuffix}.json`);

  console.log(`🚀 Running Lighthouse audit on: ${CONFIG.url}`);
  console.log(`📊 Form Factor: ${CONFIG.formFactor} ${CONFIG.formFactor === 'mobile' ? '📱' : '🖥️'}`);
  console.log(`📁 Output: ${outputPath}\n`);

  // Build command based on form factor
  let command;
  if (CONFIG.formFactor === 'mobile') {
    command = `lighthouse "${CONFIG.url}" \
      --form-factor=mobile \
      --screenEmulation.mobile=true \
      --throttling-method=simulate \
      --output=html \
      --output=json \
      --output-path="${outputPath.replace('.html', '')}" \
      --view`;
  } else {
    command = `lighthouse "${CONFIG.url}" \
      --preset=${CONFIG.preset} \
      --output=html \
      --output=json \
      --output-path="${outputPath.replace('.html', '')}" \
      --view`;
  }

  console.log('⏳ Please wait 30-60 seconds...\n');

  exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Lighthouse audit failed!');
      console.error(error.message);
      
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Make sure your dev server is running:');
        console.log('   npm run dev\n');
      }
      
      process.exit(1);
    }

    console.log('✅ Audit complete!\n');

    // Parse JSON report
    try {
      const jsonReport = JSON.parse(fs.readFileSync(jsonPath + '.json', 'utf8'));
      displayResults(jsonReport);
    } catch (err) {
      console.log('📄 Report saved successfully!');
      console.log(`   View it at: ${outputPath}\n`);
    }
  });
}

function displayResults(report) {
  const categories = report.categories;
  
  console.log('📊 LIGHTHOUSE SCORES');
  console.log('====================\n');

  // Display scores
  const scores = {
    'Performance': categories.performance.score * 100,
    'Accessibility': categories.accessibility.score * 100,
    'Best Practices': categories['best-practices'].score * 100,
    'SEO': categories.seo.score * 100,
  };

  Object.entries(scores).forEach(([name, score]) => {
    const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
    const status = score >= CONFIG.thresholds[name.toLowerCase().replace(' ', '')] ? '✅' : '⚠️';
    console.log(`${emoji} ${name.padEnd(20)} ${Math.round(score).toString().padStart(3)} / 100 ${status}`);
  });

  console.log('\n📈 KEY METRICS');
  console.log('==============\n');

  const audits = report.audits;
  console.log(`⚡ First Contentful Paint:    ${audits['first-contentful-paint'].displayValue}`);
  console.log(`⚡ Speed Index:                ${audits['speed-index'].displayValue}`);
  console.log(`⚡ Largest Contentful Paint:  ${audits['largest-contentful-paint'].displayValue}`);
  console.log(`⚡ Time to Interactive:        ${audits['interactive'].displayValue}`);
  console.log(`⚡ Total Blocking Time:        ${audits['total-blocking-time'].displayValue}`);
  console.log(`⚡ Cumulative Layout Shift:    ${audits['cumulative-layout-shift'].displayValue}`);

  // Show top issues
  const opportunities = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'opportunity')
    .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
    .slice(0, 3);

  if (opportunities.length > 0) {
    console.log('\n⚠️  TOP OPPORTUNITIES');
    console.log('====================\n');
    
    opportunities.forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.title}`);
      console.log(`   Potential savings: ${opp.displayValue || 'N/A'}\n`);
    });
  }

  // Overall assessment
  console.log('\n🎯 ASSESSMENT');
  console.log('=============\n');

  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
  
  if (avgScore >= 90) {
    console.log('🎉 EXCELLENT! Your app is production-ready!\n');
  } else if (avgScore >= 75) {
    console.log('👍 GOOD! A few optimizations will get you to 90+\n');
  } else {
    console.log('🔧 NEEDS WORK. Review the opportunities above.\n');
  }

  console.log('💡 Next steps:');
  console.log('   1. Review the HTML report for detailed issues');
  console.log('   2. Fix top 3 opportunities');
  console.log('   3. Run audit again\n');
}

