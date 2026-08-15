#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { arg, ensureIgnored, parseEnv, upsertEnv } from './lib.mjs';

const repo = path.resolve(arg('repo', process.cwd()));
const project = arg('project');
const managerFile = path.join(os.homedir(), '.codex/secrets/averlo-contact-form/resend-management.token');
const envFile = path.join(repo, '.env.local');
if (!project || !/^[a-zA-Z0-9._-]+$/.test(project)) throw new Error('Pass a safe --project value');
if (!fs.existsSync(managerFile)) throw new Error(`Management credential is missing at ${managerFile}`);
const managerStat = fs.statSync(managerFile);
if ((managerStat.mode & 0o077) !== 0) throw new Error('Management credential permissions must be 600');
ensureIgnored(repo);
const current = fs.existsSync(envFile) ? parseEnv(fs.readFileSync(envFile, 'utf8')) : new Map();
if (current.get('RESEND_API_KEY')?.startsWith('re_') && current.get('AVERLO_RESEND_API_KEY_ID')) {
  console.log('Existing project sending credential retained.');
  process.exit(0);
}

const token = fs.readFileSync(managerFile, 'utf8').trim();
if (!token.startsWith('re_')) throw new Error('Management credential has an invalid format');
const base = process.env.RESEND_API_BASE || 'https://api.resend.com';
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'averlo-contact-form-skill/1.0' };
const domainsResponse = await fetch(`${base}/domains`, { headers });
if (!domainsResponse.ok) throw new Error(`Resend domain lookup failed (${domainsResponse.status})`);
const domainPayload = await domainsResponse.json();
const domain = (domainPayload.data || domainPayload).find((item) => item.name === 'averlo.co' && item.status === 'verified');
if (!domain) throw new Error('Verified averlo.co Resend domain was not found');
const name = `averlo-${project}`.slice(0, 50);
const createResponse = await fetch(`${base}/api-keys`, {
  method: 'POST', headers,
  body: JSON.stringify({ name, permission: 'sending_access', domain_id: domain.id }),
});
if (!createResponse.ok) throw new Error(`Resend key creation failed (${createResponse.status})`);
const created = await createResponse.json();
if (!created.token?.startsWith('re_') || !created.id) throw new Error('Resend returned an incomplete project key');
upsertEnv(envFile, {
  RESEND_API_KEY: created.token,
  AVERLO_RESEND_API_KEY_ID: created.id,
  CONTACT_FORM_RECIPIENTS: 'bobryk.olaf@gmail.com',
});
console.log('Project sending credential created; local recipient is Bobryk only.');
