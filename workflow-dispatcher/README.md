# Github Action: Workflow Dispatcher

Create a workflow dispatch event

## Workflow Config Example
```yaml
  - uses: TizenAPI/tizenfx-build-actions/workflow-dispatcher@master
    with:
      token: ${{ secrets.MY_TOKEN }}
      workflow: 'Manual Workflow'
      inputs: { "foo": "bar" }
```

## Inputs
  - token: Github Personal Access Token
  - workflow: Workflow name to manually trigger
  - workflow-file: Workflow file name instead of the workflow name to manually trigger
  - inputs: Input keys and values configured in the workflow file.
