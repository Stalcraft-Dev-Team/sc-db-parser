import exp from "constants";

export interface ICanMutateValue {
    defaultValue: '0',
    mutatedValue: string | null
}

export interface ILines {
    ru: string | null,
    en: string | null
}

export class WeaponSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines | null = null;
    color: string = '';
    rank: ILines | null = null;
    category: ILines = { ru: "Оружие", en: "Weapon" };
    class: ILines | null = null;
    weight: string = '0';
    ammoType: ILines | null = null;
    stats: object[] = [];
    features: object = [];
    damageModifiers: object = [];
    additionalStats: object = [];
    description: ILines | null = null;

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;
        this.ammoType = obj.ammoType;

        let allZeroStatsDeleted = false;
        while (!allZeroStatsDeleted) {
            let indexToDelete = -1;

            (obj.stats as object[]).map((stat: any, index) => {
                if (stat.value == undefined || Number(stat.value) == 0)
                    indexToDelete = index;

                if (stat.value != undefined && typeof stat.value == 'number')
                    stat.value = stat.value.toString();
            });

            if (indexToDelete == -1)
                allZeroStatsDeleted = true;
            else
                delete obj.stats[indexToDelete];
        }
        obj.stats = obj.stats.filter((stat: any) => stat != null);
        this.stats = obj.stats;

        //////
        let allNullFeaturesDeleted = false;
        while (!allNullFeaturesDeleted) {
            let indexToDelete = -1;

            (obj.features as object[]).map((stat: any, index) => {
                if ((stat.value == null && stat.lines == null) || (stat.value != null && Number(stat.value) == 0))
                    indexToDelete = index;
            });

            if (indexToDelete == -1)
                allNullFeaturesDeleted = true;
            else
                delete obj.features[indexToDelete];
        }
        obj.features = obj.features.filter((stat: any) => stat != null);
        this.features = obj.features;
        //////

        //////
        let allNullDamageModifiersDeleted = false;
        while (!allNullDamageModifiersDeleted) {
            let indexToDelete = -1;

            (obj.damageModifiers as object[]).map((stat: any, index) => {
                if ((stat.value == null && stat.lines == null) || (stat.value != null && Number(stat.value) == 0))
                    indexToDelete = index;
            });

            if (indexToDelete == -1)
                allNullDamageModifiersDeleted = true;
            else
                delete obj.damageModifiers[indexToDelete];
        }
        obj.damageModifiers = obj.damageModifiers.filter((stat: any) => stat != null);
        this.damageModifiers = obj.damageModifiers;
        //////

        //////
        let allNullAdditionalStatsDeleted = false;
        while (!allNullAdditionalStatsDeleted) {
            let indexToDelete = -1;

            (obj.additionalStats as object[]).map((stat: any, index) => {
                if (Number(stat.value) == 0)
                    indexToDelete = index;
            });

            if (indexToDelete == -1)
                allNullAdditionalStatsDeleted = true;
            else
                delete obj.additionalStats[indexToDelete];
        }
        obj.additionalStats = obj.additionalStats.filter((stat: any) => stat != null);
        this.additionalStats = obj.additionalStats;
        //////

        this.description = obj.description;
    }
}

export class AttachmentSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines | null = null;
    color: string = '';
    rank: ILines | null = null;
    category: ILines = { ru: "Обвес", en: "Attachment" };
    class: ILines | null = null;
    weight: string = '0';
    stats: object[] = [];
    features: object = {
        zoom: null
    }
    suitableFor: object[] = [];
    description: ILines | null = null;

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;
        this.stats = obj.stats;
        if (obj.features != undefined)
            this.features = obj.features;
        this.description = obj.description;
    }
}

export class BulletSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines | null = null;
    color: string = '';
    category: ILines = { ru: "Патрон", en: "Bullet" };
    class: ILines | null = null;
    weight: ILines | null = null;
    bulletType: ILines | null = null;
    penetration: ILines | null = {
        ru: 'Низкая пробиваемость',
        en: 'Low penetration'

    };
    stats: object[] = [];

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.class = obj.class;
        this.weight = obj.weight;
        this.bulletType = obj.bulletType;
        this.penetration = obj.penetration == null ? this.penetration : obj.penetration;
        this.stats = obj.stats;
    }
}

export class MeleeWeaponSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines | null = null;
    color: string = '';
    rank: ILines | null = null;
    category: ILines = { ru: "Ближний бой", en: "Melee weapon" };
    class: ILines | null = null;
    weight: ILines | null = null;
    stats: object[] = [];
    damageModifiers: object[] = [];
    description: ILines | null = null;

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;

        //////
        let allZeroStatsDeleted = false;
        while (!allZeroStatsDeleted) {
            let indexToDelete = -1;

            (obj.stats as object[]).map((stat: any, index) => {
                if (Number(stat.value) == 0)
                    indexToDelete = index;
            });

            if (indexToDelete == -1)
                allZeroStatsDeleted = true;
            else
                delete obj.stats[indexToDelete];
        }
        obj.stats = obj.stats.filter((stat: any) => stat != null);
        this.stats = obj.stats;
        //////

        //////
        let allNullDamageModifiersDeleted = false;
        while (!allNullDamageModifiersDeleted) {
            let indexToDelete = -1;

            (obj.damageModifiers as object[]).map((stat: any, index) => {
                if (Number(stat.value) == 0)
                    indexToDelete = index;
            });

            if (indexToDelete == -1)
                allNullDamageModifiersDeleted = true;
            else
                delete obj.damageModifiers[indexToDelete];
        }
        obj.damageModifiers = obj.damageModifiers.filter((stat: any) => stat != null);
        this.damageModifiers = obj.damageModifiers;
        //////

        this.description = obj.description;
    }
}

