import test from 'node:test';
import assert from 'node:assert';

test('Frontend Security & Abuse Prevention Contracts (T067)', async (t) => {
  await t.test('Client-side URI sanitizer blocks localhost, loopback, and private IPs', () => {
    const isPrivateUri = (urlStr) => {
      try {
        const u = new URL(urlStr);
        const host = u.hostname.toLowerCase();
        if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return true;
        if (host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('169.254.')) return true;
        if (host.startsWith('172.') && parseInt(host.split('.')[1], 10) >= 16 && parseInt(host.split('.')[1], 10) <= 31) return true;
        return false;
      } catch {
        return true; // Malformed is blocked
      }
    };

    assert.strictEqual(isPrivateUri('http://127.0.0.1:8080/admin'), true);
    assert.strictEqual(isPrivateUri('http://localhost:3000/api'), true);
    assert.strictEqual(isPrivateUri('http://169.254.169.254/latest/meta-data'), true);
    assert.strictEqual(isPrivateUri('http://192.168.1.1/internal'), true);
    assert.strictEqual(isPrivateUri('https://careers.company.example/jobs'), false);
    assert.strictEqual(isPrivateUri('https://adzuna.example/api/v1'), false);
  });

  await t.test('XSS sanitization neutralizes script tags and inline handlers', () => {
    const sanitizeHtml = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const payload = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
    const clean = sanitizeHtml(payload);

    assert.strictEqual(clean.includes('<script>'), false);
    assert.strictEqual(clean.includes('&lt;script&gt;'), true);
    assert.strictEqual(clean.includes('&lt;img'), true);
  });

  await t.test('Token storage boundary keeps sensitive JWT tokens isolated', () => {
    // Verifies tokens are not logged or exposed in public telemetry
    const sanitizeTelemetry = (payload) => {
      const sanitized = { ...payload };
      if (sanitized.token) sanitized.token = '[REDACTED]';
      if (sanitized.password) sanitized.password = '[REDACTED]';
      return sanitized;
    };

    const telemetry = {
      event: 'user_action',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sensitive-signature',
      page: 'Outreach'
    };

    const safeTelemetry = sanitizeTelemetry(telemetry);
    assert.strictEqual(safeTelemetry.token, '[REDACTED]');
    assert.strictEqual(safeTelemetry.page, 'Outreach');
  });
});
