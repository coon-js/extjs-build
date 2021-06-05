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

import l8 from "@l8js/l8";

/**
 * Configuration
 * @typedef {Object} Config
 * @property {string} senchaCmd
 * @property {FileSysten} fs
 * @property {function} exec
 * @property {Object} resources
 * @property {string} targetBase
 * @property {string} targetClassic
 * @property {string} targetModern
 */


/**
 * Helper class for the build process.
 * Target dirs will be created if they do not exist.
 *
 */
export default class {

    /**
     * Resources.
     * @typedef {Object} resources
     * @property {String} frameworkDir
     * @property {String} packageDir
     * @property {{lib : string, theme: string}} classic
     * @property {{lib : string, theme: string}} modern
     */

    /**
     * @var {String} targetBase
     * @private
     */

    /**
     * @var {String} targetClassic
     * @private
     */

    /**
     * @var {String} targetModern
     * @private
     */

    /**
     * Async function to use for system calls.
     * see "npm view child_process" (promisified)
     * @var {Function} exec
     * @private
     */

    /**
     * FileSystem
     * @typedef {object} fs
     * @property {Function} rm
     * @property {Function} exists
     * @property {Function} resolve
     *
     * An object that must be configured for an instance of the builder.
     * This is mainly for injecting test-mocks. The Object must provide
     * the following functions:
     * - resolve (see "npm view fs")
     * - rm (see "npm view fs")
     * - exists (see "npm view fs");
     */

    /**
     * Constructor.
     *
     *
     * @param {string} senchaCmd
     * @param {Config} cfg
     */
    constructor (senchaCmd, cfg) {

        cfg = cfg || {};

        l8.core.lck(
            this,
            "senchaCmd", "fs", "exec", "resources",
            "targetBase", "targetClassic", "targetModern",
            Object.assign({senchaCmd}, cfg)
        );
    }

    /**
     * Initiates the build process.
     *
     * @return {Promise<void>}
     *
     * @throws
     */
    async build () {
        const
            me = this,
            senchaCmd = me.senchaCmd;

        me.assertFs(me.fs);
        me.assertExec(me.exec);

        const resources = me.resolveResourcePaths(me.resources);

        me.assertSenchaInstallation(resources);
        me.clean(me.targetBase);

        await Promise.all([
            // classic
            me.buildInternal(senchaCmd, resources, me.targetClassic, "classic", "lib"),
            me.buildInternal(senchaCmd, resources, me.targetClassic, "classic", "theme"),
            // modern
            me.buildInternal(senchaCmd, resources, me.targetModern, "modern", "lib"),
            me.buildInternal(senchaCmd, resources, me.targetModern, "modern", "theme")
        ]);
    }


    /**
     * Internal builder.
     * Attempts to build the "toolkit" of ExtJS with the "type".
     *
     * @param {String} senchaCmd
     * @param {resources} resources
     * @param {String} outputDir
     * @param {String} toolkit classic or modern
     * @param {String} type lib or theme
     *
     * @return {Promise<void>}
     *
     * @private
     */
    async buildInternal (senchaCmd, resources, outputDir, toolkit, type) {

        const
            me = this;

        if (["classic", "modern"].indexOf(toolkit) === -1) {
            throw new Error(`"toolkit" (${toolkit}) must be "classic" or "modern"`);
        }

        if (["lib", "theme"].indexOf(type) === -1) {
            throw new Error(`"type" (${type}) must be "lib" or "theme"`);
        }

        me.assertResourceObject(resources, toolkit);

        const propString = me.getPropString(resources.frameworkDir, resources.packageDir, outputDir, type === "theme");
        let cmd = `cd ${resources[toolkit][type]} && ${senchaCmd} ${propString}`;

        switch (type) {
        case "theme":
            cmd = `${cmd} then package build`;
            break;
        case "lib":
            cmd = `${cmd} then ant js`;
            break;
        }

        return await this.exec(cmd, (err, stdout, stderr) => console.log(stdout));

    }


    /**
     * Returns the string to append to #senchaCmd for configuring the various directories.
     * set useBuildDir
     *
     * @example
     *    getPropString("foo", "bar", "snafu", true) // "config -prop framework.dir=foo -prop framework.packages.dir=bar -prop package.build.dir=snafu"
     *
     * @param {String} frameworkDir
     * @param {String} packageDir
     * @param {String} outputDir
     * @param {Boolean} useWorkspacePrefix true to configure "workspace.subpkg.prefix" with outputDir, otherwise, "
     * "package.build.dir" will be used.
     *
     * @return {string}
     */
    getPropString (frameworkDir, packageDir, outputDir, useWorkspacePrefix) {
        return `config -prop framework.dir=${frameworkDir} -prop framework.packages.dir=${packageDir} -prop ${useWorkspacePrefix ? "workspace.subpkg.prefix" : "package.build.dir"}=${outputDir}`;
    }


