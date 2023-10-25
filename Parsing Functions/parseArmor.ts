import fs from "fs";
import { PathToParse } from '../Static/fileds';
import {ArmorSchema, ILines, WeaponSchema} from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    GetAndCopyIcons, MinimizeItemInfo,
    SortByGearRanks, SortByGearRanksAndCondition, SortProperties
} from "../Static/functions";
import {IndexDirName} from "../index";



export const ParseArmor = async function ParseArmor(pathToItemsFolder = ''): Promise<object[]> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        throw new Error('ParseArmor: incorrect or null path to folder');
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

    const resultFolder = RegionalPathToParse + '\\' + 'armor';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    ////////
    const subFolders: string[] = [];
    fs.readdirSync(pathToItemsFolder, {withFileTypes: true})
        .filter((dirent: { isDirectory: () => boolean; }) => dirent.isDirectory())
        .map((dirent: { name: string; }) => {
            subFolders.push(dirent.name);
        });

    const AllArmors: ArmorSchema[] = [];
    let dataJson: any;

    subFolders.map(async folder => {
        await parseItemsInFolder(pathToItemsFolder + folder);
    });

    fs.writeFileSync(resultFolder + '\\' + 'all_armors.json', JSON.stringify(MinimizeItemInfo(SortByGearRanksAndCondition(AllArmors))));

    GetAndCopyIcons(pathToItemsFolder, server, 'armor');
    return SortByGearRanksAndCondition(AllArmors); /* IMPORTANT */
    ////////

    async function parseItemsInFolder(folderPath: string) {
        const SelectedCategoryArmors: ArmorSchema[] = [];
        const files: string[] = fs.readdirSync(folderPath);

        files.map((file) => {
            if (file === '_variants') {
                return;
            }
            const fileName: string = file.split('.')[0];
            file = folderPath + '\\' + file;

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

            const getConstructObj = (_fileName: string, _dataJson: any) => {
                return {
                    exbo_id: _fileName,
                    lines: _dataJson.name.lines,
                    key: _dataJson.name.key,
                    color: _dataJson.color,
                    rank: FindLinesInValueByKey(_dataJson, "core.tooltip.info.rank"),
                    class: FindLinesInValueByKey(_dataJson, "core.tooltip.info.category"),
                    weight: FindLinesInValueByKey(_dataJson, "core.tooltip.info.weight"),
                    nightVisionGlasses: FindLinesForArmorByKey(_dataJson, "stalker.tooltip.armor_artefact.night_vision"),
                    compatibilityBackpacks: FindLinesForArmorByKey(_dataJson, "stalker.lore.armor_artefact.info.compatible_backpacks"),
                    compatibilityContainers: FindLinesForArmorByKey(_dataJson, "stalker.lore.armor_artefact.info.compatible_containers"),
                    stats: [],
                    description: FindLinesByKey(_dataJson, itemKey() + 'description'),
                }
            }

            const armor = new ArmorSchema(getConstructObj(fileName, dataJson));
            armor.stats = SortProperties(dataJson, 'player', false, true);

            // stat variants
            for (let i = 1; i <= armor.stats.length; i++) {
                const stat = armor.stats[i-1];
                if (stat) {
                    if (fs.existsSync(folderPath + '\\' + '_variants' + '\\' + fileName + '\\')) {
                        for (let i = 1; i <= 15; i++) {
                            const fileVariant = folderPath + '\\' + '_variants' + '\\' + fileName + '\\' + `${i}.json`;
                            const dataVariant: Buffer = fs.readFileSync(fileVariant);
                            const dataJsonVariant = JSON.parse(dataVariant.toString());
                            const armorVariant = new ArmorSchema(getConstructObj(fileName, dataJsonVariant));
                            armorVariant.stats = SortProperties(dataJsonVariant, 'player');
                            stat.value.push({
                                level: i,
                                value: armorVariant.stats.find(s => s.key === stat.key).value
                            })
                        }
                    }
                }
            }

            SelectedCategoryArmors.push(armor);
        });

        const CategoryName = folderPath.split('\\')[folderPath.split('\\').length - 1];
        const CategoryPath = `${resultFolder}\\${CategoryName}.json`;
        fs.writeFileSync(CategoryPath, JSON.stringify(SortByGearRanks(SelectedCategoryArmors)));
        CreateSubFoldersAndItems(CategoryPath, undefined);

        SelectedCategoryArmors.map(armor => AllArmors.push(armor));
    }
}

export function FindLinesForArmorByKey(dataJson: any, searchingKey: string): ILines | null {
    const result: ILines | null = null;

    if (searchingKey == "stalker.tooltip.armor_artefact.night_vision") {
        for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
            if (dataJson.infoBlocks[i].elements != undefined) {
                for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
                    for (const [key, value] of Object.entries(dataJson.infoBlocks[i].elements[j])) {
                        if (key == 'text' && (value as any).key.includes(searchingKey)) {
                            return (value as any).lines;
                        }
                    }
                }
            }
        }
    }

    for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
        for (const [key, value] of Object.entries(dataJson.infoBlocks[i])) {
            if (key == 'title' && (value as any).key != null && (value as any).key.includes(searchingKey)) {
                return dataJson.infoBlocks[i].text.lines;
            }
        }
    }

    return result;
}
