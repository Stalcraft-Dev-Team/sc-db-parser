import fs from 'fs';

export async function SaveErrorLog(name: string, errorData: any[]) {
    const pathToLogsFolder = 'errorLogs/';
    if (!fs.existsSync(pathToLogsFolder)) {
        fs.mkdirSync(pathToLogsFolder);
    }

    let dataToString: string = Date.now() + ' - Log data:\n';
    errorData.map((dataItem: any) => {
        dataToString += dataItem.toString() + '\n';
    });

    fs.writeFile(`${pathToLogsFolder}${name}.txt`, dataToString, (err) => {
        if (err)
            console.error(`${err.name}\n${err.path}\n${err.message}`);
    })
}