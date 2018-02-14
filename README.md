# Appcelerator Titanium Package for Atom

Appcelerator Titanium build tools and UI for the [Atom text editor](https://atom.io).

<img src="https://user-images.githubusercontent.com/2697821/33011945-556d79c6-cdd7-11e7-84a6-78c3a57b6eb1.png" width="900px" alt="Appcelerator Titanium for Atom screenshot" />

## Getting Started

* Atom 1.21 (or later) is required.
* Some features are implemented as providers for services in the [Atom IDE](https://ide.atom.io) package. Install `atom-ide-ui` package.
* Install `appcelerator-titanium` package.

### Using the Atom package manager

Preferences/Settings > Install > Search for `appcelerator-titanium`.

### Using the CLI:

```
apm install appcelerator-titanium
```

## Open a Titanium project

File > Open... > Browse to Titanium project

From the CLI:

```
atom /path/to/titanium/project
```

## Features

### Commands

Command                 | Keymap            | Description
---                     | ---               | ---
appc:build              | `ctrl-alt-enter`  | Build using the current selected command and configuration
appc:stop               | -                 | Stop the current build
appc:console            | -                 | Toggle the console
appc:generate           | -                 | Open dialog to generate a new alloy file or component
appc:open view          | `ctrl-alt-v`      | Open the related Alloy XML file
appc:open style         | `ctrl-alt-s`      | Open the related Alloy TSS file
appc:open controller    | `ctrl-alt-x`      | Open the related JavaScript file
appc:open close related | `ctrl-alt-a`      | Toggle the related Alloy XML, TSS and Javascript files

### Build tools

#### Toolbar

The toolbar provides a UI to commonly used commands when developing a Titanium application. Further information on each function is provided in the sections below.

<img src="https://user-images.githubusercontent.com/2697821/33169533-f0e0a89e-d03c-11e7-99f8-7cb91858dbed.png" width="722px"  alt="Toolbar" />

##### 1. Build select and run

Select to run on simulator or device, package for ad-hoc or App Store distribution or a custom build option.

##### 2. Platform select

Select available platforms to build for.

##### 3. Target select

Select simulator/emulator or local device. When attaching a device, select Refresh Targets option to add it to the target list.

##### 4. Code signing / Android KeyStore configuration 

When building for device (iOS) or distribution (iOS and Android) the option to configure code signing or keystore credentials is available.

##### 5. Info panel

Provides information about the active project.

##### 6. Generate component

Presents a dialog to generate a Titanium component: Controller, View, Style, Model, Widget or Alloy.jmk file.

##### 7. Console

Show or hide the console which outputs debug information during build and run.

#### Build

The build select button executes and provides selections of the build command. Depending on the target platform selected, the drop-down will display options for the `appc run` command:

<img src="https://user-images.githubusercontent.com/2697821/33169524-ed2b85ca-d03c-11e7-881e-4eb9e301649d.png" width="109px" alt="Build command select" />

* Run: Build and run the app on selected simulator/emulator or device
* Ad-Hoc: (iOS only) build and package the app for Ad-Hoc distribution using selected code signing
* Publish: Build and package the app for distribution through the App Store or Google Play using selected code signing or keystore credentials
* Custom: Execute `appc run -d <project_dir>` with custom arguments

#### Console

<img src="https://user-images.githubusercontent.com/2697821/33169526-ed531cf2-d03c-11e7-8d08-5657f691aca2.png" width="876px" alt="Build command select" />

The console displays debug logging during the build and run. The log level is passed to the `appc run` comand so selecting the log level does not alter output from the currently executing command. There are options to automatically scroll the console to the latest message and to open it when a build is initiated. 

**By default the executing command is displayed in the console to aid debugging. This can be disabled in the package settings.**

#### iOS code signing

When building for a device and ad-hoc or App Store distribution, a certificate and provisioning profile must be selected. Click the code signing / keystore button (#4) to display the code signing options.

<img src="https://user-images.githubusercontent.com/2697821/33169525-ed3f58a2-d03c-11e7-9b58-48b361328d69.png" width="479px" alt="iOS code signing" />

Certificates are populated according to the selected build option (developer / distribution). Available provisioning profiles are displayed but only those which match the selected certificate and app ID are enabled.

#### Android KeyStore

When building for distribution through Google Play, the app must be signed with a keystore. Click the code signing / keystore button (#4) to display the keystore options.

<img src="https://user-images.githubusercontent.com/2697821/33169528-ed7b7922-d03c-11e7-9647-cc39256dc94a.png" width="1110px" alt="Android keystore" />

The path to the keystore can be entered manually or by using the file picker. Keystore path and alias are stored in package configuration.

### Autocompletion

Autocompletion support is provided to help speed up development by providing quick references to Titanium APIs and Alloy markup as well as references to modules, widgets and assets within your project.

#### Generation

On initial launch, autocomplete suggestions are generated for the current selected Titanium SDK. You can check and set this using the CLI:

```
$ appc ti sdk

...

Installed SDKs:
   7.0.0.GA [selected]  7.0.0.GA
```

```
$ appc ti sdk select
```

Autocomplete suggestions can be regenerated by selecting the 'Regenerate autocomplete suggestions' option from the package settings and relaunching Atom.

<img src="https://user-images.githubusercontent.com/2697821/33169527-ed667b9e-d03c-11e7-8a48-9c34f4c8b5e2.png" width="562px" alt="Regenerate autocomplete suggestions option" />

#### Titanium and Alloy

Titanium APIs and Alloy markup suggestions are provided in Titanium JavaScript and Alloy XML and TSS files. This includes classes, properties, methods and events. Where appropriate additional information is provided with a link to the online documentation. Deprecated properties are also indicated.

<img src="https://user-images.githubusercontent.com/2697821/33011938-54d3d302-cdd7-11e7-910c-531f51454f74.png" width="385px" alt="Alloy markup class autocomplete" />

#### Project references

Suggestions for other controllers, modules and widgets are presented when referencing through a Titanium function or Alloy markup.

<img src="https://user-images.githubusercontent.com/2697821/33011939-54ebd5c4-cdd7-11e7-8cdd-b39a8c8b92d3.png" width="324px" alt="Alloy markup widget reference autocomplete" />

#### Class and ID references

Suggestions for classes and IDs declared or defined in related Alloy XML and TSS files are presented.

<img src="https://user-images.githubusercontent.com/2697821/33011940-550697c4-cdd7-11e7-8c56-b6ad9cb400a8.png" width="251px" alt="TSS class reference autocomplete" />

#### Images

Image suggestions are presented where appropriate, including a thumbnail preview and information about the scaled versions available.

<img src="https://user-images.githubusercontent.com/2697821/33011941-551aca50-cdd7-11e7-86ec-cae8ea0430ff.png" width="558px" alt="TSS image reference autocomplete" />

### Alloy file and component generation

<img src="https://user-images.githubusercontent.com/2697821/33011944-555909fa-cdd7-11e7-8bc8-0301059b360d.png" width="639px" alt="Alloy file and component generate dialog" />

A UI for the `alloy generate` command is provided. The Generate File dialog is presented by clicking the + icon in the toolbar or using the command from the menu or palette. Select the type of file or component to generate and provide the required information. The generated file(s) are then opened.

### Open related files

Opening related Alloy files is supported (see above commands list).

* From View, open related Style and/or Controller
* From Style, open related View and/or Controller
* From Controller, open related View and/or Style

### Jump-to-definition

Jump-to-definition support is provided for quickly accessing the definiion or usage of Alloy markup and to easily generate new definitions. Images can be opened directly from their path.

#### Alloy

From Views, click through to style definitions for tags, classes and IDs, in related or global TSS. Click through to event definitions in the related controller.

<img src="https://user-images.githubusercontent.com/2697821/33011943-554470ee-cdd7-11e7-9e04-1e49272c3f6d.png" width="257px" alt="View tag style definition" />

A prompt is displayed to generate undefined styles or functions.

<img src="https://user-images.githubusercontent.com/2697821/33011942-553025bc-cdd7-11e7-8389-572b2bf811e0.png" width="539px" alt="View tag style generate definition" />

#### Strings

Click on localised string references to jump to their definition. The option to generate undefined strings is provided.

#### Images

Click on an image path to open the image in a new tab. For iOS, where multiple scaled images exist with the same name the first is opened (e.g. @2x).

### Snippets

Code snippets for common Alloy and Titanium APIs are provided for use in Alloy controllers and modules. A description of the snippet and link to documentation are provided where appropriate. Type the prefix and the autocomplete overlay will be displayed with matching snippets.

<img src="https://user-images.githubusercontent.com/2697821/35726837-259fe6be-07fe-11e8-9a73-ea13a8572723.png" width="356px" alt="Code snippet suggestions" />

Prefix          | Description
---             | ---
`tidebug`       | Debug log message
`tierror`       | Error log message
`tiinfo`        | Info log message
`tiwarn`        | Warn log message
`titrace`       | Trace log message
`tiaddevent`    | Add event listener
`tiremevent`    | Remove event listener
`tifireevent`   | Fire event
`tialert`       | Show alert dialog
`tiopt`         | Show option dialog
`tianim`        | View animation
`tifile`        | Open file
`tisound`       | Play sound
`tiaudio`       | Play local or remote audio
`tivideo`       | Play local or remove video
`ticamera`      | Open camera
`alglo`         | Alloy Globals object
`alcfg`         | Alloy CFG object
`alcon`         | Alloy create controller function
`alcol`         | Alloy create collection function
`almod`         | Alloy create model function
`alwid`         | Alloy create widget function
`ifios`         | iOS conditional statement
`ifand`         | Android conditional statement
`ifwin`         | Windows conditional statement

## Contributions

This package would not be possible without support from the Titanium community. Autocompletion, jump-to-definition and grammar support provided by [Jong Eun Lee](https://github.com/yomybaby) through the [Titanium Alloy package](https://github.com/yomybaby/atom-titanium).

### Additional thanks

We doff our caps to:

* [Titanium-Build](https://github.com/HazemKhaled/Titanium-Build)
* [tool-bar](https://github.com/suda/tool-bar)
* [toolbar-basic](https://github.com/mattlovaglio/toolbar-basic)

## Legal stuff

Appcelerator is a registered trademark of Appcelerator, Inc. Titanium is
a registered trademark of Appcelerator, Inc.  Please see the LEGAL information about using our trademarks,
privacy policy, terms of usage and other legal information at [http://www.appcelerator.com/legal](http://www.appcelerator.com/legal).
