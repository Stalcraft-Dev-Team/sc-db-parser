import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {AttachmentSchema, BulletSchema} from "../itemSchemas";
import {
    FindLinesByKey,
    FindLinesInValueByKey,
    FindObjectValueByKey,
    FindValueByKey,
    SortByGearRanksKeys, SortProperties
} from "../Static/functions";
import {ItemProperties} from "../Static/itemProperties-class";


export const ParseBullet = async function ParseBullet(pathToItemsFolder = ''): Promise<void> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        throw new Error('ParseBullet: incorrect or null path to folder');
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

    const resultFolder = RegionalPathToParse + '\\' + 'bullets';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    ////////
    const AllBullets: BulletSchema[] = [];
    let dataJson: any;
    parseItemsInFolder(pathToItemsFolder).then(() => {
        fs.writeFileSync(resultFolder + '\\' + 'all bullets.json', JSON.stringify(AllBullets, null, 4));
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

            const bullet = new BulletSchema({
                exbo_id: fileName,
                key: dataJson.name.key,
                name: dataJson.name.lines,
                color: dataJson.color,
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                weight: FindValueByKey(dataJson, "core.tooltip.info.weight", "float", 2),
                bulletType: FindLinesByKey(dataJson, "weapon.tooltip.bullet.bullet_type"),
                penetration: FindLinesByKey(dataJson, "weapon.tooltip.bullet.high_penetration"),
                stats: [],
            });

            bullet.stats = SortProperties(dataJson, 'weapon');

            AllBullets.push(bullet);
        });
    }
}

