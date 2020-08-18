# Github Action: APIDB - Compare

Compare TizenFX API with APIDB.

## Workflow Config Example
```yaml
  - uses: TizenAPI/tizenfx-build-actions/apidb-compare@master
    with:
      category: API8
      path: api.json
      output: api-report.json
```

## Inputs
  - category: API Level
  - path: JSON formatted output file of APITool
  - output: Output file path
