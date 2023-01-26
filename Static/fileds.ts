import {IndexDirName} from "../index";

export const UrlToSCDB: string = 'https://github.com/EXBO-Studio/stalcraft-database.git';
export const PathToClone: string = 'Cloned DataBase';
export const PathToParse = 'Parsed Data';
export const PathToImages = (server: string): string => IndexDirName+'\\'+PathToParse+'\\'+server+'\\'+'images'+'\\';