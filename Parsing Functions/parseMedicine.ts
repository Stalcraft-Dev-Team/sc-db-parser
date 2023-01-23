import fs from "fs";
import {pathToParse} from './pathToParse';
import { MedicineSchema } from "../itemSchemas";


// EXCLUDE DEVICE AND MELEE
export const ParseMedicine = async function ParseMedicine(pathToItemsFolder = ''): Promise<void> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        console.error('Parse Medicine: incorrect or null path to folder');
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

    const resultFolder = RegionalPathToParse + '\\' + 'medicine';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    ////////
    const AllMedicine: MedicineSchema[] = [];
    let dataJson: any;
    parseItemsInFolder(pathToItemsFolder).then(() => {
        fs.writeFileSync(resultFolder + '\\' + 'all medicine.json', JSON.stringify(AllMedicine, null, 4));
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

            const medicine = new MedicineSchema({
                id: fileName,
                name: {
                    ru: dataJson.name.lines.ru,
                    en: dataJson.name.lines.en
                },
                color: dataJson.color,
                class: FindLinesInValueByKey("core.tooltip.info.category"),
                weight: FindValueByKey("core.tooltip.info.weight", "float", 1),
                purpose: FindLinesInValueByKey('stalker.tooltip.medicine.info.effect_type'),
                duration: FindValueByKey('stalker.tooltip.medicine.info.duration', 'int', null),
                positiveProperties: {
                    radiationDamageDefence: FindValueByKey('stalker.artefact_properties.factor.radiation_dmg_factor', 'int', null),
                    biologicalDamageDefence: FindValueByKey('stalker.artefact_properties.factor.biological_dmg_factor', 'int', null),
                    thermalDamageDefence: FindValueByKey('stalker.artefact_properties.factor.thermal_dmg_factor', 'int', null),
                    psychoDamageDefence: FindValueByKey('stalker.artefact_properties.factor.psycho_dmg_factor', 'int', null),
                    bleedAccumulationDefence: FindValueByKey('stalker.artefact_properties.factor.bleeding_protection', 'int', null),
                    periodHealing: FindValueByKey('stalker.artefact_properties.factor.artefakt_heal', 'float', 1),
                    healEfficiency: FindValueByKey('stalker.artefact_properties.factor.heal_efficiency', 'int', null),
                    healthRegeneration: FindValueByKey('stalker.artefact_properties.factor.regeneration_bonus', 'float', 1),
                    healthBonus: FindValueByKey('stalker.artefact_properties.factor.health_bonus', 'int', null),
                    momentHeal: FindValueByKey('stalker.tooltip.medicine.info.hp_regen', 'int', null),
                    speedModifier: FindValueByKey('stalker.artefact_properties.factor.speed_modifier', 'int', null),
                    staminaRegeneration: FindValueByKey('stalker.artefact_properties.factor.stamina_regeneration_bonus', 'int', null),
                    staminaBonus: FindValueByKey( 'stalker.artefact_properties.factor.stamina_bonus', 'int', null),
                    weightBonus: FindValueByKey('stalker.artefact_properties.factor.max_weight_bonus', 'int', null)
                },
                negativeProperties: {
                    toxiticy: FindValueByKey('stalker.tooltip.medicine.info.toxicity', 'int', null),
                    radiationAccumulation: FindValueByKey('stalker.artefact_properties.factor.radiation_accumulation', 'float', 1),
                    biologicalAccumulation: FindValueByKey('stalker.artefact_properties.factor.biological_accumulation', 'float', 1),
                    thermalAccumulation: FindValueByKey('stalker.artefact_properties.factor.thermal_accumulation', 'float', 1),
                    psychoAccumulation: FindValueByKey('stalker.artefact_properties.factor.psycho_accumulation', 'float', 1),
                    bleedAccumulation: FindValueByKey('stalker.artefact_properties.factor.bleeding_accumulation', 'float', 1),
                },
                description: FindLinesByKey(itemKey() + 'description')
            });

            const positives: any = {};
            for (const [key, value] of Object.entries(medicine.positiveProperties)) {
                if (Number(value) != 0) {
                    positives[key] = value;
                }
            }

            const negativities: any = {};
            for (const [key, value] of Object.entries(medicine.negativeProperties)) {
                if (Number(value) != 0) {
                    negativities[key] = value;
                }
            }

            medicine.positiveProperties = positives;
            medicine.negativeProperties = negativities;

            AllMedicine.push(medicine);
        });
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

