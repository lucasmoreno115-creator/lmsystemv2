import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateTags } from '../../src/core/lmTagEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'tagEngine.golden.json'), 'utf8'));

let passed = 0;
let failed = 0;

for (const scenario of cases) {
  const result = generateTags({
    lmScore: scenario.input.lmScore,
    dimensions: scenario.input.dimensions,
    profile: scenario.input.profile,
    leadValue: scenario.input.leadValue
  });

  const tags = Array.isArray(result) ? result : Array.isArray(result?.tags) ? result.tags : [];
  const errors = [];

  for (const requiredTag of scenario.expected.mustInclude) {
    if (!tags.includes(requiredTag)) {
      errors.push(`missing required tag: ${requiredTag}`);
    }
  }

  for (const forbiddenTag of scenario.expected.mustNotInclude) {
    if (tags.includes(forbiddenTag)) {
      errors.push(`forbidden tag present: ${forbiddenTag}`);
    }
  }

  if (tags.length > scenario.expected.maxTags) {
    errors.push(`tag limit exceeded: ${tags.length} > ${scenario.expected.maxTags}`);
  }

  if (errors.length > 0) {
    failed += 1;
    console.log(`FAIL ${scenario.name}`);
    for (const error of errors) console.log(`  - ${error}`);
    console.log(`  tags: ${JSON.stringify(tags)}`);
  } else {
    passed += 1;
    console.log(`PASS ${scenario.name}`);
  }
}

console.log(`\nSummary: ${passed} passed, ${failed} failed, ${cases.length} total`);
if (failed > 0) process.exit(1);
