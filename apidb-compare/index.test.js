const fs = require('fs');
const path = require('path');
const exec = require('common/exec');

test('compare-locals', async() => {
  process.env['INPUT_FILE'] = '../common/test_data/new.json';
  process.env['INPUT_BASE-FILE'] = '../common/test_data/old.json';
  process.env['INPUT_OUTPUT'] = 'output.json';

  const index = path.join(__dirname, 'index.js');

  const ret = await exec(`node ${index}`, {env: process.env}, (line) => {
    if (line.startsWith('::error::')) {
      throw new Error(line);
    }
  });

  expect(ret).toBe(0);

  const comp = JSON.parse(fs.readFileSync('output.json'));
  expect(comp.totalChanged).toBe(12);
  expect(comp.addedKeys.length).toBe(2);
  expect(comp.changedKeys.length).toBe(4);
  expect(comp.removedKeys.length).toBe(6);
  expect(comp.addedPublicKeys.length).toBe(2);
  expect(comp.changedPublicKeys.length).toBe(1);
  expect(comp.removedPublicKeys.length).toBe(6);
  expect(comp.addedInternalKeys.length).toBe(1);
  expect(comp.changedInternalKeys.length).toBe(2);
  expect(comp.removedInternalKeys.length).toBe(1);

  fs.unlinkSync('output.json');
});
