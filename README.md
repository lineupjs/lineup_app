LineUp App
==========

[![License: MIT][mit-image]][mit-url] [![CircleCI][ci-image]][ci-url]  [![CircleCI][ci-image-dev]][ci-url-dev] <sup>(dev)</sup>

LineUp is an interactive technique designed to create, visualize and explore rankings of items based on a set of heterogeneous attributes. 
This is a demo application using [LineUp.js](https://github.com/lineupjs/lineupjs). Details about the LineUp visualization technique can be found at [http://lineup.caleydo.org](http://lineup.caleydo.org). 

The application is deployed at: https://lineup.js.org/app. The develop version is deployed at https://lineup.js.org/app_develop. 


![Start Page](https://user-images.githubusercontent.com/4129778/50603800-03172600-0ebc-11e9-8664-269bd39009b8.png)

![Soccer dataset](https://user-images.githubusercontent.com/4129778/50603801-03172600-0ebc-11e9-9b74-75b408385807.png)


Features
--------
 * Data Management
   * Choose one of the preloaded datasets
   * Import/Export CSV File
   * Import/Export JSON File
   * Import/Export LineUp JSON Dump
 * Session Management
   save different analyses 
 * Export current to one of 
   * https://codepen.io
   * https://jsfiddle.net
   * https://codesandbox.io
 * 

**Note** Uploaded files are stored in your local web browser


Supported Browsers
------------------

 * Chrome 64+ (best performance)
 * Firefox 57+
 * Edge 16+
 


Development Environment
-----------------------

**Installation**

```bash
git clone https://github.com/lineupjs/lineup_app.git
cd lineup_app
npm install
```

**Build distribution packages**

```bash
npm run build
```

**Run Linting**

```bash
npm run lint
```


**Serve integrated webserver**

```bash
npm start
```


Authors
-------

 * Samuel Gratzl (@sgratzl)

[mit-image]: https://img.shields.io/badge/License-MIT-yellow.svg
[mit-url]: https://opensource.org/licenses/MIT
[ci-image]: https://circleci.com/gh/lineupjs/lineup_app.svg?style=shield
[ci-url]: https://circleci.com/gh/lineupjs/lineup_app
[ci-image-dev]: https://circleci.com/gh/lineupjs/lineup_app/tree/develop.svg?style=shield
[ci-url-dev]: https://circleci.com/gh/lineupjs/lineup_app/tree/develop
