const core = require('@actions/core');
const {APIDB} = require('common/apidb');

async function run() {
  try {
    // Inputs
    const category = core.getInput('category');
    const inputFile = core.getInput('file');
    const baseFile = core.getInput('base-file');
    const output = core.getInput('output');

    const db = new APIDB();

    // Read Base API from local file or APIDB
    const baseItems = undefined;
    if (baseFile) {
      baseItems = JSON.parse(fs.readFileSync(baseFile));
    } else {
      if (!category) {
        throw new Error(`Invalid category to query: ${category}`);
      }
      baseItems = await db.query(category);
    }

    // Read API from local file
    const localItems = JSON.parse(fs.readFileSync(inputFile));

    // Compare
    const comp = db.compare(baseItems, localItems);

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
