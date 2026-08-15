#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { arg, parseEnv } from './lib.mjs';

const repo = path.resolve(arg('repo', process.cwd()));
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full);
  }
}
for (const root of ['app', 'pages', 'src/app', 'src/pages', 'src/components']) walk(path.join(repo, root));
const hits = files.filter((file) => /contact|enquir|booking|callback|resend|CONTACT_FORM_RECIPIENTS/i.test(fs.readFileSync(file, 'utf8')));
const envFile = path.join(repo, '.env.local');
const env = fs.existsSync(envFile) ? parseEnv(fs.readFileSync(envFile, 'utf8')) : new Map();
const envMode = fs.existsSync(envFile) ? (fs.statSync(envFile).mode & 0o777).toString(8) : null;
const ignored = fs.existsSync(envFile) && spawnSync('git', ['check-ignore', '-q', '.env.local'], { cwd: repo }).status === 0;
const localRecipients = String(env.get('CONTACT_FORM_RECIPIENTS') || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
const guidance = ['AGENTS.md', 'PRODUCT.md', 'DESIGN.md'].filter((name) => fs.existsSync(path.join(repo, name)));
console.log(JSON.stringify({
  framework: fs.existsSync(path.join(repo, 'next.config.js')) || fs.existsSync(path.join(repo, 'next.config.mjs')) || fs.existsSync(path.join(repo, 'next.config.ts')) ? 'Next.js' : 'unconfirmed',
  guidance,
  candidateFiles: hits.map((file) => path.relative(repo, file)),
  envMetadata: {
    resendKeyConfigured: Boolean(env.get('RESEND_API_KEY')),
    recipientConfigured: Boolean(env.get('CONTACT_FORM_RECIPIENTS')),
    clientEmailConfigured: Boolean(env.get('AVERLO_CONTACT_CLIENT_EMAIL')),
    envLocalIgnored: ignored,
    envLocalMode: envMode,
    bobrykOnlyLocalRouting: localRecipients.length === 1 && localRecipients[0] === 'bobryk.olaf@gmail.com',
  },
}, null, 2));
