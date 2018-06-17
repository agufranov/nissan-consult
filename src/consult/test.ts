// tslint:disable:no-magic-numbers
import { Command, CommandEventType } from './Command'
import { INIT } from './commands'
import { ConsultFrameReader } from './FrameReader'

const r: ConsultFrameReader = new ConsultFrameReader()
const comm: Command = r.enqueueCommand([0xD1, 0xF0])
const comm2: Command = r.enqueueCommand([0x30, 0xD1, 0xF0])
comm.on(CommandEventType.COMMAND_RESPONSE, (frame: number[]) => console.log('Command got response', frame))
comm.on(CommandEventType.VALUE, (frame: number[]) => console.log('Command got value', frame))
comm2.on(CommandEventType.COMMAND_RESPONSE, (frame: number[]) => console.log('Command 2 got response', frame))
comm2.on(CommandEventType.VALUE, (frame: number[]) => console.log('Command 2 got value', frame))
// r.on('picked', console.log)
r.processChunk([0xC5, 0xFF])
r.processChunk([0x03, 0xDD, 0xDD, 0xDD, 0xFF])
r.processChunk([0x03, 0xDD, 0xDD, 0xDD])
r.processChunk([0xC5, 0xFF, 0x01, 0xDD])