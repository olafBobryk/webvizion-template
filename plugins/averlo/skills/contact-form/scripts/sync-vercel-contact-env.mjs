#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { arg, parseEnv, recipients, upsertEnv, validEmail } from './lib.mjs';

const repo = path.resolve(arg('repo', process.cwd()));
const client = String(arg('client-email', '')).trim().toLowerCase();
if (!validEmail(client)) throw new Error('Pass a valid --client-email');
const envFile = path.join(repo, '.env.local');
if (!fs.existsSync(envFile)) throw new Error('.env.local is missing');
const values = parseEnv(fs.readFileSync(envFile, 'utf8'));
const key = values.get('RESEND_API_KEY');
if (!key?.startsWith('re_')) throw new Error('RESEND_API_KEY is missing or invalid');
const production = recipients(client).join(',');
const vercel = process.env.VERCEL_BIN || 'vercel';
for (const [name, value] of [['RESEND_API_KEY', key], ['CONTACT_FORM_RECIPIENTS', production]]) {
  const result = spawnSync(vercel, ['env', 'add', name, 'production', '--sensitive', '--yes', '--force'], {
    cwd: repo, input: `${value}\n`, encoding: 'utf8', env: process.env,
  });
  if (result.status !== 0) throw new Error(`Vercel Production sync failed for ${name}`);
  console.log(`Synced ${name} to Vercel Production.`);
}
upsertEnv(envFile, { AVERLO_CONTACT_CLIENT_EMAIL: client, CONTACT_FORM_RECIPIENTS: 'bobryk.olaf@gmail.com' });
console.log('Local recipients remain Bobryk only.');
