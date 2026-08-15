import fs from 'node:fs';
import path from 'node:path';

export const BOBRYK_EMAIL = 'bobryk.olaf@gmail.com';

export function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function recipients(clientEmail) {
  const values = clientEmail ? [clientEmail, BOBRYK_EMAIL] : [BOBRYK_EMAIL];
  const seen = new Set();
  return values.map((v) => v.trim().toLowerCase()).filter((v) => validEmail(v) && !seen.has(v) && seen.add(v));
}

export function parseEnv(text) {
  const result = new Map();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) result.set(match[1], match[2].replace(/^['"]|['"]$/g, ''));
  }
  return result;
}

export function assertSafeEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('.env.local must be a regular file, not a symlink');
}

export function upsertEnv(file, values) {
  assertSafeEnvFile(file);
  const original = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const managed = new Set(Object.keys(values));
  const kept = original.split(/\r?\n/).filter((line) => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    return !(match && managed.has(match[1]));
  }).filter((line, index, all) => line || index < all.length - 1);
  const additions = Object.entries(values).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}=${value}`);
  const output = [...kept, ...additions].join('\n').replace(/^\n+/, '') + '\n';
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, output, { mode: 0o600, flag: 'wx' });
  fs.renameSync(temp, file);
  fs.chmodSync(file, 0o600);
}

export function ensureIgnored(repo) {
  const ignore = path.join(repo, '.gitignore');
  const text = fs.existsSync(ignore) ? fs.readFileSync(ignore, 'utf8') : '';
  const ignored = text.split(/\r?\n/).some((line) => ['.env.local', '.env*', '.env*.local'].includes(line.trim()));
  if (!ignored) throw new Error('Refusing to write: .env.local is not covered by .gitignore');
}

export function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
