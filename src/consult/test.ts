// tslint:disable:no-magic-numbers
import { INIT } from './commands'
import { ConsultFrameReader } from './ConsultFrameReader'

const r: ConsultFrameReader = new ConsultFrameReader()
r.commands.unshift([0xCF, 0x00, 0x00])
r.on('picked', console.log)
r.processChunk([0x01])
r.processChunk([0x01])
