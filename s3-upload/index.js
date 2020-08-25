const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const AWS = require('aws-sdk');

async function run() {
  try {
    // Inputs
    const file = core.getInput('file');
    const region = core.getInput('region');
    const bucket = core.getInput('bucket');
    let key = core.getInput('key');

    if (!fs.existsSync(file)) {
      throw new Error(`File not found : ${file}`);
    }

    if (!key) {
      key = path.basename(file);
    }

    // Config AWS
    AWS.config.update({
      region,
    });

    // Upload a file
    const data = await uploadFile(file, bucket, key);
    core.setOutput('data', JSON.stringify(data));
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

async function uploadFile(filepath, bucket, key) {
  const s3 = new AWS.S3({apiVersion: '2006-03-01'});
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, data) => {
      const params = {
        Bucket: bucket,
        Key: key,
        Body: data,
      };
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  });
}

run();
