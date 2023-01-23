import fs from "fs";
import {pathToParse} from './pathToParse';
import { MeleeWeaponSchema } from "../itemSchemas";


// EXCLUDE DEVICE AND MELEE
export const ParseMeleeWeapon = async function ParseMeleeWeapon(pathToItemsFolder = ''): Promise<void> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        console.error('Parse Melee Weapon: incorrect or null path to folder');
        return;
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
        result += pathToParse + '\\' + server;
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
        fs.writeFileSync(resultFolder + '\\' + 'all melee.json', JSON.stringify(AllMeleeWeapons, null, 4));
    }).catch(e => {
        console.error(e);
    });
    ////////

    async function parseItemsInFolder(folderPath: string) {
        const SelectedCategoryWeapons: MeleeWeaponSchema[] = [];
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
                id: fileName,
                name: {
                    ru: dataJson.name.lines.ru,
                    en: dataJson.name.lines.en
                },
                color: dataJson.color,
                rank: FindLinesInValueByKey("core.tooltip.info.rank"),
                class: FindLinesInValueByKey("core.tooltip.info.category"),
                weight: FindValueByKey("core.tooltip.info.weight", "float", 1),
                quickHit:  {
                    minDamage: FindValueByKey("weapon.tooltip.melee_weapon.info.damage.min.common", "int", null),
                    maxDamage: FindValueByKey("weapon.tooltip.melee_weapon.info.damage.max.common", "int", null),
                    distance: FindValueByKey("weapon.tooltip.melee_weapon.info.reach.common", "float", 2)
                },
                strongHit:  {
                    minDamage: FindValueByKey("weapon.tooltip.melee_weapon.info.damage.min.strong", "int", null),
                    maxDamage: FindValueByKey("weapon.tooltip.melee_weapon.info.damage.max.strong", "int", null),
                    distance: FindValueByKey("weapon.tooltip.melee_weapon.info.reach.strong", "float", 2)
                },
                damageModifiers: {
                    backStabDamage: FindValueByKey("weapon.tooltip.melee_weapon.critical_hit_mod", "float", 1),
                    mobsDamage: FindValueByKey("weapon.tooltip.melee_weapon.mutant_damage_mod", "float", 1),
                    penetration: FindValueByKey("weapon.tooltip.melee_weapon.stat_name.piercing", "int", null),
                    chanceToDeepWound: FindValueByKey("weapon.tooltip.melee_weapon.stat_name.bloodlust_chance", "int", null),
                },
                damageFeatures: {
                    damageTypes: {
                        frostDamage: FindValueByKey("core.tooltip.stat_name.damage_type.frost", "int", null),
                        burnDamage: FindValueByKey("core.tooltip.stat_name.damage_type.burn", "int", null),
                        chemicalDamage: FindValueByKey("core.tooltip.stat_name.damage_type.chemical_burn", "int", null),
                        pureDamage: FindValueByKey("core.tooltip.stat_name.damage_type.default", "int", null)
                    }
                },
                description: FindLinesByKey(itemKey() + 'description')
            });
            SelectedCategoryWeapons.push(meleeWeapon);
        });

        SelectedCategoryWeapons.map(weapon => AllMeleeWeapons.push(weapon));
    }

    function FindLinesInValueByKey(searchingKey: string): object {
        const result: object = {
            ru: "null",
            en: "null"
        }

        for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
            if (dataJson.infoBlocks[i].elements != undefined)
                for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
                    for (const [key, value] of Object.entries(dataJson.infoBlocks[i].elements[j])) {
                        if ((key == 'key' || key == 'text') && (value as any).key as string == searchingKey) {
                            return dataJson.infoBlocks[i].elements[j].value.lines;
                        }
                    }
                }
        }

        return result;
    }

    function FindLinesByKey(searchingKey: string): object {
        const result: object = {
            ru: "null",
            en: "null"
        }

        for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
            if (dataJson.infoBlocks[i].elements != undefined)
                for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
                    for (const [key, value] of Object.entries(dataJson.infoBlocks[i].elements[j])) {
                        if ((key == 'key' || key == 'text') && (value as any).key as string == searchingKey) {
                            return (value as any).lines;
                        }
                    }
                }
        }

        if (searchingKey.split('.')[searchingKey.split('.').length - 1] == 'description') {
            for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
                if (dataJson.infoBlocks[i].type == 'text')
                    return dataJson.infoBlocks[i].text.lines;
            }
        }

        return result;
    }

    // [null, ...] == integer, ('f' || 'float') == float
    function FindValueByKey(searchingKey: string, type: string | null, roundValueIfFloat: number | null): string {
        let result: string = '0';

        const returnType: string =
            (type == 'f' || type == 'float')
                ? 'float'
                : 'integer';

        for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
            if (dataJson.infoBlocks[i].elements != undefined)
                for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
                    for (const [key, value] of Object.entries(dataJson.infoBlocks[i].elements[j])) {
                        if ((key == 'name' || key == 'key' || key == 'text') && (value as any).key as string == searchingKey) {
                            if (dataJson.infoBlocks[i].elements[j].value != null) {
                                result = dataJson.infoBlocks[i].elements[j].value as string;
                            } else if (Object.entries(dataJson.infoBlocks[i].elements[j].text.args).length > 0) {
                                result = dataJson.infoBlocks[i].elements[j].text.args.factor as string;
                            }
                        }
                    }
                }
        }

        switch (returnType) {
            case 'integer': {
                result = Number.parseInt(result).toString();
                break;
            }
            case 'float': {
                if (typeof roundValueIfFloat == 'number' && roundValueIfFloat > 0)
                    result = Number(result).toFixed(roundValueIfFloat);

                break;
            }
            default: {
                console.error("WHAT THE HELL???");
            }
        }

        return result;
    }

    // function FindFeatureByKey(searchingKey: string): object {
    //     for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
    //         if (dataJson.infoBlocks[i].elements != undefined)
    //             for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
    //                 for (const [key, value] of Object.entries(dataJson.infoBlocks[i].elements[j])) {
    //                     if (key == 'text' && (value as any).key as string == searchingKey) {
    //                         return dataJson.infoBlocks[i].elements[j].text.lines;
    //                     }
    //                 }
    //             }
    //     }
    //
    //     return {
    //         ru: "null",
    //         en: "null"
    //     }
    // }
}

