import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawn } from 'node:child_process';
import { recipients, upsertEnv, validEmail } from './lib.mjs';

const skillScripts = path.dirname(new URL(import.meta.url).pathname);

test('recipient validation trims and deduplicates Bobryk', () => {
  assert.equal(validEmail('client@example.com'), true);
  assert.equal(validEmail('broken'), false);
  assert.deepEqual(recipients(' BOBRYK.OLAF@GMAIL.COM '), ['bobryk.olaf@gmail.com']);
  assert.deepEqual(recipients('client@example.com'), ['client@example.com', 'bobryk.olaf@gmail.com']);
});

test('env updates preserve unrelated values and enforce mode 600', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'averlo-env-'));
  const file = path.join(dir, '.env.local');
  fs.writeFileSync(file, 'UNRELATED=yes\nCONTACT_FORM_RECIPIENTS=old@example.com\n');
  upsertEnv(file, { CONTACT_FORM_RECIPIENTS: 'bobryk.olaf@gmail.com' });
  const text = fs.readFileSync(file, 'utf8');
  assert.match(text, /UNRELATED=yes/);
  assert.match(text, /CONTACT_FORM_RECIPIENTS=bobryk\.olaf@gmail\.com/);
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
});

test('provisioning failure never creates a partial env file or prints a token', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averlo-provision-'));
  const home = path.join(root, 'home');
  const repo = path.join(root, 'repo');
  const secretDir = path.join(home, '.codex/secrets/averlo-contact-form');
  fs.mkdirSync(secretDir, { recursive: true });
  fs.mkdirSync(repo);
  fs.writeFileSync(path.join(repo, '.gitignore'), '.env.local\n');
  const token = 're_TEST_SECRET_MUST_NOT_LEAK';
  const secretFile = path.join(secretDir, 'resend-management.token');
  fs.writeFileSync(secretFile, token, { mode: 0o600 });
  const server = http.createServer((request, response) => {
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end('{}');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const result = await run(process.execPath, [path.join(skillScripts, 'provision-project-key.mjs'), '--repo', repo, '--project', 'test'], {
    HOME: home, RESEND_API_BASE: `http://127.0.0.1:${port}`,
  });
  server.close();
  assert.notEqual(result.code, 0);
  assert.equal(fs.existsSync(path.join(repo, '.env.local')), false);
  assert.equal(`${result.stdout}${result.stderr}`.includes(token), false);
});

test('Vercel sync sends values through stdin and never argv', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averlo-vercel-'));
  const repo = path.join(root, 'repo');
  const bin = path.join(root, 'fake-vercel.sh');
  const log = path.join(root, 'calls.log');
  fs.mkdirSync(repo);
  fs.writeFileSync(path.join(repo, '.env.local'), 'RESEND_API_KEY=re_PROJECT_SECRET\n', { mode: 0o600 });
  fs.writeFileSync(bin, '#!/bin/sh\nprintf "%s|" "$*" >> "$AVERLO_TEST_LOG"\nIFS= read -r value\nprintf "%s\\n" "$value" >> "$AVERLO_TEST_LOG"\n', { mode: 0o700 });
  const result = await run(process.execPath, [path.join(skillScripts, 'sync-vercel-contact-env.mjs'), '--repo', repo, '--client-email', 'client@example.com'], {
    VERCEL_BIN: bin, AVERLO_TEST_LOG: log,
  });
  assert.equal(result.code, 0, result.stderr);
  const calls = fs.readFileSync(log, 'utf8');
  assert.equal(calls.match(/re_PROJECT_SECRET/g)?.length, 1);
  for (const line of calls.trim().split('\n')) {
    assert.equal(line.split('|')[0].includes('re_PROJECT_SECRET'), false);
  }
  assert.match(calls, /client@example\.com,bobryk\.olaf@gmail\.com/);
  const local = fs.readFileSync(path.join(repo, '.env.local'), 'utf8');
  assert.match(local, /CONTACT_FORM_RECIPIENTS=bobryk\.olaf@gmail\.com/);
});

function run(command, args, extraEnv) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { env: { ...process.env, ...extraEnv } });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}
