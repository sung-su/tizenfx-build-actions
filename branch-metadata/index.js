const fs = require('fs');
const yaml = require('js-yaml');
const core = require('@actions/core');

async function run() {
  try {
    // Inputs
    const ref = core.getInput('ref');
    const upperRef = (ref || '').toUpperCase();

    // Load Branch Metadata File
    const mapFile = process.env.BRANCH_METADATA_FILE ||
                      '.github/branch-metadata.yml';
    if (!fs.existsSync(mapFile)) {
      throw new Error(`Can not find a branch metadata file. (${mapFile})`);
    }
    const metadata = yaml.safeLoad(fs.readFileSync(mapFile, 'utf8'));

    // Set Output
    let branch = ref;
    if (upperRef.startsWith('REFS/HEADS/')) {
      branch = ref.substring('refs/heads/'.length);
    }

    core.setOutput('data', JSON.stringify(metadata[branch]));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
