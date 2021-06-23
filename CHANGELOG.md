## [2.2.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v2.1.1...v2.2.0) (2021-06-22)


### Bug Fixes

* **completions:** guard against undefined when check for events ([654a217](https://github.com/appcelerator/atom-appcelerator-titanium/commit/654a2177567bcc609842cbe170aa26a3357ebdf5)), closes [#136](https://github.com/appcelerator/atom-appcelerator-titanium/issues/136)
* check for existence of toolbar before performing target setup ([8004fbe](https://github.com/appcelerator/atom-appcelerator-titanium/commit/8004fbe51d5814cc927dcc5951813aafbfa14ab3)), closes [#253](https://github.com/appcelerator/atom-appcelerator-titanium/issues/253)


### Features

* **console:** allow positioning console anywhere in the atom window ([8dba020](https://github.com/appcelerator/atom-appcelerator-titanium/commit/8dba0200a0ca0fd3a7aef97e8e78fa0e4e0db2c9)), closes [#134](https://github.com/appcelerator/atom-appcelerator-titanium/issues/134)
* **ios:** support outputting to xcode when performing a dist-appstore build ([06420e7](https://github.com/appcelerator/atom-appcelerator-titanium/commit/06420e7e8fb47d1b52b137ba8ec319f05bcc1337)), closes [#85](https://github.com/appcelerator/atom-appcelerator-titanium/issues/85)
* **toolbar:** add clean button to toolbar ([cfa1f97](https://github.com/appcelerator/atom-appcelerator-titanium/commit/cfa1f976dc711f6a65d774ecee651c42a6bd6ac5)), closes [#161](https://github.com/appcelerator/atom-appcelerator-titanium/issues/161)

## [2.1.1](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v2.1.0...v2.1.1) (2021-06-15)


### Bug Fixes

* **touchbar:** adapt to new touchbar API ([37abfed](https://github.com/appcelerator/atom-appcelerator-titanium/commit/37abfedfe682c4b5841abc5319d0d13b9264dfe4))

## [2.1.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v2.0.4...v2.1.0) (2021-06-14)


### Bug Fixes

* **toolbar:** correct usage of open dialog on keystore selection ([bbcd086](https://github.com/appcelerator/atom-appcelerator-titanium/commit/bbcd0864bc5915a2c8c5e283b22e8b59e83600b8))
* **updates:** update editor commons to fix passing of error metadata ([f18b43d](https://github.com/appcelerator/atom-appcelerator-titanium/commit/f18b43dfbfb168d73eb409ad51bd53f6097d41f0))


### Features

* **toolbar:** update liveview icon to better distinguish states ([4ccc3d0](https://github.com/appcelerator/atom-appcelerator-titanium/commit/4ccc3d02ffe40226d4bfb7d7aefecddf32204e2f)), closes [#306](https://github.com/appcelerator/atom-appcelerator-titanium/issues/306)
* persist build information ([760ad5d](https://github.com/appcelerator/atom-appcelerator-titanium/commit/760ad5d0f7bac14b2e90df7fffacb326faa98e5f))

## [2.0.4](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v2.0.3...v2.0.4) (2021-06-08)


### Bug Fixes

* **updates:** ensure updates always has an eempty error to prevent errors ([9e58fd1](https://github.com/appcelerator/atom-appcelerator-titanium/commit/9e58fd1943b5bafab18c80b2c43afff1b8e92109))
* update editor-commons to fix issue when pulling latest npm version ([b94d4d2](https://github.com/appcelerator/atom-appcelerator-titanium/commit/b94d4d2ddd1db736f8b6a957b80dbb1c457d4883))

## [2.0.3](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v2.0.2...v2.0.3) (2021-06-03)


### Bug Fixes

* update editor-commons to fix issue when detecting environment ([b118468](https://github.com/appcelerator/atom-appcelerator-titanium/commit/b1184685f6925e6cb5b5a4b7b22034f1cd22dd1f))

## [2.0.2](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v2.0.1...v2.0.2) (2021-06-02)


### Bug Fixes

* **updates:** select Titanium SDK after installing it ([b57a36e](https://github.com/appcelerator/atom-appcelerator-titanium/commit/b57a36ed474cdecc78ba2ef6431f1946eefd3194))

## [2.0.1](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v2.0.0...v2.0.1) (2021-04-19)


### Bug Fixes

* exit 0 if husky errors ([ddba778](https://github.com/appcelerator/atom-appcelerator-titanium/commit/ddba778966dd682d7dad6f8a547df6f755f28cd5))

# [2.0.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.14.0...v2.0.0) (2021-04-19)


### Bug Fixes

* **new:** adapt to  new electron dialog api ([f95247a](https://github.com/appcelerator/atom-appcelerator-titanium/commit/f95247a2478b6e1c7d5e483bbf3a1577b5aedda9))
* **new:** use correct subcommand for creating ([b061e22](https://github.com/appcelerator/atom-appcelerator-titanium/commit/b061e2261ffed8188b3c22e9511de13ee84465fb))


* refactor!: remove appcCommandPath setting ([e9eaa31](https://github.com/appcelerator/atom-appcelerator-titanium/commit/e9eaa3164e4450d78658a9263876a1c1686ca7a0))


### Code Refactoring

* remove windows platform ([#420](https://github.com/appcelerator/atom-appcelerator-titanium/issues/420)) ([b2af0a5](https://github.com/appcelerator/atom-appcelerator-titanium/commit/b2af0a50adee3c4942fe9b45b8ff8913c910a92d))


### Features

* support using OSS tooling ([acf19ff](https://github.com/appcelerator/atom-appcelerator-titanium/commit/acf19fffdd808214950ca11bfe3e4bb9b57ce5d6))


### BREAKING CHANGES

* The appcCommandPath setting is no longer supported
* Windows will no longer be offered as a choice in the platform selection

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.14.0 (2021-02-15)

### Bug Fixes

* **completions:** generate v3 for titanium and alloy completions ([#388](https://github.com/appcelerator/atom-appcelerator-titanium/issues/388)) ([eb8332a](https://github.com/appcelerator/atom-appcelerator-titanium/commit/eb8332a652bacd4fb02b8486ce8f7ea79699b96c))


## 1.13.0 (2020-09-16)

This release updates titanium-editor-commons to fix a bug in the SDK install logic to ensure compatibility when installing the future 9.2.0.GA release

## [1.12.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.11.0...v1.12.0) (2020-09-02)

This release was made in error

## [1.11.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.10.1...v1.11.0) (2020-09-02)

### Bug Fixes

* **providers/tiapp:** handle an open xml file that isn't on disk ([1b5e749](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1b5e749304865f1bbf9387e14290705573e440a2)), closes [#284](https://github.com/appcelerator/atom-appcelerator-titanium/issues/284)

### [1.10.1](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.9.1...v1.10.1) (2019-12-06)


### Bug Fixes

* **completion:** handle array being returned from getCompletions ([7780d98](https://github.com/appcelerator/atom-appcelerator-titanium/commit/7780d98)), closes [#188](https://github.com/appcelerator/atom-appcelerator-titanium/issues/188)


## [1.10.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.9.1...v1.10.0) (2019-11-07)


### Features

* change the console icon to command line icon ([#178](https://github.com/appcelerator/atom-appcelerator-titanium/issues/178)) ([b680220](https://github.com/appcelerator/atom-appcelerator-titanium/commit/b680220))
* **completion:** add completions for Ti namespace in controllers ([#177](https://github.com/appcelerator/atom-appcelerator-titanium/issues/177)) ([5785389](https://github.com/appcelerator/atom-appcelerator-titanium/commit/5785389)), closes [#171](https://github.com/appcelerator/atom-appcelerator-titanium/issues/171)
* **completions:** added completions for Alloy namespace in cont… ([#180](https://github.com/appcelerator/atom-appcelerator-titanium/issues/180)) ([1faec8c](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1faec8c)), closes [#179](https://github.com/appcelerator/atom-appcelerator-titanium/issues/179)
* **ios:** support generic apple certificates ([d9e53a1](https://github.com/appcelerator/atom-appcelerator-titanium/commit/d9e53a1)), closes [#183](https://github.com/appcelerator/atom-appcelerator-titanium/issues/183)



### [1.9.1](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.9.0...v1.9.1) (2019-09-27)



## [1.9.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.8.0...v1.9.0) (2019-08-13)


### Bug Fixes

* **app creation:** fixed the app creation flow for newer sdks ([#167](https://github.com/appcelerator/atom-appcelerator-titanium/issues/167)) ([cda8014](https://github.com/appcelerator/atom-appcelerator-titanium/commit/cda8014)), closes [#158](https://github.com/appcelerator/atom-appcelerator-titanium/issues/158)


### Features

* **toolbar:** add user information and login icon ([#165](https://github.com/appcelerator/atom-appcelerator-titanium/issues/165)) ([a478274](https://github.com/appcelerator/atom-appcelerator-titanium/commit/a478274)), closes [#159](https://github.com/appcelerator/atom-appcelerator-titanium/issues/159)
* add open related to context menu ([#175](https://github.com/appcelerator/atom-appcelerator-titanium/issues/175)) ([0b62033](https://github.com/appcelerator/atom-appcelerator-titanium/commit/0b62033)), closes [#174](https://github.com/appcelerator/atom-appcelerator-titanium/issues/174)
* show login dialog if login is required to run command ([1e1168b](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1e1168b)), closes [#160](https://github.com/appcelerator/atom-appcelerator-titanium/issues/160)



## 1.8.0 (2019-07-15)


### Bug Fixes

* **provider:** improve ordering of suggestions ([#156](https://github.com/appcelerator/atom-appcelerator-titanium/issues/156)) ([59bb539](https://github.com/appcelerator/atom-appcelerator-titanium/commit/59bb539)), closes [#143](https://github.com/appcelerator/atom-appcelerator-titanium/issues/143)

### Features
* **updates:** add update functionality ([#162](https://github.com/appcelerator/atom-appcelerator-titanium/issues/162)) ([dad3a08](https://github.com/appcelerator/atom-appcelerator-titanium/commit/dad3a08))
* add support for interaction via mac Touch Bar ([#124](https://github.com/appcelerator/atom-appcelerator-titanium/issues/124)) ([1fae584](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1fae584))


<a name="1.7.0"></a>
# 1.7.0 (2019-05-08)


### Bug Fixes

* **styleprovider:** improved suggestions to include quotes for color and layout properties ([#154](https://github.com/appcelerator/atom-appcelerator-titanium/issues/154)) ([f7128a8](https://github.com/appcelerator/atom-appcelerator-titanium/commit/f7128a8)), closes [#152](https://github.com/appcelerator/atom-appcelerator-titanium/issues/152)


### Features

* **toolbar:** add config setting for showing toolbar, respect on open ([#151](https://github.com/appcelerator/atom-appcelerator-titanium/issues/151)) ([6fdae71](https://github.com/appcelerator/atom-appcelerator-titanium/commit/6fdae71)), closes [#148](https://github.com/appcelerator/atom-appcelerator-titanium/issues/148)



<a name="1.6.0"></a>
# [1.6.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.5.1...v1.6.0) (2019-03-28)


### Bug Fixes

* **autocomplete:** correct filtering of colors ([ffb340e](https://github.com/appcelerator/atom-appcelerator-titanium/commit/ffb340e)), closes [#139](https://github.com/appcelerator/atom-appcelerator-titanium/issues/139)
* **definitions:** do not suggest app.tss when generating tss for id ([1fbf454](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1fbf454)), closes [#141](https://github.com/appcelerator/atom-appcelerator-titanium/issues/141)
* **toolbar:** add titles to fields ([#135](https://github.com/appcelerator/atom-appcelerator-titanium/issues/135)) ([4514d57](https://github.com/appcelerator/atom-appcelerator-titanium/commit/4514d57))
* **toolbar/android:** handle emulators being undefined, improve ui when no emulators ([f439e71](https://github.com/appcelerator/atom-appcelerator-titanium/commit/f439e71)), closes [#142](https://github.com/appcelerator/atom-appcelerator-titanium/issues/142)


### Features

* **toolbar:** add button and command to toggle toolbar visibility ([b871811](https://github.com/appcelerator/atom-appcelerator-titanium/commit/b871811)), closes [#138](https://github.com/appcelerator/atom-appcelerator-titanium/issues/138)



<a name="1.5.1"></a>
## [1.5.1](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.5.0...v1.5.1) (2019-01-02)


### Bug Fixes

* **commands/login:** fix detection of output ([57370bf](https://github.com/appcelerator/atom-appcelerator-titanium/commit/57370bf))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.4.2...v1.5.0) (2018-12-19)


### Bug Fixes

* check for existence of type before trying to access properties ([ad4ebd2](https://github.com/appcelerator/atom-appcelerator-titanium/commit/ad4ebd2)), closes [#126](https://github.com/appcelerator/atom-appcelerator-titanium/issues/126)


### Features

* add login dialog ([a3f9601](https://github.com/appcelerator/atom-appcelerator-titanium/commit/a3f9601))


## 1.4.2

**26/10/18**

- Fixed error being thrown when tiapp.xml was saved in an invalid format (([#128]https://github.com/appcelerator/atom-appcelerator-titanium/issues/128))

## 1.4.1

**25/09/18**

- Fixed autocomplete issue when autocompleting the sdk-version tag in tiapp ([#119](https://github.com/appcelerator/atom-appcelerator-titanium/issues/119))
- Internal: Add GitHub issue templates ([#123](https://github.com/appcelerator/atom-appcelerator-titanium/pull/123))

## 1.4.0

**13/07/18**

- Added support for taking screenshots from the IDE ([#112](https://github.com/appcelerator/atom-appcelerator-titanium/pull/112), thanks to [@m1ga](https://github.com/m1ga))
- Internal: Added Travis CI to all pull requests ([#113](https://github.com/appcelerator/atom-appcelerator-titanium/pull/113))

## 1.3.0

**06/07/18**

- Added LiveView support  ([#108](https://github.com/appcelerator/atom-appcelerator-titanium/issues/108))
- Added expiration date to certificates **and** provisioning profiles ([#91](https://github.com/appcelerator/atom-appcelerator-titanium/issues/91))
- Fixed HUD-error  ([#103](https://github.com/appcelerator/atom-appcelerator-titanium/issues/103))
- Use `INFO` log-level by default, for parity with Studio  ([#90](https://github.com/appcelerator/atom-appcelerator-titanium/issues/90))
- Allow custom args to be saved across Atom sessions ([#114](https://github.com/appcelerator/atom-appcelerator-titanium/issues/114))

## 1.2.0

**01/07/18**

- Added support for cleaning the project via the toolbar ([#93](https://github.com/appcelerator/atom-appcelerator-titanium/pull/93), thanks to [@m1ga](https://github.com/m1ga))

## 1.1.1

**22/03/18**

- Default to latest SDK if none selected ([ATOM-66](https://jira.appcelerator.org/browse/ATOM-66))
- Improved Alloy create function snippets
- Fixed Slider tag autocomplete suggestion ([ATOM-70](https://jira.appcelerator.org/browse/ATOM-70))
- Fixed duplicate class suggestions and ignore blank values ([ATOM-67](https://jira.appcelerator.org/browse/ATOM-67))
- Fixed exception thrown when triggering class and ID autosuggestion ([ATOM-74](https://jira.appcelerator.org/browse/ATOM-74))

## 1.1.0

**14/02/18**

- Added support for creating new Titanium projects ([ATOM-37](https://jira.appcelerator.org/browse/ATOM-37))
- Added support for native module projects ([ATOM-38](https://jira.appcelerator.org/browse/ATOM-38))
- Added snippets support ([ATOM-11](https://jira.appcelerator.org/browse/ATOM-11))
- Added keyboard shortcuts for opening related Alloy files ([ATOM-39](https://jira.appcelerator.org/browse/ATOM-39))
- Added option to set full path to `appc` command ([ATOM-50](https://jira.appcelerator.org/browse/ATOM-50))
- Improved behaviour when non-Titanium project is open ([ATOM-40](https://jira.appcelerator.org/browse/ATOM-40))
- Improved tiapp.xml parsing ([ATOM-49](https://jira.appcelerator.org/browse/ATOM-49))
- Fixed triggering image autocompletion ([ATOM-43](https://jira.appcelerator.org/browse/ATOM-43))

## 1.0.3

**21/12/17**

- Fixed error on Linux - thanks @m1ga ([ATOM-34](https://jira.appcelerator.org/browse/ATOM-34))
- Fixed deprecation warnings ([ATOM-35](https://jira.appcelerator.org/browse/ATOM-35))
- Improve behaviour when Titanium project is not open ([ATOM-36](https://jira.appcelerator.org/browse/ATOM-35))

## 1.0.2

**09/12/17**

- Fixed issues with non-Titanium projects ([ATOM-33](https://jira.appcelerator.org/browse/ATOM-33))

## 1.0.1

**08/12/17**

- Fixed non-wildcard iOS provisioning profiles always being invalid ([ATOM-30](https://jira.appcelerator.org/browse/ATOM-30))
- Marking managed provisioning profiles as invalid ([ATOM-31](https://jira.appcelerator.org/browse/ATOM-31))
- Fixed provisioning profile ordering ([ATOM-32](https://jira.appcelerator.org/browse/ATOM-32))
- Fixed autocomplete error when creating styles for classes ([ATOM-28](https://jira.appcelerator.org/browse/ATOM-28))
- Updated publish option labelling
