# Github Action: Branch Metadata

Provides metadata of the specific branch described in a yaml file.

## Usage

### Create .github/branch-metadata.yml
Create a .github/branch-metadata.yml file.

```yaml
main:
  api-level: API8
  labels: [ "API8", "Development" ]

API7:
  api-level: API7
  labels: API7
```

### Use this action in Workflow
```yaml
  - uses: TizenAPI/tizenfx-build-actions/branch-metadata@master
    with:
      ref: ${{ github.base_ref }}
```

#### Inputs
  - repo: The owner and repository name. For example, Codertocat/Hello-World. Default is `$GITHUB_REPOSITORY`.
  - path: Metadata file path to read. Default is `.github/branch-metadata.yml`.
  - ref: The target branch of the pull request or the base branch of the push. Default is `$GITHUB_REF`.
  - prop: The property key to return as output data, all metadata set of the branch will be return if not set.

#### Outputs
  - data: The json object of the specific branch's metadata
