import * as _ from 'lodash'

// tslint:disable:no-magic-numbers
export const INIT: number[] = [0xFF, 0xFF, 0xEF]
export const STOP: number[] = [0x30]
export const GEN_SENSOR: ((codes: number[]) => number[]) = (codes: number[]): number[] =>
    [0x30, ..._.flatMap(codes, (code: number) => [0x5A, code]), 0xF0]