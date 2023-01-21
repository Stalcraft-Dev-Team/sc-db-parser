// LIBS
const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pathToParseFuncs = './Parsing Functions/';
const
    // { ParseArmor } = require(pathToParseFuncs+'parseArmor.js'),
    // { ParseArtefact } = require(pathToParseFuncs+'parseArtefact.js'),
    // { ParseAttachment } = require(pathToParseFuncs+'parseAttachment.js'),
    // { ParseBackpack } = require(pathToParseFuncs+'parseBackpack.js'),
    // { ParseBullet } = require(pathToParseFuncs+'parseBullet.js'),
    // { ParseContainer } = require(pathToParseFuncs+'parseContainer.js'),
    // { ParseGrenade } = require(pathToParseFuncs+'parseGrenade.js'),
    // { ParseMedicine } = require(pathToParseFuncs+'parseMedicine.js'),
    { ParseWeapon } = require(pathToParseFuncs+'parseWeapon.js'),
    { ParseMeleeWeapon } = require(pathToParseFuncs+'parseMeleeWeapon.js');
// END LIBS

// CONST'S
const UrlToSCDB = 'https://github.com/EXBO-Studio/stalcraft-database.git';
const PathToDB = 'Cloned DataBase';
const FoldersNeedsToPullInsteadOfClone = ['.git', 'global', 'ru'];
const { pathToParse } = require(pathToParseFuncs+'pathToParse.js');
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
    if (!(server === 'ru' || server === 'global')) {
        console.error('ParseAllData: incorrect server name.');
        return;
    }

    if (!fs.existsSync(pathToParse)) {
        fs.mkdirSync(pathToParse, { recursive: true });
    }

    const pathToItems = PathToDB+'/'+server+'/'+'items'+'/';
    /* await ParseArmor(pathToItems+'armor/');
    await ParseArtefact(pathToItems+'artefact/');
    await ParseAttachment(pathToItems+'attachment/');
    await ParseBackpack(pathToItems+'backpack/');
    await ParseBullet(pathToItems+'bullet/');
    await ParseContainer(pathToItems+'container/');
    await ParseGrenade(pathToItems+'grenade/');
    await ParseMedicine(pathToItems+'medicine/'); */
    await ParseWeapon(pathToItems+'weapon/');
    await ParseMeleeWeapon(pathToItems+'weapon/melee');
}

async function StartParse() {
    await ParseAllData('ru');
    await ParseAllData('global');
}


// START PROGRAM
PrepareData();
StartParse().then(r => {
    if (r)
        console.log(r);
    else
        console.log('Parsing complete.');
});
