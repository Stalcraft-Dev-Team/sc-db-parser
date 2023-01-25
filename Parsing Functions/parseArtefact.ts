import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {ArtefactSchema, ILines} from "../itemSchemas";
import {FindLinesByKey, FindLinesInValueByKey, FindValueByKey} from "../Static/functions";
import {ArtefactTypes} from "../Static/enums";
import {ItemProperties} from "../Static/itemProperties-class";

export const ParseArtefact = async function ParseArtefact(pathToItemsFolder = ''): Promise<void> {
    if (pathToItemsFolder === '' || !fs.existsSync(pathToItemsFolder)) {
        throw new Error('ParseContainer: incorrect or null path to folder');
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

    const resultFolder = RegionalPathToParse + '\\' + 'artefacts';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    ////////
    const AllArtefacts: ArtefactSchema[] = [];
    let dataJson: any;

    const subFolders: string[] = [];
    fs.readdirSync(pathToItemsFolder, {withFileTypes: true})
        .filter((dirent: { isDirectory: () => boolean; }) => dirent.isDirectory())
        .map((dirent: { name: string; }) => {
            subFolders.push(dirent.name);
        });

    subFolders.map(async folder => {
        await parseItemsInFolder(pathToItemsFolder + folder + '\\');
    })

    fs.writeFileSync(resultFolder + '\\' + 'all artefacts.json', JSON.stringify(AllArtefacts, null, 4));
    ////////

    async function parseItemsInFolder(folderPath: string) {
        const SelectedArtefactType: ArtefactSchema[] = [];
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

            const artefact = new ArtefactSchema({
                exbo_id: fileName,
                key: dataJson.name.key,
                name: dataJson.name.lines,
                color: dataJson.color,
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                weight: FindValueByKey(dataJson, "core.tooltip.info.weight", "float", 1),
                stats: [],
                additionalStats: [],
                features: {},
                description: FindLinesByKey(dataJson, itemKey() + 'description')
            });

            if (artefact.name.en == 'Polyhedron') {
                artefact.features = {
                    polyhedron: {
                        triggerDamage: '100',
                            //FindRangeValueByKey(dataJson, "stalker.tooltip.item.lifesaver_sniper.info.trigger_damage", 'int', null),
                        reduceDamage:
                            FindRangeValueByKey(dataJson, "stalker.tooltip.item.lifesaver_sniper.info.blocking_damage", 'float', 2),
                        reloadTime:
                            FindRangeValueByKey(dataJson, "stalker.tooltip.item.lifesaver.info.recharge", 'float', 1),
                        costToActivate:
                            FindRangeValueByKey(dataJson, "stalker.tooltip.item.lifesaver.info.cost", 'float', 1)
                    }
                };
                // (artefact.features as any).reduceDamage.isPositive = '1';
                // (artefact.features as any).reloadTime.isPositive = 'null';
                // (artefact.features as any).costToActivate.isPositive = 'null';
                // console.log(artefact.features);
            }

            const Stats: object[] = [];
            ItemProperties.AllProperties.playerProperties.forEach(prop => {
                const range = FindRangeValueByKey(dataJson, prop.key, 'float', 2);
                if (Number(range.max) != 0 || Number(range.min) != 0) {
                    Stats.push({
                        key: 'properties' + '.' + (prop.key).split('.')[(prop.key).split('.').length - 1],
                        range: range,
                        isPositive: (prop.goodIfGreaterThanZero && Number(range.max) > 0) || (!prop.goodIfGreaterThanZero && Number(range.max) < 0)
                            ? '1'
                            : '0',
                        lines: prop.lines
                    })
                }
            });

            const Positive: object[] = Stats.filter(prop => (prop as any).isPositive == "1");
            const Negative: object[] = Stats.filter(prop => (prop as any).isPositive == "0");
            artefact.stats = Positive.concat(Negative);

            SelectedArtefactType.push(artefact);
        });

        const CategoryName = folderPath.split('\\')[folderPath.split('\\').length - 2];
        fs.writeFile(resultFolder + '\\' + `${CategoryName}.json`, JSON.stringify(SelectedArtefactType, null, 4), (e) => {
            if (e) console.error(e);
        });
        SelectedArtefactType.map(artefact => AllArtefacts.push(artefact));
    }
}

export function FindRangeValueByKey(dataJson: any, searchingKey: string, type: string | null, roundValueIfFloat: number | null): any {
    let result: any = {
        min: '0',
        max: '0'
    };

    const returnType: string =
        (type == 'f' || type == 'float')
            ? 'float'
            : 'integer';

    for (let i = 0; i < (dataJson.infoBlocks).length; i++) {
        if (dataJson.infoBlocks[i].elements != undefined)
            for (let j = 0; j < (dataJson.infoBlocks[i].elements).length; j++) {
                for (const [key, value] of Object.entries(dataJson.infoBlocks[i].elements[j])) {
                    if ((key == 'name') && (value as any).key as string == searchingKey) {
                        if (dataJson.infoBlocks[i].elements[j].min != null && dataJson.infoBlocks[i].elements[j].max != null) {
                            result = {
                                min: dataJson.infoBlocks[i].elements[j].min,
                                max: dataJson.infoBlocks[i].elements[j].max
                            }
                        }
                    }
                }
            }
    }

    switch (returnType) {
        case 'integer': {
            result = {
                min: Number.parseInt(result.min).toString(),
                max: Number.parseInt(result.max).toString()
            }
            break;
        }
        case 'float': {
            if (typeof roundValueIfFloat == 'number' && roundValueIfFloat > 0)
                result = {
                    min: Number(result.min).toFixed(roundValueIfFloat),
                    max: Number(result.max).toFixed(roundValueIfFloat)
                }
            break;
        }
        default: {
            console.error("WHAT THE HELL???");
        }
    }

    return result;
}