    /**
     * Removes the target dir.
     *
     * @param target
     *
     * @return the return value of the "rm"-call of the used {FileSystem}
     *
     * @throws
     */
    clean (target) {
        const me = this;

        return me.fs.rm(target);
    }


    /**
     * Iterates through the resources object and calls resolve() on each entry.
     *
     * @param {resources} resources
     *
     * @return {resources} A new resource object, with no reference to the passed resource-object.
     *
     * @private
     */
    resolveResourcePaths (resources) {
        const
            me = this,
            resolve = me.fs.resolve;

        const cp = {};

        if (me.assertResourceObject(resources)) {
            cp.frameworkDir = resolve(resources.frameworkDir);
            cp.packageDir = resolve(resources.packageDir);

            l8.core.chn([
                "modern.lib",
                "modern.theme",
                "classic.lib",
                "classic.theme"
            ], cp, property => l8.core.nchn(property, resources, resolve));
        }

        return cp;
    }


    /**
     * Throws an error if any of the resources directory does not exist, and an attempt to build the libs
     * would most likely fail.
     *
     * @param {resources} resources
     *
     * @return {Boolean}
     *
     * @throws
     */
    assertSenchaInstallation (resources) {

        const
            me = this,
            fs = me.fs;

        if (me.assertResourceObject(resources)) {
            const checks = {
                "framework": resources.frameworkDir,
                "package": resources.packageDir,
                "modern (lib)": resources.modern.lib,
                "modern (theme)": resources.modern.theme,
                "classic (lib)": resources.classic.lib,
                "classic (theme)": resources.classic.theme
            };

            Object.entries(checks).some(([type, path]) => {
                if (!fs.exists(path)) {
                    throw new Error(`the path for ${type} (${path}) does not exist. Please make sure you have the Sencha-packages properly installed locally.`);
                }
            });

            return true;
        }

        // should have thrown
        return false;
    }


    /**
     * Ensures the integrity of the specified resources-object.
     *
     * @param {resources} resources
     * @param {String} toolkit
     *
     * @return {boolean}
     *
     * @throws
     */
    assertResourceObject (resources, toolkit) {

        if (typeof resources !== "object") {
            throw new Error("\"resources must be an object\"");
        }

        let toolkits = ["classic", "modern"];

        if (toolkit !== undefined) {
            if (toolkits.indexOf(toolkit) === -1) {
                throw new Error(`"toolkit" (${toolkit}) must be one of ${toolkits.join(", ")}`);
            }
            toolkits = [toolkit];
        }
        toolkits.some((toolkit) => {
            if (!l8.core.nchn(`${toolkit}.lib`, resources) ||
                !l8.core.nchn(`${toolkit}.theme`, resources)) {
                throw new Error("\"resources\" must be configured with \"[classic|modern].[lib|theme]\"");
            }
        });

        if (!resources.frameworkDir || !resources.packageDir) {
            throw new Error("\"resources\" must be configured with \"frameworkDir\" and \"packageDir\"");
        }

        return true;
    }


    /**
     * Ensures availability of fs object with the methods rm, exists and resolve.
     *
     * @param {FileSystem} fs
     *
     * @return {Boolean} true if fs is an object providing the functions "resolve", "rm", "exists"
     *
     * @throws
     */
    assertFs (fs) {

        const methods = [
            "resolve",
            "rm",
            "exists"
        ];

        if (!fs || methods.some(fn => l8.core.isf(fs[fn])) === false) {
            let av;
            if (fs) {
                av = Object.keys(fs).join(", ");
            }
            throw new Error(`"fs" must be an object with the functions "${methods.join("\", \"")}", ${av ? av : "no" } methods found`);
        }

        return true;
    }


    /**
     * Asserts availability of this.exec
     *
     * @param {Function} exec
     *
     * @return {Boolean} true if exec is a function
     *
     * @throws
     */
    assertExec (exec) {
        if (!l8.core.isf(exec)) {
            throw new Error("\exec\" must be an async function");
        }

        return true;
    }

}