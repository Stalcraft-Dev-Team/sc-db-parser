const fs = require('fs');

async function ParseWeapon(pathToFolder = '') {
    if (pathToFolder === '' || !fs.existsSync(pathToFolder)) {
        console.error('ParseWeapon: incorrect or null path to folder');
        return;
    }

}