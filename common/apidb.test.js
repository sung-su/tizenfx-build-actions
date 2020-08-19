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
  expect(comp.addedKeys.length).toBe(2);
  expect(comp.changedKeys.length).toBe(4);
  expect(comp.removedKeys.length).toBe(6);
  expect(comp.addedPublicKeys.length).toBe(2);
  expect(comp.changedPublicKeys.length).toBe(1);
  expect(comp.removedPublicKeys.length).toBe(6);
  expect(comp.addedInternalKeys.length).toBe(1);
  expect(comp.changedInternalKeys.length).toBe(2);
  expect(comp.removedInternalKeys.length).toBe(1);
});
