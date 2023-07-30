import type { Template, Templates } from '$lib/types';
import fs from 'fs/promises';

const templatesFilePath = './templates.json';

if (!(await fileExists(templatesFilePath))) {
	await initFile(templatesFilePath);
}

export const templates: Templates = JSON.parse((await fs.readFile('./templates.json')).toString());

export async function setTemplate(template: Template) {
	templates[template.name] = template;
	await storeTemplates();
}

export async function deleteTemplate(templateName: string) {
    delete templates[templateName];
    await storeTemplates();
}

async function storeTemplates() {
	fs.writeFile(templatesFilePath, JSON.stringify(templates, undefined, 2));
}

async function initFile(filename: string) {
	try {
		const fileHandle = await fs.open(filename, 'a');
		await fileHandle.write('{}');
		await fileHandle.close();
	} catch (err) {
		console.error(err);
	}
}

async function fileExists(path: string) {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
}
