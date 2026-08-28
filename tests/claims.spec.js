import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('@claim:demo-sandbox the demo uses only demo storage and same-origin page requests', async ({ page }) => {
  const requests = [];
  page.on('request', request => requests.push(new URL(request.url()).origin));
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('agent-edit.json')).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('demo:change-checkpoints:state'))).toBe('sample');
  expect([...new Set(requests)]).toEqual(['http://127.0.0.1:4173']);
});

test('@claim:signed-manifest cpc demo produces an Ed25519-signed manifest with recorded check exits', async () => {
  const output = execFileSync('cargo', ['run', '--quiet', '--', 'demo', '--json'], { encoding: 'utf8' });
  const result = JSON.parse(output);
  const manifest = JSON.parse(readFileSync(result.manifest, 'utf8'));
  expect(manifest.signature.algorithm).toBe('ed25519');
  expect(manifest.signature.value.length).toBeGreaterThan(40);
  expect(manifest.checks.map(check => check.exit_code)).toEqual([0, 0]);
});

test('@claim:verify-manifest cpc verifies the sample state and reruns its checks', async () => {
  const output = execFileSync('cargo', ['run', '--quiet', '--', 'demo', '--json'], { encoding: 'utf8' });
  const result = JSON.parse(output);
  const verified = execFileSync('cargo', ['run', '--manifest-path', join(process.cwd(), 'Cargo.toml'), '--quiet', '--', 'verify', result.manifest, '--rerun', '--json'], { cwd: result.demo_directory, encoding: 'utf8' });
  expect(JSON.parse(verified).valid).toBe(true);
});

test('@claim:no-command-output checkpoint manifests omit command output', async () => {
  const repo = mkdtempSync(join(tmpdir(), 'cpc-output-test-'));
  mkdirSync(join(repo, 'src'));
  writeFileSync(join(repo, 'src', 'a.txt'), 'base\n');
  for (const args of [['init'], ['config', 'user.email', 'test@example.invalid'], ['config', 'user.name', 'Test'], ['add', '.'], ['commit', '-m', 'base']]) execFileSync('git', args, { cwd: repo });
  writeFileSync(join(repo, 'src', 'a.txt'), 'changed\n');
  writeFileSync(join(repo, 'output.txt'), 'PRIVATE OUTPUT');
  execFileSync('cargo', ['run', '--manifest-path', join(process.cwd(), 'Cargo.toml'), '--quiet', '--', 'checkpoint', 'quiet', '--check', 'cat output.txt', '--rollback', 'git restore src/a.txt'], { cwd: repo });
  const text = readFileSync(join(repo, '.change-checkpoints', 'quiet.json'), 'utf8');
  expect(text).not.toContain('PRIVATE OUTPUT');
  expect(text).not.toContain('"output"');
  expect(JSON.parse(text).checks[0].exit_code).toBe(0);
});

test('keyboard paths expose the demo action and visible result', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo$/);
  await page.getByRole('button', { name: 'Verify sample state' }).press('Enter');
  await expect(page.getByText('Sample signature and recorded state match.')).toBeVisible();
});

test('home and demo have no serious accessibility violations', async ({ page }) => {
  for (const route of ['/', '/demo', '/404.html']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations).toEqual([]);
  }
});

test('the designed 404 page loads cleanly and returns home by keyboard', async ({ page }) => {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Change Checkpoints');
  await expect(page.getByRole('heading', { name: 'That checkpoint page is not here' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Go to Change Checkpoints' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/$/);
  expect(errors).toEqual([]);
});
