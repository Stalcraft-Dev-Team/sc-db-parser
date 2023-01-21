const fs = require('fs');
const { pathToParse } = require('./pathToParse.js');

const MeleeWeaponSchema = {
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

let ParseMeleeWeapon = async function ParseMeleeWeapon(pathToFolder = '') {
    if (pathToFolder === '' || !fs.existsSync(pathToFolder)) {
        console.error('ParseMeleeWeapon: incorrect or null path to folder');
        return;
    }

    const resultFolder = pathToParse+'/'+'Melee Weapons';
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }


}

module.exports.ParseMeleeWeapon = ParseMeleeWeapon;