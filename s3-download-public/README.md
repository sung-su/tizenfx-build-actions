# Github Action: AWS S3 Download for Public Objects

Download public objects from the AWS S3 Buckets

## Workflow Config Example
```yaml
  - uses: TizenAPI/tizenfx-build-actions/s3-download-public@master
    with:
      region: ap-northeast-2
      bucket: test-bucket
      key: test-folder/test-file.txt
```

