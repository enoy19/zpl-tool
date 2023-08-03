import { env } from "$env/dynamic/private";
import fs from "fs/promises";

export async function storeObject(object: object, path: string) {
	await fs.writeFile(getDataFilePathFor(path), JSON.stringify(object, undefined, 2));
}

export async function createEmptyJsonFileIfNotExists(path: string) {
    if(!fileExists(path)) {
        await createEmptyJsonFile(path);
    }
}

export async function readJson(path: string) {
    return JSON.parse((await fs.readFile(getDataFilePathFor(path))).toString());
}

async function createEmptyJsonFile(path: string) {
	await storeObject({}, path);
}

export async function fileExists(path: string) {
	try {
		await fs.access(getDataFilePathFor(path));
		return true;
	} catch {
		return false;
	}
}

function getDataFilePathFor(path: string) {
    return `${env.SECRET_DATA_PATH}/${path}`;
}
