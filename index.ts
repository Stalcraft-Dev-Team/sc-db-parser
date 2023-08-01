// LIBS
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import {execSync} from 'child_process';
import {ItemProperties} from "./Static/itemProperties-class";
import {ParseMedicine} from './Parsing Functions/parseMedicine';
import {ParseWeapon} from './Parsing Functions/parseWeapon';
import {ParseMeleeWeapon} from './Parsing Functions/parseMeleeWeapon';
import {ParseAttachment} from "./Parsing Functions/parseAttachment";
import {ParseBullet} from "./Parsing Functions/parseBullet";
import {ParseDevice} from "./Parsing Functions/parseDevice";
import {ParseGrenade} from "./Parsing Functions/parseGrenade";
import {ParseContainer} from "./Parsing Functions/parseContainer";
import {ParseArtefact} from "./Parsing Functions/parseArtefact";
import {ParseArmor} from "./Parsing Functions/parseArmor";
import {ParseOther} from "./Parsing Functions/parseOther";
import {ParseBarterRecipes} from './Parsing Functions/parseBarterRecipes';
// END LIBS

// CONST'S
export const IndexDirName: string = __dirname;
import {UrlToSCDB, PathToClone, PathToParse} from "./Static/fileds";
import {DeleteDublicatesAndRejectedItems, MinimizeItemInfo} from "./Static/functions";
import {ParseStalcraftWikiArmor} from "./Parsing Functions/parseStalcraftWikiArmor";
import {ParseStalcraftWikiArtefact} from "./Parsing Functions/parseStalcraftWikiArtefact";
import {ParseStalcraftWikiContainer} from "./Parsing Functions/parseStalcraftWikiContainer";

const PathToDB: string = __dirname + '\\' + PathToClone;
const FoldersNeedsToPullInsteadOfClone: string[] = ['global', 'ru'];
const EnableNiceLookForJSON = true;

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
        case 'clean': {
            execSync(`git clean -dfx`, {
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
        fs.mkdirSync(PathToDB, {recursive: true});
        callGit('clone');
    } else {
        let allExists: boolean = true;
        FoldersNeedsToPullInsteadOfClone.map(value => {
            if (!fs.existsSync(PathToDB + '\\' + value)) {
                allExists = false;
            }
        })

        if (allExists) {
            callGit('pull');
            callGit('clean');
        } else {
            callGit('clone');
        }
    }

    console.log('\nClone/Pull was finished!\nStarting parsing...');

    fs.rmSync(__dirname + '\\' + PathToParse, {recursive: true, force: true});
}

async function ParseAllData(server = '') {
    ListingJSON = [];

    if (!(server === 'ru' || server === 'global')) {
        console.error('ParseAllData: incorrect server name.');
        return;
    }

    if (!fs.existsSync(__dirname + '\\' + PathToParse)) {
        fs.mkdirSync(__dirname + '\\' + PathToParse);
    }

    const pathToItemsFolder = PathToDB + '\\' + server + '\\' + 'items' + '\\';

    await ParseArmor(pathToItemsFolder + 'armor\\')
        .then(PushToListing)
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            console.log(server.toUpperCase() + ': ParseArmor: complete!');
        });

    await ParseArtefact(pathToItemsFolder + 'artefact\\')
        .then(PushToListing)
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            console.log(server.toUpperCase() + ': ParseArtefact: complete!');
        });

    await ParseContainer(pathToItemsFolder + 'containers\\')
        .then(PushToListing)
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            console.log(server.toUpperCase() + ': ParseContainer: complete!');
        });

    // await ParseBackpack(pathToItemsFolder+'backpack\\'); // юзлесс на данный момент

    await ParseMedicine(pathToItemsFolder + 'medicine\\')
        .then(PushToListing)
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            console.log(server.toUpperCase() + ': ParseMedicine: complete!');
        });

    await ParseWeapon(pathToItemsFolder + 'weapon\\')
        .then(PushToListing)
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            console.log(server.toUpperCase() + ': ParseWeapon: complete!');
        });

    await ParseAttachment(pathToItemsFolder + 'attachment\\')
        .then(PushToListing)
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            console.log(server.toUpperCase() + ': ParseAttachment: complete!');
        });

    await ParseBullet(pathToItemsFolder + 'bullet\\')
        .then(PushToListing)
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            console.log(server.toUpperCase() + ': ParseBullet: complete!');
        });

    await ParseMeleeWeapon(pathToItemsFolder + 'weapon\\melee\\')
        .then(PushToListing)
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            console.log(server.toUpperCase() + ': ParseMeleeWeapon: complete!');
        });

    await ParseGrenade(pathToItemsFolder + 'grenade\\')
        .then(PushToListing)
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            console.log(server.toUpperCase() + ': ParseGrenade: complete!');
        });

    await ParseDevice(pathToItemsFolder + 'weapon\\device\\')
        .then(PushToListing)
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            console.log(server.toUpperCase() + ': ParseDevice: complete!');
        });

    await ParseOther(pathToItemsFolder + 'other\\')
        .then(PushToListing)
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            console.log(server.toUpperCase() + ': ParseOther: complete!');
        });

    const PathToListing = IndexDirName + '\\' + PathToParse + '\\' + server + '\\' + 'listing.json';
    fs.writeFileSync(PathToListing, JSON.stringify(ListingJSON, null, 4));

    await ParseBarterRecipes(PathToListing, server)
        .then(() => {
            console.log(server.toUpperCase() + ': ParseBarterRecipes complete!')
        })
        .catch((err) => {
            if (err) console.error(err)
        });

}

