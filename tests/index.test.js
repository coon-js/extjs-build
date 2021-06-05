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

import Builder from "../src/Builder.js";
jest.mock("../src/Builder.js");

import extjsbuild from "../index.js";
import defaultConfig from "../extjs-build.config.js";
import path from "path";
import config from "../extjs-build.config";
import fs from "fs";
import {exec} from "child_process";
import util from "util";

const promisifiedExec = util.promisify(exec);

let mockBuild = jest.fn();

// +------------------------------------------------
// | Setup/teardown
// +------------------------------------------------

beforeAll(() => {

    Builder.mockImplementation(() => {

        return {
            build: mockBuild
        };

    });

});


// +------------------------------------------------
// | Tests
// +------------------------------------------------
test("default", () => {
    expect(defaultConfig).toEqual({
        senchaCmd: "npx sencha",
        resources: {
            frameworkDir: "./node_modules/@sencha/",
            packageDir: "./node_modules/@sencha/",
            classic: {
                lib: "./node_modules/@sencha/ext-classic",
                theme: "./node_modules/@sencha/ext-classic-theme-triton"
            },
            modern: {
                lib: "./node_modules/@sencha/ext-modern",
                theme: "./node_modules/@sencha/ext-modern-theme-triton"
            }
        },
        defaultDirs: {
            extjs_build: "extjs-build",
            classic: "extjs/classic",
            modern: "extjs/modern"
        }
    });
});


test("extjsbuild() - invalid dropTarget", async () => {
    await expect(extjsbuild()).rejects.toThrow(/must be a string/);
});

test("extjsbuild()", async () => {
    await extjsbuild("dropTarget");

    expect(mockBuild).toHaveBeenCalled();

    const
        senchaCmd = Builder.mock.calls[0][0],
        cfg = Builder.mock.calls[0][1];

    expect(senchaCmd).toBe(defaultConfig.senchaCmd);
    expect(cfg.resources).toEqual(defaultConfig.resources);

    const [targetBase, targetClassic, targetModern] = [
        path.resolve(`dropTarget/${defaultConfig.defaultDirs.extjs_build}`),
        path.resolve(`dropTarget/${defaultConfig.defaultDirs.extjs_build}/${defaultConfig.defaultDirs.classic}`),
        path.resolve(`dropTarget/${defaultConfig.defaultDirs.extjs_build}/${defaultConfig.defaultDirs.modern}`)
    ];

    expect(cfg.targetBase).toBe(targetBase);
    expect(cfg.targetClassic).toBe(targetClassic);
    expect(cfg.targetClassic).not.toContain("undefined");
    expect(cfg.targetModern).toBe(targetModern);
    expect(cfg.targetModern).not.toContain("undefined");

    expect(cfg.fs.resolve).toBe(path.resolve);
    expect(cfg.fs.exists).toBe(fs.existsSync);

    // test custom rm delegate
    const rmSpy = jest.spyOn(fs, "rmSync").mockImplementation(() => {});
    cfg.fs.rm("/dev/null");
    expect(rmSpy.mock.calls[0][0]).toBe("/dev/null");
    expect(rmSpy.mock.calls[0][1]).toEqual({force: true, recursive: true});
    rmSpy.mockClear();
    
    expect(cfg.exec).toBe(promisifiedExec);
});