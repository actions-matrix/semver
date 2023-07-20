# today
A small utility to extract SemVer version information

## Usage

```yaml
name: Build

on:
  push:
    branches:
      - main

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - id: today
        uses: actions-matrix/today@main
      - id: release
        uses: actions-matrix/release-matrix-action@v1
        with:
          search: "nginx"
          date: ${{ steps.today.outputs.year }}
      - id: semver
        uses: actions-matrix/semver@v1
        with:
          value: ${{ steps.release.outputs.version }}
          pattern: "{major}.{minor}"
    outputs:
      version: ${{ steps.semver.outputs.version }}

  build:
    runs-on: ubuntu-latest
    needs: generate
    strategy:
      matrix: ${{ fromJson(needs.generate.outputs.matrix) }}
    steps:
      - run: echo "Build ${{ matrix.version }}"
```

**Example**

Given the input value of `1.2.3` and the pattern of the following:

```sh
# {version}
1.2.3
# {major}
1
# {major}.{minor}
1.2
# {major}.{minor}.{patch} (same as {version})
1.2.3
# {major}{minor}{patch}
123
```

## Inputs

- `value` - The value to extract the version from supports **single value** or **comma separated** list or **JSON array stringified**.
- `pattern` - The pattern to extract the version with, supported keywords `{version}` or `{major}.{minor}.{patch}`.

## Outputs

- `version` - The extracted version

## License
Licensed under the [MIT License](./LICENSE).
