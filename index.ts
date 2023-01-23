// LIBS
//const shell = require('shelljs');
import fs from "fs";
const path = require('path');
import { execSync } from 'child_process';

//import { ParseArmor } from './Parsing Functions/parseArmor';
//import { ParseArtefact } from './Parsing Functions/parseArtefact';
//import { ParseAttachment } from './Parsing Functions/parseAttachment';
//import { ParseBackpack } from './Parsing Functions/parseBackpack';
//import { ParseBullet } from './Parsing Functions/parseBullet';
//import { ParseContainer } from './Parsing Functions/parseContainer';
//import { ParseGrenade } from './Parsing Functions/parseGrenade';
//import { ParseMedicine } from './Parsing Functions/parseMedicine';
import { ParseWeapon } from './Parsing Functions/parseWeapon';
import { ParseMeleeWeapon } from './Parsing Functions/parseMeleeWeapon';

// END LIBS

// CONST'S
const UrlToSCDB: string = 'https://github.com/EXBO-Studio/stalcraft-database.git';
const PathToDB: string = __dirname+'\\'+'Cloned DataBase';
const FoldersNeedsToPullInsteadOfClone: string[] = ['global', 'ru'];
import { pathToParse } from './Parsing Functions/pathToParse';
// END CONST'S

function callGit(type = ''): void {
    switch (type) {
        case 'clone': {
            execSync(`git clone ${UrlToSCDB} .`, {
                stdio: [0, 1, 2], // we need this so node will print the command output
                cwd: path.resolve(__dirname, PathToDB), // path to where you want to save the file
            });
            break;
        }
        case 'pull': {
            execSync(`git pull ${UrlToSCDB}`, {
                stdio: [0, 1, 2], // we need this so node will print the command output
                cwd: path.resolve(__dirname, PathToDB), // path to where you want to save the file
            });
            break;
        }
        default: {
            throw new Error('type is incorrect or null');
        }
    }
}

function PrepareData(): void {
    if (!fs.existsSync(PathToDB)) {
        fs.mkdirSync(PathToDB, { recursive: true });
        callGit('clone');
    } else {
        let allExists: boolean = true;
        FoldersNeedsToPullInsteadOfClone.map(value => {
            if (!fs.existsSync(PathToDB+'\\'+value)) {
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

    if (!fs.existsSync(__dirname+'\\'+pathToParse)) {
        fs.mkdirSync(__dirname+'\\'+pathToParse, { recursive: true });
    }

    let parseResults: boolean[] = [];
    const pathToItemsFolder = PathToDB+'\\'+server+'\\'+'items'+'\\';
    // parseResults.push( await ParseArmor(pathToItemsFolder+'armor\\') );
    // parseResults.push( await ParseArtefact(pathToItemsFolder+'artefact\\') );
    // parseResults.push( await ParseAttachment(pathToItemsFolder+'attachment\\') );
    // parseResults.push( await ParseBackpack(pathToItemsFolder+'backpack\\') );
    // parseResults.push( await ParseBullet(pathToItemsFolder+'bullet\\') );
    // parseResults.push( await ParseContainer(pathToItemsFolder+'container\\') );
    // parseResults.push( await ParseGrenade(pathToItemsFolder+'grenade\\') );
    // parseResults.push( await ParseMedicine(pathToItemsFolder+'medicine\\') );

    parseResults.push( await ParseMeleeWeapon(pathToItemsFolder + 'weapon\\melee\\')
        .then(() => { return true; })
        .catch((e) => { console.error(e); return false; }));

    parseResults.push( await ParseWeapon(pathToItemsFolder+'weapon\\')
        .then(() => { return true; })
        .catch((e) => { console.error(e); return false; }));

    if (parseResults.filter(value => !value).length > 0) {
        console.error(parseResults.length+" unparsed categories after complete!")
    }
}

async function StartParse() {
    await ParseAllData('ru');
    await ParseAllData('global');
}


// START PROGRAM
PrepareData();
StartParse().then(r => {
    if (r != undefined)
        console.log(r)
    else
        console.log("Parsing complete!")
});
