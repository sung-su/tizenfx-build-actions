# Github Action: AWS S3 Upload

Upload a file to S3 bucket

## Workflow Config Example
```yaml
  - uses: TizenAPI/tizenfx-build-actions/s3-upload@master
    with:
      region: ap-northeast-2
      bucket: test-bucket
      file: test-file.txt
      key: test-folder/test-file.txt
```

## Inputs
  - file: File path to upload
  - region: AWS region. (default: ap-northeast-2)
  - bucket: Bucket name to which the PUT operation was initiated.
  - key: Object key for which the PUT operation was initiated. If not set, same name of file will be used.
