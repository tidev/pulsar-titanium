# Contributing

Firstly, thanks for wanting to contribute to the Titanium Atom plugin! This file will let you know how to do that.

## Getting set up for development

1. To be safe, remove or move your existing installation at `~/.atom/packages/appcelerator-titanium`
2. Fork this repo to your GitHub account and clone your fork.
3. `cd` into and run `npm install` in your local repository.
4. Run `apm link` to link the package to your Atom application.
	- See [this note in the apm repo](https://github.com/atom/apm#installing) if you're unable to run `apm`
5. Open a Titanium project in atom and the package should be loaded.

When making changes in the source code, make sure to reload the atom window you're test in to see the changes.

## Sending in a PR

When sending in a PR please make sure you do the following:

- Commit using `npm run commit`
	- This ensure that the commit follows the [Conventional Commits](https://www.conventionalcommits.org/) standard used by the project. This is validated on a `git commit` using git hooks via husky.
- `npm run lint` passes
	- This is also validated on a `git commit` using git hooks via husky.
- When making the PR, please make sure to contain as much relevant info as possible in the PR body.
- Make sure to sign the [Axway CLA](https://cla.axway.com/).
- Open the PR against `master`
  - If this PR is most likely going to be a larger piece of work then we will change the target branch ourselves, and merge it into a feature branch first

## Releasing

Releasing should generally be done through GitHub actions which is described below. However the "manual" process is also documented.

## Through GitHub Actions

1. Navigate to the [Release workflow](https://github.com/tidev/atom-appcelerator-titanium/actions/workflows/release.yml)
2. Trigger a workflow run and wait for the run to finish
3. Verify the release is published on the Atom registry and GitHub releases

### Manually

To release the extension manually, the steps below need to be followed. Manual release should only be done if the automated release process cannot be achieved (for example if Jenkins is down).

1. Ensure that your local `master` branch is completely up to date with the main repo.
2. Run `npm run release`, which uses [semantic-release](https://github.com/semantic-release/semantic-release). It requires a `ATOM_ACCESS_TOKEN` and `GH_TOKEN` environment variable and will do the following:
	- Bump the version based on commit messages, updates the changelog, commits the files and tags a new release.
	- Pushes the changes and tag to the main repo
	- Creates a new release based on that tag on GitHub with the entry from the changelog
	- Runs `apm publish` to register that tag on the Atom marketplace
3. 🎉
