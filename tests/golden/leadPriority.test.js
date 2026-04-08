import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLeadPriority } from '../../src/core/lmLeadPriorityEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'leadPriority.golden.json'), 'utf8'));

function normalize(value) {
  return (value ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

let passed = 0;
let failed = 0;

for (const scenario of cases) {
  const result = buildLeadPriority(scenario.input);
  const errors = [];

  if (result.priorityLevel !== scenario.expected.priorityLevel) {
    errors.push(`priorityLevel expected=${scenario.expected.priorityLevel} got=${result.priorityLevel}`);
  }

  if (result.closeProbability !== scenario.expected.closeProbability) {
    errors.push(`closeProbability expected=${scenario.expected.closeProbability} got=${result.closeProbability}`);
  }

  if (result.contactAction !== scenario.expected.contactAction) {
    errors.push(`contactAction expected=${scenario.expected.contactAction} got=${result.contactAction}`);
  }

  const reasons = Array.isArray(result.priorityReasons) ? result.priorityReasons : [];
  const normalizedReasons = normalize(reasons.join(' | '));

  for (const fragment of scenario.expected.mustIncludeReasons) {
    if (!normalizedReasons.includes(normalize(fragment))) {
      errors.push(`missing reason fragment: ${fragment}`);
    }
  }

  if (errors.length > 0) {
    failed += 1;
    console.log(`FAIL ${scenario.name}`);
    for (const error of errors) console.log(`  - ${error}`);
    console.log(`  result: ${JSON.stringify(result)}`);
  } else {
    passed += 1;
    console.log(`PASS ${scenario.name}`);
  }
}

console.log(`\nSummary: ${passed} passed, ${failed} failed, ${cases.length} total`);
if (failed > 0) process.exit(1);
