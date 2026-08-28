import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { join } from 'node:path';

const root = process.cwd();
const configPath = join(root, 'site', 'public', 'staticwebapp.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

test('Azure Static Web Apps config keeps rewrites and route status codes separate', () => {
  const invalidRoutes = (config.routes ?? []).filter(route => 'rewrite' in route && 'statusCode' in route);
  assert.deepEqual(invalidRoutes, []);
  assert.equal(config.navigationFallback.rewrite, '/index.html');
});

test('Azure Static Web Apps uses a response override for its designed 404', () => {
  assert.deepEqual(config.responseOverrides?.['404'], { rewrite: '/404.html' });
  assert.ok(config.navigationFallback.exclude.includes('/404.html'));
  assert.ok(existsSync(join(root, 'site', 'public', '404.html')));

  const artifactPath = join(root, 'dist', 'site', 'staticwebapp.config.json');
  assert.ok(existsSync(artifactPath), 'the deployable site artifact includes the Static Web Apps configuration');
  assert.deepEqual(JSON.parse(readFileSync(artifactPath, 'utf8')), config);
});
