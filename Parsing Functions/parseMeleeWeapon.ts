import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {MeleeWeaponSchema} from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    FindValueByKey,
    SortByGearRanksKeys
} from "../Static/functions";


export const ParseMeleeWeapon = async function ParseMeleeWeapon(pathToItemsFolder = ''): Promise<object[]> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        throw new Error('ParseMeleeWeapon: incorrect or null path to folder');
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

    const resultFolder = RegionalPathToParse + '\\' + 'melee';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    ////////
    const AllMeleeWeapons: MeleeWeaponSchema[] = [];
    let dataJson: any;
    parseItemsInFolder(pathToItemsFolder).then(() => {
        const CategoryPath = resultFolder + '\\' + `all_melee.json`;
        fs.writeFile(CategoryPath, JSON.stringify(SortByGearRanksKeys(AllMeleeWeapons), null, 4), () => {
            CreateSubFoldersAndItems(CategoryPath);
        });
    }).catch(e => {
        console.error(e);
    });

    return SortByGearRanksKeys(AllMeleeWeapons); /* IMPORTANT */
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

            const meleeWeapon = new MeleeWeaponSchema({
                exbo_id: fileName,
                key: dataJson.name.key,
                name: dataJson.name.lines,
                color: dataJson.color,
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                weight: FindValueByKey(dataJson, "core.tooltip.info.weight", "float", 2),
                quickHit: {
                    minDamage: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.damage.min.common", "int", null),
                    maxDamage: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.damage.max.common", "int", null),
                    distance: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.reach.common", "float", 2)
                },
                strongHit: {
                    minDamage: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.damage.min.strong", "int", null),
                    maxDamage: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.damage.max.strong", "int", null),
                    distance: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.reach.strong", "float", 2)
                },
                damageModifiers: {
                    backStabDamage: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.critical_hit_mod", "float", 1),
                    mobsDamage: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.mutant_damage_mod", "float", 1),
                    penetration: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.stat_name.piercing", "int", null),
                    chanceToDeepWound: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.stat_name.bloodlust_chance", "int", null),
                },
                damageFeatures: {
                    damageTypes: {
                        frostDamage: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.frost", "int", null),
                        burnDamage: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.burn", "int", null),
                        chemicalDamage: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.chemical_burn", "int", null),
                        pureDamage: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.default", "int", null)
                    }
                },
                description: FindLinesByKey(dataJson, itemKey() + 'description')
            });
            AllMeleeWeapons.push(meleeWeapon);
        });
    }
}

