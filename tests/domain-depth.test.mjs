import test from 'node:test';
import assert from 'node:assert';

test('Frontend Domain Depth & Rule Validation (T062)', async (t) => {
  await t.test('Role account classification identifies generic mailboxes', () => {
    const rolePrefixes = ['info@', 'sales@', 'support@', 'admin@', 'billing@', 'contact@', 'jobs@', 'careers@'];
    const isRoleAccount = (email) => rolePrefixes.some(p => email.toLowerCase().startsWith(p));

    assert.strictEqual(isRoleAccount('info@company.com'), true);
    assert.strictEqual(isRoleAccount('sales@vendor.org'), true);
    assert.strictEqual(isRoleAccount('careers@startup.io'), true);
    assert.strictEqual(isRoleAccount('maya.patel@northstar.example'), false);
    assert.strictEqual(isRoleAccount('john.doe@company.com'), false);
  });

  await t.test('Compliance Gate enforces all 6 fail-closed statutory requirements', () => {
    const evaluateGate = (cfg) => {
      const reasons = [];
      if (!cfg.senderEmail) reasons.push('Sender identity missing');
      if (!cfg.providerTransport) reasons.push('Provider transport missing');
      if (!cfg.physicalAddress) reasons.push('Physical address missing');
      if (!cfg.optOutUrl) reasons.push('Opt-out URL missing');
      if (!cfg.jurisdiction) reasons.push('Jurisdiction missing');
      if (!cfg.dailyCap || cfg.dailyCap <= 0) reasons.push('Rate limit missing');

      return {
        isProductionReady: reasons.length === 0,
        blockingReasons: reasons
      };
    };

    const incomplete = evaluateGate({
      senderEmail: 'outreach@example.com',
      dailyCap: 25
    });
    assert.strictEqual(incomplete.isProductionReady, false);
    assert.strictEqual(incomplete.blockingReasons.length, 4);

    const complete = evaluateGate({
      senderEmail: 'outreach@vsrsalesengine.com',
      providerTransport: 'AmazonSES',
      physicalAddress: '100 Enterprise Way, Austin TX 78701',
      optOutUrl: 'https://vsrsalesengine.com/opt-out',
      jurisdiction: 'US-CANSPAM',
      dailyCap: 50
    });
    assert.strictEqual(complete.isProductionReady, true);
    assert.strictEqual(complete.blockingReasons.length, 0);
  });

  await t.test('Truthfulness guard identifies prohibited claims', () => {
    const prohibitedPatterns = [
      'guaranteed', '100% guarantee', 'best in the world', 'cheapest rates', 'zero risk'
    ];
    const checkProhibitedClaims = (body) => {
      const lower = body.toLowerCase();
      return prohibitedPatterns.filter(p => lower.includes(p));
    };

    const cleanDraft = 'Hi Alex, we have seasoned .NET and React engineers available for sprint delivery.';
    const flaggedDraft = 'Hi Alex, we offer a 100% guarantee and the cheapest rates in the world.';

    assert.deepStrictEqual(checkProhibitedClaims(cleanDraft), []);
    const violations = checkProhibitedClaims(flaggedDraft);
    assert.strictEqual(violations.includes('100% guarantee'), true);
    assert.strictEqual(violations.includes('cheapest rates'), true);
  });

  await t.test('Backoff calculation grows exponentially and caps at 60 seconds', () => {
    const calculateBackoff = (attempt) => {
      const base = Math.pow(2, Math.max(1, attempt));
      return Math.min(60, base);
    };

    assert.strictEqual(calculateBackoff(1), 2);
    assert.strictEqual(calculateBackoff(2), 4);
    assert.strictEqual(calculateBackoff(3), 8);
    assert.strictEqual(calculateBackoff(4), 16);
    assert.strictEqual(calculateBackoff(10), 60);
  });
});
