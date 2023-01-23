import fs from "fs";
import {pathToParse} from './pathToParse';
import {WeaponSchema} from "../itemSchemas";


// EXCLUDE DEVICE AND MELEE
export const ParseWeapon = async function ParseWeapon(pathToItemsFolder = ''): Promise<void> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        console.error('ParseWeapon: incorrect or null path to folder');
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

    const resultFolder = RegionalPathToParse + '\\' + 'weapons';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    const subFolders: string[] = [];
    fs.readdirSync(pathToItemsFolder, {withFileTypes: true})
        .filter((dirent: { isDirectory: () => boolean; }) => dirent.isDirectory())
        .map((dirent: { name: string; }) => {
            if (dirent.name != "device" && dirent.name != "melee") {
                subFolders.push(dirent.name);
            }
        });

    ////////
    const AllWeapons: WeaponSchema[] = [];
    let dataJson: any;
    if (subFolders.length == 0) {
        await parseItemsInFolder(pathToItemsFolder)
            .then(() => {
                fs.writeFileSync(resultFolder + '\\' + 'all weapons.json', JSON.stringify(AllWeapons, null, 4));
            })
            .catch((e) => {
                console.error(e);
            });
    } else {
        subFolders.map(async folder => {
            await parseItemsInFolder(pathToItemsFolder + folder + '\\');
        })
    }
    fs.writeFileSync(resultFolder + '\\' + 'all weapons.json', JSON.stringify(AllWeapons, null, 4));
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
                id: fileName,
                name: {
                    ru: dataJson.name.lines.ru,
                    en: dataJson.name.lines.en
                },
                color: dataJson.color,
                rank: FindLinesInValueByKey("core.tooltip.info.rank"),
                class: FindLinesInValueByKey("core.tooltip.info.category"),
                weight: FindValueByKey("core.tooltip.info.weight", "float", 1),
                ammoType: FindLinesInValueByKey("weapon.tooltip.weapon.info.ammo_type"),
                startDamage: DamagesAndDistances.startDamage == undefined
                    ? FindValueByKey('core.tooltip.stat_name.damage_type.direct', 'int', null)
                    : DamagesAndDistances.startDamage,
                endDamage: DamagesAndDistances.endDamage,
                startDistance: DamagesAndDistances.damageDecreaseStart,
                endDistance: DamagesAndDistances.damageDecreaseEnd,
                maxDistance: DamagesAndDistances.maxDistance,
                ammoCapacity: FindValueByKey("weapon.tooltip.weapon.info.clip_size", "int", null),
                rateOfFire: FindValueByKey("weapon.tooltip.weapon.info.rate_of_fire", "int", null),
                reloadTime: FindValueByKey("weapon.tooltip.weapon.info.reload_time", "float", 1),
                tacticalReloadTime: FindValueByKey("weapon.tooltip.weapon.info.tactical_reload_time", "float", 1),
                spread: FindValueByKey("weapon.tooltip.weapon.info.spread", "float", 2),
                hipSpread: FindValueByKey("weapon.tooltip.weapon.info.hip_spread", "float", 2),
                verticalRecoil: FindValueByKey("weapon.tooltip.weapon.info.recoil", "float", 2),
                horizontalRecoil: FindValueByKey("weapon.tooltip.weapon.info.horizontal_recoil", "float", 2),
                drawTime: FindValueByKey("weapon.tooltip.weapon.info.draw_time", "float", 2),
                aimTime: FindValueByKey("weapon.tooltip.weapon.info.aim_switch", "float", 2),
                damageModifiers: {
                    head: FindValueByKey("weapon.tooltip.weapon.head_damage_modifier", "float", 2),
                    mobsDamage: FindValueByKey("weapon.tooltip.weapon.mobs_damage_multiplier", "float", 2),
                    limbs: '0.5',
                    pierce: FindValueByKey("weapon.tooltip.weapon.info.piercing", "int", null),
                    bleeding: FindValueByKey("weapon.tooltip.weapon.info.bleeding", "int", null),
                    stoppingPower: FindValueByKey("weapon.tooltip.weapon.info.stopping_power", "int", null),
                },
                damageFeatures: {
                    damageIncreasing: FindFeatureByKey("weapon.tooltip.weapon.constancy_damage_modifier"),
                    executeModifier: FindFeatureByKey("weapon.tooltip.weapon.execute_damage_modifier"),
                    uniqueFeature: FindLinesByKey(itemKey() + 'features'),
                    damageTypes: {
                        burnDamage: FindValueByKey("core.tooltip.stat_name.damage_type.burn", "float", 2),
                        pureDamage: FindValueByKey("core.tooltip.stat_name.damage_type.default", "float", 2)
                    }
                },
                description: FindLinesByKey(itemKey() + 'description')
            });
            SelectedCategoryWeapons.push(weapon);
        });

        const CategoryName = folderPath.split('\\')[folderPath.split('\\').length - 2];
        fs.writeFile(resultFolder + '\\' + `${CategoryName}.json`, JSON.stringify(SelectedCategoryWeapons, null, 4), (e) => {
            if (e) console.error(e);
        });
        SelectedCategoryWeapons.map(weapon => AllWeapons.push(weapon));
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
                                result = dataJson.infoBlocks[i].elements[j].text.args.modifier as string;
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

