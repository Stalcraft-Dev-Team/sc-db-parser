export class WeaponSchema {
    id: string = '';
    name: object = {
        ru: '',
        en: ''
    };
    color: string = '';
    rank: object = {
        ru: '',
        en: ''
    };
    class: object = {
        ru: '',
        en: ''
    };
    weight: number = 0;
    ammoType: object = {
        ru: '',
        en: ''
    };
    startDamage: number = 0;
    endDamage: number = 0;
    startDistance: number = 0;
    endDistance: number = 0;
    maxDistance: number = 0;
    ammoCapacity: number = 0;
    rateOfFire: number = 0;
    reloadTime: number = 0;
    tacticalReloadTime: number = 0; /* Не все оружия имеют тактическую перезарядку */
    spread: number = 0;
    hipSpread: number = 0;
    verticalRecoil: number = 0;
    horizontalRecoil: number = 0;
    drawTime: number = 0;
    aimTime: number = 0;
    damageModifiers: object = {
        head: 1.25,
        limbs: 0.5,
        mobsDamage: 1,
        pierce: 0,
        bleeding: 0,
        stoppingPower: 0
    };
    damageFeatures: object = {
        damageIncreasing: {
            ru: '',
            en: ''
        },
        executeModifier: {
            ru: '',
            en: ''
        },
        uniqueFeature: {
            ru: '',
            en: ''
        },
        damageTypes: { /* Огнемет и огниво берут часть от обычного урона, параметры ниже указывают процент урона от обычного */
            burnDamage: 0,
            pureDamage: 0
        }
    };
    description: object = {
        ru: '',
        en: ''
    };

    constructor (obj: any) {
        this.id = obj.id;
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
        this.tacticalReloadTime = obj.tacticalReloadTime == 0 ? obj.reloadTime : obj.tacticalReloadTime;
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

        if (obj.damageFeatures.uniqueFeature.en.search('x0.') > 0) {
            console.log(obj.name)
            if (obj.damageFeatures.uniqueFeature.en.search('x0.7') > 0)
                obj.damageModifiers.limbs = '0.7';
            else if (obj.damageFeatures.uniqueFeature.en.search('x0.9') > 0)
                obj.damageModifiers.limbs = '0.9';

            this.damageModifiers = obj.damageModifiers;
        }
    }
}

interface MeleeWeaponSchema {
    id: "",
    category: "",
    name: {
        ru: "",
        en: ""
    },
    color: "",
    rank: {
        ru: "",
        en: ""
    },
    class: {
        ru: "",
        en: ""
    },
    weight: 0,
    quickHit: {
        minDamage: 0,
        maxDamage: 0,
        distance: 0
    },
    strongHit: {
        minDamage: 0,
        maxDamage: 0,
        distance: 0
    },
    penetration: 0,
    chanceForADeepWound: 0,
    damageModifiers: {
        backStabDamage: 1,
        mobsDamage: 1,
    },
    damageFeatures: {
        frostDamage: 0,
        fireDamage: 0,
        chemicalDamage: 0,
        pureDamage: 0
    },
    description: {
        ru: "",
        en: ""
    }
}