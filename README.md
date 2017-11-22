<!-- <img width="385" alt="autocomplete_alloy_class" src="https://user-images.githubusercontent.com/2697821/33011938-54d3d302-cdd7-11e7-910c-531f51454f74.png"> -->
<!-- <img width="324" alt="autocomplete_alloy_widget" src="https://user-images.githubusercontent.com/2697821/33011939-54ebd5c4-cdd7-11e7-8cdd-b39a8c8b92d3.png"> -->
<!-- <img width="251" alt="autocomplete_tss_class" src="https://user-images.githubusercontent.com/2697821/33011940-550697c4-cdd7-11e7-8c56-b6ad9cb400a8.png"> -->
<!-- <img width="558" alt="autocomplete_tss_image" src="https://user-images.githubusercontent.com/2697821/33011941-551aca50-cdd7-11e7-86ec-cae8ea0430ff.png"> -->
<!-- <img width="539" alt="definitions_generate_tag" src="https://user-images.githubusercontent.com/2697821/33011942-553025bc-cdd7-11e7-8389-572b2bf811e0.png"> -->
<!-- <img width="257" alt="definitions_tag" src="https://user-images.githubusercontent.com/2697821/33011943-554470ee-cdd7-11e7-9e04-1e49272c3f6d.png"> -->
<!-- <img width="639" alt="generate_dialog" src="https://user-images.githubusercontent.com/2697821/33011944-555909fa-cdd7-11e7-8bc8-0301059b360d.png"> -->
<!-- ![screenshot](https://user-images.githubusercontent.com/2697821/33011945-556d79c6-cdd7-11e7-84a6-78c3a57b6eb1.png) -->



# Appcelerator Titanium package for Atom

Appcelerator Titanium build tools and UI for the [Atom text editor](https://atom.io).

<img src="https://user-images.githubusercontent.com/2697821/33011945-556d79c6-cdd7-11e7-84a6-78c3a57b6eb1.png" width="900px" height="591px" alt="Appcelerator Titanium for Atom screenshot" />

## Getting Started

Some of the features in this package are implemented as providers for services in the [Atom IDE](https://ide.atom.io) package. Install `atom-ide-ui` from the Atom package installer.

** :bangbang: While this is not in the public Atom package library you need to manually install it. **

1. Clone or download the project and run from the project directory:

`npm install`

2. Copy or symlink the project directory into your Atom packagaes directory. For example:

`ln -s /path/to/the/plugin ~/.atom/packages`

3. Relaunch Atom

---

Using the Atom package manager: Preferences/Settings > Install > Search for `appcelerator-titanium`.

Using the CLI:

```
apm install appcelerator-titanium
```



## Features

### Commands

Command                 | Description
---                     | ---
appc:build              | Build using the current selected command and configuration
appc:stop               | Stop the current build
appc:console            | Toggle the console
appc:generate           | Open dialog to generate a new alloy file or component
appc:open view          | Open the related Alloy XML file
appc:open style         | Open the related Alloy TSS file
appc:open controller    | Open the related JavaScript file
appc:open close related | Toggle the related Alloy XML, TSS and Javascript files

### Build tools

TBD



### Auto-completion

Auto-completion support is provided to help speed up development by providing quick references to Titanium APIs and Alloy markup as well as references to modules, widgets and assets within your project.

#### Titanium and Alloy

Titanium APIs and Alloy markup suggestions are provided in Titanium JavaScript and Alloy XML and TSS files. This includes classes, properties, methods and events. Where appropriate additional information is provided with a link to the online documentation. Deprecated properties are also indicated.

<img src="https://user-images.githubusercontent.com/2697821/33011938-54d3d302-cdd7-11e7-910c-531f51454f74.png" width="385px" height="222px" alt="Alloy markup class auto-complete" />

#### Project references

Suggestions for other controllers, modules and widgets are presented when referencing through a Titanium function or Alloy markup.

<img src="https://user-images.githubusercontent.com/2697821/33011939-54ebd5c4-cdd7-11e7-8cdd-b39a8c8b92d3.png" width="324px" height="83px" alt="Alloy markup widget reference auto-complete" />

#### Class and ID references

Suggestions for classes and IDs declared or defined in related Alloy XML and TSS files are presented.

<img src="https://user-images.githubusercontent.com/2697821/33011940-550697c4-cdd7-11e7-8c56-b6ad9cb400a8.png" width="251px" height="86px" alt="TSS class reference auto-complete" />

#### Images

Image suggestions are presented where appropriate, including a thumbnail preview and information about the scaled versions available.

<img src="https://user-images.githubusercontent.com/2697821/33011941-551aca50-cdd7-11e7-86ec-cae8ea0430ff.png" width="558px" height="155px" alt="TSS image reference auto-complete" />

### Alloy file and component generation

<img src="https://user-images.githubusercontent.com/2697821/33011944-555909fa-cdd7-11e7-8bc8-0301059b360d.png" width="639px" height="218px" alt="Alloy file and component generate dialog" />

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

<img src="https://user-images.githubusercontent.com/2697821/33011943-554470ee-cdd7-11e7-9e04-1e49272c3f6d.png" width="257px" height="129px" alt="View tag style definition" />

A prompt is displayed to generate undefined styles or functions.

<img src="https://user-images.githubusercontent.com/2697821/33011942-553025bc-cdd7-11e7-8389-572b2bf811e0.png" width="539px" height="74px" alt="View tag style generate definition" />

#### Strings

Click on localised string references to jump to their definition. The option to generate undefined strings is provided.

#### Images

Click on an image path to open the image in a new tab. For iOS, where multiple scaled images exist with the same name the first is opened (e.g. @2x).

## Contributions

This package would not be possible without support from the Titanium community. Auto-completion and grammar support provided by [Jong Eun Lee](https://github.com/yomybaby) through the [Titanium Alloy package](https://github.com/yomybaby/atom-titanium).

### Additional thanks

We doth our caps to:

* [Titanium-Build](https://github.com/HazemKhaled/Titanium-Build)
* [tool-bar](https://github.com/suda/tool-bar)
* [toolbar-basic](https://github.com/mattlovaglio/toolbar-basic)
