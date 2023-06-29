import fs from "fs";
import { PathToParse } from '../Static/fileds';
import { ILines, OtherItemSchema } from "../itemSchemas";
import {
    CreateSubFoldersAndItems, DeleteDublicatesAndRejectedItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    GetAndCopyIcons, MinimizeItemInfo,
    SortByGearRanks
} from "../Static/functions";


export const ParseOther = async function ParseOther(pathToItemsFolder = ''): Promise<object[]> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        throw new Error('ParseOther: incorrect or null path to folder');
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

    const resultFolder = RegionalPathToParse + '\\' + 'other';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    ////////
    let AllOtherItems: OtherItemSchema[] = [];
    let dataJson: any;

    await parseItemsInFolder(pathToItemsFolder);
    await parseItemsInFolder(pathToItemsFolder.replace('other', 'misc'));

    const CategoryPath = resultFolder + '\\' + `all_other.json`;
    AllOtherItems = DeleteDublicatesAndRejectedItems(AllOtherItems) as OtherItemSchema[]; // Временное решение
    fs.writeFileSync(CategoryPath, JSON.stringify(MinimizeItemInfo(SortByGearRanks(AllOtherItems))));
    CreateSubFoldersAndItems(CategoryPath, SortByGearRanks(AllOtherItems));
    GetAndCopyIcons(pathToItemsFolder, server, 'other');

    return SortByGearRanks(AllOtherItems); /* IMPORTANT */
    ////////

    async function parseItemsInFolder(folderPath: string) {
        let filesFromSkins: string[] = [];
        if(fs.existsSync(folderPath+'skins'))
            filesFromSkins = fs.readdirSync(folderPath+'skins')
            .map(file => {
                return folderPath+'skins'+'\\'+file;
            });

        if (folderPath.includes('\\misc\\'))
            filesFromSkins = [];

        let files: string[] = fs.readdirSync(folderPath)
            .map(file => {
                return folderPath+file;
            });

        files = files.filter(file => file.includes('.'));
        files = files.concat(filesFromSkins);

        files.map((file) => {
            let fileName: string = file.split('.')[0];
            fileName = fileName.split('\\')[fileName.split('\\').length-1];

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

            let otherItem = new OtherItemSchema({
                exbo_id: fileName,
                key: dataJson.name.key,
                lines: dataJson.name.lines,
                color: dataJson.color,
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                weight: FindLinesInValueByKey(dataJson, "core.tooltip.info.weight"),
                suitableFor: [],
                useCategory:
                    FindLinesByKey(dataJson, "item.weapon_skin.additional_stats_tip")
                    ??
                    FindLinesByKey(dataJson, "item.weapon_unique_skin.additional_stats_tip")
                    ??
                    FindLinesByKey(dataJson, "item.armor_skin.additional_stats_tip")
                    ??
                    FindLinesByKey(dataJson, "item.armor_unique_skin.additional_stats_tip"),

                description: FindLinesByKey(dataJson, itemKey() + 'additional_stats_tip')
            });

            otherItem.suitableFor = GetSuitableWeaponsOrArmor(dataJson);
            console.log(otherItem)

            const newObj: any = {};
            for (const key in otherItem) {
                if ((key == 'useCategory' || key == 'suitableFor') && otherItem[key] != null) {
                    newObj[key] = otherItem[key];
                } else {
                    // @ts-ignore
                    newObj[key] = otherItem[key];
                }
            }
            otherItem = new OtherItemSchema(newObj);

            otherItem.description = MakeDescription(dataJson, otherItem);

            AllOtherItems.push(otherItem);
        });
    }
}

function GetSuitableWeaponsOrArmor(dataJson: any): object[] {
    let result: object[] = [];

    for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
        if (dataJson.infoBlocks[i].type === 'list' && dataJson.infoBlocks[i].elements[0]?.text?.lines?.en === 'Suitable for:') {
            result = dataJson.infoBlocks[i].elements as object[];
        }
    }

    let resultDump: object[] = [];
    result.forEach((item: any, index) => {
        if (index !== 0 && result.indexOf(item) != 0)
        resultDump.push({
            key: item.name.key,
            lines: item.name.lines
        });
    })

    return resultDump;
}

function MakeDescription(dataJson: any, item: OtherItemSchema): ILines {
    const itemKey = () => {
        const keys: string[] = (dataJson.name.key).split('.');
        let result: string = '';
        for (let i = 0; i < keys.length - 1; i++) {
            result += keys[i] + '.';
        }

        return result;
    };

    let startDescription: ILines = {
        ru: '',
        en: ''
    };

    const UpgradeToolCompabilityLvls = FindLinesByKey(dataJson, "upgrade_tool.tooltip.info.compatible_levels");
    if (UpgradeToolCompabilityLvls != null) {
        const DurabilityDecrease: ILines | any = FindLinesByKey(dataJson, "upgrade_tool.tooltip.info.durability_decrease");
        startDescription.ru += `${UpgradeToolCompabilityLvls.ru}<br>${DurabilityDecrease.ru}<br><br>`;
        startDescription.en += `${UpgradeToolCompabilityLvls.en}<br>${DurabilityDecrease.en}<br><br>`;
    }

    const BarterOrigin: ILines | any = FindLinesByKey(dataJson, "core.tooltip.origin");
    if (BarterOrigin != null) {
        startDescription.ru += BarterOrigin.ru;
        startDescription.en += BarterOrigin.en;
    }

    let endDescription: ILines | any = FindLinesByKey(dataJson, itemKey() + 'additional_stats_tip');
    if (endDescription == null) {
        endDescription = {
            ru: '',
            en: ''
        }
    }

    item.description = {
        ru: startDescription.ru+endDescription.ru,
        en: startDescription.en+endDescription.en
    }

    return item.description;
}

