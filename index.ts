// LIBS
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
import { ParseMedicine } from './Parsing Functions/parseMedicine';
import { ParseWeapon } from './Parsing Functions/parseWeapon';
import { ParseMeleeWeapon } from './Parsing Functions/parseMeleeWeapon';
import { ItemProperties } from "./Static/itemProperties-class";

// END LIBS

// CONST'S
import { UrlToSCDB, PathToClone, PathToParse } from "./Static/fileds";
import {WeaponSchema} from "./itemSchemas";
import {ParseAttachment} from "./Parsing Functions/parseAttachment";
import {ParseBullet} from "./Parsing Functions/parseBullet";
import {ParseDevice} from "./Parsing Functions/parseDevice";
import {ParseGrenade} from "./Parsing Functions/parseGrenade";
import {ParseContainer} from "./Parsing Functions/parseContainer";
import {ParseArtefact} from "./Parsing Functions/parseArtefact";
import {ParseArmor} from "./Parsing Functions/parseArmor";
export const IndexDirName: string = __dirname;
const PathToDB: string = __dirname+'\\'+PathToClone;
const FoldersNeedsToPullInsteadOfClone: string[] = ['global', 'ru'];
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

    if (!fs.existsSync(__dirname+'\\'+PathToParse)) {
        fs.mkdirSync(__dirname+'\\'+PathToParse, { recursive: true });
    }

    const pathToItemsFolder = PathToDB+'\\'+server+'\\'+'items'+'\\';

    await ParseArmor(pathToItemsFolder+'armor\\')
        .then(() => { console.log (server.toUpperCase()+': ParseArmor: complete!'); })
        .catch((e) => { console.error(e); });

    await ParseArtefact(pathToItemsFolder+'artefact\\')
        .then(() => { console.log (server.toUpperCase()+': ParseArtefact: complete!'); })
        .catch((e) => { console.error(e); });

    await ParseContainer(pathToItemsFolder+'containers\\')
        .then(() => { console.log (server.toUpperCase()+': ParseContainer: complete!'); })
        .catch((e) => { console.error(e); });

    // await ParseBackpack(pathToItemsFolder+'backpack\\'); // юзлесс на данный момент

    await ParseMedicine(pathToItemsFolder+'medicine\\')
        .then(() => { console.log (server.toUpperCase()+': ParseMedicine: complete!'); })
        .catch((e) => { console.error(e); });

    await ParseWeapon(pathToItemsFolder+'weapon\\')
        .then(() => { console.log (server.toUpperCase()+': ParseWeapon: complete!'); })
        .catch((e) => { console.error(e); });

    await ParseAttachment(pathToItemsFolder+'attachment\\')
        .then(() => { console.log (server.toUpperCase()+': ParseAttachment: complete!'); })
        .catch((e) => { console.error(e); });

    await ParseBullet(pathToItemsFolder+'bullet\\')
        .then(() => { console.log (server.toUpperCase()+': ParseBullet: complete!'); })
        .catch((e) => { console.error(e); });

    await ParseMeleeWeapon(pathToItemsFolder + 'weapon\\melee\\')
        .then(() => { console.log (server.toUpperCase()+': ParseMeleeWeapon: complete!'); })
        .catch((e) => { console.error(e); });

    await ParseGrenade(pathToItemsFolder+'grenade\\')
        .then(() => { console.log (server.toUpperCase()+': ParseGrenade: complete!'); })
        .catch((e) => { console.error(e); });

    await ParseDevice(pathToItemsFolder+'weapon\\device\\')
        .then(() => { console.log (server.toUpperCase()+': ParseDevice: complete!'); })
        .catch((e) => { console.error(e); });

}

async function StartParse() {
    await ParseAllData('ru');
    await ParseAllData('global');
}


// START PROGRAM
PrepareData();
ItemProperties.Init();
StartParse()
    .then(() => {
        console.log("Parsing complete!")
    })
    .catch((e) => {
        console.error(e);
    });
