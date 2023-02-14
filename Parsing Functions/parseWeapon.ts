import fs from "fs";
import { PathToParse } from '../Static/fileds';
import { WeaponSchema } from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    FindValueByKey, GetAndCopyIcons, MinimizeItemInfo,
    SortByGearRanksKeys
} from "../Static/functions";


// EXCLUDE DEVICE AND MELEE
export const ParseWeapon = async function ParseWeapon(pathToItemsFolder = ''): Promise<object[]> {
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

    const resultFolder = RegionalPathToParse + '\\' + 'weapon';
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
    });

    fs.writeFileSync(resultFolder + '\\' + 'all_weapons.json', JSON.stringify(MinimizeItemInfo(SortByGearRanksKeys(AllWeapons))));
    GetAndCopyIcons(pathToItemsFolder, server, 'weapon');

    return SortByGearRanksKeys(AllWeapons); /* IMPORTANT */
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
                lines: dataJson.name.lines,
                color: dataJson.color,
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                weight: FindLinesInValueByKey(dataJson, "core.tooltip.info.weight"),
                ammoType: FindLinesInValueByKey(dataJson, "weapon.tooltip.weapon.info.ammo_type"),
                stats: [
                    {
                        unitKey: null,
                        key: 'core.tooltip.stat_name.damage_type.direct',
                        value: DamagesAndDistances.startDamage == undefined
                            ? FindValueByKey(dataJson, 'core.tooltip.stat_name.damage_type.direct', 'int', null)
                            : DamagesAndDistances.startDamage.toString(),
                        mutatedValue: null,
                        lines: {
                           ru: 'Урон',
                           en: 'Damage'
                        }
                    },
                    {
                        unitKey: null,
                        key: 'core.tooltip.stat_name.damage_type.endDamage',
                        value: DamagesAndDistances.endDamage,
                        mutatedValue: null,
                        lines: {
                            ru: 'Мин. урон',
                            en: 'End damage'
                        }
                    },
                    {
                        unitKey: null,
                        key: 'core.tooltip.stat_name.damage_type.damageDecreaseStart',
                        value: DamagesAndDistances.damageDecreaseStart,
                        mutatedValue: null,
                        lines: {
                            ru: 'Начало падения урона',
                            en: 'Damage decrease start'
                        }
                    },
                    {
                        unitKey: null,
                        key: 'core.tooltip.stat_name.damage_type.damageDecreaseEnd',
                        value: DamagesAndDistances.damageDecreaseEnd,
                        mutatedValue: null,
                        lines: {
                            ru: 'Конец падения урона',
                            en: 'Damage decrease end'
                        }
                    },
                    {
                        unitKey: null,
                        key: 'core.tooltip.stat_name.damage_type.maxDistance',
                        value: DamagesAndDistances.maxDistance,
                        mutatedValue: null,
                        lines: {
                            ru: 'Максимальная дистанция',
                            en: 'Max distance'
                        }
                    },
                    {
                        unitKey: null,
                        key: "weapon.tooltip.weapon.info.clip_size",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.clip_size", "int", null),
                        mutatedValue: null,
                        lines: {
                            ru: 'Объем магазина',
                            en: 'Ammo capacity'
                        }
                    },
                    {
                        unitKey: 'firerate',
                        key: "weapon.tooltip.weapon.info.rate_of_fire",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.rate_of_fire", "int", null),
                        mutatedValue: null,
                        lines: {
                            ru: 'Скорострельность',
                            en: 'Rate of fire'
                        }
                    },
                    {
                        unitKey: 'time',
                        key: "weapon.tooltip.weapon.info.reload_time",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.reload_time", "float", 2),
                        mutatedValue: null,
                        lines: {
                            ru: 'Время перезарядки',
                            en: 'Reload time'
                        }
                    },
                    {
                        unitKey: 'time',
                        key: "weapon.tooltip.weapon.info.tactical_reload_time",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.tactical_reload_time", "float", 2),
                        mutatedValue: null,
                        lines: {
                            ru: 'Время тактической перезарядки',
                            en: 'Tactical reload time'
                        }
                    },
                    {
                        unitKey: 'degrees',
                        key: "weapon.tooltip.weapon.info.spread",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.spread", "float", 2),
                        mutatedValue: null,
                        lines: {
                            ru: 'Разброс',
                            en: 'Spread'
                        }
                    },
                    {
                        unitKey: 'degrees',
                        key: "weapon.tooltip.weapon.info.hip_spread",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.hip_spread", "float", 2),
                        mutatedValue: null,
                        lines: {
                            ru: 'Разброс от бедра',
                            en: 'Hip spread'
                        }
                    },
                    {
                        unitKey: 'degrees',
                        key: "weapon.tooltip.weapon.info.recoil",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.recoil", "float", 2),
                        mutatedValue: null,
                        lines: {
                            ru: 'Вертикальная отдача',
                            en: 'Vertical recoil'
                        }
                    },
                    {
                        unitKey: 'degrees',
                        key: "weapon.tooltip.weapon.info.horizontal_recoil",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.horizontal_recoil", "float", 2),
                        mutatedValue: null,
                        lines: {
                            ru: 'Горизонтальная отдача',
                            en: 'Horizontal recoil'
                        }
                    },
                    {
                        unitKey: 'time',
                        key: "weapon.tooltip.weapon.info.draw_time",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.draw_time", "float", 2),
                        mutatedValue: null,
                        lines: {
                            ru: 'Время доставания',
                            en: 'Draw time'
                        }
                    },
                    {
                        unitKey: 'time',
                        key: "weapon.tooltip.weapon.info.aim_switch",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.aim_switch", "float", 2),
                        mutatedValue: null,
                        lines: {
                            ru: 'Скорость прицеливания',
                            en: 'Aiming time'
                        }
                    },
                ],
                features: [
                    {
                        unitKey: 'uniqueFeature',
                        key: null,
                        value: null,
                        lines: FindLinesByKey(dataJson, itemKey() + 'features')
                    },
                    {
                        unitKey: 'burnDamage',
                        key: null,
                        value: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.burn", "float", 2),
                        lines: {
                            ru: 'Огненный урон',
                            en: 'Burn damage'
                        }
                    },
                    {
                        unitKey: 'pureDamage',
                        key: null,
                        value: FindValueByKey(dataJson, "core.tooltip.stat_name.damage_type.default", "float", 2),
                        lines: {
                            ru: 'Чистый урон',
                            en: 'Pure damage'
                        }
                    },
                ],
                damageModifiers: [
                    {
                        unitKey: 'x',
                        key: null,
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.head_damage_modifier", "float", 2),
                        lines: {
                            ru: 'Множитель урона в голову',
                            en: 'Headshot damage multiplier'
                        }
                    },
                    {
                        unitKey: 'x',
                        key: null,
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.limbs_damage_modifier", "float", 2),
                        lines: {
                            ru: 'Множитель урона по конечностям',
                            en: 'Limbs damage multiplier'
                        }
                    },
                    {
                        unitKey: 'x',
                        key: null,
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.mobs_damage_multiplier", "float", 2),
                        lines: {
                            ru: 'Множитель урона по мутантам',
                            en: 'Mutant damage multiplier'
                        }
                    },
                    {
                        unitKey: null,
                        key: null,
                        value: null,
                        lines: FindFeatureByKey("weapon.tooltip.weapon.constancy_damage_modifier")
                    },
                    {
                        unitKey: null,
                        key: null,
                        value: null,
                        lines: FindFeatureByKey("weapon.tooltip.weapon.execute_damage_modifier")
                    },
                ],
                additionalStats: [
                    {
                        unitKey: 'pierce',
                        key: "weapon.tooltip.weapon.info.piercing",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.piercing", "int", null),
                        mutatedValue: null,
                        lines: {
                            ru: 'Бронебойность',
                            en: 'Pierce'
                        }
                    },
                    {
                        unitKey: 'bleeding',
                        key: "weapon.tooltip.weapon.info.bleeding",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.bleeding", "int", null),
                        mutatedValue: null,
                        lines: {
                            ru: 'Кровотечение',
                            en: 'Bleeding'
                        }
                    },
                    {
                        unitKey: 'stoppingPower',
                        key: "weapon.tooltip.weapon.info.stopping_power",
                        value: FindValueByKey(dataJson, "weapon.tooltip.weapon.info.stopping_power", "int", null),
                        mutatedValue: null,
                        lines: {
                            ru: 'Останавливающая сила',
                            en: 'Stopping power'
                        }
                    },
                ],
                description: FindLinesByKey(dataJson, itemKey() + 'description')
            });

            SelectedCategoryWeapons.push(weapon);
        });

        const CategoryName = folderPath.split('\\')[folderPath.split('\\').length - 2];
        const CategoryPath = `${resultFolder}\\${CategoryName}.json`;
        fs.writeFileSync(CategoryPath, JSON.stringify(SortByGearRanksKeys(SelectedCategoryWeapons)));
        CreateSubFoldersAndItems(CategoryPath, undefined);

        SelectedCategoryWeapons.map(weapon => AllWeapons.push(weapon));
    }

    function FindFeatureByKey(searchingKey: string): object | null {
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

        return null;
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

