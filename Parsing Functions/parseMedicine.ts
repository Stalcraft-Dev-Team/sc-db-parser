import fs from "fs";
import { PathToParse } from '../Static/fileds';
import { MedicineSchema } from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesInValueByKey,
    FindValueByKey,
    GetAndCopyIcons, MinimizeItemInfo,
    SortProperties, SortSomethingLikeInGame
} from "../Static/functions";
import SortedMedicine from "../SortedSomething/medicine.json";

export const ParseMedicine = async function ParseMedicine(pathToItemsFolder = ''): Promise<object[]> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        throw new Error('ParseMedicine: incorrect or null path to folder');
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

    const resultFolder = RegionalPathToParse + '\\' + 'medicine';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    ////////
    const AllMedicine: MedicineSchema[] = [];
    let dataJson: any;

    await Promise.all([
        parseItemsInFolder(pathToItemsFolder),
        parseItemsInFolder(pathToItemsFolder.replace('medicine', 'drink')),
        parseItemsInFolder(pathToItemsFolder.replace('medicine', 'food')),
    ]);

    const CategoryPath = resultFolder + '\\' + `all_medicine.json`;
    fs.writeFileSync(CategoryPath, JSON.stringify(
        MinimizeItemInfo(
            SortSomethingLikeInGame(AllMedicine, SortedMedicine, 'Medicine')
        )
    ));
    CreateSubFoldersAndItems(CategoryPath, AllMedicine);
    GetAndCopyIcons(pathToItemsFolder, server, 'medicine');

    return AllMedicine; /* IMPORTANT */
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
                exbo_id: fileName,
                key: dataJson.name.key,
                lines: dataJson.name.lines,
                color: dataJson.color,
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                weight: FindLinesInValueByKey(dataJson, "core.tooltip.info.weight"),
                usedInCrafts: FindLinesInValueByKey(dataJson, "core.tooltip.used_in_crafts"),
                purpose: FindLinesInValueByKey(dataJson, 'stalker.tooltip.medicine.info.effect_type'),
                duration: FindValueByKey(dataJson, 'stalker.tooltip.medicine.info.duration', 'int', null),
                stats: [],
                description: FindLinesByKey(itemKey() + 'description')
            });

            medicine.stats = SortProperties(dataJson, 'player');

            AllMedicine.push(medicine);
        });
    }

    function FindLinesByKey(searchingKey: string): object {
        const result: object = {
            ru: null,
            en: null
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
}

