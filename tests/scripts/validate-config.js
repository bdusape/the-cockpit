/**
 * Environment Configuration Validator
 *
 * Validates that all required environment variables are set
 * and have proper values.
 *
 * Usage: node tests/scripts/validate-config.js
 */

require('dotenv').config({ path: '.env.test' });

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

// Required environment variables for testing
const REQUIRED_ENV_VARS = {
  // Test phone numbers
  TEST_PHONE_NUMBER: {
    required: true,
    validator: (val) => /^\+\d{10,15}$/.test(val),
    error: 'Must be in format +1234567890',
  },
  UNAUTHORIZED_TEST_NUMBER: {
    required: true,
    validator: (val) => /^\+\d{10,15}$/.test(val),
    error: 'Must be in format +1234567890',
  },

  // Pipedream (required for E2E tests)
  PIPEDREAM_WEBHOOK_URL: {
    required: false, // Optional for local testing
    validator: (val) => val.startsWith('https://'),
    error: 'Must be a valid HTTPS URL',
  },
  PIPEDREAM_SOURCE_ID: {
    required: false,
    validator: (val) => val.startsWith('dc_'),
    error: 'Must start with dc_',
  },
  PIPEDREAM_API_KEY: {
    required: false,
    validator: (val) => val.length > 20,
    error: 'Must be valid API key',
  },

  // Claude API
  CLAUDE_API_KEY: {
    required: false, // Optional for API contract tests only
    validator: (val) => val.startsWith('sk-ant-'),
    error: 'Must start with sk-ant-',
  },
  CLAUDE_MODEL: {
    required: false,
    validator: (val) => val.includes('claude'),
    error: 'Must be a valid Claude model',
  },

  // GitHub
  GITHUB_USERNAME: {
    required: true,
    validator: (val) => val.length > 0,
    error: 'Cannot be empty',
  },
  GITHUB_REPO: {
    required: true,
    validator: (val) => val === 'the-cockpit',
    error: 'Must be "the-cockpit"',
  },
  GITHUB_BRANCH: {
    required: true,
    validator: (val) => ['main', 'test', 'develop'].includes(val),
    error: 'Must be main, test, or develop',
  },
};

function validateEnv() {
  log(colors.bold, '\n╔══════════════════════════════════════╗');
  log(colors.bold, '║  ENVIRONMENT CONFIG VALIDATOR        ║');
  log(colors.bold, '╚══════════════════════════════════════╝\n');

  const errors = [];
  const warnings = [];
  let score = 100;

  Object.entries(REQUIRED_ENV_VARS).forEach(([key, config]) => {
    const value = process.env[key];

    if (!value) {
      if (config.required) {
        errors.push(`Missing required env var: ${key}`);
        log(colors.red, `❌ ${key}: NOT SET (required)`);
        score -= 15;
      } else {
        warnings.push(`Optional env var not set: ${key}`);
        log(colors.yellow, `⚠️  ${key}: NOT SET (optional)`);
        score -= 5;
      }
    } else if (config.validator && !config.validator(value)) {
      errors.push(`Invalid value for ${key}: ${config.error}`);
      log(colors.red, `❌ ${key}: INVALID - ${config.error}`);
      score -= 10;
    } else {
      // Mask sensitive values in output
      const displayValue = key.includes('KEY') || key.includes('TOKEN')
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value;
      log(colors.green, `✅ ${key}: ${displayValue}`);
    }
  });

  // Summary
  log(colors.bold, '\n╔══════════════════════════════════════╗');
  log(colors.bold, '║           VALIDATION SUMMARY         ║');
  log(colors.bold, '╚══════════════════════════════════════╝\n');

  if (errors.length > 0) {
    log(colors.red, '❌ ERRORS:');
    errors.forEach((err) => log(colors.red, `  - ${err}`));
  }

  if (warnings.length > 0) {
    log(colors.yellow, '\n⚠️  WARNINGS:');
    warnings.forEach((warn) => log(colors.yellow, `  - ${warn}`));
  }

  log(
    score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red,
    `\nConfiguration Score: ${score}/100\n`
  );

  if (errors.length > 0) {
    log(colors.red, '❌ Configuration invalid! Fix errors before running tests.');
    log(colors.yellow, '\nTo fix: Copy .env.example to .env.test and update values.');
    process.exit(1);
  } else if (warnings.length > 0) {
    log(colors.yellow, '⚠️  Configuration valid but some optional vars missing.');
    log(colors.yellow, 'Some tests may be skipped.');
    process.exit(0);
  } else {
    log(colors.green, '✅ All environment variables configured correctly!');
    process.exit(0);
  }
}

validateEnv();
