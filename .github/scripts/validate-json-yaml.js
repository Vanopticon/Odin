#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'dist', 'out'].includes(entry.name)) continue;
      walk(full, cb);
    } else {
      cb(full);
    }
  }
}

const errors = [];
const warnings = [];

walk(process.cwd(), (file) => {
  if (file.endsWith('.json')) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      JSON.parse(raw);
    } catch (e) {
      errors.push(`JSON parse error in ${file}: ${e.message}`);
    }
  }

  if (file.endsWith('.yaml') || file.endsWith('.yml')) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      if (/\t/.test(raw)) {
        errors.push(`YAML file contains tab characters (not allowed) in ${file}`);
      }
      YAML.parse(raw);
    } catch (e) {
      errors.push(`YAML parse error in ${file}: ${e.message}`);
    }
  }
});

if (warnings.length) {
  console.warn('Warnings:');
  for (const w of warnings) console.warn(' -', w);
}

if (errors.length) {
  console.error('Errors:');
  for (const e of errors) console.error(' -', e);
  process.exit(2);
}

console.log('All JSON/YAML parse checks passed.');
