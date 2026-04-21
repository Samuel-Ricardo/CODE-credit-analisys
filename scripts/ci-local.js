#!/usr/bin/env node

/**
 * CI Local Validator
 * 
 * Este script executa todas as validações do CI localmente
 * antes de fazer push, economizando tempo e garantindo que
 * o código passará nos checks do GitHub Actions.
 * 
 * Uso:
 *   node scripts/ci-local.js
 *   npm run ci:local
 */

const { execSync } = require('child_process');

// Colors para terminal (fallback sem dependências)
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

const c = (color, text) => `${colors[color]}${text}${colors.reset}`;

// Configuração
const CHECKS = [
  {
    name: 'Lint & Code Quality',
    command: 'npm run lint',
    emoji: '🔍',
    required: true,
  },
  {
    name: 'TypeScript Type Check',
    command: 'npx tsc --noEmit',
    emoji: '📘',
    required: true,
  },
  {
    name: 'Unit Tests',
    command: 'npm run test:unit',
    emoji: '🧪',
    required: true,
  },
  {
    name: 'Integration Tests',
    command: 'npm run test:integration',
    emoji: '🔗',
    required: true,
  },
  {
    name: 'Component Tests',
    command: 'npm run test:components',
    emoji: '🎨',
    required: true,
  },
  {
    name: 'Build Validation',
    command: 'npm run build',
    emoji: '🏗️',
    required: true,
  },
  {
    name: 'E2E Tests (Cypress)',
    command: 'npm run cy:run',
    emoji: '🎭',
    required: false, // Opcional por ser mais demorado
  },
];

// Funções auxiliares
function exec(command, options = {}) {
  return execSync(command, {
    encoding: 'utf8',
    stdio: options.silent ? 'pipe' : 'inherit',
    ...options,
  });
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

// Main
async function main() {
  console.log(c('cyan', c('bold', '\n🚀 CI Local Validator\n')));
  console.log(c('gray', 'Running all CI checks locally...\n'));

  const results = [];
  const startTime = Date.now();
  let hasFailure = false;

  for (const check of CHECKS) {
    process.stdout.write(`⏳ ${check.emoji} ${check.name}...`);
    const checkStartTime = Date.now();

    try {
      exec(check.command, { silent: true });
      const duration = Date.now() - checkStartTime;
      
      process.stdout.write('\r');
      console.log(
        c('green', `✓ ${check.emoji} ${check.name} `) +
        c('gray', `(${formatTime(duration)})`)
      );
      
      results.push({ ...check, passed: true, duration });
    } catch (error) {
      const duration = Date.now() - checkStartTime;
      
      process.stdout.write('\r');
      
      if (check.required) {
        console.log(
          c('red', `✗ ${check.emoji} ${check.name} `) +
          c('gray', `(${formatTime(duration)})`)
        );
        hasFailure = true;
      } else {
        console.log(
          c('yellow', `⚠ ${check.emoji} ${check.name} (optional) `) +
          c('gray', `(${formatTime(duration)})`)
        );
      }
      
      results.push({ ...check, passed: false, duration, error });
      
      // Mostrar erro
      if (check.required) {
        console.log(c('red', '\n  Error output:'));
        console.log(c('gray', error.stdout || error.message));
      }
    }
  }

  // Summary
  const totalDuration = Date.now() - startTime;
  console.log(c('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  
  if (hasFailure) {
    console.log(c('red', c('bold', '❌ CI validation failed!\n')));
    
    const failedChecks = results.filter(r => !r.passed && r.required);
    console.log(c('red', 'Failed checks:'));
    failedChecks.forEach(check => {
      console.log(c('red', `  • ${check.name}`));
    });
    
    console.log(c('yellow', '\n💡 Tip: Fix the errors above before pushing.'));
    process.exit(1);
  } else {
    console.log(c('green', c('bold', '✅ All CI checks passed!\n')));
    
    // Stats
    console.log(c('gray', 'Summary:'));
    console.log(c('gray', `  Total time: ${formatTime(totalDuration)}`));
    console.log(c('gray', `  Checks passed: ${results.filter(r => r.passed).length}/${results.length}`));
    
    console.log(c('green', '\n🎉 Your code is ready to push!'));
  }
  
  console.log(c('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

main().catch(error => {
  console.error(c('red', 'Fatal error:'), error);
  process.exit(1);
});
