import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {ArmorSchema, ILines} from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    FindObjectValueByKey,
    FindValueByKey,
    SortByGearRanksKeys, SortProperties
} from "../Static/functions";
import {ItemProperties} from "../Static/itemProperties-class";


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
        await parseItemsInFolder(pathToItemsFolder + folder + '\\');
    });

    fs.writeFileSync(resultFolder + '\\' + 'all_armors.json', JSON.stringify(SortByGearRanksKeys(AllArmors), null, 4));
    return SortByGearRanksKeys(AllArmors); /* IMPORTANT */
    ////////

    async function parseItemsInFolder(folderPath: string) {
        const SelectedCategoryArmors: ArmorSchema[] = [];
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

            const armor = new ArmorSchema({
                exbo_id: fileName,
                name: dataJson.name.lines,
                key: dataJson.name.key,
                color: dataJson.color,
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                weight: FindValueByKey(dataJson, "core.tooltip.info.weight", "float", 2),
                nightVisionGlasses: FindLinesForArmorByKey(dataJson, "stalker.tooltip.armor_artefact.night_vision"),
                compatibilityBackpacks: FindLinesForArmorByKey(dataJson, "stalker.lore.armor_artefact.info.compatible_backpacks"),
                compatibilityContainers: FindLinesForArmorByKey(dataJson, "stalker.lore.armor_artefact.info.compatible_containers"),
                stats: [],
                description: FindLinesByKey(dataJson, itemKey() + 'description'),
            });


            armor.stats = SortProperties(dataJson, 'player');

            SelectedCategoryArmors.push(armor);
        });

        const CategoryName = folderPath.split('\\')[folderPath.split('\\').length - 2];
        const CategoryPath = resultFolder + '\\' + `${CategoryName}.json`;
        fs.writeFile(CategoryPath, JSON.stringify(SortByGearRanksKeys(SelectedCategoryArmors), null, 4), () => {
            CreateSubFoldersAndItems(CategoryPath);
        });

        SelectedCategoryArmors.map(armor => AllArmors.push(armor));
    }
}

export function FindLinesForArmorByKey(dataJson: any, searchingKey: string): ILines {
    const result: ILines = {
        ru: "null",
        en: "null"
    }

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
