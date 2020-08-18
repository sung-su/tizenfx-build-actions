# Github Action: APIDB

Create a report or update API DB with the result of comparison between local built and APIDB.

## Workflow Config Example
```yaml
  - uses: TizenAPI/tizenfx-build-actions/apidb@master
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      repo: TizenFX/TizenAPI
      issue-number: 2
      operation: compare
      category: API8
      path: api.json
```

## Inputs
  - token: Github Token
  - operation: `compare` or `update`
  - category: API Level
  - path: JSON formatted output file of APITool
