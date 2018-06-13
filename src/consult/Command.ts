import { EventEmitter } from 'eventemitter3'
import * as _ from 'lodash'

export enum CommandEventType {
    COMMAND_RESPONSE = 'COMMAND_RESPONSE',
    VALUE = 'VALUE',
    ERROR = 'ERROR',
}

type CommandEventTypes =
    CommandEventType.COMMAND_RESPONSE |
    CommandEventType.VALUE |
    CommandEventType.ERROR

export class Command extends EventEmitter<CommandEventTypes> {
    public readonly bytes: number[]

    public constructor(bytes: number[]) {
        super()
        this.bytes = bytes
    }

    public equals(bytes: number[]): boolean {
        return !!this.bytes && _.isEqual(this.bytes, bytes)
    }
}
