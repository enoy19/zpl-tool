export abstract class Printer {
	constructor(public readonly identifier: string) {}

	public abstract print(zpl: string): Promise<void>;
}