async function ParseDataForStalcraftWiki(server = '') {
    if (!fs.existsSync(__dirname + '\\' + PathToParse)) {
        fs.mkdirSync(__dirname + '\\' + PathToParse);
    }

    const pathToItemsFolder = PathToDB + '\\' + server + '\\' + 'items' + '\\';

    await ParseStalcraftWikiArmor(pathToItemsFolder + 'armor\\')
      .then(PushToListing)
      .catch((e) => {
          console.error(e);
      })
      .finally(() => {
          console.log(server.toUpperCase() + ': ParseStalcraftWikiArmor: complete!');
      });

    await ParseStalcraftWikiArtefact(pathToItemsFolder + 'artefact\\')
      .then(PushToListing)
      .catch((e) => {
          console.error(e);
      })
      .finally(() => {
          console.log(server.toUpperCase() + ': ParseStalcraftWikiArtefact: complete!');
      });

    await ParseStalcraftWikiContainer(pathToItemsFolder + 'containers\\')
      .then(PushToListing)
      .catch((e) => {
          console.error(e);
      })
      .finally(() => {
          console.log(server.toUpperCase() + ': ParseStalcraftWikiContainer: complete!');
      });
}

async function StartParse() {
    // await ParseAllData('ru');
    // await ParseAllData('global');
    await ParseDataForStalcraftWiki('ru');
    await ParseDataForStalcraftWiki('global');
}

let ListingJSON: object[] = [];

function PushToListing(data: any[]): void {
    DeleteDublicatesAndRejectedItems(data).forEach((item: any) => ListingJSON.push({
        exbo_id: item.exbo_id,
        category: item.category,
        class: item.class,
        lines: item.lines,
        color: item.color
    }));
}

// START PROGRAM
PrepareData();
ItemProperties.Init();
StartParse()
    .then(() => {
        console.log("Parsing complete!");
        if (EnableNiceLookForJSON) {
            NiceLookForJSON('ru');
            // NiceLookForJSON('global');
        }
    })
    .catch((e) => {
        console.error(e);
    });
// END PROGRAM


// Optional
function NiceLookForJSON(server: string): void {
    ThroughDirectoryGetAllJSON(IndexDirName + '\\' + PathToParse + '\\' + server + '\\');
}

function ThroughDirectoryGetAllJSON(Directory: string) {
    fs.readdirSync(Directory)
        .forEach(File => {
            const Absolute = path.join(Directory, File);
            if (fs.statSync(Absolute).isDirectory()) return ThroughDirectoryGetAllJSON(Absolute);
            else if (Absolute.split('.')[1] === 'json') {
                const data: any = JSON.stringify(JSON.parse(fs.readFileSync(Absolute).toString()), null, 4);
                fs.writeFile(Absolute, data, (err) => {
                    if (err) console.error(err)
                });
            }
        });
}
