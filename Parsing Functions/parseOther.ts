import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {ILines, MeleeWeaponSchema, OtherItemSchema} from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    FindValueByKey, GetAndCopyIcons, MinimizeItemInfo,
    SortByGearRanksKeys
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
    const AllOtherItems: OtherItemSchema[] = [];
    let dataJson: any;
    parseItemsInFolder(pathToItemsFolder).then(() => {
        const CategoryPath = resultFolder + '\\' + `all_other.json`;
        fs.writeFileSync(CategoryPath, JSON.stringify(MinimizeItemInfo(SortByGearRanksKeys(AllOtherItems))));
        CreateSubFoldersAndItems(CategoryPath, SortByGearRanksKeys(AllOtherItems));
        GetAndCopyIcons(pathToItemsFolder, server, 'other');
    }).catch(e => {
        console.error(e);
    });

    return SortByGearRanksKeys(AllOtherItems); /* IMPORTANT */
    ////////

    async function parseItemsInFolder(folderPath: string) {
        let files: string[] = fs.readdirSync(folderPath);
        files = files.filter(file => file.includes('.'));

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

            const otherItem = new OtherItemSchema({
                exbo_id: fileName,
                key: dataJson.name.key,
                name: dataJson.name.lines,
                color: dataJson.color,
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                weight: FindLinesInValueByKey(dataJson, "core.tooltip.info.weight"),
                description: FindLinesByKey(dataJson, itemKey() + 'additional_stats_tip')
            });

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

            otherItem.description = {
                ru: startDescription.ru+endDescription.ru,
                en: startDescription.en+endDescription.en
            }

            AllOtherItems.push(otherItem);
        });
    }
}

