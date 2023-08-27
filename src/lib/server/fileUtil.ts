import { env } from '$env/dynamic/private';
import fs from 'fs/promises';

await mkdirIfNotExists('.');

export async function mkdirIfNotExists(dataPath: string) {
	const path = getDataFilePathFor(dataPath);

	if (!(await fileExists(path, false))) {
		await fs.mkdir(path, {
			recursive: true
		});
	}
}

export async function storeObject(object: object, dataPath: string) {
	await fs.writeFile(getDataFilePathFor(dataPath), JSON.stringify(object, undefined, 2));
}

export async function createEmptyJsonFileIfNotExists(dataPath: string) {
	if (!fileExists(dataPath)) {
		await createEmptyJsonFile(dataPath);
	}
}

export async function readJson(dataPath: string) {
	try {
		return JSON.parse((await fs.readFile(getDataFilePathFor(dataPath))).toString());
	} catch (e) {
		console.warn(`${dataPath} not found`);
		return {};
	}
}

async function createEmptyJsonFile(dataPath: string) {
	await storeObject({}, dataPath);
}

export async function fileExists(path: string, inDataPath = true) {
	try {
		await fs.access(inDataPath ? getDataFilePathFor(path) : path);
		return true;
	} catch {
		return false;
	}
}

export function getDataFilePathFor(dataPath: string) {
	return `${env.SECRET_DATA_PATH}/${dataPath}`;
}
