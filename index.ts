// LIBS
import fs from "fs";
const path = require('path');
import { execSync } from 'child_process';
import { ItemProperties } from "./Static/itemProperties-class";
import { ParseMedicine } from './Parsing Functions/parseMedicine';
import { ParseWeapon } from './Parsing Functions/parseWeapon';
import { ParseMeleeWeapon } from './Parsing Functions/parseMeleeWeapon';
import { ParseAttachment } from "./Parsing Functions/parseAttachment";
import { ParseBullet } from "./Parsing Functions/parseBullet";
import { ParseDevice } from "./Parsing Functions/parseDevice";
import { ParseGrenade } from "./Parsing Functions/parseGrenade";
import { ParseContainer } from "./Parsing Functions/parseContainer";
import { ParseArtefact } from "./Parsing Functions/parseArtefact";
import { ParseArmor } from "./Parsing Functions/parseArmor";
import { ParseOther } from "./Parsing Functions/parseOther";
import { ParseBarterRecipes } from "./Parsing Functions/parseBarterRecipes";
// END LIBS

// CONST'S
export const IndexDirName: string = __dirname;
import { UrlToSCDB, PathToClone, PathToParse } from "./Static/fileds";
import Path from "path";
const PathToDB: string = __dirname+'\\'+PathToClone;
const FoldersNeedsToPullInsteadOfClone: string[] = ['global', 'ru'];
const EnableNiceLookForJSON = false;
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
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseArmor: complete!');
        });

    await ParseArtefact(pathToItemsFolder+'artefact\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseArtefact: complete!');
        });

    await ParseContainer(pathToItemsFolder+'containers\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseContainer: complete!');
        });

    // await ParseBackpack(pathToItemsFolder+'backpack\\'); // юзлесс на данный момент

    await ParseMedicine(pathToItemsFolder+'medicine\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseMedicine: complete!');
        });

    await ParseWeapon(pathToItemsFolder+'weapon\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseWeapon: complete!');
        });

    await ParseAttachment(pathToItemsFolder+'attachment\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseAttachment: complete!');
        });

    await ParseBullet(pathToItemsFolder+'bullet\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseBullet: complete!');
        });

    await ParseMeleeWeapon(pathToItemsFolder + 'weapon\\melee\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseMeleeWeapon: complete!');
        });

    await ParseGrenade(pathToItemsFolder+'grenade\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseGrenade: complete!');
        });

    await ParseDevice(pathToItemsFolder+'weapon\\device\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseDevice: complete!');
        });

    if (server != 'global')
    await ParseOther(pathToItemsFolder+'other\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseOther: complete!');
        });


    const PathToListing = __dirname+'\\'+PathToParse+'\\'+server+'\\'+'listing.json';
    fs.writeFileSync(PathToListing, JSON.stringify(ListingJSON, null, 4));

    if (server == 'ru') {
        await ParseBarterRecipes(PathToListing)
            .then(() => { console.log('Parse barter recipes complete!') })
            .catch((err) => { if (err) console.error(err) });
    }
}

async function StartParse() {
    await ParseAllData('ru').then(() => { if (EnableNiceLookForJSON) NiceLookForJSON('ru'); });
    await ParseAllData('global').then(() => { if (EnableNiceLookForJSON) NiceLookForJSON('global'); })
}

const ListingJSON: object[] = [];
function PushToListing(data: object[]): void {
    const UniqueSubCategories: string[] = [];
    data.forEach((item: any) => {
        if (UniqueSubCategories.indexOf(item.class.en) == -1) {
            UniqueSubCategories.push(item.class.en);
        }
    });

    data.forEach((item: any) => ListingJSON.push({
        exbo_id: item.exbo_id,
        category: UniqueSubCategories.length > 1 ? item.category : item.class,
        name: item.name,
        color: item.color
    }))
}

// START PROGRAM
PrepareData();
ItemProperties.Init();
StartParse()
    .then(() => {
        console.log("Parsing complete!");
    })
    .catch((e) => {
        console.error(e);
    });

// END PROGRAM

function NiceLookForJSON(server: string): void {
    ThroughDirectoryGetAllJSON(IndexDirName + '\\' + PathToParse + '\\' + server + '\\');

    if (server == 'ru') {
        const PathToRecipes = IndexDirName + '\\' + PathToParse + '\\' + 'recipes';
        const files = fs.readdirSync(PathToRecipes);
        files.forEach(file => {
            const fileJson = JSON.parse(fs.readFileSync(`${PathToRecipes}\\${file}`).toString());
            fs.writeFile(`${PathToRecipes}\\${file}`, JSON.stringify(fileJson, null, 4), (err) => {
                if (err)
                    console.error(err);
            });
        })
    }
}

function ThroughDirectoryGetAllJSON(Directory: string) {
    fs.readdirSync(Directory).forEach(File => {
        const Absolute = Path.join(Directory, File);
        if (fs.statSync(Absolute).isDirectory()) return ThroughDirectoryGetAllJSON(Absolute);
        else if (Absolute.split('.')[1] == 'json') {
            const data: any = JSON.stringify(JSON.parse(fs.readFileSync(Absolute).toString()), null, 4);
            fs.writeFile(Absolute, data, (err) => { if (err)  console.error(err) });
        }
    });
}