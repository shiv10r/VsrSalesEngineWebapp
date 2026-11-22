import test from 'node:test';
import assert from 'node:assert';
import { loadModule, stubBrowserGlobals } from './_bundle.mjs';

stubBrowserGlobals();

// One bundle so React and react-dom share a single copy.
const m = await loadModule(`
  import { renderToStaticMarkup } from 'react-dom/server';
  import { createElement as h } from 'react';
  import { LinkedInHandoff } from './src/components/linkedin/LinkedInHandoff.tsx';
  import { LinkedInSection } from './src/components/linkedin/LinkedInSection.tsx';
  import { api } from './src/services/api.ts';
  export * from './src/utils/linkedinHandoff.ts';
  export const render = (type, props) => renderToStaticMarkup(h(type, props));
  export { LinkedInHandoff, LinkedInSection, api };
`);

const contact = (over = {}) => ({
  id: 'CNT-1', name: 'Priya Sharma', company: 'Acme', role: 'Co-founder & CTO', email: 'priya@acme.example',
  source: 'Company site', status: 'Not contacted', qualificationStatus: 'Verified', relationToPost: null, ...over,
});
const noop = () => {};
const base = { guest: false, onNotify: noop, onMarkRequested: noop };
const SUFFIX = " I'm with VSR Technologies and would like to connect if you're open to it.";
const ROLE = 'Senior .NET Engineer';
const noLoneSurrogates = (s) => !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(s);
const note = (relationToPost, roleTitle, name = 'Priya Sharma') =>
  m.buildConnectionNote({ contact: { name, company: 'Acme', relationToPost }, roleTitle });
const follow = (relationToPost, roleTitle, name = 'Priya Sharma') =>
  m.buildFollowUp({ contact: { name, company: 'Acme', relationToPost }, roleTitle });

test('original post link', async (t) => {
  const post = 'https://news.ycombinator.com/item?id=42';
  await t.test('shown for posters with a web link', () => {
    const html = m.render(m.LinkedInHandoff, { ...base, contact: contact({ relationToPost: 'poster', sourceUrl: post }) });
    assert.match(html, /href="https:\/\/news\.ycombinator\.com\/item\?id=42"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*>View original post/);
  });
  await t.test('not shown without a link, for other relationships, in compact mode, or for non-web links', () => {
    for (const props of [
      { contact: contact({ relationToPost: 'poster' }) },
      { contact: contact({ relationToPost: 'hiring', sourceUrl: post }) },
      { contact: contact({ relationToPost: 'poster', sourceUrl: post }), compact: true },
      { contact: contact({ relationToPost: 'poster', sourceUrl: 'javascript:alert(1)' }) },
    ]) {
      assert.doesNotMatch(m.render(m.LinkedInHandoff, { ...base, ...props }), /View original post|javascript:/);
    }
  });
});

test('relationship chips and ordering', async (t) => {
  await t.test('each relationship has its label, unknown has none', () => {
    const labels = { poster: 'Posted this', 'decision-maker': 'Decision-maker', hiring: 'Hiring', engineering: 'Engineering', mentioned: 'Mentioned in post' };
    for (const [relation, label] of Object.entries(labels)) {
      const html = m.render(m.LinkedInSection, { ...base, company: 'Acme', contacts: [contact({ relationToPost: relation })] });
      assert.match(html, new RegExp(`li-rel-${relation}">${label}<`));
    }
    const none = m.render(m.LinkedInSection, { ...base, company: 'Acme', contacts: [contact({ relationToPost: null })] });
    assert.doesNotMatch(none, /li-badge/);
  });
  await t.test('sorted poster, hiring, decision-maker, engineering, mentioned, then unknown', () => {
    const people = [
      contact({ id: '1', name: 'Una', relationToPost: null }),
      contact({ id: '2', name: 'Mia', relationToPost: 'mentioned' }),
      contact({ id: '3', name: 'Eli', relationToPost: 'engineering' }),
      contact({ id: '4', name: 'Dee', relationToPost: 'decision-maker' }),
      contact({ id: '5', name: 'Hal', relationToPost: 'hiring' }),
      contact({ id: '6', name: 'Pat', relationToPost: 'poster' }),
      contact({ id: '7', name: 'Other', company: 'Other Co', relationToPost: 'poster' }),
    ];
    assert.deepStrictEqual(m.contactsForCompany(people, ' ACME ').map((c) => c.name), ['Pat', 'Hal', 'Dee', 'Eli', 'Mia', 'Una']);
    assert.deepStrictEqual(m.contactsForCompany(people, 'Nobody'), []);
  });
  await t.test('unknown values from the server are treated as unknown', () => {
    assert.strictEqual(m.toRelation('poster'), 'poster');
    assert.strictEqual(m.toRelation('bogus'), null);
    assert.strictEqual(m.toRelation(undefined), null);
    assert.strictEqual(m.toRelation(null), null);
  });
  await t.test('the API mapper keeps relationToPost and drops unknown values', async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: true, json: async () => [
      { id: '1', name: 'A', company: 'Acme', role: 'x', email: 'a@x.co', source: 's', status: 'Not contacted', relationToPost: 'poster' },
      { id: '2', name: 'B', company: 'Acme', role: 'x', email: 'b@x.co', source: 's', status: 'Not contacted', relationToPost: 'bogus' },
      { id: '3', name: 'C', company: 'Acme', role: 'x', email: 'c@x.co', source: 's', status: 'Not contacted' },
    ] });
    try {
      const list = await m.api.getContacts();
      assert.deepStrictEqual(list.map((c) => c.relationToPost), ['poster', null, null]);
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});

