import {PathToClone} from "./fileds";
import {IndexDirName} from "../index";
import fs from 'fs';
import Path from "path";
import {ILines} from "../itemSchemas";
import {PropertiesTypes} from "./enums";
import FileWithSortedProps from "../sortedProps.json";

export interface IPropertiesElement {
    key: string,
    goodIfGreaterThanZero: boolean,
    lines: ILines;
}

interface IProperties {
    player: IPropertiesElement[],
    attachmentOrBullet: IPropertiesElement[]
}

export class ItemProperties {

    public static readonly AllProperties: IProperties = {
        player: [],
        attachmentOrBullet: []
    };

    private static isInitialized: boolean = false;

    public static Init(): void {
        if (ItemProperties.isInitialized)
            return;

        let files: string[] = [];
        let AcceptedCategories: string[] = [];
        let BadPropertiesKeys: string[] = [];
        function ThroughDirectory(Directory: string) {
            fs.readdirSync(Directory).forEach(File => {
                const Absolute = Path.join(Directory, File);
                if (fs.statSync(Absolute).isDirectory()) return ThroughDirectory(Absolute);
                else {
                    if (AcceptedCategories.length > 0)
                    AcceptedCategories.forEach(category => {
                        if (Absolute.includes(category))
                            return files.push(Absolute);
                    })
                }
            });
        }

        // GET ARMORS+ARTEFACTS+MEDS PROPERTIES
        AcceptedCategories = [
            'armor',
            'artefact',
            'medicine'
        ];
        BadPropertiesKeys = [
            'stalker.tooltip.medicine.info.toxicity',
            'stalker.artefact_properties.factor.radiation_accumulation',
            'stalker.artefact_properties.factor.biological_accumulation',
            'stalker.artefact_properties.factor.thermal_accumulation',
            'stalker.artefact_properties.factor.psycho_accumulation',
            'stalker.artefact_properties.factor.bleeding_accumulation'
        ];
        ThroughDirectory(IndexDirName + '\\' + PathToClone + '\\' + 'ru' + '\\' + 'items');
        files.forEach(file => {
            const data = fs.readFileSync(file);
            const DataJson: object = JSON.parse(data.toString());
            for (const [key, value] of Object.entries(DataJson)) {
                if ((typeof value) == 'object') {
                    ItemProperties.IterateObject(key, value, ['stalker.artefact_properties.factor', 'stalker.tooltip.medicine.info.toxicity'], PropertiesTypes.Player);
                }
            }
        });

        ItemProperties.AllProperties.player.forEach(prop => {
            prop.goodIfGreaterThanZero = !BadPropertiesKeys.includes(prop.key);
        });

        // GET ATTACHMENT PROPERTIES
        files = [];
        AcceptedCategories = [
            'attachment',
            'bullet'
        ];
        BadPropertiesKeys = [
            'weapon.stat_factor.recoil',
            'weapon.stat_factor.horizontal_recoil',
            'weapon.stat_factor.spread',
            'weapon.stat_factor.hip_spread',
            'weapon.stat_factor.reload_time',
            'weapon.stat_factor.draw_time',
            'weapon.stat_factor.aim_switch_time',
            'weapon.tooltip.magazine.stat_name.jamming',
            'weapon.stat_factor.wiggle',

        ];

        ThroughDirectory(IndexDirName + '\\' + PathToClone + '\\' + 'ru' + '\\' + 'items');
        files.forEach(file => {
            const data = fs.readFileSync(file);
            const DataJson: object = JSON.parse(data.toString());
            for (const [key, value] of Object.entries(DataJson)) {
                if ((typeof value) == 'object') {
                    ItemProperties.IterateObject(key, value, [
                        'weapon.stat_factor',
                        'weapon.tooltip.magazine.info.additive_clip_size',
                        'core.tooltip.stat_name.damage_type',
                        'weapon.tooltip.bullet.stat_name'
                    ], PropertiesTypes.AttachmentOrBullet);
                }
            }
        });

        ItemProperties.AllProperties.attachmentOrBullet.forEach(prop => {
            prop.goodIfGreaterThanZero = !BadPropertiesKeys.includes(prop.key);
        });



        const SortedProps: IProperties = {
            player: [],
            attachmentOrBullet: []
        }

        // @ts-ignore
        FileWithSortedProps[PropertiesTypes.Player].forEach(key => {
            ItemProperties.AllProperties[PropertiesTypes.Player].forEach(prop => {
                if (prop.key == key)
                    SortedProps[PropertiesTypes.Player].push(prop);
            })
        })

        // @ts-ignore
        FileWithSortedProps[PropertiesTypes.AttachmentOrBullet].forEach(key => {
            ItemProperties.AllProperties[PropertiesTypes.AttachmentOrBullet].forEach(prop => {
                if (prop.key == key)
                    SortedProps[PropertiesTypes.AttachmentOrBullet].push(prop);
            })
        })

        if (ItemProperties.AllProperties[PropertiesTypes.Player].length == SortedProps[PropertiesTypes.Player].length) {
            ItemProperties.AllProperties[PropertiesTypes.Player] = SortedProps[PropertiesTypes.Player];
            console.log(`AllProperties - ${PropertiesTypes.Player}: successful sorted!`)
        } else {
            console.error(`AllProperties - ${PropertiesTypes.Player}: different arrays length`)
        }

        if (ItemProperties.AllProperties[PropertiesTypes.AttachmentOrBullet].length == SortedProps[PropertiesTypes.AttachmentOrBullet].length) {
            ItemProperties.AllProperties[PropertiesTypes.AttachmentOrBullet] = SortedProps[PropertiesTypes.AttachmentOrBullet];
            console.log(`AllProperties - ${PropertiesTypes.AttachmentOrBullet}: successful sorted!`)
        } else {
            console.error(`AllProperties - ${PropertiesTypes.AttachmentOrBullet}: different arrays length`)
        }

        ItemProperties.isInitialized = true;
    }

    private static IterateObject(k: string, v: object, searchingStrings: string[], type: PropertiesTypes) {
        for (const [key, value] of Object.entries(v)) {
            if (key == 'key') {
                let goNext: boolean = false;
                searchingStrings.forEach(str => {
                    if ((value.toString()).includes(str)) {
                        goNext = true;
                    }
                })
                if (goNext) {
                    const property: IPropertiesElement = {
                        key: value.toString(),
                        lines: {
                            ru: (v as any).lines.ru,
                            en: (v as any).lines.en
                        },
                        goodIfGreaterThanZero: true
                    }

                    let isDublicate: boolean = false;

                    // @ts-ignore
                    ItemProperties.AllProperties[type].forEach((prop: IPropertiesElement) => {
                        if (prop.key == property.key) {
                            isDublicate = true;
                        }
                    });

                    if (!isDublicate) {
                        // @ts-ignore
                        ItemProperties.AllProperties[type].push(property);
                    }
                }
            } else if ((typeof value) == 'object') {
                ItemProperties.IterateObject(key, value, searchingStrings, type);
            }
        }
    }
}