export class GrenadeSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines | null = null;
    color: string = '';
    rank: string = '';
    category: ILines = { ru: "Граната", en: "Grenade" };
    class: ILines | null = null;
    weight: ILines | null = null;
    stats: object[] = [];
    description: ILines | null = null;

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;

        //////
        let allZeroStatsDeleted = false;
        while (!allZeroStatsDeleted) {
            let indexToDelete = -1;

            (obj.stats as object[]).map((stat: any, index) => {
                if ((stat.value == null && stat.lines == null) || (stat.value != null && Number(stat.value) == 0 && stat.lines != null))
                    indexToDelete = index;
            });

            if (indexToDelete == -1)
                allZeroStatsDeleted = true;
            else
                delete obj.stats[indexToDelete];
        }
        obj.stats = obj.stats.filter((stat: any) => stat != null);
        this.stats = obj.stats;
        //////

        this.description = obj.description;
    }
}

export class DeviceSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines | null = null;
    color: string = '';
    rank: string = '';
    category: ILines = { ru: "Устройство", en: "Device" };
    class: ILines | null = null;
    weight: ILines | null = null;
    stats: object[] = [];
    description: ILines | null = null;

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;

        //////
        let allZeroStatsDeleted = false;
        while (!allZeroStatsDeleted) {
            let indexToDelete = -1;

            (obj.stats as object[]).map((stat: any, index) => {
                if ((stat.value == null && stat.lines == null) || (stat.value != null && Number(stat.value) == 0 && stat.lines != null))
                    indexToDelete = index;
            });

            if (indexToDelete == -1)
                allZeroStatsDeleted = true;
            else
                delete obj.stats[indexToDelete];
        }
        obj.stats = obj.stats.filter((stat: any) => stat != null);
        this.stats = obj.stats;
        //////

        this.description = obj.description;
    }
}

export class MedicineSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines | null = null;
    color: string = '';
    rank: string = '';
    category: ILines = { ru: "Медицина", en: "Medicine" };
    class: ILines | null = null;
    weight: ILines | null = null;
    purpose: ILines | null = null;
    duration: string = '0';
    stats: object[] = [];
    description: ILines | null = null;

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;
        this.purpose = obj.purpose;
        this.duration = obj.duration;
        this.stats = obj.stats;
        this.description = obj.description;
    }
}

export class ArmorSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines | null = null;
    color: string = '';
    rank: ILines | null = null;
    category: ILines = { ru: "Броня", en: "Armor" };
    class: ILines | null = null;
    weight: ILines | null = null;
    nightVisionGlasses: ILines | null = null;
    compatibilityBackpacks: ILines | null = null;
    compatibilityContainers: ILines | null = null;
    stats: object[] = [];

    description: ILines | null = null;

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;
        this.nightVisionGlasses = obj.nightVisionGlasses;
        this.compatibilityBackpacks = obj.compatibilityBackpacks;
        this.compatibilityContainers = obj.compatibilityContainers;
        this.stats = obj.stats;
        this.description = obj.description;
    }
}

export class ArtefactSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines | null = null;
    color: string = '';
    rank: string = '';
    category: ILines = { ru: "Артефакт", en: "Artefact" };
    class: ILines | null = null;
    weight: ILines | null = null;
    stats: object[] = [];
    additionalStats: object[] = [];
    features: object = {};
    description: ILines | null = null;

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;
        this.stats = obj.stats;
        this.additionalStats = obj.additionalStats;
        this.features = obj.features;
        this.description = obj.description;
    }
}

export class ContainerSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines | null = null;
    color: string = '';
    rank: string = '';
    category: ILines = { ru: "Контейнер/Рюкзак", en: "Container/Backpack" };
    class: ILines | null = null;
    containerType: ILines | null = null;
    weight: ILines | null = null;
    stats: object[] = [];
    description: ILines | null = null;

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.containerType = obj.containerType;
        this.weight = obj.weight;
        this.stats = obj.stats;
        this.description = obj.description;
    }
}

export class OtherItemSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines | null = null;
    color: string = '';
    rank: string = '';
    category: ILines = { ru: "Прочее", en: "Other" };
    class: ILines | null = null;
    weight: ILines | null = null;

    description: ILines | null = null;

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;
        this.description = obj.description;
    }
}

export interface IRecipe {
    money: string,
    item: object | null,
    otherItems: object[]
}

export class ItemRecipes {
    exbo_id: string = '';
    settlementTitles: ILines[] = [];
    settlementRequiredLevel: string = '';
    recipes: IRecipe[] = [];

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.settlementTitles = obj.settlementTitles;
        this.settlementRequiredLevel = obj.settlementRequiredLevel;
        this.recipes = obj.recipes;
    }
}

