import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {AttachmentSchema} from "../itemSchemas";
import {
    FindLinesByKey,
    FindLinesInValueByKey,
    FindObjectValueByKey,
    FindValueByKey,
    SortByGearKeys
} from "../Static/functions";
import {ItemProperties} from "../Static/itemProperties-class";


// EXCLUDE DEVICE AND MELEE
export const ParseAttachment = async function ParseAttachment(pathToItemsFolder = ''): Promise<void> {
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

    const resultFolder = RegionalPathToParse + '\\' + 'attachments';
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
    fs.writeFileSync(resultFolder + '\\' + 'all attachments.json', JSON.stringify(SortByGearKeys(AllAttachments), null, 4));

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
                weight: FindValueByKey(dataJson, "core.tooltip.info.weight", "float", 1),
                stats: [],
                features: {
                    zoom: FindObjectValueByKey(dataJson, 'weapon.tooltip.sight.info.zoom', 'text')
                },
                description: FindLinesByKey(dataJson, itemKey() + 'description'),
                suitableFor: []
            });

            attachment.suitableFor = GetSuitableWeapons(dataJson);

            const Stats: object[] = [];
            ItemProperties.AllProperties.attachmentAndBulletProperties.forEach(prop => {
                const value = FindValueByKey(dataJson, prop.key, 'float', 1);
                if (Number(value) != 0) {
                    Stats.push({
                        key: 'properties' + '.' + 'additional_to_weapons' + '.' + (prop.key).split('.')[(prop.key).split('.').length - 1],
                        value: value,
                        isPositive: (prop.goodIfGreaterThanZero && Number(value) > 0) || (!prop.goodIfGreaterThanZero && Number(value) < 0)
                            ? '1'
                            : '0',
                        //lines: prop.lines
                    })
                }
            })

            const Positive: object[] = Stats.filter(prop => (prop as any).isPositive == "1");
            const Negative: object[] = Stats.filter(prop => (prop as any).isPositive == "0");
            attachment.stats = Positive.concat(Negative);

            SelectedCategoryWeapons.push(attachment);
        });

        const CategoryName = folderPath.split('\\')[folderPath.split('\\').length - 2];
        fs.writeFile(resultFolder + '\\' + `${CategoryName}.json`, JSON.stringify(SortByGearKeys(SelectedCategoryWeapons), null, 4), (e) => {
            if (e) console.error(e);
        });

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

