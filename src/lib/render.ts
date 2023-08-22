import type { Variables } from './types';

const variableRegex = /\$\{([\w]+)\}/g;

export function renderZpl(zpl: string, ...variables: Variables[]) {
	return variables.map((v) => replaceVariables(zpl, v)).join('\n');
}

export function getVariableNames(zpl: string) {
	const variableNames = new Set<string>();
	let match;
	while ((match = variableRegex.exec(zpl)) !== null) {
		variableNames.add(match[1]);
	}
	return Array.from(variableNames);
}

function replaceVariables(str: string, values: Variables) {
	return str.replace(variableRegex, (match, variableName) => {
		return values[variableName] || match;
	});
}
