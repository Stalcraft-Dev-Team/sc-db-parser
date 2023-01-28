import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {DeviceSchema} from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    FindValueByKey, GetAndCopyIcons,
    SortByGearRanksKeys
} from "../Static/functions";


export const ParseDevice = async function ParseDevice(pathToItemsFolder = ''): Promise<object[]> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        throw new Error('ParseDevice: incorrect or null path to folder');
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

    const resultFolder = RegionalPathToParse + '\\' + 'device';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    ////////
    const AllDevices: DeviceSchema[] = [];
    let dataJson: any;
    parseItemsInFolder(pathToItemsFolder).then(() => {
        const CategoryPath = resultFolder + '\\' + `all_devices.json`;
        fs.writeFile(CategoryPath, JSON.stringify(SortByGearRanksKeys(AllDevices), null, 4), () => {
            CreateSubFoldersAndItems(CategoryPath);
        });
        GetAndCopyIcons(pathToItemsFolder, server, 'device');
    }).catch(e => {
        console.error(e);
    });

    return SortByGearRanksKeys(AllDevices); /* IMPORTANT */
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

            const device = new DeviceSchema({
                exbo_id: fileName,
                key: dataJson.name.key,
                name: dataJson.name.lines,
                color: dataJson.color,
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                weight: FindValueByKey(dataJson, "core.tooltip.info.weight", "float", 2),
                features: {
                    signalSearcher: {
                        canDetectSignals: FindLinesByKey(dataJson, 'anomaly.tooltip.signal_detector.can_detect_signals') != null ? '1' : '0',
                        canDetectArtefacts:  FindLinesByKey(dataJson, 'anomaly.tooltip.signal_detector.can_detect_artefacts') != null ? '1' : '0',
                        range: FindValueByKey(dataJson, 'anomaly.tooltip.signal_detector.info.range', 'int', null)
                    },
                    metalDetector: {
                        passiveRange: FindValueByKey(dataJson, 'stalker.gauge_meter_stat.metal_detector.info.passive_scan_radius', 'int', null),
                        activeRange: FindValueByKey(dataJson, 'stalker.gauge_meter_stat.metal_detector.info.active_scan_radius', 'int', null),
                        scanAngle: FindValueByKey(dataJson, 'stalker.gauge_meter_stat.metal_detector.info.active_scan_angle', 'int', null)
                    }
                },
                description: FindLinesByKey(dataJson, itemKey() + 'description')
            });
            AllDevices.push(device);
        });
    }
}

