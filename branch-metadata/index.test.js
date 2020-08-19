const path = require('path');
const exec = require('common/exec')

test('master', async () => {
  const metadata = await getMetadata('master');
  expect(metadata['api-level']).toBe('API8');
});

test('refs/heads/master', async () => {
  const metadata = await getMetadata('refs/heads/master');
  expect(metadata['api-level']).toBe('API8');
});

test('API7', async () => {
  const metadata = await getMetadata('API7');
  expect(metadata['api-level']).toBe('API7');
});

test('refs/heads/API7', async () => {
  const metadata = await getMetadata('refs/heads/API7');
  expect(metadata['api-level']).toBe('API7');
});

test('no-branch', async () => {
  const metadata = await getMetadata('no-branch');
  expect(metadata).toBe(undefined);
});

test('prop-api-level', async () => {
  const metadata = await getMetadata('master', 'api-level');
  expect(metadata).toBe('API8');
});

test('no-prop', async () => {
  const metadata = await getMetadata('master', 'no-prop');
  expect(metadata).toBe(undefined);
});

test('no-branch-and-no-prop', async () => {
  const metadata = await getMetadata('no-branch', 'no-prop');
  expect(metadata).toBe(undefined);
});

async function getMetadata(ref, prop) {
  process.env['INPUT_REPO'] = 'TizenAPI/TizenFX';
  process.env['INPUT_PATH'] = '.github/branch-metadata.yml';
  process.env['INPUT_REF'] = ref;
  process.env['INPUT_PROP'] = prop || '';

  const index = path.join(__dirname, 'index.js');

  let metadata = undefined;
  const ret = await exec(`node ${index}`, {env: process.env}, (line) => {
    if (line.startsWith('::error::')) {
      throw new Error(line);
    }
    if (line.startsWith('::set-output name=data::')) {
      const json = line.substring('::set-output name=data::'.length);
      if (json) {
        metadata = JSON.parse(json);
      }
    }
  });

  return metadata;
}
