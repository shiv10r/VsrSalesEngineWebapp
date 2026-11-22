import test from 'node:test';
import assert from 'node:assert';
import { loadModule } from './_bundle.mjs';

const m = await loadModule(`
  export * from './src/utils/csvParse.ts';
  export * from './src/utils/localLeadsFormat.ts';
`);

const run = (text, defaultDistrict = '') => {
  const table = m.parseCsv(text);
  const map = m.mapColumns(table[0] ?? []);
  return { table, map, ...m.toImportRows(table, map, defaultDistrict) };
};

test('CSV parser', async (t) => {
  await t.test('plain comma file', () => {
    const t1 = m.parseCsv('name,district\nA,Lucknow\nB,Noida\n');
    assert.deepStrictEqual(t1, [['name', 'district'], ['A', 'Lucknow'], ['B', 'Noida']]);
  });

  await t.test('semicolon and tab delimiters are detected', () => {
    assert.deepStrictEqual(m.parseCsv('name;district\nA;Lucknow'), [['name', 'district'], ['A', 'Lucknow']]);
    assert.deepStrictEqual(m.parseCsv('name\tdistrict\nA\tLucknow'), [['name', 'district'], ['A', 'Lucknow']]);
  });

  await t.test('quoted fields keep commas, doubled quotes and line breaks', () => {
    const table = m.parseCsv('name,address\n"Sharma, Dr. ""Raj"" Clinic","12 Mall Rd\nHazratganj"\n');
    assert.strictEqual(table[1][0], 'Sharma, Dr. "Raj" Clinic');
    assert.strictEqual(table[1][1], '12 Mall Rd\nHazratganj');
  });

  await t.test('CRLF, BOM and blank lines are handled', () => {
    const table = m.parseCsv('﻿name,district\r\n\r\nA,Lucknow\r\n,\r\nB,Noida');
    assert.deepStrictEqual(table, [['name', 'district'], ['A', 'Lucknow'], ['B', 'Noida']]);
  });

  await t.test('a delimiter inside quotes does not change the detected delimiter', () => {
    assert.strictEqual(m.detectDelimiter('"a;b;c",d,e'), ',');
  });
});

test('column mapping', async (t) => {
  await t.test('aliases match case-insensitively with separators normalised', () => {
    const map = m.mapColumns(['Business_Name', 'City', 'Mobile Number', 'URL', 'Review Count', 'Stars', 'Type', 'Street']);
    assert.strictEqual(map.mapping.businessName, 0);
    assert.strictEqual(map.mapping.district, 1);
    assert.strictEqual(map.mapping.phone, 2);
    assert.strictEqual(map.mapping.website, 3);
    assert.strictEqual(map.mapping.reviewCount, 4);
    assert.strictEqual(map.mapping.rating, 5);
    assert.strictEqual(map.mapping.category, 6);
    assert.strictEqual(map.mapping.address, 7);
    assert.deepStrictEqual(map.unmapped, []);
  });

  await t.test('unknown headers are reported as ignored, each column is used once', () => {
    const map = m.mapColumns(['name', 'Owner', 'business', 'notes']);
    assert.strictEqual(map.mapping.businessName, 0);
    assert.deepStrictEqual(map.unmapped, ['Owner', 'business', 'notes']);
  });

  await t.test('a file without a name column is detected', () => {
    assert.strictEqual(m.mapColumns(['district', 'phone']).mapping.businessName, undefined);
  });
});

test('rows to import', async (t) => {
  await t.test('builds clean rows and skips rows without a business name, using spreadsheet row numbers', () => {
    const r = run('name,district,phone,website,rating,reviews\nSharma Clinic,Lucknow,98765,,4.5,"1,200"\n,Noida,111,,,\nVerma Store,,222,verma.example,9,x');
    assert.strictEqual(r.rows.length, 2);
    assert.deepStrictEqual(r.rows[0], {
      businessName: 'Sharma Clinic', district: 'Lucknow', phone: '98765', rating: 4.5, reviewCount: 1200,
    });
    assert.deepStrictEqual(r.rows[1], { businessName: 'Verma Store', phone: '222', website: 'verma.example' });
    assert.deepStrictEqual(r.skipped, [{ row: 3, message: 'Missing business name' }]);
  });

  await t.test('rating accepts a decimal comma and rejects values outside 0-5', () => {
    const r = run('name,rating\nA,"4,5"\nB,7\nC,abc');
    assert.strictEqual(r.rows[0].rating, 4.5);
    assert.strictEqual(r.rows[1].rating, undefined);
    assert.strictEqual(r.rows[2].rating, undefined);
  });

  await t.test('the default district fills only rows that have none', () => {
    const r = run('name,district\nA,Noida\nB,', 'Lucknow');
    assert.strictEqual(r.rows[0].district, 'Noida');
    assert.strictEqual(r.rows[1].district, 'Lucknow');
  });

  await t.test('rows beyond the limit are cut and flagged', () => {
    const body = Array.from({ length: m.MAX_IMPORT_ROWS + 5 }, (_, i) => `Shop ${i}`).join('\n');
    const r = run(`name\n${body}`);
    assert.strictEqual(r.rows.length, m.MAX_IMPORT_ROWS);
    assert.strictEqual(r.truncated, true);
  });
});

test('display helpers', async (t) => {
  await t.test('only http(s) websites become links', () => {
    assert.strictEqual(m.safeWebsiteHref('example.com'), 'https://example.com/');
    assert.strictEqual(m.safeWebsiteHref('http://example.com/a'), 'http://example.com/a');
    assert.strictEqual(m.safeWebsiteHref('javascript:alert(1)'), null);
    assert.strictEqual(m.safeWebsiteHref('data:text/html,x'), null);
    assert.strictEqual(m.safeWebsiteHref('   '), null);
  });

  await t.test('phone numbers become tel links only when they look like numbers', () => {
    assert.strictEqual(m.telHref('98765 43210'), 'tel:9876543210');
    assert.strictEqual(m.telHref('+91 98765-43210'), 'tel:+919876543210');
    assert.strictEqual(m.telHref('123'), null);
  });

  await t.test('rating text', () => {
    assert.strictEqual(m.formatRating(null, null), '—');
    assert.strictEqual(m.formatRating(4.5, null), '4.5');
    assert.match(m.formatRating(4.5, 1200), /^4\.5 \(1[,.]?200\)$/);
  });

  await t.test('grid building: busiest districts first, intensity steps, known categories kept', () => {
    const summary = {
      total: 6, noWebsite: 0,
      byDistrict: [{ district: 'A', count: 1 }, { district: 'B', count: 5 }, { district: 'C', count: 0 }],
      byCategory: [], grid: [
        { district: 'A', category: 'Retail', count: 1 },
        { district: 'B', category: 'Retail', count: 4 },
        { district: 'B', category: 'Services', count: 1 },
      ],
    };
    const g = m.buildGrid(summary, ['Healthcare', 'Retail']);
    assert.deepStrictEqual(g.districts, ['B', 'A']);
    assert.deepStrictEqual(g.categories, ['Healthcare', 'Retail', 'Services']);
    assert.strictEqual(g.max, 4);
    assert.strictEqual(m.gridStep(g.counts['B|Retail'], g.max), 4);
    assert.strictEqual(m.gridStep(g.counts['A|Retail'], g.max), 1);
    assert.strictEqual(m.gridStep(0, g.max), 0);
  });
});