test('opening, opt-outs and requested state', () => {
  assert.strictEqual(m.openingFor([{ company: 'acme', title: 'Go Developer' }], 'Acme'), 'Go Developer');
  assert.strictEqual(m.openingFor([{ company: 'Other', title: 'x' }], 'Acme'), undefined);
  assert.match(m.handoffBlockedReason(contact({ qualificationStatus: 'OptedOut' })), /Opted out/);
  assert.match(m.handoffBlockedReason(contact({ status: 'Do not contact' })), /Opted out/);
  assert.match(m.handoffBlockedReason(contact({ qualificationStatus: 'BlockedByPolicy' })), /Blocked by policy/);
  assert.strictEqual(m.handoffBlockedReason(contact()), null);
  assert.ok(m.isRequested(contact({ status: 'LinkedIn requested' })));
  assert.ok(!m.isRequested(contact()));
});

test('handoff control renders', async (t) => {
  await t.test('link, copy buttons and toggle', () => {
    const html = m.render(m.LinkedInHandoff, { ...base, contact: contact({ relationToPost: 'hiring' }), openingTitle: ROLE });
    assert.match(html, /href="https:\/\/www\.linkedin\.com\/search\/results\/people\/\?keywords=Priya%20Sharma%20Acme"/);
    assert.match(html, /target="_blank"/);
    assert.match(html, /rel="noopener noreferrer"/);
    assert.match(html, /Find on LinkedIn/);
    assert.match(html, /Copy connection note/);
    assert.match(html, /Copy follow-up message/);
    assert.match(html, /Mark as requested/);
    assert.match(html, /is hiring for Senior \.NET Engineer/);
    assert.doesNotMatch(html, /disabled/);
  });
  await t.test('compact mode shows the chip but drops the follow-up and the preview', () => {
    const html = m.render(m.LinkedInHandoff, { ...base, contact: contact({ relationToPost: 'engineering' }), compact: true });
    assert.match(html, />Engineering</);
    assert.doesNotMatch(html, /follow-up|Preview/i);
    assert.match(html, /Copy connection note/);
  });
  await t.test('requested contacts show the box ticked', () => {
    const html = m.render(m.LinkedInHandoff, { ...base, contact: contact({ status: 'LinkedIn requested' }) });
    assert.match(html, /checked=""/);
  });
  await t.test('guests can read and copy but not mark', () => {
    const html = m.render(m.LinkedInHandoff, { ...base, guest: true, contact: contact() });
    assert.match(html, /<input type="checkbox"[^>]*disabled=""/);
    assert.match(html, /Guests can(&#x27;|')t change contacts\. Sign in to edit\./);
    assert.match(html, /Find on LinkedIn/);
  });
  await t.test('an opted-out contact gets no controls at all', () => {
    const html = m.render(m.LinkedInHandoff, { ...base, contact: contact({ qualificationStatus: 'OptedOut' }) });
    assert.match(html, /Opted out: do not contact\./);
    assert.doesNotMatch(html, /linkedin\.com|Copy connection note|checkbox/);
  });
});

test('section: people, empty state and caption', async (t) => {
  const props = { ...base, company: 'Acme' };

  await t.test('lists people with the caption', () => {
    const html = m.render(m.LinkedInSection, {
      ...props, contacts: [contact({ id: '1', name: 'Zed', relationToPost: 'mentioned' }), contact({ id: '2', name: 'Amy', relationToPost: 'poster' })],
    });
    assert.ok(html.indexOf('Amy') < html.indexOf('Zed'));
    assert.match(html, /People connected to this post/);
    assert.match(html, /You send this yourself on LinkedIn\. We never automate LinkedIn\./);
    assert.doesNotMatch(html, /No one connected/);
  });
  await t.test('nobody found: the exact empty state with a company search link', () => {
    const html = m.render(m.LinkedInSection, { ...props, contacts: [] });
    assert.match(html, /No one connected to this post was found on the company site or in the post\. <a href="https:\/\/www\.linkedin\.com\/search\/results\/companies\/\?keywords=Acme"[^>]*>Search LinkedIn manually<\/a>\./);
    assert.match(html, /We never automate LinkedIn/);
  });
  await t.test('someone with no known relationship is still listed, no empty state', () => {
    const html = m.render(m.LinkedInSection, { ...props, contacts: [contact({ role: 'Recruiter', relationToPost: null })] });
    assert.doesNotMatch(html, /No one connected/);
    assert.match(html, /Priya Sharma/);
  });
  await t.test('contacts at other companies are not shown', () => {
    const html = m.render(m.LinkedInSection, { ...props, contacts: [contact({ company: 'Other Co' })] });
    assert.doesNotMatch(html, /Priya Sharma/);
    assert.match(html, /No one connected/);
  });
  await t.test('guest hint appears when there are people', () => {
    const html = m.render(m.LinkedInSection, { ...props, guest: true, contacts: [contact()] });
    assert.match(html, /Sign in to mark a request\./);
  });
});
