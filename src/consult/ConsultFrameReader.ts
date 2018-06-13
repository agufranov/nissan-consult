import { EventEmitter } from 'eventemitter3'

import { Command, CommandEventType } from './Command'

import { INIT, STOP } from './commands'
import {
    ERROR_BYTE,
    INIT_FIRST_RESPONSE_LENGTH,
    INIT_RESPONSE_LENGTH,
    VALUE_FRAME_HEADER_LENGTH,
    VALUE_FRAME_START_BYTE,
} from './constants'

interface IPickResult {
    frame: number[]
    type: CommandEventType
}

export class ConsultFrameReader extends EventEmitter<'picked'> {
    public command: Command | undefined
    public commands: Command[] = []
    public data: number[] = []

    public enqueueCommand(bytes: number[]): Command {
        const command: Command = new Command(bytes)
        this.commands.push(command)

        return command
    }

    public processChunk(chunk: number[]): void {
        if (chunk.length === 0) { throw new Error('Empty chunk received') }
        this.data = [...this.data, ...chunk]
        let picked: IPickResult | undefined
        do {
            picked = this.pickFrame()
            if (picked) {
                if (this.command) {
                    this.command.emit(picked.type, picked.frame)
                }
                this.emit('picked', picked)
            }
        } while (picked)
    }

    private pickFrame(): IPickResult | undefined {
        if (this.data.length === 0) { return undefined }

        if (this.data[0] === VALUE_FRAME_START_BYTE) {
            if (!this.command) { throw new Error('Got value frame, but no current command present') }
            if (this.data.length === 1) { return undefined }
            const frameLength: number = this.data[1] + VALUE_FRAME_HEADER_LENGTH
            if (this.data.length < frameLength) { return undefined }

            return { type: CommandEventType.VALUE, frame: this.data.splice(0, frameLength) }
        } else if (this.data[0] === ERROR_BYTE) {
            if (!this.command) { throw new Error('Got error frame, but no current command present') }

            return { type: CommandEventType.ERROR, frame: this.data.splice(1) }
        } else {
            if (this.commands.length === 0) { throw new Error('No commands in queue to process') }
            this.command = this.commands[0]
            const frameLength: number =
                this.command.equals(INIT)
                    ? this.data[0] === 0x00
                        ? INIT_RESPONSE_LENGTH
                        : INIT_FIRST_RESPONSE_LENGTH
                    : Math.max(this.command.bytes.length - 1, 1)
            if (this.data.length < frameLength) { return undefined }

            this.commands.shift()

            return { type: CommandEventType.COMMAND_RESPONSE, frame: this.data.splice(0, frameLength) }
        }
    }
}
