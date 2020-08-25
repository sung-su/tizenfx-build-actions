# Github Action: AWS S3 Download for Public Objects

Download public objects from the AWS S3 Buckets

## Workflow Config Example
```yaml
  - uses: TizenAPI/tizenfx-build-actions/download-workflow-artifacts@master
    with:
      token: ${{ secrets.MY_PAT }}
      repo: ${{ github.repository }}
      run-id: ${{ github.event.workflow_run.id }}
      name: artifact
      path: tmp/Artifacts
      unzip: true
```

## Inputs
  - token: Github Personal Access Token. Access tokens require repo scope for private repos and public_repo scope for public repos.
  - repo: The owner and repository name. For example, Codertocat/Hello-World.
  - run-id: The id of the workflow run.
  - name: The name of an artifact to download. If not set, all artifacts of the workflow run will be downloaded.
  - path: The destination directory to locate the downloaded files. If not set, github.workspace will be used.
  - unzip: If true, unzip the downloaded artifacts to the path. Default is true.
