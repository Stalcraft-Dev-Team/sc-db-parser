import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {MedicineSchema} from "../itemSchemas";
import {ItemProperties} from "../Static/itemProperties-class";
import {FindLinesInValueByKey, FindValueByKey} from "../Static/functions";


export const ParseMedicine = async function ParseMedicine(pathToItemsFolder = ''): Promise<void> {
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
                exbo_id: fileName,
                key: dataJson.name.key,
                name: dataJson.name.lines,
                color: dataJson.color,
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                weight: FindValueByKey(dataJson, "core.tooltip.info.weight", "float", 2),
                purpose: FindLinesInValueByKey(dataJson, 'stalker.tooltip.medicine.info.effect_type'),
                duration: FindValueByKey(dataJson, 'stalker.tooltip.medicine.info.duration', 'int', null),
                stats: [],
                description: FindLinesByKey(itemKey() + 'description')
            });

            const Stats: object[] = [];
            ItemProperties.AllProperties.playerProperties.forEach(prop => {
                const value = FindValueByKey(dataJson, prop.key, 'float', 1);
                if (Number(value) != 0) {
                    Stats.push({
                        key: 'properties' + '.' + (prop.key).split('.')[(prop.key).split('.').length - 1],
                        value: value,
                        isPositive: (prop.goodIfGreaterThanZero && Number(value) > 0) || (!prop.goodIfGreaterThanZero && Number(value) < 0)
                            ? '1'
                            : '0',
                        lines: prop.lines
                    })
                }
            })

            const Positive: object[] = Stats.filter(prop => (prop as any).isPositive == "1");
            const Negative: object[] = Stats.filter(prop => (prop as any).isPositive == "0");
            medicine.stats = Positive.concat(Negative);

            AllMedicine.push(medicine);
        });
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
}

