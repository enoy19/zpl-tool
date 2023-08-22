import { env } from '$env/dynamic/private';
import fs from 'fs/promises';

if (!(await fileExists(env.SECRET_DATA_PATH))) {
	await fs.mkdir(env.SECRET_DATA_PATH, {
		recursive: true
	});
}

export async function storeObject(object: object, path: string) {
	await fs.writeFile(getDataFilePathFor(path), JSON.stringify(object, undefined, 2));
}

export async function createEmptyJsonFileIfNotExists(path: string) {
	if (!fileExists(path)) {
		await createEmptyJsonFile(path);
	}
}

export async function readJson(path: string) {
	try {
		return JSON.parse((await fs.readFile(getDataFilePathFor(path))).toString());
	} catch (e) {
		console.warn(`${path} not found`);
		return {};
	}
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
