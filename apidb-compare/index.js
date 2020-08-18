const core = require('@actions/core');
const {APIDB} = require('common/apidb');

async function run() {
  try {
    // Inputs
    const category = core.getInput('category');
    const inputPath = core.getInput('path');
    const output = core.getInput('output');

    const db = new APIDB();
    const dbItems = await db.query(category);

    // Read API from local file
    const rawdata = fs.readFileSync(inputPath);
    const localItems = JSON.parse(rawdata);

    // Compare
    const comp = db.compare(dbItems, localItems);

    // Write Results
    const dirname = path.dirname(output);
    if (!fs.existSync(dirname)) {
      fs.mkdirSync(dirname, {recursive: true});
    }

    fs.writeFileSync(output, JSON.stringify(comp));
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

run();
