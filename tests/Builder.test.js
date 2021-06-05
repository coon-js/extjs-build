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
import defaultConfig from "../extjs-build.config.js";

const getResources = () => ({
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
});

let inst;

// +------------------------------------------------
// | Setup/teardown
// +------------------------------------------------

beforeEach(() => {
    inst = new Builder(); 
});

afterEach(() => {
    inst = null;
});


// +------------------------------------------------
// | Tests
// +------------------------------------------------
test("defaultConfig", () => {
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


test("assertExec()", () => {
    expect(() => {inst.assertExec();}).toThrow(/must be an async function/);
    expect(inst.assertExec(() => {})).toBe(true);
});


test("assertFs()", () => {

    const methods = {
        "resolve": () => {},
        "rm": () => {},
        "exists": () => {}
    };
    
    expect(() => {inst.assertFs();}).toThrow(/must be an object/);
    expect(() => {inst.assertFs({});}).toThrow(/with the functions/);

    expect(inst.assertFs( methods)).toBe(true);
});


test("assertResourceObject()", () => {

    const resources = getResources();

    expect(() => {inst.assertResourceObject();}).toThrow(/must be an object/);
    expect(() => {inst.assertResourceObject({});}).toThrow(/must be configured with/);
    expect(() => {inst.assertResourceObject(resources, "foo");}).toThrow(/must be one of/);

    expect(inst.assertResourceObject( resources)).toBe(true);

    delete resources.classic.theme;
    expect(() => {inst.assertResourceObject(resources, "classic");}).toThrow(/must be configured with/);
    expect(inst.assertResourceObject( resources, "modern")).toBe(true);

});


test("assertSenchaInstallation()", () => {

    const
        existsMock = path => {
            return true;
        },
        resources = getResources();

    let inst = new Builder("npx sencha", {
        fs: {
            exists: jest.fn().mockImplementation(existsMock)
        }
    });

    const spy = jest.spyOn(inst, "assertResourceObject");
    expect(inst.assertSenchaInstallation(resources)).toBe(true);
    expect(spy).toHaveBeenCalledWith(resources);


    inst = new Builder("npx sencha", {
        fs: {
            exists: () => false
        }
    });
    expect(() => {inst.assertSenchaInstallation(resources);}).toThrow();

    spy.mockClear();
});


test("resolveResourcePaths()", () => {

    const
        resolveMock = path => {
            return "/" . path;
        },
        resources = getResources();

    let inst = new Builder("npx sencha", {
        fs: {
            resolve: jest.fn().mockImplementation(resolveMock)
        }
    });

    const
        spy = jest.spyOn(inst, "assertResourceObject"),
        res = inst.resolveResourcePaths(resources);
    expect(res).toBeTruthy();
    expect(res).not.toBe(resources);
    expect(spy).toHaveBeenCalledWith(resources);

    expect(res).toEqual({
        frameworkDir: resolveMock(resources.frameworkDir),
        packageDir: resolveMock(resources.packageDir),
        classic: {
            lib: resolveMock(resources.classic.lib),
            theme: resolveMock(resources.classic.theme)
        },
        modern: {
            lib: resolveMock(resources.modern.lib),
            theme: resolveMock(resources.modern.theme)
        }
    });

    spy.mockClear();
});


test("clean()", () => {

    const rmMock = path => "REMOVED " + path;

    let inst = new Builder("npx sencha", {
        fs: {
            rm: jest.fn().mockImplementation(rmMock)
        }
    });

    const res = inst.clean("target");

    expect(inst.fs.rm).toHaveBeenCalledWith("target");
    expect(res).toBe( rmMock("target"));
});


test("getPropString()", () => {

    expect(inst.getPropString(
        "fwd", "pd", "od", true
    )).toBe(
        "config -prop framework.dir=fwd -prop framework.packages.dir=pd -prop workspace.subpkg.prefix=od"
    );

    expect(inst.getPropString(
        "fwd2", "pd2", "od2"
    )).toBe(
        "config -prop framework.dir=fwd2 -prop framework.packages.dir=pd2 -prop package.build.dir=od2"
    );
});


test("buildInternal()", async () => {

    const
        execMock = async command => "CLI " + command,
        resources = getResources(),
        inst = new Builder("npx sencha", {
            exec: jest.fn().mockImplementation(execMock)
        }),
        spyAssert = jest.spyOn(inst, "assertResourceObject"),
        spyProp = jest.spyOn(inst, "getPropString");


    const calls = [[
        "npx sencha", resources, "foo", "classic", "theme"
    ], [
        "npx sencha", resources, "foo", "modern", "lib"
    ]];

    const testCall = async ([senchaCmd, resources, outputDir, toolkit, type], index) => {
        let res = await inst.buildInternal(senchaCmd, resources, outputDir, toolkit, type);

        expect(spyAssert).toHaveBeenCalledWith(resources, toolkit);
        expect(spyProp).toHaveBeenCalledWith(resources.frameworkDir, resources.packageDir, outputDir, type === "theme");

        let cmd = `cd ${resources[toolkit][type]} && ${senchaCmd} ${spyProp.mock.results[index].value}`;
        expect(res).toBe(`CLI ${cmd} ${type === "theme" ? "then package build" : "then ant js"}`);

        return true;
    };

    for await (const result of calls.map(testCall)) {
        expect(result).toBe(true);
    }
    
    spyAssert.mockClear();
    spyProp.mockClear();
});


test("constructor()", () => {
    
    const props = {
        fs: "fs", 
        exec: "exec",
        resources: "resources",
        targetBase: "targetBase", 
        targetClassic: "targetClassic", 
        targetModern: "targetModern"
    };
    
    let inst = new Builder("senchaCmd", props);

    Object.entries(props).forEach(([key, value]) => {
        expect(inst[key]).toBe(value);

        let desc = Object.getOwnPropertyDescriptor(inst, key);
        expect(desc.configurable).toBe(false);
        expect(desc.writable).toBe(false);
    });

    expect(inst.senchaCmd).toBe("senchaCmd");

});


test("build()", async () => {

    const props = {
            fs: () => ({rm: () => {},  exists: () => {}, resolve: () => {}}),
            exec: () => {},
            resources: "resources",
            targetBase: "targetBase",
            targetClassic: "targetClassic",
            targetModern: "targetModern"
        },
        cmd = "senchaCmd";
    let inst = new Builder(cmd, props);

    const resolvedResources = getResources();


    const [fsSpy, execSpy, resourcePathSpy, senchaInstSpy, cleanSpy, buildSpy] = [
        jest.spyOn(inst, "assertFs").mockImplementation(() => {}),
        jest.spyOn(inst, "assertExec").mockImplementation(() => {}),
        jest.spyOn(inst, "resolveResourcePaths").mockImplementation(() => resolvedResources),
        jest.spyOn(inst, "assertSenchaInstallation").mockImplementation(() => {}),
        jest.spyOn(inst, "clean").mockImplementation(() => {}),
        jest.spyOn(inst, "buildInternal")
    ];

    await inst.build();

    expect(fsSpy).toHaveBeenCalledWith(inst.fs);
    expect(execSpy).toHaveBeenCalledWith(inst.exec);
    expect(resourcePathSpy).toHaveBeenCalledWith(inst.resources);
    expect(senchaInstSpy).toHaveBeenCalledWith(resolvedResources);
    expect(cleanSpy).toHaveBeenCalledWith(inst.targetBase);

    const buildCalls = [
        [inst.senchaCmd, resolvedResources, inst.targetClassic, "classic", "lib"],
        [inst.senchaCmd, resolvedResources, inst.targetClassic, "classic", "theme"],
        [inst.senchaCmd, resolvedResources, inst.targetModern, "modern", "lib"],
        [inst.senchaCmd, resolvedResources, inst.targetModern, "modern", "theme"]
    ];

    buildCalls.forEach(([cmd, res, target, toolkit, type], index) => {
        expect(buildSpy.mock.calls[index][0]).toBe(cmd);
        expect(buildSpy.mock.calls[index][1]).toBe(res);
        expect(buildSpy.mock.calls[index][2]).toBe(target);
        expect(buildSpy.mock.calls[index][3]).toBe(toolkit);
        expect(buildSpy.mock.calls[index][4]).toBe(type);
    });
});