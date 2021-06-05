/**
 * coon.js
 * extjs-build
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-build
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

export default {

    "senchaCmd": "npx sencha",
    /**
     * The paths are relative to the npm module in which "extjs-build" gets called in.
     *
     * If you are in "/tmp/runner>" and call "npx extjs-build", the relative paths in the config
     * are computed against the path "tmp/runner".
     *
     * We are then expecting the package dependencies to be available in the following directories:
     *
     *  <pre>
     *      @sencha/ext-classic: /tmp/runner/node_modules/@sencha/ext-classic
     *      @sencha/ext-theme-classic-triton: /tmp/runner/node_modules/@sencha/ext-theme-classic-triton
     *      @sencha/ext-modern: /tmp/runner/node_modules/@sencha/ext-classic
     *      @sencha/ext-modern-theme-triton: /tmp/runner/node_modules/@sencha/ext-theme-classic-triton
     *  </ pre>
     */
    "resources": {

        "frameworkDir": "./node_modules/@sencha/",
        "packageDir": "./node_modules/@sencha/",

        "classic": {
            "lib": "./node_modules/@sencha/ext-classic",
            "theme": "./node_modules/@sencha/ext-classic-theme-triton"
        },

        "modern": {
            "lib": "./node_modules/@sencha/ext-modern",
            "theme": "./node_modules/@sencha/ext-modern-theme-triton"
        }

    },
    "defaultDirs": {
        "extjs_build": "extjs-build",
        // reative to the "extjs_build"-config-value (see one lne above), this is the path to the
        // builds of classic/modern
        // extjs-build will purge the "extjs_build"-directory on each run
        // and add a fresh built
        "classic": "extjs/classic", // results in "extjs-build/extjs/classic"
        "modern": "extjs/modern"    // results in "extjs-build/extjs/modern"
    }
    
};
    