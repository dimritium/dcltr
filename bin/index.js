#!/usr/bin/env node

const utils = require('../utils/utils') //all script related utility
const yargs = require('yargs'); // argument parser
const process = require('process'); // used for reading dir
const fs = require('fs'); // file system modeled on POSIX
const path = require('path'); // resolving the dir path
const { resolve } = require('path');
const readline = require('readline');

const options = yargs
    .showHelpOnFail(true)
    .scriptName('dcltr')
    .command(['org'], '<organize current directory based on file extension>', {
        set: {
            alias: 's',
            describe: 'auto organize the directory based on extension',
            type: 'boolean'
        },
        dir: {
            alias: 'd',
            describe: 'specify directory path for organising',
            type: 'string'
        }
    })
    .usage(`Usage: 
    $0 [command] <options>
    $0 [command] -h   (for command specific help)
    `)
    .help()
    .alias('h', 'help')
    .argv

const command = options._[0];

/**
 * Displays all the files respective to their extensions
 * @param {fs.PathLike} dir - absolute path of the directory to be read 
 * @returns {Object}
 */
async function getOrgStats(dir) {
    let extMap = {}
    const filenames = await fs.promises.readdir(dir).catch(console.error);


    await Promise.all(
        filenames.map(async (file) => {
            const absolutePath = path.join(dir, file);
            return fs.promises.lstat(absolutePath).then((stats) => {
                if (stats.isFile()) {
                    let key = path.extname(absolutePath).substring(1,); //skipping dot (.) from extname
                    key = key == "" ? "misc" : key;
                    if (extMap[key] === undefined) {
                        extMap[key] = [path.basename(absolutePath)];
                    }
                    else {
                        extMap[key].push(path.basename(absolutePath));
                    }
                }
            }
            ).catch(console.error);
        }));

    return extMap;
}

/**
 * 
 * @param {string} que Question to be asked to the user
 */
async function handleUserInput(que) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(que, (ans) => {
        rl.close();
        resolve(ans.toLowerCase());
    }));
}


/**
 * 
 * @param {Object} extMap 
 * @param {fs.PathLike} dir 
 */
async function handleFileMove(extMap, dir) {
    let errorObj = (filename, error) => {
        return { filename: filename, error: error };
    };

    let restoreObj = (from, to) => {
        return { from: from, to: to };
    }

    let errorObjStore = [];
    let restoreObjStore = { dirCreated: [], filesMoved: [] };
    let totalFilesMoved = 0;

    for (folder in extMap) {
        for (file of extMap[folder]) {
            let oldPath = path.join(dir, file);
            let newPath = path.join(dir, folder);
            if (!fs.existsSync(newPath)) {
                try {
                    newPath = path.join(dir, folder)
                    fs.mkdirSync(newPath);
                    restoreObjStore['dirCreated'].push(newPath);
                } catch (err) {
                    console.log(err);
                }
            }

            try {
                let newFilePath = path.join(newPath, file);
                if (fs.existsSync(newFilePath)) {
                    let num = 1;
                    let fileName = path.basename(newFilePath, path.extname(file));
                    while (fs.existsSync(newFilePath)) {
                        let fileRename = `${fileName}_${num++}`;
                        newFilePath = path.join(newPath, fileRename + path.extname(file));
                    }
                }
                fs.renameSync(oldPath, newFilePath);
                restoreObjStore['filesMoved'].push(restoreObj(newFilePath, oldPath));
                totalFilesMoved += 1;
            } catch (err) {
                errorObjStore.push(errorObj(oldPath, err.message));
            }

        }
    }
    if (errorObjStore.length > 0) {
        console.log("Some errors were encountered:\n",errorObjStore); // display errors
    }
    // display stats
    console.log(utils.statsTable(totalFilesMoved, errorObjStore));
    if (totalFilesMoved > 0) {
        let ans = await handleUserInput(`${totalFilesMoved}/${totalFilesMoved + errorObjStore.length} files moved. Do you want to undo the changes? [y/n] `);
        if (ans === 'yes' || ans === 'y') {
            errorObjStore = [];
            // move files first
            for (obj of restoreObjStore['filesMoved']) {
                try {
                    fs.renameSync(obj.from, obj.to);
                } catch (err) {
                    errorObjStore.push(errorObj(fs.basename(obj.from), err.message));
                }
            }
            // delete folders that were created
            for (obj of restoreObjStore['dirCreated']) {
                try {
                    fs.rmdirSync(obj);
                } catch (err) {
                    errorObjStore.push(errorObj(path.basename(obj), err.message));
                }
            }
            console.log("Changes undone...");
        } 
        if(errorObjStore.length > 0)
            console.log(errorObjStore);
    } else {
        console.log("No file moved, see error above");
    }
}

async function handleCmdOrg() {

    // resolve user provided dir; defaults to the current dir
    let dir = options.dir ? path.resolve(options.dir) : process.cwd();
    let loadingId = utils.loadingAnimation();
    let extMap = await new Promise(resolve => setTimeout(() => resolve(getOrgStats(dir)), 1000));
    if (Object.keys(extMap).length === 0) {
        clearInterval(loadingId);
        console.log("\nNo files to move, exiting now...");
        return;
    }
    let ans = "";

    console.log(`\nDirectory: ${dir}`);
    clearInterval(loadingId);               //stop loading animation
    process.stdout.write(utils.displayObjectAsTable(extMap, ["Extensions", "Filenames"]));

    if (!options.set)
        ans = await handleUserInput("Do you want to move files to folders named by respective extensions? [y/n]  ");

    if (ans === "yes" || ans === "y" || options.set) {
        await handleFileMove(extMap, dir);
    } else {
        console.log("No action taken");
    }
}

/**
 * `org` used for organising the directory
 *  options:
 *      -s for auto organise
 *      -d to specify the directory path for running `org`
 */
if (command === 'org') {
    handleCmdOrg();
}



