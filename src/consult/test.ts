// tslint:disable:no-magic-numbers
import { CommandEventType } from './Command'
import { INIT } from './commands'
import { ConsultFrameReader } from './ConsultFrameReader'

const r: ConsultFrameReader = new ConsultFrameReader()
r.enqueueCommand([0xD1, 0xF0])
    .on(CommandEventType.VALUE, (frame: number[]) => console.log('Command got value', frame))
    .on(CommandEventType.COMMAND_RESPONSE, (frame: number[]) => console.log('Command got response', frame))
// r.on('picked', console.log)
r.processChunk([0xC5, 0xFF])
r.processChunk([0x03, 0xDD, 0xDD, 0xDD, 0xFF])
r.processChunk([0x03, 0xDD, 0xDD, 0xDD])
