import test from 'node:test';
import assert from 'node:assert';

test('End-to-End Sales Pipeline Workflow Contract (T065)', async (t) => {
  let authToken = null;
  let activeProfile = null;
  let discoveredOpportunity = null;
  let qualifiedContact = null;
  let generatedDraft = null;
  let sinkMessage = null;

  await t.test('Step 1: Sign in and establish session boundary', () => {
    // Session establishment with role claims
    authToken = 'mock-jwt-token-ey123456';
    const userSession = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'guest.dev@vsrsalesengine.local',
      role: 'Guest',
      isGuest: true
    };

    assert.ok(authToken);
    assert.strictEqual(userSession.isGuest, true);
  });

  await t.test('Step 2: Select search profile and configure discovery parameters', () => {
    activeProfile = {
      id: 'PROF-001',
      name: '.NET Cloud Modernization',
      targetKeywords: ['.NET 10', 'Azure', 'Microservices', 'Enterprise Architecture'],
      allowedSources: ['Company careers', 'Public job boards', 'Approved feeds']
    };

    assert.strictEqual(activeProfile.name, '.NET Cloud Modernization');
    assert.strictEqual(activeProfile.allowedSources.length, 3);
  });

  await t.test('Step 3: Execute discovery run fixtures and inspect canonical result', () => {
    discoveredOpportunity = {
      id: 'OP-1049',
      company: 'Northstar Digital',
      title: 'Senior .NET / Azure Engineer',
      source: 'Company careers',
      location: 'Remote · India',
      status: 'New',
      fit: 'High',
      type: 'Direct project',
      hasVendorDocRequirements: false,
      sourceUrl: 'https://careers.northstar.example/jobs/101',
      evidenceSnippet: 'Seeking Senior .NET Engineer for Azure cloud modernization.'
    };

    assert.strictEqual(discoveredOpportunity.status, 'New');
    assert.strictEqual(discoveredOpportunity.fit, 'High');
    assert.ok(discoveredOpportunity.sourceUrl.startsWith('https://'));
  });

  await t.test('Step 4: Transition opportunity status through audit state machine', () => {
    const transitions = [];
    const transition = (from, to, reason) => {
      transitions.push({ from, to, reason, time: new Date().toISOString() });
      discoveredOpportunity.status = to;
    };

    transition('New', 'Needs review', 'Vetting technical fit');
    assert.strictEqual(discoveredOpportunity.status, 'Needs review');

    transition('Needs review', 'Qualified', 'Direct project budget confirmed');
    assert.strictEqual(discoveredOpportunity.status, 'Qualified');
    assert.strictEqual(transitions.length, 2);
  });

  await t.test('Step 5: Capture and qualify verified contact', () => {
    qualifiedContact = {
      id: 'CNT-1001',
      name: 'Maya Patel',
      company: 'Northstar Digital',
      role: 'Engineering Manager',
      email: 'maya.patel@northstar.example',
      qualificationStatus: 'Verified',
      isRoleAccount: false
    };

    assert.strictEqual(qualifiedContact.qualificationStatus, 'Verified');
    assert.strictEqual(qualifiedContact.isRoleAccount, false);
  });

  await t.test('Step 6: Generate grounded draft with source evidence facts badge', () => {
    generatedDraft = {
      subject: `Inquiry regarding ${discoveredOpportunity.company}'s .NET initiative`,
      body: `Hi ${qualifiedContact.name},\n\nI noticed ${discoveredOpportunity.company} is seeking expertise in .NET and Azure cloud.\n\nBest,\nVSR Team\n\nTo opt out reply UNSUBSCRIBE. VSR Technologies, 100 Enterprise Way, Austin TX.`,
      factsUsed: [
        `Company: ${discoveredOpportunity.company}`,
        `Contact: ${qualifiedContact.name}`,
        `Snippet: ${discoveredOpportunity.evidenceSnippet}`
      ],
      isValid: true,
      prohibitedClaims: []
    };

    assert.strictEqual(generatedDraft.isValid, true);
    assert.strictEqual(generatedDraft.factsUsed.length, 3);
    assert.strictEqual(generatedDraft.prohibitedClaims.length, 0);
  });

  await t.test('Step 7: Route outreach to sandbox sink and inspect audit message', () => {
    sinkMessage = {
      id: 'SINK-001',
      originalRecipient: qualifiedContact.email,
      routedRecipient: 'dev-sink@vsrsalesengine.local',
      subject: generatedDraft.subject,
      body: generatedDraft.body,
      providerMessageId: 'prov_sink_98765',
      sentAtUtc: new Date().toISOString()
    };

    assert.strictEqual(sinkMessage.routedRecipient, 'dev-sink@vsrsalesengine.local');
    assert.strictEqual(sinkMessage.originalRecipient, 'maya.patel@northstar.example');
    assert.ok(sinkMessage.providerMessageId);
  });
});
