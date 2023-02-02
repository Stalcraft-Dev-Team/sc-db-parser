import fs from "fs";
import {PathToParse} from '../Static/fileds';
import {ContainerSchema, ILines} from "../itemSchemas";
import {
    CreateSubFoldersAndItems,
    FindLinesByKey,
    FindLinesInValueByKey,
    FindValueByKey, GetAndCopyIcons, MinimizeItemInfo,
    SortByGearRanksKeys,
    SortProperties
} from "../Static/functions";
import {ContainerTypes} from "../Static/enums";



export const ParseContainer = async function ParseContainer(pathToItemsFolder = ''): Promise<object[]> {
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

    const resultFolder = RegionalPathToParse + '\\' + 'container';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }

    ////////
    const AllContainers: ContainerSchema[] = [];
    let dataJson: any;
    parseItemsInFolder(pathToItemsFolder).then(() => {
        const CategoryPath = resultFolder + '\\' + `all_containers.json`;
        fs.writeFileSync(CategoryPath, JSON.stringify(MinimizeItemInfo(SortByGearRanksKeys(AllContainers))));
        CreateSubFoldersAndItems(CategoryPath, SortByGearRanksKeys(AllContainers));
        GetAndCopyIcons(pathToItemsFolder, server, 'container');
    }).catch(e => {
        console.error(e);
    });

    return SortByGearRanksKeys(AllContainers); /* IMPORTANT */
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

            const container = new ContainerSchema({
                exbo_id: fileName,
                key: dataJson.name.key,
                name: dataJson.name.lines,
                color: dataJson.color,
                class: FindLinesInValueByKey(dataJson, "core.tooltip.info.category"),
                rank: FindLinesInValueByKey(dataJson, "core.tooltip.info.rank"),
                containerType: {},
                weight: FindValueByKey(dataJson, "core.tooltip.info.weight", "float", 2),
                stats: [
                    {
                        key: 'percentage',
                        value: FindValueByKey(dataJson, "stalker.tooltip.backpack.stat_name.inner_protection", "int", null),
                        lines: {
                            ru: 'Внутренняя защита',
                            en: 'Inner protection'
                        }
                    },
                    {
                        key: 'percentage',
                        value: FindValueByKey(dataJson, "stalker.tooltip.backpack.stat_name.effectiveness", "int", null),
                        lines: {
                            ru: 'Эффективность',
                            en: 'Effectiveness'
                        }
                    },
                    {
                        key: null,
                        value: FindValueByKey(dataJson, "stalker.tooltip.backpack.info.size", "int", null),
                        lines: {
                            ru: 'Вместимость артефактов',
                            en: 'Artefact capacity'
                        }
                    },
                ],
                description: FindLinesByKey(dataJson, itemKey() + 'description')
            });


            for (const [key, value] of Object.entries(ContainerTypes)) {
                let isIt: ILines | null = FindLinesByKey(dataJson, value);
                if (isIt != null) {
                    container.containerType = isIt;
                    break;
                }
            }

            container.stats = container.stats.filter((stat: any) => Number(stat.value) != 0);
            container.stats = container.stats.concat(SortProperties(dataJson, 'player'));

            AllContainers.push(container);
        });
    }
}

