import fs from "fs";
import { PathToParse } from '../Static/fileds';
import { MeleeWeaponSchema } from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    FindValueByKey, GetAndCopyIcons, MinimizeItemInfo,
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
        fs.writeFileSync(CategoryPath, JSON.stringify(MinimizeItemInfo(SortByGearRanksKeys(AllMeleeWeapons))));
        CreateSubFoldersAndItems(CategoryPath, SortByGearRanksKeys(AllMeleeWeapons));
        GetAndCopyIcons(pathToItemsFolder, server, 'melee');
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
                weight: FindLinesInValueByKey(dataJson, "core.tooltip.info.weight"),
                stats: [
                    {
                        unitKey: 'specialDamage',
                        key: "core.tooltip.stat_name.damage_type.frost",
                        value: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.frost", "int", null),
                        lines: {
                            ru: 'Морозный урон',
                            en: 'Frost damage'
                        }
                    },
                    {
                        unitKey: 'specialDamage',
                        key: "core.tooltip.stat_name.damage_type.burn",
                        value: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.burn", "int", null),
                        lines: {
                            ru: 'Огненный урон',
                            en: 'Burn damage'
                        }
                    },
                    {
                        unitKey: 'specialDamage',
                        key: "core.tooltip.stat_name.damage_type.chemical_burn",
                        value: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.chemical_burn", "int", null),
                        lines: {
                            ru: 'Химический урон',
                            en: 'Chemical burn damage'
                        }
                    },
                    {
                        unitKey: 'specialDamage',
                        key: "core.tooltip.stat_name.damage_type.default",
                        value: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.default", "int", null),
                        lines: {
                            ru: 'Чистый урон',
                            en: 'Pure damage'
                        }
                    },
                    {
                        unitKey: 'units',
                        key: null,
                        value:
                            FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.damage.min.common", "int", null)
                            + ' - ' +
                            FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.damage.max.common", "int", null),
                        lines: {
                            ru: 'Урон быстрого удара',
                            en: 'Quick hit damage'
                        }
                    },
                    {
                        unitKey: 'meters',
                        key: "weapon.tooltip.melee_weapon.info.reach.common",
                        value: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.reach.common", "float", 2),
                        lines: {
                            ru: 'Досягаемость (быстр)',
                            en: 'Reach distance (quick)'
                        }
                    },
                    {
                        unitKey: 'units',
                        key: null,
                        value:
                            FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.damage.min.strong", "int", null)
                            + ' - ' +
                            FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.damage.max.strong", "int", null),
                        lines: {
                            ru: 'Урон сильного удара',
                            en: 'Strong hit damage'
                        }
                    },
                    {
                        unitKey: 'meters',
                        key: "weapon.tooltip.melee_weapon.info.reach.strong",
                        value: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.info.reach.strong", "float", 2),
                        lines: {
                            ru: 'Досягаемость (сильн)',
                            en: 'Reach distance (strong)'
                        }
                    },
                    {
                        unitKey: 'percentage',
                        key: "weapon.tooltip.melee_weapon.stat_name.piercing",
                        value: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.stat_name.piercing", "int", null),
                        lines: {
                            ru: 'Пробиваемость',
                            en: 'Penetration'
                        }
                    },
                    {
                        unitKey: 'percentage',
                        key: "weapon.tooltip.melee_weapon.stat_name.bloodlust_chance",
                        value: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.stat_name.bloodlust_chance", "int", null),
                        lines: {
                            ru: 'Шанс глубокого ранения',
                            en: 'Chance for a deep wound'
                        }
                    }
                ],
                damageModifiers: [
                    {
                        unitKey: 'x',
                        key: "weapon.tooltip.melee_weapon.critical_hit_mod",
                        value: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.critical_hit_mod", "float", 1),
                        lines: {
                            ru: 'Множитель урона в спину',
                            en: 'BackStab damage multiplier'
                        }
                    },
                    {
                        unitKey: 'x',
                        key: "weapon.tooltip.melee_weapon.mutant_damage_mod",
                        value: FindValueByKey(dataJson, "weapon.tooltip.melee_weapon.mutant_damage_mod", "float", 1),
                        lines: {
                            ru: 'Множитель урона по мутантам',
                            en: 'Mutant damage multiplier'
                        }
                    }
                ],
                description: FindLinesByKey(dataJson, itemKey() + 'description')
            });
            AllMeleeWeapons.push(meleeWeapon);
        });
    }
}

