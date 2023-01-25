import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {GrenadeSchema} from "../itemSchemas";
import {FindLinesByKey, FindLinesInValueByKey, FindValueByKey, SortByGearRanksKeys} from "../Static/functions";


export const ParseGrenade = async function ParseGrenade(pathToItemsFolder = ''): Promise<void> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        throw new Error('ParseGrenade: incorrect or null path to folder');
    }

    let server: string;
    if (pathToItemsFolder.split('\\').filter(folderName => folderName == 'ru').length > 0) {
        server = 'ru';
    } else {
        server = 'global';
    }

    function RPToP(): string {
        let result: string = '';
        let dirname: string[] = __dirname.split('\\');
        for (let i = 0; i < dirname.length - 1; i++) {
            result += dirname[i] + '\\';
        }
        result += PathToParse + '\\' + server;
        return result;
    }

    const RegionalPathToParse: string = RPToP();
    if (!fs.existsSync(RegionalPathToParse)) {
        fs.mkdirSync(RegionalPathToParse);
    }

    const resultFolder = RegionalPathToParse + '\\' + 'grenades';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    ////////
    const AllGrenades: GrenadeSchema[] = [];
    let dataJson: any;
    parseItemsInFolder(pathToItemsFolder).then(() => {
        fs.writeFileSync(resultFolder + '\\' + 'all grenades.json', JSON.stringify(AllGrenades, null, 4));
    }).catch(e => {
        console.error(e);
    });
    ////////

    async function parseItemsInFolder(folderPath: string) {
        const files: string[] = fs.readdirSync(folderPath);

        files.map((file) => {
            const fileName: string = file.split('.')[0];
            file = folderPath + file;

            const data: Buffer = fs.readFileSync(file);
            dataJson = JSON.parse(data.toString());

            const itemKey = () => {
                const keys: string[] = (dataJson.name.key).split('.');
                let result: string = '';
                for (let i = 0; i < keys.length - 1; i++) {
                    result += keys[i] + '.';
                }

                return result;
            };

            const grenade = new GrenadeSchema({
                exbo_id: fileName,
                key: dataJson.name.key,
                name: dataJson.name.lines,
                color: dataJson.color,
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                weight: FindValueByKey(dataJson, "core.tooltip.info.weight", "float", 1),
                stats: {
                    maxDamage: FindValueByKey(dataJson, "weapon.grenade.frag.stats.info.explosion_strength", 'int', null),
                    minDamage: FindValueByKey(dataJson, "weapon.grenade.frag.stats.info.explosion_strength_min", 'int', null),
                    range: FindValueByKey(dataJson, "weapon.grenade.frag.stats.info.explosion_size", 'float', 1),
                    timeUntilDetonation: FindValueByKey(dataJson, "weapon.grenade.frag.stats.info.lifetime", 'int', null),
                    maxFlashTime: FindValueByKey(dataJson, "weapon.grenade.flash.stats.info.flash_time", 'int', null),
                    hasContactExplosion: (FindLinesByKey(dataJson, "weapon.grenade.frag.stats.explosion_on_collide") as any).en != 'null' ? '1' : '0',
                    fuzeTime: FindValueByKey(dataJson, "weapon.grenade.frag.stats.info.explosion_activation_time", 'float', 2),
                },
                features: {},
                description: FindLinesByKey(dataJson, itemKey() + 'description')
            });

            if ((grenade.stats as any).maxFlashTime != '0') {

                (grenade.stats as any).range =
                    FindValueByKey(dataJson, "weapon.grenade.flash.stats.info.explosion_size", 'float', 1);

                (grenade.stats as any).timeUntilDetonation =
                    FindValueByKey(dataJson, "weapon.grenade.flash.stats.info.lifetime", 'float', 1);

            }

            AllGrenades.push(grenade);
        });
    }
}

