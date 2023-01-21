const fs = require('fs');
const { pathToParse } = require('./pathToParse.js');

const WeaponSchema = {
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
    ammoType: "",
    startDamage: 0,
    endDamage: 0,
    ammoCapacity: 0,
    startDistance: 0,
    endDistance: 0,
    maxDistance: 0,
    rateOfFire: 0,
    reloadTime: 0,
    spread: 0,
    hipSpread: 0,
    verticalRecoil: 0,
    horizontalRecoil: 0,
    drawTime: 0,
    aimTime: 0,
    damageModifiers: {
        head: 1.25,
        limbs: 0.5,
        mobsDamage: 1,
    },
    damageFeatures: {
        damageIncreasing: {
          enabled: false,
          plusPercent: 0,
          maxPercent: 0,
          resetTime: 0
        },
        executeModifier: {
          enabled: false,
          plusPercent: 0,
          maxPercent: 0
        },
        uniqueBurstFire: {
            enabled: false,
            shotsPerBurst: 0,
            burstFireRate: 0,
            delayBetweenBurst: 0
        }
    },
    description: {
        ru: "",
        en: ""
    }
}

// EXCLUDE DEVICE AND MELEE
let ParseWeapon = async function ParseWeapon(pathToFolder = '') {
    if (pathToFolder === '' || !fs.existsSync(pathToFolder)) {
        console.error('ParseWeapon: incorrect or null path to folder');
        return;
    }

    const resultFolder = pathToParse+'/'+'Weapons';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }


}

module.exports.ParseWeapon = ParseWeapon;