import fs from "fs";
import { PathToParse } from '../Static/fileds';
import { ArtefactSchema } from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    GetAndCopyIcons, MinimizeItemInfo,
    SortProperties, SortSomethingLikeInGame
} from "../Static/functions";
import {ItemProperties} from "../Static/itemProperties-class";
import FileWithArtefactAdditionalStats from "../artefacts.json";
import SortedArtefacts from "../SortedSomething/artefacts.json";

export const ParseArtefact = async function ParseArtefact(pathToItemsFolder = ''): Promise<object[]> {
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

    const resultFolder = RegionalPathToParse + '\\' + 'artefact';
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

    fs.writeFileSync(resultFolder + '\\' + 'all_artefacts.json', JSON.stringify(
        MinimizeItemInfo(
            SortSomethingLikeInGame(AllArtefacts, SortedArtefacts)
        )
    ));

    GetAndCopyIcons(pathToItemsFolder, server, 'artefact');

    return AllArtefacts; /* IMPORTANT */
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
                lines: dataJson.name.lines,
                color: dataJson.color,
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                weight: FindLinesInValueByKey(dataJson, "core.tooltip.info.weight"),
                stats: [
                    {
                        key: 'units',
                        value: '≥ 100',
                        lines: {
                            ru: 'Срабатывает при',
                            en: 'Triggers when'
                        }
                    },
                    {
                        key: 'units',
                        value: FindRangeValueByKey(dataJson, "stalker.tooltip.item.lifesaver_sniper.info.blocking_damage", 'float', 2),
                        lines: {
                            ru: 'Снижает урон на',
                            en: 'Reduces damage by'
                        }
                    },
                    {
                        key: 'time',
                        value: FindRangeValueByKey(dataJson, "stalker.tooltip.item.lifesaver.info.recharge", 'float', 1),
                        lines: {
                            ru: 'Время перезарядки',
                            en: 'Reload'
                        }
                    },
                    {
                        key: 'percentage',
                        value: FindRangeValueByKey(dataJson, "stalker.tooltip.item.lifesaver.info.cost", 'float', 2),
                        lines: {
                            ru: 'Заряда тратится при активации',
                            en: 'Charge required to activate'
                        }
                    },
                ],
                additionalStats: [],
                description: FindLinesByKey(dataJson, itemKey() + 'description')
            });

            if (artefact.stats.filter((item: any) => typeof item.value !== 'string' && Number(item.value.max) !== 0).length === 0) {
                artefact.stats = [];
            }
            artefact.stats = artefact.stats.concat(SortProperties(dataJson, 'player'));

            FileWithArtefactAdditionalStats.forEach((_artefact: any) => {
                const ArtefactKey = (_artefact.key.split('.')[1]).split('_')[1];

                if (artefact.key.search(ArtefactKey) !== -1) {
                    artefact.additionalStats = SortAdditionalProperties(_artefact.additionalStats);
                }
            });

            SelectedArtefactType.push(artefact);
        });

        const CategoryName = folderPath.split('\\')[folderPath.split('\\').length - 2];
        const CategoryPath = `${resultFolder}\\${CategoryName}.json`;

        fs.writeFileSync(CategoryPath, JSON.stringify(
            SortSomethingLikeInGame(SelectedArtefactType, SortedArtefacts)
        ));
        CreateSubFoldersAndItems(CategoryPath, undefined);

        SelectedArtefactType.map(artefact => AllArtefacts.push(artefact));
    }
}

export function FindRangeValueByKey(dataJson: any, searchingKey: string, type: string | null, roundValueIfFloat: number | null): any {
    let result: any = {
        min: '0',
        max: '0',
        lines: null
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
                                max: dataJson.infoBlocks[i].elements[j].max,
                                lines: dataJson.infoBlocks[i].elements[j].formatted.value
                            }
                        }
                    }
                }
            }
    }

    switch (returnType) {
        case 'integer': {
            result.min = Number.parseInt(result.min).toString();
            result.max = Number.parseInt(result.max).toString();
            break;
        }
        case 'float': {
            if (typeof roundValueIfFloat == 'number' && roundValueIfFloat > 0) {
                result.min = Number(result.min).toFixed(roundValueIfFloat);
                result.max = Number(result.max).toFixed(roundValueIfFloat);
            }
            break;
        }
        default: {
            console.error("WHAT THE HELL???");
        }
    }

    delete result.lines;
    return result;
}

function SortAdditionalProperties(array: any): object[] {
    const result: object[] = [];

    array.forEach((prop: any) => {
        const PropInfo = ItemProperties.AllProperties.player
            .filter((_prop: any) => {
                const _propKey = _prop.key.split('.')[_prop.key.split('.').length-1];

                let propKey = prop.key.split('.')[prop.key.split('.').length-1];
                if (propKey == 'psycho_protection_short')
                    propKey = 'psycho_protection';


                return _propKey == propKey;
            })[0];

        // @ts-ignore
        const IsPercentage: boolean = ItemProperties.PercentageTagProperties.player
            .filter((_key: string) => _key == PropInfo.key)[0] != undefined;
        result.push({
            unitKey: IsPercentage ? 'percentage' : null,
            key: PropInfo.key,
            value: {
                min: prop.valueMin.toString(),
                max: prop.valueMax.toString()
            },
            isPositive: prop.isPositive,
            lines: PropInfo.lines
        });
    })

    return result;
}