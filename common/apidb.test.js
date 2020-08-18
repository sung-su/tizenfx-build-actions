const fs = require('fs');
const path = require('path');
const {APIDB} = require('./apidb');

test('test compare', async () => {
  const oldJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'test_data', 'old.json')),
  );
  const newJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'test_data', 'new.json')),
  );

  const db = new APIDB();
  const comp = db.compare(oldJson, newJson);

  expect(comp.totalChanged).toBe(12);
  expect(comp.addedKeys.size).toBe(2);
  expect(comp.changedKeys.size).toBe(4);
  expect(comp.removedKeys.size).toBe(6);
  expect(comp.addedPublicKeys.size).toBe(2);
  expect(comp.changedPublicKeys.size).toBe(1);
  expect(comp.removedPublicKeys.size).toBe(6);
  expect(comp.addedInternalKeys.size).toBe(1);
  expect(comp.changedInternalKeys.size).toBe(2);
  expect(comp.removedInternalKeys.size).toBe(1);
});
