import { GearRanks, PropertiesTypes } from "./enums";
import { ILines } from "../itemSchemas";
import { IPropertiesElement, ItemProperties } from "./itemProperties-class";
import { FindRangeValueByKey } from "../Parsing Functions/parseArtefact";
import fs from "fs";
import Path from "path";
import { PathToImages } from "./fileds";

const filesObj: any = {};

export function GetAndCopyIcons(DirectoryToItems: string, Server: string, FolderName: string): void {
    const DirectoryToIcons = DirectoryToItems.replace('\\items\\', '\\icons\\');
    const funcID: string = '_' + new Date().getMilliseconds();
    filesObj[funcID] = [] as string[];

    if (FolderName == 'other') {
        ["other", "misc"].forEach(fName => {
            LocalFuncThroughDirectory(DirectoryToIcons.replace('\\other\\', `\\${fName}\\`), funcID);
        });
    } else {
        LocalFuncThroughDirectory(DirectoryToIcons, funcID);
    }

    if (!fs.existsSync(PathToImages(Server))) {
        fs.mkdirSync(PathToImages(Server));
    }

    if (!fs.existsSync(PathToImages(Server) + FolderName)) {
        fs.mkdirSync(PathToImages(Server) + FolderName);
    }

    filesObj[funcID].forEach((iconPath: string) => {
        const SplittedIP = iconPath.split('.')[0];
        const fileName: string = SplittedIP.substring(SplittedIP.length - 4, SplittedIP.length);
        fs.readFile(iconPath, (err, data) => {
            if (err)
                console.error(err);
            else {
                fs.writeFile(PathToImages(Server) + FolderName + '\\' + fileName + '.png', data, (err) => {
                    if (err) console.error(err);
                })
            }
        })
    });
    delete filesObj[funcID];
}

function LocalFuncThroughDirectory(Directory: string, funcID: string) {
    fs.readdirSync(Directory).forEach(File => {
        const Absolute = Path.join(Directory, File);
        if (fs.statSync(Absolute).isDirectory()) return LocalFuncThroughDirectory(Absolute, funcID);
        else {
            return filesObj[funcID].push(Absolute);
        }
    });
}

export function CreateSubFoldersAndItems(CategoryPath: string, array: object[] | undefined) {
    if (!fs.existsSync(CategoryPath.split('.')[0]))
        fs.mkdirSync(CategoryPath.split('.')[0], null);

    const data: any = array == undefined
        ? JSON.parse(fs.readFileSync(CategoryPath, null).toString())
        : array;

    data.forEach((item: any) => {
        const itemAsAny: any = item as any;
        fs.writeFileSync(`${CategoryPath.split('.')[0]}\\${itemAsAny.exbo_id}.json`, JSON.stringify(itemAsAny));
    });
}

