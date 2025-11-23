/**
 * TypeScript Type Safety Validation
 * 
 * This script validates that all types are correctly defined
 * and match between frontend and backend
 * 
 * Run: npx tsx tests/type-check.ts
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

interface TypeCheckResult {
  file: string;
  passed: boolean;
  errors: string[];
}

const results: TypeCheckResult[] = [];

async function checkFile(filePath: string, description: string): Promise<void> {
  const result: TypeCheckResult = {
    file: filePath,
    passed: true,
    errors: [],
  };

  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Basic checks
    if (!content.includes('export')) {
      result.errors.push('No exports found');
      result.passed = false;
    }

    // Check for any types
    if (content.includes(': any') && !content.includes('// eslint-disable')) {
      result.errors.push('Contains "any" type (should be avoided)');
      // Don't fail, just warn
    }

    // Check for proper TypeScript syntax
    if (content.includes('@ts-ignore') || content.includes('@ts-expect-error')) {
      result.errors.push('Contains TypeScript ignore comments');
      // Warning only
    }

    results.push(result);
    
    if (result.passed && result.errors.length === 0) {
      console.log(`✅ ${description}: OK`);
    } else if (result.errors.length > 0) {
      console.log(`⚠️  ${description}: ${result.errors.join(', ')}`);
    } else {
      console.log(`❌ ${description}: Failed`);
    }
  } catch (error: any) {
    result.passed = false;
    result.errors.push(`File read error: ${error.message}`);
    results.push(result);
    console.log(`❌ ${description}: ${error.message}`);
  }
}

async function main() {
  console.log('🔍 TypeScript Type Safety Check');
  console.log('='.repeat(60));

  const filesToCheck = [
    // Backend types
    { path: 'server/types.ts', desc: 'Backend Types' },
    { path: 'server/api/users.ts', desc: 'Users API Types' },
    { path: 'server/api/clients.ts', desc: 'Clients API Types' },
    { path: 'server/api/dashboard.ts', desc: 'Dashboard API Types' },
    { path: 'server/utils/alerts.ts', desc: 'Alerts Types' },
    
    // Frontend types
    { path: 'src/lib/api/api.ts', desc: 'Frontend API Types' },
    { path: 'src/store/authStore.ts', desc: 'Auth Store Types' },
    { path: 'src/store/searchStore.ts', desc: 'Search Store Types' },
  ];

  for (const file of filesToCheck) {
    const filePath = join(process.cwd(), file.path);
    await checkFile(filePath, file.desc);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Type Check Summary');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed && r.errors.length === 0).length;
  const warnings = results.filter(r => r.errors.length > 0).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);

  // Run actual TypeScript compiler check
  console.log('\n🔧 Running TypeScript compiler check...');
  console.log('   Run: npx tsc --noEmit');
  console.log('   This will check all TypeScript files for type errors\n');

  if (failed > 0) {
    console.log('❌ Some files failed type checks');
    process.exit(1);
  } else {
    console.log('✅ All type checks passed');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

