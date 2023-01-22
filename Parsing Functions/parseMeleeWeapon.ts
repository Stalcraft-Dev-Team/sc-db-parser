const fs = require('fs');
import { pathToParse } from './pathToParse';
const { MeleeWeaponSchema } = require('../itemSchemas.ts');

export const ParseMeleeWeapon = async function ParseMeleeWeapon(pathToFolder = '') {
    if (pathToFolder === '' || !fs.existsSync(pathToFolder)) {
        console.error('ParseMeleeWeapon: incorrect or null path to folder');
        return;
    }

}
