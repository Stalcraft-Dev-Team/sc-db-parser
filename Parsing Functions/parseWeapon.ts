import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {WeaponSchema} from "../itemSchemas";
import {FindLinesByKey, FindLinesInValueByKey, FindValueByKey, SortByGearKeys} from "../Static/functions";


// EXCLUDE DEVICE AND MELEE
export const ParseWeapon = async function ParseWeapon(pathToItemsFolder = ''): Promise<void> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        throw new Error('ParseWeapon: incorrect or null path to folder');
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

    const resultFolder = RegionalPathToParse + '\\' + 'weapons';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    ////////
    const subFolders: string[] = [];
    fs.readdirSync(pathToItemsFolder, {withFileTypes: true})
        .filter((dirent: { isDirectory: () => boolean; }) => dirent.isDirectory())
        .map((dirent: { name: string; }) => {
            if (dirent.name != "device" && dirent.name != "melee") {
                subFolders.push(dirent.name);
            }
        });

    const AllWeapons: WeaponSchema[] = [];
    let dataJson: any;
    subFolders.map(async folder => {
        await parseItemsInFolder(pathToItemsFolder + folder + '\\');
    })
    fs.writeFileSync(resultFolder + '\\' + 'all weapons.json', JSON.stringify(SortByGearKeys(AllWeapons), null, 4));

    ////////

    async function parseItemsInFolder(folderPath: string) {
        const SelectedCategoryWeapons: WeaponSchema[] = [];
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

            const DamagesAndDistances: any = GetInfoBlockWithDamagesAndDistances();
            const weapon = new WeaponSchema({
                exbo_id: fileName,
                key: dataJson.name.key,
                name: dataJson.name.lines,
                color: dataJson.color,
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                weight: FindValueByKey(dataJson, "core.tooltip.info.weight", "float", 1),
                ammoType: FindLinesInValueByKey(dataJson, "weapon.tooltip.weapon.info.ammo_type"),
                startDamage: {
                    defaultValue: DamagesAndDistances.startDamage == undefined
                        ? FindValueByKey(dataJson, 'core.tooltip.stat_name.damage_type.direct', 'int', null)
                        : DamagesAndDistances.startDamage,
                    mutatedValue: 'null'
                },
                endDamage: {
                    defaultValue: DamagesAndDistances.endDamage,
                    mutatedValue: 'null'
                },
                startDistance: {
                    defaultValue: DamagesAndDistances.damageDecreaseStart,
                    mutatedValue: 'null'
                },
                endDistance: {
                    defaultValue: DamagesAndDistances.damageDecreaseEnd,
                    mutatedValue: 'null'
                },
                maxDistance: {
                    defaultValue: DamagesAndDistances.maxDistance,
                    mutatedValue: 'null'
                },
                ammoCapacity: {
                    defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.clip_size", "int", null),
                    mutatedValue: 'null'
                },
                rateOfFire: {
                    defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.rate_of_fire", "int", null),
                    mutatedValue: 'null'
                },
                reloadTime: {
                    defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.reload_time", "float", 1),
                    mutatedValue: 'null'
                },
                tacticalReloadTime: {
                    defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.tactical_reload_time", "float", 1),
                    mutatedValue: 'null'
                },
                spread: {
                    defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.spread", "float", 2),
                    mutatedValue: 'null'
                },
                hipSpread: {
                    defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.hip_spread", "float", 2),
                    mutatedValue: 'null'
                },
                verticalRecoil: {
                    defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.recoil", "float", 2),
                    mutatedValue: 'null'
                },
                horizontalRecoil: {
                    defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.horizontal_recoil", "float", 2),
                    mutatedValue: 'null'
                },
                drawTime: {
                    defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.draw_time", "float", 2),
                    mutatedValue: 'null'
                },
                aimTime: {
                    defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.aim_switch", "float", 2),
                    mutatedValue: 'null'
                },
                damageModifiers: {
                    head: FindValueByKey(dataJson, "weapon.tooltip.weapon.head_damage_modifier", "float", 2),
                    mobsDamage: FindValueByKey(dataJson, "weapon.tooltip.weapon.mobs_damage_multiplier", "float", 2),
                    limbs: '0.5',
                    pierce: {
                        defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.piercing", "int", null),
                        mutatedValue: 'null'
                    },
                    bleeding: {
                        defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.bleeding", "int", null),
                        mutatedValue: 'null'
                    },
                    stoppingPower: {
                        defaultValue: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.stopping_power", "int", null),
                        mutatedValue: 'null'
                    },
                },
                damageFeatures: {
                    damageIncreasing: FindFeatureByKey("weapon.tooltip.weapon.constancy_damage_modifier"),
                    executeModifier: FindFeatureByKey("weapon.tooltip.weapon.execute_damage_modifier"),
                    uniqueFeature: FindLinesByKey(dataJson, itemKey() + 'features'),
                    damageTypes: {
                        burnDamage: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.burn", "float", 2),
                        pureDamage: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.default", "float", 2)
                    }
                },
                description: FindLinesByKey(dataJson, itemKey() + 'description')
            });
            switch (true) {
                case weapon.endDamage.defaultValue == undefined: {
                    delete (weapon as any).endDamage;
                }
                case weapon.startDistance.defaultValue == undefined: {
                    delete (weapon as any).startDistance;
                }
                case weapon.endDistance.defaultValue == undefined: {
                    delete (weapon as any).endDistance;
                }
                case weapon.maxDistance.defaultValue == undefined: {
                    delete (weapon as any).maxDistance;
                }
            }
            SelectedCategoryWeapons.push(weapon);
        });

        const CategoryName = folderPath.split('\\')[folderPath.split('\\').length - 2];
        fs.writeFile(resultFolder + '\\' + `${CategoryName}.json`, JSON.stringify(SortByGearKeys(SelectedCategoryWeapons), null, 4), (e) => {
            if (e) console.error(e);
        });
        SelectedCategoryWeapons.map(weapon => AllWeapons.push(weapon));
    }

    function FindFeatureByKey(searchingKey: string): object {
        for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
            if (dataJson.infoBlocks[i].elements != undefined)
                for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
                    for (const [key, value] of Object.entries(dataJson.infoBlocks[i].elements[j])) {
                        if (key == 'text' && (value as any).key as string == searchingKey) {
                            return dataJson.infoBlocks[i].elements[j].text.lines;
                        }
                    }
                }
        }

        return {
            ru: "null",
            en: "null"
        }
    }

    function GetInfoBlockWithDamagesAndDistances(): object {
        for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
            if (dataJson.infoBlocks[i].type == "damage") {
                return dataJson.infoBlocks[i];
            }
        }

        return {};
    }
}

