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

test('search links are plain, encoded URLs', () => {
  assert.strictEqual(
    m.peopleSearchUrl('Priya Sharma', 'Acme & Sons'),
    'https://www.linkedin.com/search/results/people/?keywords=Priya%20Sharma%20Acme%20%26%20Sons');
  assert.match(m.peopleSearchUrl('Zoë Müller', 'Größe GmbH'), /keywords=Zo%C3%AB%20M%C3%BCller%20Gr%C3%B6%C3%9Fe%20GmbH$/);
  assert.strictEqual(m.companySearchUrl(' Acme Ltd '), 'https://www.linkedin.com/search/results/companies/?keywords=Acme%20Ltd');
  assert.doesNotMatch(m.peopleSearchUrl('A"><script>', 'x&y=z#frag'), /[<>"#]|&y=/);
});

test('connection note says the right thing for each relationship', async (t) => {
  const cases = [
    ['poster', `I saw your post about ${ROLE}.`, 'I saw your post about Acme.'],
    ['hiring', `I saw Acme is hiring for ${ROLE}.`, 'I saw Acme is hiring.'],
    ['decision-maker', `I came across Acme and the ${ROLE} opening.`, 'I came across Acme.'],
    ['engineering', `I saw your team is hiring for ${ROLE}.`, 'I saw your team at Acme is hiring.'],
    ['mentioned', `I saw your name in the Acme posting for ${ROLE}.`, 'I saw your name in the Acme posting.'],
    [null, `I saw Acme is hiring for ${ROLE}.`, 'I came across Acme and wanted to reach out.'],
    [undefined, `I saw Acme is hiring for ${ROLE}.`, 'I came across Acme and wanted to reach out.'],
  ];
  for (const [relation, withRole, withoutRole] of cases) {
    await t.test(`${relation}: with an opening`, () => assert.strictEqual(note(relation, ROLE), `Hi Priya, ${withRole}${SUFFIX}`));
    await t.test(`${relation}: without an opening nothing is invented`, () => assert.strictEqual(note(relation), `Hi Priya, ${withoutRole}${SUFFIX}`));
  }
  await t.test('follow-up matches the relationship too', () => {
    assert.match(follow('poster', ROLE), /^Hi Priya, thanks for connecting\. I saw your post about Senior \.NET Engineer, which is why I got in touch\. /);
    assert.match(follow('hiring', ROLE), /I saw Acme is hiring for Senior \.NET Engineer, which is why I got in touch\./);
    assert.match(follow('decision-maker', ROLE), /I came across Acme and the Senior \.NET Engineer opening, which is why I got in touch\./);
    assert.match(follow('engineering', ROLE), /I saw your team is hiring for Senior \.NET Engineer, which is why I got in touch\./);
    assert.match(follow('mentioned', ROLE), /I saw your name in the Acme posting for Senior \.NET Engineer, which is why I got in touch\./);
    assert.match(follow(null), /I came across Acme, which is why I got in touch\./);
    assert.match(follow('poster'), /I saw your post about Acme, which is why I got in touch\./);
  });
  await t.test('no name falls back to a plain greeting', () => {
    assert.match(note('hiring', ROLE, '  '), /^Hello, /);
  });
  await t.test('makes no claims about results, clients, awards or certifications', () => {
    for (const relation of [...m.RELATIONS, null]) {
      const all = note(relation, 'Engineer') + follow(relation, 'Engineer');
      assert.doesNotMatch(all, /certif|award|guarantee|years|clients? (like|such)|\bbest (in|of)\b|#1|proven|results|ISO|GST/i);
    }
  });
  await t.test('is deterministic', () => {
    assert.strictEqual(note('poster', ROLE), note('poster', ROLE));
  });
});

test('length limits hold for every relationship and awkward input', async (t) => {
  const long = (n, ch = 'x') => ch.repeat(n);
  const inputs = {
    'very long role': { name: 'Priya Sharma', company: 'Acme', role: long(500) },
    'very long company': { name: 'Priya Sharma', company: long(400), role: 'Engineer' },
    'long role and company': { name: 'Priya Sharma', company: long(400), role: long(400) },
    'very long name': { name: long(500), company: 'Acme', role: 'Engineer' },
    'non-ASCII names': { name: 'Zoë Müller', company: 'Größe 株式会社', role: 'Ingénieur logiciel sénior' },
    'emoji everywhere': { name: '😀 Zoë', company: '🚀'.repeat(300), role: '😀'.repeat(400) },
  };
  for (const relation of [...m.RELATIONS, null]) {
    for (const [label, i] of Object.entries(inputs)) {
      await t.test(`${relation} / ${label}`, () => {
        const c = { name: i.name, company: i.company, relationToPost: relation };
        const n = m.buildConnectionNote({ contact: c, roleTitle: i.role });
        const f = m.buildFollowUp({ contact: c, roleTitle: i.role });
        assert.ok(n.length <= 300, `note is ${n.length}`);
        assert.ok(f.length <= 600, `follow-up is ${f.length}`);
        assert.ok(noLoneSurrogates(n) && noLoneSurrogates(f), 'an emoji was split');
      });
    }
  }
  await t.test('a long role is shortened with an ellipsis and the rest of the note survives', () => {
    const n = note('hiring', long(500));
    assert.match(n, /^Hi Priya, I saw Acme is hiring for x+….+open to it\.$/);
  });
  await t.test('a short note is left untouched', () => assert.doesNotMatch(note('hiring', 'Engineer'), /…/));
  await t.test('truncate helper', () => {
    assert.strictEqual(m.truncate('hello', 10), 'hello');
    assert.strictEqual(m.truncate('hello world', 6), 'hello…');
    assert.strictEqual(m.truncate('😀😀😀', 5), '😀😀…');
    assert.strictEqual(m.truncate('😀😀😀', 4), '😀…');
  });
});

test('handles: a username is not treated as a name', async (t) => {
  await t.test('detected only for posters with a single word', () => {
    assert.ok(m.isHandle({ name: 'patio11', relationToPost: 'poster' }));
    assert.ok(!m.isHandle({ name: 'Priya Sharma', relationToPost: 'poster' }));
    assert.ok(!m.isHandle({ name: 'Madonna', relationToPost: 'hiring' }));
    assert.ok(!m.isHandle({ name: '', relationToPost: 'poster' }));
  });
  await t.test('greeting does not pretend it is a first name', () => {
    assert.match(note('poster', ROLE, 'patio11'), /^Hello, I saw your post about /);
    assert.match(note('hiring', ROLE, 'Madonna'), /^Hi Madonna, /);
  });
  await t.test('LinkedIn search uses handle + company and the UI says it is a handle', () => {
    const c = contact({ name: 'patio11', relationToPost: 'poster', sourceUrl: 'https://news.ycombinator.com/item?id=42' });
    const html = m.render(m.LinkedInHandoff, { ...base, contact: c });
    assert.match(html, /keywords=patio11%20Acme"/);
    assert.match(html, /username from the post, not a confirmed name/);
    const section = m.render(m.LinkedInSection, { ...base, company: 'Acme', contacts: [c] });
    assert.match(section, /@patio11/);
  });
  await t.test('a full-name poster gets no handle warning', () => {
    const html = m.render(m.LinkedInHandoff, { ...base, contact: contact({ relationToPost: 'poster' }) });
    assert.doesNotMatch(html, /not a confirmed name/);
  });
});

