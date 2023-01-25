import {GearRanks} from "./enums";
import {ILines} from "../itemSchemas";

export function SortByGearRanksKeys(array: any[]): object[] {
    const SortedItems: object[] = [];
    const ItemWithoutGearRanks: object[] = [];
    for (let gearRanksKey in GearRanks) {
        const ItemStorage: object[] = [];


        array.forEach(item => {
            if (item.hasOwnProperty('rank') && item.rank.en != 'null' && item.rank.en == gearRanksKey) {
                ItemStorage.push(item);
            } else if (item.rank.en == 'null' && ItemWithoutGearRanks.indexOf(item) == -1) {
                ItemWithoutGearRanks.push(item)
            }
        })
        ItemStorage.forEach(item => {
            SortedItems.push(item);
        });
    }

    ItemWithoutGearRanks.forEach(item => {
        SortedItems.push(item);
    });

    return SortedItems;
}

export function FindLinesInValueByKey(dataJson: any, searchingKey: string): object {
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

export function FindLinesByKey(dataJson: any, searchingKey: string): ILines {
    const result: ILines = {
        ru: "null",
        en: "null"
    }

    for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
        if (dataJson.infoBlocks[i].elements != undefined) {
            for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
                for (const [key, value] of Object.entries(dataJson.infoBlocks[i].elements[j])) {
                    if ((key == 'key' || key == 'text') && (value as any).key.includes(searchingKey)) {
                        return (value as any).lines;
                    }
                }
            }
        } else {
            for (const [key, value] of Object.entries(dataJson.infoBlocks[i])) {
                if (key == 'text' && (value as any).key.includes(searchingKey)) {
                    return (value as any).lines;
                }
            }
        }
    }

    if (searchingKey.split('.')[searchingKey.split('.').length - 1] == 'description') {
        for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
            if (dataJson.infoBlocks[i].type == 'text' && dataJson.infoBlocks[i].text.key.includes(searchingKey))
                return dataJson.infoBlocks[i].text.lines;
        }
    }

    return result;
}

// [null, ...] == integer, ('f' || 'float') == float
export function FindValueByKey(dataJson: any, searchingKey: string, type: string | null, roundValueIfFloat: number | null): string {
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
                            if (searchingKey.includes('melee_weapon')) {
                                result = dataJson.infoBlocks[i].elements[j].text.args.factor as string;
                            } else {
                                result = dataJson.infoBlocks[i].elements[j].text.args.modifier as string;
                            }
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

export function FindObjectValueByKey(dataJson: any, searchingKey: string, searchingValue: string): string {
    let result: any = 'null';


    for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
        if (dataJson.infoBlocks[i].elements != undefined)
            for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
                for (const [key, value] of Object.entries(dataJson.infoBlocks[i].elements[j])) {
                    if ((key == 'name' || key == 'key' || key == 'text') && (value as any).key as string == searchingKey) {
                        result = dataJson.infoBlocks[i].elements[j].value;
                    }
                }
            }
    }
    try {
        if (result[searchingValue] != undefined)
            result = result[searchingValue];
    } finally {

    }
    return result;
}