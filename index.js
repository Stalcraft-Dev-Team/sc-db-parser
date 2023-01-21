// LIBS
const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pathToParseFuncs = 'parsing functions/';
const
    { ParseArmor } = require(pathToParseFuncs+'parseArmor.js'),
    { ParseArtefact } = require(pathToParseFuncs+'parseArtefact.js'),
    { ParseAttachment } = require(pathToParseFuncs+'parseAttachment.js'),
    { ParseBackpack } = require(pathToParseFuncs+'parseBackpack.js'),
    { ParseBullet } = require(pathToParseFuncs+'parseBullet.js'),
    { ParseContainer } = require(pathToParseFuncs+'parseContainer.js'),
    { ParseGrenade } = require(pathToParseFuncs+'parseGrenade.js'),
    { ParseMedicine } = require(pathToParseFuncs+'parseMedicine.js'),
    { ParseWeapon } = require(pathToParseFuncs+'parseWeapon.js');
// END LIBS

// CONST'S
const UrlToSCDB = 'https://github.com/EXBO-Studio/stalcraft-database.git';
const PathToDB = 'clonedDB';
const FoldersNeedsToPullInsteadOfClone = ['.git', 'global', 'ru'];
// END CONST'S

function callGit(type = '') {
    switch (type) {
        case 'clone': {
            execSync(`git clone ${UrlToSCDB} .`, {
                stdio: [0, 1, 2], // we need this so node will print the command output
                cwd: path.resolve(__dirname, PathToDB), // path to where you want to save the file
            })
            break;
        }
        case 'pull': {
            execSync(`git pull ${UrlToSCDB}`, {
                stdio: [0, 1, 2], // we need this so node will print the command output
                cwd: path.resolve(__dirname, PathToDB), // path to where you want to save the file
            })
            break;
        }
        default: {
            throw new Error('type is incorrect or null');
        }
    }
}

function PrepareData() {
    if (!fs.existsSync(PathToDB)) {
        fs.mkdirSync(PathToDB, { recursive: true });
        callGit('clone');
    } else {
        let allExists = true;
        FoldersNeedsToPullInsteadOfClone.map(value => {
            if (!fs.existsSync(PathToDB+'/'+value)) {
                allExists = false;
            }
        })
        if (allExists) {
            callGit('pull');
        } else {
            callGit('clone');
        }
    }

    console.log('\nClone/Pull was finished!\nStarting parsing...');
}

async function ParseAllData(server = '') {
    if (server !== 'ru' || server !== 'global') {
        console.error('ParseAllData: incorrect server name.');
        return;
    }

    if (!fs.existsSync('parsedData')) {
        fs.mkdirSync('parsedData', { recursive: true });
    }
    const pathToSomething = PathToDB+'/'+server+'/'+'items'+'/';
    /* await ParseArmor(pathToSomething+'armor/');
    await ParseArtefact(pathToSomething+'artefact/');
    await ParseAttachment(pathToSomething+'attachment/');
    await ParseBackpack(pathToSomething+'backpack');
    await ParseBullet(pathToSomething+'bullet');
    await ParseContainer(pathToSomething+'container');
    await ParseGrenade(pathToSomething+'grenade');
    await ParseMedicine(pathToSomething+'medicine'); */
    await ParseWeapon(pathToSomething+'weapon/');
}

PrepareData();
await ParseAllData('ru');
await ParseAllData('global');