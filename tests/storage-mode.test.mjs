import test from 'node:test';
import assert from 'node:assert/strict';

function computeMode(value) {
  return value === 'client' ? 'client' : 'postgres';
}

test('returns client mode only for explicit client value', () => {
  assert.equal(computeMode('client'), 'client');
  assert.equal(computeMode('postgres'), 'postgres');
  assert.equal(computeMode(undefined), 'postgres');
});
