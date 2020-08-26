# Github Action: Problem Filter

Filter out warning or error messages output to stdout using specific conditions.

## Workflow Config Example
```yaml
  - uses: TizenAPI/tizenfx-build-actions/problem-filter@master
    with:
      run: dotnet build
      type: dotnet
      files: ["src/Foo.cs", "src/Bar.cs"]
```

## Inputs
  - run: shell command to execute
  - working-directory: the working directory of where to run the command
  - type: problem matcher type ('dotnet')
  - files: JSON array of files to print

## Outputs
  - errors: Error messages during execution of shell
