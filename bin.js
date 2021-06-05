#!/usr/bin/env node
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

import extjsbuild from "./index.js";

let help = false, p = -1, dropTo = "./build";

const args = process.argv.slice(2);
args.some(arg => {
    if (arg.match(/^(-+|\/)(h(elp)?|\?)$/)) {
        help = true;
    }
    return help;
});

if (!help) {
    p = args.indexOf("-p")
    if (p === -1) {
        p = args.indexOf("-path");
    }

    if (p !== -1) {
        dropTo = args[p + 1];
    }
}

if (!help && p === -1 && args.length > 0) {
    help = true;
}


if (help) {
    const log = help ? console.log : console.error;
    log("Usage: extjsbuild (-p <path>)");
    log("");
    log("  Creates extjs classic/modern builds and drops them at \"build/extjs/[classic|modern]\".");
    log("  Note:");
    log("  This script assumes that the necessary npm-packages are available in ./node_modules/@sencha");
    log("");
    log("Options:");
    log("");
    log("  -h, --help           Display this usage info");
    log("  -p, --path  <path>   The target folder for the generated files. Defaults to  \"./build\".");
    process.exit(help ? 0 : 1);
} else {
    try {
        await extjsbuild(dropTo);
    } catch (e) {
        console.error(e);
    }

}

