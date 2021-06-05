# @coon-js/extjs-build
This npm-package provides the build process for the [Sencha ExtJS](https://sencha.com)
framework, including *modern*- and *classic*-toolkit.

The official Sencha [NPM registry](https://npm.sencha.com) provides access to almost all of their packages,
but prebuild versions of the sdks are not available. This package makes sure that the current versions
of **@sencha/ext-modern** and **@sencha/ext-classic** are built and available in the package this tool is used in,
e.g. for testing Sencha ExtJS npm packages.


## Installation
```
npm install --save-dev @coon-js/extjs-build
```

## Features
* Supports build process for both modern- and classic-toolkit
* Creates theme-triton css-files for both toolkits

## Usage
Navigate to the package that requires build-versions of ExtJS and make sure you have installed the required
libraries and themes. This tool expects the following @sencha-npm packages to be available as installed node-modules:

* [@sencha/ext-core](https://npm.sencha.com)
* [@sencha/ext-classic](https://npm.sencha.com)
* [@sencha/ext-modern-theme-triton](https://npm.sencha.com)
* [@sencha/ext-modern](https://npm.sencha.com)
* [@sencha/ext-modern-theme-triton](https://npm.sencha.com)

Packages can be obtained by signing in into the sencha realm using npm. A detailed description of the process
can be found here: https://docs.sencha.com/extjs/7.4.0/guides/using_systems/using_npm/npm_repo_access.html

Once the modules have been installed, call **extjs-build**

```
dev/mypackage> npx extjs-build -h

Usage: extjsbuild (-p <ypath>

  Creates extjs classic/modern builds and drops them at "build/extjs/[classic|modern]".
  Note:
  This script assumes that the necessary npm-packages are available in ./node_modules/@sencha

Options:

  -h, --help           Display this usage info
  -p, --path  <path>   The target folder for the generated files. Defaults to  "./build".

```

Providing no drop target for the build will use `./build` as the default folder:

```
dev/mypackage> npx extjs-build
```

This will create the following files on your system:

```
dev
   /mypackage
             /build (*)
                   /extjs-build
                               /extjs
                                     /classic
                                             /theme-triton
                                     /modern
                                             /theme-triton
```
```
(*) This folder will be replaced with any folder you specify with the "-p" option, e.g.
extjs-build -p testing creates:

dev
   /mypackage
             /testing (*)
                     /extjs-build
                                 / ...

```

Once the build has finished, you can access all regular (debug)-files for the ExtJS-library, along with the pre-build 
css-files.