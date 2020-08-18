# Github Action: APIDB - Update

Update TizenFX API changes to the APIDB

## Workflow Config Example
```yaml
  - uses: TizenAPI/tizenfx-build-actions/apidb-update@master
    with:
      category: API8
      path: api.json
```

## Inputs
  - category: API Level
  - path: JSON formatted output file of APITool
