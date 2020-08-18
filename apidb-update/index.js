const fs = require('fs');
const core = require('@actions/core');
const {APIDB} = require('common/apidb');

async function run() {
  try {
    // Inputs
    const category = core.getInput('category');
    const inputPath = core.getInput('path');

    const db = new APIDB();
    const dbItems = await db.query(category);

    // Read API from local file
    const rawdata = fs.readFileSync(inputPath);
    const localItems = JSON.parse(rawdata);

    // Compare db with local
    const comp = db.compare(dbItems, localItems);

    const addedItems = {};
    comp.addedKeys.forEach((docId) => {
      addedItems[docId] = comp.newItems[docId];
    });

    const changedItems = {};
    comp.changedKeys.forEach((docId) => {
      changedItems[docId] = comp.newItems[docId];
    });

    // Update APIDB
    if (comp.totalChanged) {
      if (comp.addedKeys.size > 0) {
        console.log('## Add Items ##');
        await db.put(category, addedItems);
      }
      if (comp.changedKeys.size > 0) {
        console.log('## Update Items ##');
        await db.put(category, changedItems);
      }
      if (comp.removedKeys.size > 0) {
        console.log('## Delete Items ##');
        await db.delete(category, comp.removedKeys);
      }
    } else {
      console.log('## No items to update');
    }
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

run();
