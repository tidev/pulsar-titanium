## Getting set up for development

1. Just to be safe, remove or move your existing installation at `~/.atom/packages/appcelerator-titanium`
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


## Releasing

To release the extension the steps below need to be followed.

1. Ensure that your local `master` branch is completely up to date with the main repo.
2. Run `npm run release`, which performs the following
	- Runs [standard-version](https://github.com/conventional-changelog/standard-version) to bump versions based on commit messages, updates the changelog, commits the files and tags a new release.
3. Push to the main repo with `git push` and `git push <appc remote> <tag>`.
4. Run `apm publish --tag <tag>` where `<tag>` is the tag produced by the `npm run release` step. This updates the package on the atom marketplace.
	- If this is your first release you will be prompted for an atom API token which you can find [here](https://atom.io/account)
5. Draft a new release on the [releases page](https://github.com/appcelerator/atom-appcelerator-titanium/releases).
6. 🎉
