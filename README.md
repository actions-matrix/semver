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

## License
Licensed under the [MIT License](./LICENSE).
