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
    weight: string = '0';
    ammoType: object = {
        ru: '',
        en: ''
    };
    startDamage: string = '0';
    endDamage: string = '0';
    startDistance: string = '0';
    endDistance: string = '0';
    maxDistance: string = '0';
    ammoCapacity: string = '0';
    rateOfFire: string = '0';
    reloadTime: string = '0';
    tacticalReloadTime: string = '0'; /* Не все оружия имеют тактическую перезарядку */
    spread: string = '0';
    hipSpread: string = '0';
    verticalRecoil: string = '0';
    horizontalRecoil: string = '0';
    drawTime: string = '0';
    aimTime: string = '0';
    damageModifiers: object = {
        head: '1.25',
        limbs: '0.5',
        mobsDamage: '1',
        pierce: '0',
        bleeding: '0',
        stoppingPower: '0'
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
            burnDamage: '0',
            pureDamage: '0'
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
            if (obj.damageFeatures.uniqueFeature.en.search('x0.7') > 0)
                obj.damageModifiers.limbs = '0.7';
            else if (obj.damageFeatures.uniqueFeature.en.search('x0.9') > 0)
                obj.damageModifiers.limbs = '0.9';

            this.damageModifiers = obj.damageModifiers;
        }
    }
}

export class MeleeWeaponSchema {
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
