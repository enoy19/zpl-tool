import type { densities, printerTypes } from './constants';

export type Densities = (typeof densities)[number];

export type Density = `${Densities}dpmm`;
export type Variables = Record<string, string>;

export type Template = {
	name: string;
	zpl: string;
	width: number;
	height: number;
	density: Density;
};

export type Templates = Record<string, Template>;

export type PrinterType = (typeof printerTypes)[number];

export type PrinterOptions<T extends PrinterType> = T extends 'serial'
	? {
			path: string;
			baudRate: number;
	  }
	: T extends 'tcp'
	? {
			host: string;
			port: number;
	  }
	: never;

export type PrinterConfig<T extends PrinterType> = {
	type: T;
	dpmm: number;
	widthMm: number;
	heightMm: number;
	options: PrinterOptions<T>;
};

export type PrinterConfigs = Record<string, PrinterConfig<PrinterType>>;

export type BinarykitsZplRequestBody = {
	zpl: string;
	dpmm: number;
	width: number;
	height: number;
};
