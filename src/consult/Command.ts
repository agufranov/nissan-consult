import * as _ from 'lodash'
import { TypedEvent } from './TypedEvent'
import { TypedEventEmitter } from './TypedEventEmitter'

export enum CommandEventType {
    COMMAND_RESPONSE = 'COMMAND_RESPONSE',
    VALUE = 'VALUE',
    ERROR = 'ERROR',
}

type CommandEventTypes =
    CommandEventType.COMMAND_RESPONSE |
    CommandEventType.VALUE |
    CommandEventType.ERROR

export class Command extends TypedEventEmitter<{
    [CommandEventType.COMMAND_RESPONSE]: number[];
    [CommandEventType.VALUE]: number[];
    [CommandEventType.ERROR]: number[];
}> {
    public readonly bytes: number[]

    public constructor(bytes: number[]) {
        super({
            [CommandEventType.COMMAND_RESPONSE]: new TypedEvent<number[]>(),
            [CommandEventType.VALUE]: new TypedEvent<number[]>(),
            [CommandEventType.ERROR]: new TypedEvent<number[]>(),
        })
        this.bytes = bytes
    }

    public equals(bytes: number[]): boolean {
        return !!this.bytes && _.isEqual(this.bytes, bytes)
    }
}
