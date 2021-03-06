import { Command, CommandEventType } from './Command'

import { INIT } from './commands'
import {
    ERROR_BYTE,
    INIT_FIRST_RESPONSE_LENGTH,
    INIT_RESPONSE_LENGTH,
    STOP_COMMAND_BYTE,
    VALUE_FRAME_HEADER_LENGTH,
    VALUE_FRAME_START_BYTE,
} from './constants'
import { TypedEvent } from './TypedEvent'
import { TypedEventEmitter } from './TypedEventEmitter'
import { invert } from './util'

export interface IPickResult {
    frame: number[]
    type: CommandEventType
}

export class ConsultFrameReader extends TypedEventEmitter<{
    picked: IPickResult;
    rawChunk: number[];
    enqueue: Command;
    error: string;
}> {
    public command: Command | undefined
    public commands: Command[] = []
    public data: number[] = []

    public constructor() {
        super({
            picked: new TypedEvent<IPickResult>(),
            rawChunk: new TypedEvent<number[]>(),
            enqueue: new TypedEvent<Command>(),
            error: new TypedEvent<string>(),
        })
    }

    public enqueueCommand(bytes: number[]): Command {
        const command: Command = new Command(bytes)
        this.commands.push(command)
        this.emit('enqueue', command)

        return command
    }

    public processChunk(chunk: number[]): void {
        this.emit('rawChunk', chunk)
        if (chunk.length === 0) { this.emit('error', 'Empty chunk received'); return }
        this.data = [...this.data, ...chunk]
        let picked: IPickResult | undefined
        setTimeout(() => {
            do {
                picked = this.pickFrame()
                if (picked) {
                    if (this.command) {
                        this.command.emit(picked.type, picked.frame)
                    }
                    this.emit('picked', picked)
                }
            } while (picked)
        })
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private pickFrame(): IPickResult | undefined {
        if (this.data.length === 0) { return undefined }

        if (this.data[0] === VALUE_FRAME_START_BYTE) {
            if (!this.command) { this.emit('error', 'Got value frame, but no current command present'); return }
            if (this.data.length === 1) { return undefined }
            const frameLength: number = this.data[1] + VALUE_FRAME_HEADER_LENGTH
            if (this.data.length < frameLength) { return undefined }

            return { type: CommandEventType.VALUE, frame: this.data.splice(0, frameLength) }
        } else if (this.data[0] === ERROR_BYTE) {
            if (!this.command) { this.emit('error', 'Got error frame, but no current command present'); return }

            return { type: CommandEventType.ERROR, frame: this.data.splice(0, 1) }
        } else {
            if (this.commands.length === 0) { this.emit('error', 'No commands in queue to process'); return }
            this.command = this.commands[0]
            let frameLength: number | undefined
            if (this.command.equals(INIT)) {
                frameLength = this.data[0] === 0x00 ? INIT_RESPONSE_LENGTH : INIT_FIRST_RESPONSE_LENGTH
            } else if (
                (this.command.bytes[0] === 0x5A)
                || (
                    (this.command.bytes[0] === 0x30)
                    &&
                    (this.command.bytes[1] === 0x5A)
                )
             ) {
                 let i;
                 let c = 0;
                 let set = false
                 for (i = 0; i < this.data.length; i++) {
                     const d = this.data[i]
                     if (d !== 0xa5) { c++ }
                     if (c === Math.floor(this.command.bytes.length / 2)) {
                         set = true
                         frameLength = i + 1
                         console.warn('framelength set to', frameLength)
                         break
                     }
                 }
                 if (!set) { frameLength = undefined }
            } else if ((this.command.bytes[0] === STOP_COMMAND_BYTE) && this.command.bytes.length > 1) {
                frameLength = this.data.length > 0
                    ? (this.data[0] === invert(STOP_COMMAND_BYTE))
                        ? this.command.bytes.length - 1
                        // tslint:disable-next-line:no-magic-numbers
                        : this.command.bytes.length - 2
                    : undefined
            } else {
                frameLength = Math.max(this.command.bytes.length - 1, 1)
            }
            if ((frameLength === undefined) || (this.data.length < frameLength)) { return undefined }

            this.commands.shift()

            return { type: CommandEventType.COMMAND_RESPONSE, frame: this.data.splice(0, frameLength) }
        }
    }
}
