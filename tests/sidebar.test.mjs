import test from 'node:test';
import assert from 'node:assert';
import { loadModule } from './_bundle.mjs';

const m = await loadModule(`
  import { renderToStaticMarkup } from 'react-dom/server';
  import { createElement as h } from 'react';
  import { Sidebar } from './src/components/layout/Sidebar.tsx';
  import { initialsFrom, navBadge, sessionLabel } from './src/components/layout/sidebarModel.ts';
  import { navGroups } from './src/data/navigation.ts';
  const base = { page: 'Dashboard', go() {}, opportunityCount: 12, userEmail: 'sales.team@vsr.com', guest: false,
    collapsed: false, onToggleCollapsed() {}, mobileOpen: false, onCloseMobile() {}, onOpenHelp() {} };
  export const render = (over = {}) => renderToStaticMarkup(h(Sidebar, { ...base, ...over }));
  export { initialsFrom, navBadge, sessionLabel, navGroups };
`);

test('initials', () => {
  assert.strictEqual(m.initialsFrom('sales.team@vsr.com'), 'ST');
  assert.strictEqual(m.initialsFrom('maya@x.com'), 'MA');
  assert.strictEqual(m.initialsFrom('shiv_work-101@x.com'), 'SW');
  assert.strictEqual(m.initialsFrom(''), 'VS');
  assert.strictEqual(m.initialsFrom(null), 'VS');
});

test('nav badge shows a count only for Opportunities and caps it', () => {
  assert.strictEqual(m.navBadge('Opportunities', { opportunities: 12 }), '12');
  assert.strictEqual(m.navBadge('Opportunities', { opportunities: 0 }), null);
  assert.strictEqual(m.navBadge('Opportunities', { opportunities: 4200 }), '999+');
  assert.strictEqual(m.navBadge('Agents', { opportunities: 12 }), null);
});

test('session label is plain about guests', () => {
  assert.strictEqual(m.sessionLabel(true), 'Guest (read-only)');
  assert.strictEqual(m.sessionLabel(false), 'Signed in');
});

test('sidebar markup', async (t) => {
  await t.test('lists every page from the navigation data, each with an accessible name', () => {
    const html = m.render();
    for (const group of m.navGroups) {
      assert.match(html, new RegExp(group.title.replace('&', '&amp;')));
      for (const [label] of group.items) {
        assert.match(html, new RegExp(`aria-label="${label}"`));
      }
    }
  });

  await t.test('marks only the current page with aria-current', () => {
    const html = m.render({ page: 'Agents' });
    assert.strictEqual((html.match(/aria-current="page"/g) || []).length, 1);
    assert.match(html, /sb-item sb-active"[^>]*aria-current="page"[^>]*aria-label="Agents"/);
  });

  await t.test('shows the opportunity count badge', () => {
    assert.match(m.render({ opportunityCount: 37 }), /<span class="sb-badge">37<\/span>/);
    assert.doesNotMatch(m.render({ opportunityCount: 0 }), /sb-badge/);
  });

  await t.test('collapse button is named for what it will do', () => {
    assert.match(m.render({ collapsed: false }), /aria-label="Collapse sidebar"/);
    assert.match(m.render({ collapsed: true }), /aria-label="Expand sidebar"/);
  });

  await t.test('user card shows initials, email and a guest warning style for guests', () => {
    const user = m.render();
    assert.match(user, />ST<\/span>/);
    assert.match(user, /sales\.team@vsr\.com/);
    assert.match(user, /Signed in/);
    const guest = m.render({ guest: true, userEmail: 'guest.dev@local' });
    assert.match(guest, /sb-guest/);
    assert.match(guest, /Guest \(read-only\)/);
  });

  await t.test('phone drawer opens with a class and has a close button', () => {
    assert.match(m.render({ mobileOpen: true }), /class="sb sb-open"/);
    assert.match(m.render({ mobileOpen: false }), /class="sb "/);
    assert.match(m.render(), /aria-label="Close menu"/);
  });

  await t.test('no leftover development-only copy', () => {
    const html = m.render();
    assert.doesNotMatch(html, /Login bypass|Guest-mode controls|LOCAL GUEST|JWT/);
  });
});
