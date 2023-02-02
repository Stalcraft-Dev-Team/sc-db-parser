import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {AttachmentSchema} from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    FindObjectValueByKey,
    FindValueByKey, GetAndCopyIcons, MinimizeItemInfo,
    SortByGearRanksKeys, SortProperties
} from "../Static/functions";



export const ParseAttachment = async function ParseAttachment(pathToItemsFolder = ''): Promise<object[]> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        throw new Error('ParseAttachment: incorrect or null path to folder');
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

    const resultFolder = RegionalPathToParse + '\\' + 'attachment';
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

    const AllAttachments: AttachmentSchema[] = [];
    let dataJson: any;
    subFolders.map(async folder => {
        await parseItemsInFolder(pathToItemsFolder + folder + '\\');
    })
    fs.writeFileSync(resultFolder + '\\' + 'all_attachments.json', JSON.stringify(MinimizeItemInfo(SortByGearRanksKeys(AllAttachments))));
    GetAndCopyIcons(pathToItemsFolder, server, 'attachment');

    return SortByGearRanksKeys(AllAttachments); /* IMPORTANT */
    ////////

    async function parseItemsInFolder(folderPath: string) {
        const SelectedCategoryWeapons: AttachmentSchema[] = [];
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

            const attachment = new AttachmentSchema({
                exbo_id: fileName,
                name: dataJson.name.lines,
                key: dataJson.name.key,
                color: dataJson.color,
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                weight: FindValueByKey(dataJson, "core.tooltip.info.weight", "float", 2),
                stats: [],
                features: {
                    zoom: FindObjectValueByKey(dataJson, 'weapon.tooltip.sight.info.zoom', 'text')
                },
                description: FindLinesByKey(dataJson, itemKey() + 'description'),
                suitableFor: []
            });

            attachment.suitableFor = GetSuitableWeapons(dataJson);

            attachment.stats = SortProperties(dataJson, 'weapon');

            SelectedCategoryWeapons.push(attachment);
        });

        const CategoryName = folderPath.split('\\')[folderPath.split('\\').length - 2];
        const CategoryPath = resultFolder + '\\' + `${CategoryName}.json`;
        fs.writeFileSync(CategoryPath, JSON.stringify(SortByGearRanksKeys(SelectedCategoryWeapons)));
        CreateSubFoldersAndItems(CategoryPath, undefined);

        SelectedCategoryWeapons.map(attachment => AllAttachments.push(attachment));
    }

    function GetSuitableWeapons(dataJson: any): object[] {
        let result: object[] = [];

        for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
            if (dataJson.infoBlocks[i].title.key == 'weapon.lore.attachment.all_suitable_targets') {
                result = dataJson.infoBlocks[i].elements as object[];
            }
        }
        let resultDump: object[] = [];
        result.forEach(item => {
            resultDump.push({
                key: (item as any).name.key,
                lines: {
                    ru: (item as any).name.lines.ru,
                    en: (item as any).name.lines.en
                }
            });
        })

        return resultDump;
    }
}

