const path = require('path');
const exec = require('../common/exec')

process.env['BRANCH_METADATA_FILE'] = './test_data/branch-metadata.yml';

test('master', async() => {
  const metadata = await getMetadata('master');
  expect(metadata['api-level']).toBe('API8');
});

test('refs/heads/master', async() => {
  const metadata = await getMetadata('refs/heads/master');
  expect(metadata['api-level']).toBe('API8');
});

test('API7', async() => {
  const metadata = await getMetadata('API7');
  expect(metadata['api-level']).toBe('API7');
});

test('refs/heads/API7', async() => {
  const metadata = await getMetadata('refs/heads/API7');
  expect(metadata['api-level']).toBe('API7');
});

test('no-branch', async() => {
  const metadata = await getMetadata('no-branch');
  expect(metadata['api-level']).toBe(undefined);
});

async function getMetadata(ref) {
  process.env['INPUT_REF'] = ref;

  const index = path.join(__dirname, 'index.js');

  let metadata;
  const ret = await exec(`node ${index}`, {env: process.env}, (line) => {
    if (line.startsWith('::set-output name=data::')) {
      const json = line.substring('::set-output name=data::'.length) || '{}';
      metadata = JSON.parse(json);
    }
  });

  return metadata;
}
