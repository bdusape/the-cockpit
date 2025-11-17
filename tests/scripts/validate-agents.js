/**
 * Agent Configuration Validator
 *
 * Validates that all agent markdown files have required sections
 * and proper structure.
 *
 * Usage: node tests/scripts/validate-agents.js
 */

const fs = require('fs');
const path = require('path');

// Required sections in every agent file
const REQUIRED_SECTIONS = [
  '## Role',
  '## Personality',
  '## Core Responsibilities',
];

// Optional but recommended sections
const RECOMMENDED_SECTIONS = [
  '## Knowledge Base',
  '## Output Format',
  '## Constraints',
  '## Example',
];

const AGENTS_DIR = path.join(__dirname, '../../agents');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function validateAgent(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  log(colors.blue, `\n=== Validating: ${fileName} ===`);

  const errors = [];
  const warnings = [];
  let score = 100;

  // Check file size (should be substantial)
  if (content.length < 1000) {
    errors.push(`File too short (${content.length} chars). Expected >1000 chars.`);
    score -= 20;
  } else {
    log(colors.green, `✓ File size: ${content.length} characters`);
  }

  // Check required sections
  REQUIRED_SECTIONS.forEach((section) => {
    if (!content.includes(section)) {
      errors.push(`Missing required section: ${section}`);
      score -= 20;
    } else {
      log(colors.green, `✓ Found: ${section}`);
    }
  });

  // Check recommended sections
  RECOMMENDED_SECTIONS.forEach((section) => {
    if (!content.includes(section)) {
      warnings.push(`Missing recommended section: ${section}`);
      score -= 5;
    } else {
      log(colors.green, `✓ Found: ${section}`);
    }
  });

  // Check for placeholder text that should be updated
  const placeholders = [
    'your-business-name',
    'TODO',
    'PLACEHOLDER',
    '[Insert',
    'example.com',
  ];

  placeholders.forEach((placeholder) => {
    if (content.includes(placeholder)) {
      warnings.push(`Found placeholder text: "${placeholder}" - should be updated`);
      score -= 2;
    }
  });

  // Check for proper markdown formatting
  const headingCount = (content.match(/^#{1,3}\s/gm) || []).length;
  if (headingCount < 5) {
    warnings.push(`Only ${headingCount} headings found. Consider better structure.`);
    score -= 5;
  } else {
    log(colors.green, `✓ Structure: ${headingCount} headings`);
  }

  // Check for examples
  if (!content.toLowerCase().includes('example')) {
    warnings.push('No examples found. Consider adding example interactions.');
    score -= 5;
  }

  // Print results
  if (errors.length > 0) {
    log(colors.red, '\n❌ ERRORS:');
    errors.forEach((err) => log(colors.red, `  - ${err}`));
  }

  if (warnings.length > 0) {
    log(colors.yellow, '\n⚠️  WARNINGS:');
    warnings.forEach((warn) => log(colors.yellow, `  - ${warn}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    log(colors.green, '\n✅ All validation checks passed!');
  }

  log(
    score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red,
    `\nQuality Score: ${score}/100`
  );

  return {
    fileName,
    errors,
    warnings,
    score,
    passed: errors.length === 0,
  };
}

function main() {
  log(colors.bold, '\n╔══════════════════════════════════════╗');
  log(colors.bold, '║   AGENT CONFIGURATION VALIDATOR     ║');
  log(colors.bold, '╚══════════════════════════════════════╝\n');

  // Get all agent files (excluding template)
  const agentFiles = fs
    .readdirSync(AGENTS_DIR)
    .filter((file) => file.endsWith('.md') && file !== '_template.md')
    .map((file) => path.join(AGENTS_DIR, file));

  if (agentFiles.length === 0) {
    log(colors.red, '❌ No agent files found!');
    process.exit(1);
  }

  log(colors.blue, `Found ${agentFiles.length} agent files to validate\n`);

  // Validate each agent
  const results = agentFiles.map(validateAgent);

  // Print summary
  log(colors.bold, '\n\n╔══════════════════════════════════════╗');
  log(colors.bold, '║         VALIDATION SUMMARY           ║');
  log(colors.bold, '╚══════════════════════════════════════╝\n');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

  results.forEach((result) => {
    const status = result.passed ? '✅' : '❌';
    const color = result.passed ? colors.green : colors.red;
    log(color, `${status} ${result.fileName} - Score: ${result.score}/100`);
  });

  log(colors.blue, `\nTotal: ${results.length} agents`);
  log(colors.green, `Passed: ${passed}`);
  if (failed > 0) log(colors.red, `Failed: ${failed}`);
  log(colors.blue, `Average Score: ${avgScore}/100`);

  // Exit code
  if (failed > 0) {
    log(colors.red, '\n❌ Validation failed! Fix errors before launch.');
    process.exit(1);
  } else if (avgScore < 80) {
    log(colors.yellow, '\n⚠️  Validation passed but quality could be improved.');
    process.exit(0);
  } else {
    log(colors.green, '\n✅ All agents validated successfully!');
    process.exit(0);
  }
}

// Run validation
main();
