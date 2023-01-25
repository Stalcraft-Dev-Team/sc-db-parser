export interface ICanMutateValue {
    defaultValue: '0',
    mutatedValue: 'null'
}

export interface ILines {
    ru: string,
    en: string
}

export class WeaponSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines = { ru: "", en: "" };
    color: string = '';
    rank: ILines = { ru: "", en: "" };
    class: ILines = { ru: "", en: "" };
    weight: string = '0';
    ammoType: ILines = { ru: "", en: "" };
    startDamage: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    endDamage: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    startDistance: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    endDistance: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    maxDistance: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    ammoCapacity: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    rateOfFire: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    reloadTime: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    tacticalReloadTime: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" }; /* Не все оружия имеют тактическую перезарядку */
    spread: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    hipSpread: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    verticalRecoil: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    horizontalRecoil: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    drawTime: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    aimTime: ICanMutateValue = { defaultValue: "0", mutatedValue: "null" };
    damageModifiers: object = {
        head: '1.25',
        limbs: '0.5',
        mobsDamage: '1',
        pierce:  { defaultValue: "0", mutatedValue: "null" },
        bleeding: { defaultValue: "0", mutatedValue: "null" },
        stoppingPower: { defaultValue: "0", mutatedValue: "null" }
    };
    damageFeatures: object = {
        damageIncreasing: {
            ru: 'null',
            en: 'null'
        },
        executeModifier: {
            ru: 'null',
            en: 'null'
        },
        uniqueFeature: {
            ru: 'null',
            en: 'null'
        },
        damageTypes: { /* Огнемет и огниво берут часть от обычного урона, параметры ниже указывают процент урона от обычного */
            burnDamage: '0',
            pureDamage: '0'
        }
    };
    description: ILines = { ru: "", en: "" };

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;
        this.ammoType = obj.ammoType;
        this.startDamage = obj.startDamage;
        this.endDamage = obj.endDamage;
        this.startDistance = obj.startDistance;
        this.endDistance = obj.endDistance;
        this.maxDistance = obj.maxDistance;
        this.ammoCapacity = obj.ammoCapacity;
        this.rateOfFire = obj.rateOfFire;
        this.reloadTime = obj.reloadTime;
        this.tacticalReloadTime = Number(obj.tacticalReloadTime.defaultValue) == 0 ? obj.reloadTime : obj.tacticalReloadTime;
        this.spread = obj.spread;
        this.hipSpread = obj.hipSpread;
        this.verticalRecoil = obj.verticalRecoil;
        this.horizontalRecoil = obj.horizontalRecoil;
        this.drawTime = obj.drawTime;
        this.aimTime = obj.aimTime;
        if (obj.damageModifiers.head < 1.25) obj.damageModifiers.head = '1.25';
        if (Number.parseFloat(obj.damageModifiers.limbs) < 0.5) obj.damageModifiers.limbs = '0.5';
        if (obj.damageModifiers.mobsDamage < 1) obj.damageModifiers.mobsDamage = '1';
        this.damageModifiers = obj.damageModifiers;
        this.damageFeatures = obj.damageFeatures;
        this.description = obj.description;

        if (obj.damageFeatures.uniqueFeature.en.includes('x0.') > 0) {
            if (obj.damageFeatures.uniqueFeature.en.search('x0.7') > 0)
                obj.damageModifiers.limbs = '0.7';
            else if (obj.damageFeatures.uniqueFeature.en.search('x0.9') > 0)
                obj.damageModifiers.limbs = '0.9';

            this.damageModifiers = obj.damageModifiers;
        }
    }
}

export class AttachmentSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines = { ru: "", en: "" };
    color: string = '';
    rank: ILines = { ru: "", en: "" };
    class: ILines = { ru: "", en: "" };
    weight: string = '0';
    stats: object[] = [];
    features: object = {
        zoom: 'null'
    }
    suitableFor: object[] = [];
    description: ILines = { ru: "", en: "" };

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
    name: ILines = { ru: "", en: "" };
    color: string = '';
    class: ILines = { ru: "", en: "" };
    weight: string = '0';
    bulletType: ILines = { ru: "", en: "" };
    penetration: ILines = {
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
        this.penetration = obj.penetration.en == 'null' ? this.penetration : obj.penetration;
        this.stats = obj.stats;
    }
}

export class MeleeWeaponSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines = { ru: "", en: "" };
    color: string = '';
    rank: ILines = { ru: "", en: "" };
    class: ILines = { ru: "", en: "" };
    weight: string = '0';
    quickHit: object = {
        minDamage: '0',
        maxDamage: '0',
        distance: '0',
    };
    strongHit: object = {
        minDamage: '0',
        maxDamage: '0',
        distance: '0',
    };
    damageModifiers: object = {
        backStabDamage: '1.2',
        mobsDamage: '1',
        penetration: '0',
        chanceToDeepWound: '0',
    };
    damageFeatures: object = {
        damageTypes: {
            frostDamage: '0',
            burnDamage: '0',
            chemicalDamage: '0',
            pureDamage: '0'
        }
    };
    description: ILines = { ru: "", en: "" };

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;
        this.quickHit = obj.quickHit;
        this.strongHit = obj.strongHit;
        if (Number(obj.damageModifiers.mobsDamage) < 1) {
            obj.damageModifiers.mobsDamage = '1';
        }
        this.damageModifiers = obj.damageModifiers;
        this.damageFeatures = obj.damageFeatures;
        this.description = obj.description;
    }
}

export class DeviceSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines = { ru: "", en: "" };
    color: string = '';
    rank: string = '';
    class: ILines = { ru: "", en: "" };
    weight: string = '0';
    features: object = {
        signalSearcher: {
            canDetectSignals: '0',
            canDetectArtefacts: '0',
            range: 'null'
        },
        metalDetector: {
            passiveRange: 'null',
            activeRange: 'null',
            scanAngle: 'null'
        }
    }
    description: ILines = { ru: "", en: "" };

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.rank = obj.rank;
        this.class = obj.class;
        this.weight = obj.weight;
        this.features = obj.features;
        this.description = obj.description;
    }
}

export class MedicineSchema {
    exbo_id: string = '';
    key: string = '';
    name: ILines = { ru: "", en: "" };
    color: string = '';
    class: ILines = { ru: "", en: "" };
    weight: string = '0';
    purpose: ILines = { ru: "", en: "" };
    duration: string = '0';
    stats: object[] = [];
    description: object = {
        ru: '',
        en: ''
    };

    constructor(obj: any) {
        this.exbo_id = obj.exbo_id;
        this.key = obj.key;
        this.name = obj.name;
        this.color = obj.color;
        this.class = obj.class;
        this.weight = obj.weight;
        this.purpose = obj.purpose;
        this.duration = obj.duration;
        this.stats = obj.stats;
        this.description = obj.description;
    }
}



