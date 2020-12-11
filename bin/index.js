#!/usr/bin/env node

const yargs = require('yargs'); // argument parser
const process = require('process'); // used for reading dir
const fs = require('fs'); // file system modeled on POSIX
const path = require('path'); // resolving the dir path

const options = yargs
    .showHelpOnFail(true)
    .scriptName('hello')
    .command(['org'], '<organize current directory based on extension>', {
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
    .usage('Usage: $0 [command] <option>')
    .help()
    .alias('h', 'help')
    .argv

const command = options._[0];

/**
 * 
 * @param {pathLike} filename - should specify the full path if not in current dir 
 * @param {function} callback - callback to be executed after stat object is created for filename
 */
let statsWrapper = function (filename, callback) {
    fs.stat(filename, function (err, stats) {
        if (err)
            callback(err);
        else {
            stats.filename = filename;
            callback(err, stats);
        }
    })
}

/**
 * `org` used for organising the directory
 *  options:
 *      -s for auto organise
 *      -d to specify the directory path for running `org`
 */
if (command === 'org') {
    console.log(options);
    let extMap = {}
    // resolve user provided dir; defaults to the current dir
    let dir = options.dir ? path.resolve(options.dir) : process.cwd();

    fs.promises.readdir(dir)
        .then(fileNames => {
            for (let file of fileNames) {
                // in order for fs.stat to process filename the path `dir` and `file` needs to be join-ed
                statsWrapper(path.join(dir, file), (err, stat) => {
                    if (err)
                        console.log(err);
                    else {
                        

                        console.log(stat.isFile(), stat.filename, path.extname(stat.filename));
                    }
                });
            }
        })
        .catch(err => console.log(err))

}

