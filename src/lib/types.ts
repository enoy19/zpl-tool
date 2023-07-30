export const densities = [6, 8, 12, 24] as const;
export type Densities = (typeof densities)[number];

export type Density = `${Densities}dpmm`;
export type Variables = Record<string, any>;

export type Template = {
	name: string;
	zpl: string;
    width: number;
    height: number;
    density: Density;
};

export type Templates = Record<string, Template>;
