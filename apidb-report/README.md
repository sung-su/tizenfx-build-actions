# Github Action: APIDB - Report

Report the comparison result of APIDB to the pull request.

## Workflow Config Example
```yaml
  - uses: TizenAPI/tizenfx-build-actions/apidb-report@master
    with:
      token: ${{ secrets.MY_PAT }}
      repo: TizenAPI/TizenFX
      issue-number: 2
      path: api-report.json
```
