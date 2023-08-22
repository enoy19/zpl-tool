import type { Template, Templates } from '$lib/types';
import { createEmptyJsonFileIfNotExists, readJson, storeObject } from './fileUtil';

const templatesFilename = `templates.json`;

await createEmptyJsonFileIfNotExists(templatesFilename);

export const templates: Templates = await readJson(templatesFilename);

export async function setTemplate(template: Template) {
	templates[template.name] = template;
	await storeObject(templates, templatesFilename);
}

export async function deleteTemplate(templateName: string) {
	delete templates[templateName];
	await storeObject(templates, templatesFilename);
}