export function SortByGearRanksKeys(array: any[]): object[] {
    const SortedItems: object[] = [];
    const ItemWithoutGearRanks: object[] = [];
    for (let gearRanksKey in GearRanks) {
        const ItemStorage: object[] = [];


        array.forEach(item => {
            if (item.hasOwnProperty('rank') && item.rank != null && item.rank.en == gearRanksKey) {
                ItemStorage.push(item);
            } else if (item.rank == null && ItemWithoutGearRanks.indexOf(item) == -1) {
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

export function MinimizeItemInfo(array: any[]): object[] {
    const MinimizedArray: object[] = [];

    array.forEach(item => {
        MinimizedArray.push({
            exbo_id: item.exbo_id,
            name: item.name,
            color: item.color,
            rank: item.rank,
            class: item.class,
            purpose: item.purpose ?? "null"
        });

        const index: number = MinimizedArray.length - 1;

        const Array = Object.entries(MinimizedArray[index]);
        const FilteredArray = Array.filter(([key, value]) => value !== "null");
        if (Array.length != FilteredArray.length) {
            MinimizedArray[index] = Object.fromEntries(FilteredArray);
        }
    });

    return MinimizedArray;
}

// type must be 'player' or 'weapon'
export function SortProperties(dataJson: any, type: string = ''): object[] {
    if (type.toLowerCase() != 'player' && type.toLowerCase() != 'weapon') {
        throw new Error('Incorrect type.');
    } else {
        type = type.toLowerCase();
    }
    const AllPropsKey = type == 'player' ? PropertiesTypes.Player : PropertiesTypes.AttachmentOrBullet;

    const Stats: object[] = [];

    (ItemProperties.AllProperties as any)[AllPropsKey].forEach((prop: IPropertiesElement) => {
        let value;
        // @ts-ignore
        const IsPercentageValue: boolean = (ItemProperties.PercentageTagProperties[AllPropsKey]).filter(key => prop.key == key).length > 0;
        let valueIsNull: boolean = false;
        let unitKey: string | null = null;
        if (IsPercentageValue) {
            unitKey = 'percentage';
        }

        let isPositive: string = '';
        if (dataJson.category.includes('artefact')) {
            value = FindRangeValueByKey(dataJson, prop.key, 'float', 1);
            isPositive = (prop.goodIfGreaterThanZero && Number(value.max) > 0) || (!prop.goodIfGreaterThanZero && Number(value.max) < 0)
                ? '1'
                : '0';

            if (Number(value.max) == 0) {
                valueIsNull = true;
            }
        } else {
            value = FindValueByKey(dataJson, prop.key, 'float', 1);
            isPositive = (prop.goodIfGreaterThanZero && Number(value) > 0) || (!prop.goodIfGreaterThanZero && Number(value) < 0)
                ? '1'
                : '0';

            if (Number(value) == 0) {
                valueIsNull = true;
            }
        }


        if (!valueIsNull) {
            Stats.push({
                unitKey: unitKey,
                key: prop.key,
                value: value,
                isPositive: isPositive,
                lines: prop.lines
            })
        }
    })

    return Stats;
}

export function FindLinesInValueByKey(dataJson: any, searchingKey: string): ILines | null {
    const result: ILines | null = null;

    for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
        if (dataJson.infoBlocks[i].elements != undefined)
            for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
                for (const [key, value] of Object.entries(dataJson.infoBlocks[i].elements[j])) {
                    if ((key == 'key' || key == 'text') && (value as any).key as string == searchingKey) {
                        return dataJson.infoBlocks[i].elements[j].value.lines;
                    }
                    if (key == 'formatted' && (value as any).value.en != undefined
                        && dataJson.infoBlocks[i].elements[j].name.key == searchingKey) {
                        return (value as any).value;
                    }
                }
            }
    }

    return result;
}

export function FindLinesByKey(dataJson: any, searchingKey: string): ILines | null {
    const result: ILines | null = null;

    for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
        if (dataJson.infoBlocks[i].elements != undefined) {
            for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
                for (const [key, value] of Object.entries(dataJson.infoBlocks[i].elements[j])) {
                    if ((key == 'key' || key == 'text') && (value as any).key.includes(searchingKey)) {
                        if ((value as any).key == "core.tooltip.origin") {
                            const OriginInfo = dataJson.infoBlocks[i].elements[j+1].text.lines;
                            return {
                                ru: `Получение<br>${OriginInfo.ru}<br><br>`,
                                en: `Obtained<br>${OriginInfo.en}<br><br>`
                            }
                        } else
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

    const searchingKeyLastWord = searchingKey.split('.')[searchingKey.split('.').length - 1];
    if (searchingKeyLastWord == 'description') {
        for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
            if (dataJson.infoBlocks[i].type == 'text' && dataJson.infoBlocks[i].text.key.includes(searchingKey))
                return dataJson.infoBlocks[i].text.lines;
        }
    }

    if (searchingKeyLastWord == 'durability_decrease') {
        for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
            if (dataJson.infoBlocks[i].elements != undefined) {
                for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
                    if (dataJson.infoBlocks[i].elements[j].name != undefined && dataJson.infoBlocks[i].elements[j].name.key.includes(searchingKey))
                        return {
                            ru: `${dataJson.infoBlocks[i].elements[j].name.lines.ru}: ${dataJson.infoBlocks[i].elements[j].formatted.value.ru}`,
                            en: `${dataJson.infoBlocks[i].elements[j].name.lines.en}: ${dataJson.infoBlocks[i].elements[j].formatted.value.en}`
                        };
                }
            }
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
                result = Number.parseFloat(result).toFixed(roundValueIfFloat);

            break;
        }
        default: {
            console.error("WHAT THE HELL???");
        }
    }

    return result;
}

export function FindObjectValueByKey(dataJson: any, searchingKey: string, searchingValue: string): string {
    let result: any = null;

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

    if (result != null && result[searchingValue] != null)
        result = result[searchingValue];

    return result;
}