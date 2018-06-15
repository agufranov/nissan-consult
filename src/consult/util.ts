// tslint:disable:no-magic-numbers
export const invert: ((byte: number) => number) = (byte: number): number => 0xFF - byte

export const toHex: ((n: number) => string) = (n: number): string => `0${n.toString(16)}`.slice(-2)

export const aToHex: ((ns: number[]) => string) = (ns: number[]): string => ns.map(toHex).join(' ')

export const fromHex: ((n: string) => number) = (n: string): number => parseInt(n, 16)

export const aFromHex: ((ns: string) => number[]) = (ns: string): number[] => ns.split(' ').map(fromHex)
