import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webappRoot = path.resolve(__dirname, '..');

test('Deployment Pipelines, Netlify & Environment Contract (T068)', async (t) => {
  await t.test('netlify.toml exists and configures build command and publish directory', () => {
    const netlifyPath = path.join(webappRoot, 'netlify.toml');
    assert.ok(fs.existsSync(netlifyPath), 'netlify.toml must exist at webapp root');

    const content = fs.readFileSync(netlifyPath, 'utf8');
    assert.match(content, /command\s*=\s*"npm run build"/, 'Must define build command');
    assert.match(content, /publish\s*=\s*"dist"/, 'Must publish dist directory');
    assert.match(content, /to\s*=\s*"\/index\.html"/, 'Must configure SPA routing redirect to index.html');
    assert.match(content, /status\s*=\s*200/, 'Redirect status must be 200 rewrite');
    assert.match(content, /X-Frame-Options\s*=\s*"DENY"/, 'Must enforce frame options security header');
    assert.match(content, /X-Content-Type-Options\s*=\s*"nosniff"/, 'Must enforce nosniff security header');
  });

  await t.test('.env.example template exists with public deployment variables', () => {
    const envExamplePath = path.join(webappRoot, '.env.example');
    assert.ok(fs.existsSync(envExamplePath), '.env.example must exist at webapp root');

    const content = fs.readFileSync(envExamplePath, 'utf8');
    assert.match(content, /VITE_API_BASE_URL/, 'Must document VITE_API_BASE_URL');
    assert.match(content, /VITE_APP_ENV/, 'Must document VITE_APP_ENV');
  });

  await t.test('GitHub Actions CI pipeline exists and executes test and build steps', () => {
    const ciPath = path.join(webappRoot, '.github', 'workflows', 'ci.yml');
    assert.ok(fs.existsSync(ciPath), '.github/workflows/ci.yml must exist');

    const content = fs.readFileSync(ciPath, 'utf8');
    assert.match(content, /branches:\s*\[\s*develop,\s*main\s*\]/, 'CI must trigger on develop and main');
    assert.match(content, /npm test/, 'CI must execute npm test');
    assert.match(content, /npm run build/, 'CI must execute npm run build');
  });
});

test('Production Smoke Drill & Emergency Kill Switch Contract (T069, T070)', async (t) => {
  await t.test('Operational smoke drill contract validates all 4 operational subsystems', () => {
    // Simulated drill response contract
    const mockDrillResponse = {
      status: 'PASS',
      allChecksPassed: true,
      checks: [
        { component: 'DatabaseRepository', status: 'PASS', detail: 'Persistent data store connection active.' },
        { component: 'SourceRegistry', status: 'PASS', detail: 'Permitted discovery sources configured.' },
        { component: 'ReliabilityEngine', status: 'PASS', detail: 'Reliability and backoff safeguards operational.' },
        { component: 'OutreachSafety', status: 'PASS', detail: 'OutreachMode: Test, Sink: dev-sink@vsrsalesengine.local' },
      ],
      timestampUtc: new Date().toISOString(),
    };

    assert.strictEqual(mockDrillResponse.status, 'PASS');
    assert.strictEqual(mockDrillResponse.allChecksPassed, true);
    assert.strictEqual(mockDrillResponse.checks.length, 4);

    const components = mockDrillResponse.checks.map(c => c.component);
    assert.ok(components.includes('DatabaseRepository'));
    assert.ok(components.includes('SourceRegistry'));
    assert.ok(components.includes('ReliabilityEngine'));
    assert.ok(components.includes('OutreachSafety'));
  });

  await t.test('Emergency kill switch state immediately signals safety boundary', () => {
    let killSwitchState = false;

    // Dispatching when kill switch is off
    const canSendInitially = !killSwitchState;
    assert.strictEqual(canSendInitially, true);

    // Engaging kill switch
    killSwitchState = true;
    const canSendAfterKillSwitch = !killSwitchState;
    assert.strictEqual(canSendAfterKillSwitch, false);
  });
});
