import assert from 'node:assert';
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  rtoLookup,
  rtoByState,
  vehicleInfo,
  decodeRegistration,
} from '../lib/rto.js';

let passed = 0;
function ok(name, fn) {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
}

async function okAsync(name, fn) {
  await fn();
  passed++;
  console.log(`  ✓ ${name}`);
}

console.log('rto_lookup tests:');

ok('decodes MH01AB1234', () => {
  const r = rtoLookup('MH01AB1234');
  assert.ok(r.ok, 'expected ok');
  assert.strictEqual(r.stateCode, 'MH');
  assert.strictEqual(r.state, 'Maharashtra');
  assert.strictEqual(r.rtoCode, '01');
  assert.strictEqual(r.area, 'Mumbai (Central)');
  assert.strictEqual(r.series, 'AB');
  assert.strictEqual(r.serial, '1234');
});

ok('decodes KA01MB1234', () => {
  const r = rtoLookup('KA01MB1234');
  assert.ok(r.ok);
  assert.strictEqual(r.state, 'Karnataka');
  assert.strictEqual(r.area, 'Bengaluru Urban');
});

ok('decodes DL01SC4151', () => {
  const r = rtoLookup('DL01SC4151');
  assert.ok(r.ok);
  assert.strictEqual(r.state, 'Delhi');
  assert.strictEqual(r.area, 'New Delhi');
});

ok('decodes TN07AB9876', () => {
  const r = rtoLookup('TN07AB9876');
  assert.ok(r.ok);
  assert.strictEqual(r.state, 'Tamil Nadu');
  assert.strictEqual(r.area, 'Salem');
});

ok('normalizes lowercase + whitespace', () => {
  const r = rtoLookup('  mh01ab1234  ');
  assert.ok(r.ok);
  assert.strictEqual(r.raw, 'MH01AB1234');
});

ok('rejects wrong length', () => {
  assert.strictEqual(rtoLookup('MH01AB').ok, false);
  assert.strictEqual(rtoLookup('MH01ABC12345').ok, false);
});

ok('rejects wrong pattern', () => {
  assert.strictEqual(rtoLookup('M01AB1234').ok, false);
  assert.strictEqual(rtoLookup('MH1AB1234').ok, false);
  assert.strictEqual(rtoLookup('MH01111234').ok, false);
});

ok('rejects unknown state code', () => {
  assert.strictEqual(rtoLookup('ZZ01AB1234').ok, false);
});

ok('rejects non-string', () => {
  assert.strictEqual(rtoLookup(560001).ok, false);
});

console.log('\nrto_by_state tests:');

ok('lists Maharashtra offices', () => {
  const r = rtoByState('MH');
  assert.ok(r.ok);
  assert.strictEqual(r.state, 'Maharashtra');
  assert.ok(Array.isArray(r.offices) && r.offices.length > 0);
  assert.ok(r.offices.some((o) => o.code === '01' && o.area === 'Mumbai (Central)'));
});

ok('lists Karnataka offices', () => {
  const r = rtoByState('KA');
  assert.ok(r.ok);
  assert.strictEqual(r.state, 'Karnataka');
  assert.ok(r.offices.some((o) => o.code === '01' && o.area === 'Bengaluru Urban'));
});

ok('accepts state name', () => {
  const r = rtoByState('Maharashtra');
  assert.ok(r.ok);
  assert.strictEqual(r.stateCode, 'MH');
});

ok('rejects unknown state', () => {
  assert.strictEqual(rtoByState('ZZ').ok, false);
});

ok('rejects non-string', () => {
  assert.strictEqual(rtoByState(123).ok, false);
});

console.log('\nvehicle_info tests:');

ok('returns sample for MH01AB1234', () => {
  const v = vehicleInfo('MH01AB1234');
  assert.ok(v.ok);
  assert.strictEqual(v.fuel, 'Petrol');
  assert.strictEqual(v.category, 'Passenger Vehicle');
  assert.strictEqual(v.makeModel, 'Maruti Suzuki Swift');
  assert.strictEqual(v.firstRegistrationYear, 2019);
});

ok('returns sample for KA01MB1234', () => {
  const v = vehicleInfo('KA01MB1234');
  assert.ok(v.ok);
  assert.strictEqual(v.fuel, 'Electric');
  assert.strictEqual(v.makeModel, 'Tata Nexon EV');
});

ok('returns estimate when no sample exists', () => {
  const v = vehicleInfo('MH05C1234');
  assert.ok(v.ok);
  assert.ok(v.estimated, 'expected an estimated block');
  assert.ok(v.estimated.fuel);
  assert.ok(v.estimated.category);
});

ok('rejects wrong pattern', () => {
  assert.strictEqual(vehicleInfo('NOPE').ok, false);
});

console.log('\ndecodeRegistration tests:');

ok('splits components correctly', () => {
  const d = decodeRegistration('MH01P12345');
  assert.strictEqual(d.stateCode, 'MH');
  assert.strictEqual(d.rtoCode, '01');
  assert.strictEqual(d.series, 'P1');
  assert.strictEqual(d.serial, '2345');
  assert.strictEqual(d.vehicleClass, 'Passenger Vehicle');
});

console.log('\nserver boot test:');

okAsync('server boots on stdio', async () => {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(fileURLToPath(new URL('..', import.meta.url)), 'server.js')], {
      cwd: fileURLToPath(new URL('..', import.meta.url)),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('server did not boot in time'));
    }, 5000);
    child.stdout.on('data', (d) => {
      const t = d.toString();
      if (t.includes('rto-mcp server running on stdio')) {
        clearTimeout(timer);
        child.kill();
        resolve();
      }
    });
    child.stderr.on('data', (d) => {
      const t = d.toString();
      if (t.includes('rto-mcp server running on stdio')) {
        clearTimeout(timer);
        child.kill();
        resolve();
      }
    });
    child.on('error', reject);
  });
});

console.log(`\n${passed} passed.`);
