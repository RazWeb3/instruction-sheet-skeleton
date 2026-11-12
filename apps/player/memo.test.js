import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMemo } from './memo.js';

test('memo lists title, sections and items only', () => {
  const memo = buildMemo({
    title: 'Fruits',
    sections: [{ heading: 'Common fruits', items: [{ text: 'apple', meaning: 'りんご', note: 'hidden' }, { text: 'pear' }] }],
  });
  assert.equal(memo, 'Pack: Fruits\nSection: Common fruits\n- apple — りんご\n- pear\n');
});

test('memo works for a pack without sections', () => {
  assert.equal(buildMemo({ title: 'Empty' }), 'Pack: Empty\n');
});
