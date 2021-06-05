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


/**
 * Based on previous calls to the following scripts in [extjs-lib-core](https://github.com/coon-js/extjs-lib-core):
 *
 * "build:extjs": "npm run build:extjs:classic && npm run build:extjs:modern",
 * "build:extjs:themes": "npm run build:theme:classic && npm run build:theme:modern",
 * "build:extjs:classic": "cd ./node_modules/@sencha/ext-classic && npx sencha config -prop framework.dir=../ -prop framework.packages.dir=../ -prop package.build.dir=../../../tests/build/extjs/classic then ant js",
 * "build:extjs:modern": "cd ./node_modules/@sencha/ext-modern && npx sencha config -prop framework.dir=../ -prop framework.packages.dir=../ -prop package.build.dir=../../../tests/build/extjs/modern then ant js",
 * "build:theme:classic": "cd ./node_modules/@sencha/ext-classic-theme-triton && npx sencha config -prop framework.dir=../ -prop framework.packages.dir=../ -prop workspace.subpkg.prefix=../../../tests/build/extjs/classic then package build",
 * "build:theme:modern": "cd ./node_modules/@sencha/ext-modern-theme-triton && npx sencha config -prop framework.dir=../ -prop framework.packages.dir=../ -prop workspace.subpkg.prefix=../../../tests/build/extjs/modern then package build"
 */
import fs from "fs";
import path from "path";
import Builder from "./src/Builder.js";
import {exec} from "child_process";
import config from "./extjs-build.config.js";
import l8 from "@l8js/l8";
import util from "util";

const promisifiedExec = util.promisify(exec);

/**
 * Entry point function call.
 * Creates a Builder and invokes build() on it.
 *
 * @param {String} dropTarget The target directory name the files should be
 * stored in.
 *
 * @throws {Error} if dropTarget is not a string, or any error that occured during
 * the build process.
 */
export default async (dropTarget) => {

    if (!l8.core.isString(dropTarget)) {
        throw new Error(`"dropTarget" (${dropTarget}) must be a string.`);
    }

    const
        targetBase = path.resolve(`${dropTarget}/${config.defaultDirs.extjs_build}`),
        targetClassic = path.resolve(`${targetBase}/${config.defaultDirs.classic}`),
        targetModern = path.resolve(`${targetBase}/${config.defaultDirs.modern}`);

    const builder = new Builder(config.senchaCmd,{
        fs: {
            resolve: path.resolve,
            exists: fs.existsSync,
            rm: (path) => fs.rmSync(path, {force: true, recursive: true})
        },
        exec : promisifiedExec,
        resources: config.resources,
        targetBase,
        targetClassic,
        targetModern
    });

    await builder.build();

    return true;
};

