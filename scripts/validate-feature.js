#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });
const schemasDir = path.resolve(process.cwd(), '.github', 'schemas');

function loadSchema(name) {
  const p = path.join(schemasDir, name);
  if (!fs.existsSync(p)) throw new Error(`Schema not found: ${p}`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const testsSchema = loadSchema('tests.schema.json');
const featureSchema = loadSchema('feature-card.schema.json');

ajv.addSchema(testsSchema, 'tests.schema.json');
ajv.addSchema(featureSchema, 'feature-card.schema.json');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/validate-feature.js <feature-file.json> [more.json]');
  process.exit(2);
}

let ok = true;
for (const file of args) {
  const fp = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fp)) {
    console.error('File not found:', fp);
    ok = false;
    continue;
  }
  const doc = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const valid = ajv.validate('feature-card.schema.json', doc);
  if (valid) {
    console.log(`OK: ${file}`);
  } else {
    console.error(`INVALID: ${file}`);
    for (const err of ajv.errors || []) {
      console.error('-', err.instancePath, err.message);
    }
    ok = false;
  }
}
process.exit(ok ? 0 : 1);
