import fs from "fs";
import { PathToParse } from '../Static/fileds';
import { DeviceSchema } from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    FindValueByKey, GetAndCopyIcons, MinimizeItemInfo,
    SortByGearRanks
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
        fs.writeFileSync(CategoryPath, JSON.stringify(MinimizeItemInfo(SortByGearRanks(AllDevices))));
        CreateSubFoldersAndItems(CategoryPath, SortByGearRanks(AllDevices));
        GetAndCopyIcons(pathToItemsFolder, server, 'device');
    }).catch(e => {
        console.error(e);
    });

    return SortByGearRanks(AllDevices); /* IMPORTANT */
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
                lines: dataJson.name.lines,
                color: dataJson.color,
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                weight: FindLinesInValueByKey(dataJson, "core.tooltip.info.weight"),
                stats: [
                    {
                        unitKey: null,
                        key: "anomaly.tooltip.signal_detector.can_detect_signals",
                        value: null,
                        lines: FindLinesByKey(dataJson, "anomaly.tooltip.signal_detector.can_detect_signals")
                    },
                    {
                        unitKey: null,
                        key: "anomaly.tooltip.signal_detector.can_detect_artefacts",
                        value: null,
                        lines: FindLinesByKey(dataJson, "anomaly.tooltip.signal_detector.can_detect_artefacts")
                    },
                    {
                        unitKey: 'meters',
                        key: "anomaly.tooltip.signal_detector.info.range",
                        value: FindValueByKey(dataJson, "anomaly.tooltip.signal_detector.info.range", 'int', null),
                        lines: {
                            ru: 'Радиус поиска',
                            en: 'Search range'
                        }
                    },
                    {
                        unitKey: 'meters',
                        key: "stalker.gauge_meter_stat.metal_detector.info.passive_scan_radius",
                        value: FindValueByKey(dataJson, "stalker.gauge_meter_stat.metal_detector.info.passive_scan_radius", 'int', null),
                        lines: {
                            ru: 'Пассивная дистанция',
                            en: 'Passive scan range'
                        }
                    },
                    {
                        unitKey: 'meters',
                        key: "stalker.gauge_meter_stat.metal_detector.info.active_scan_radius",
                        value: FindValueByKey(dataJson, "stalker.gauge_meter_stat.metal_detector.info.active_scan_radius", 'int', null),
                        lines: {
                            ru: 'Активная дистанция',
                            en: 'Active scan range'
                        }
                    },
                    {
                        unitKey: 'degrees',
                        key: "stalker.gauge_meter_stat.metal_detector.info.active_scan_angle",
                        value: FindValueByKey(dataJson, "stalker.gauge_meter_stat.metal_detector.info.active_scan_angle", 'int', null),
                        lines: {
                            ru: 'Угол сканирования',
                            en: 'Scan angle'
                        }
                    }
                ],
                description: FindLinesByKey(dataJson, itemKey() + 'description')
            });
            AllDevices.push(device);
        });
    }
}

