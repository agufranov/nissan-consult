import { CommandHelper } from '../../consult/CommandHelper'
import { ConsultFrameReader } from '../../consult/FrameReader'
import { SocketConnector } from '../../consult/SocketConnector'
import { Timer } from '../../consult/Timer'
import { aToHex } from '../../consult/util'

const reader = new ConsultFrameReader()
// tslint:disable-next-line:typedef
reader.on('error', (error) => console.error(error))
const socketConnector = new SocketConnector('ws://localhost:8033', reader)
const commandHelper = new CommandHelper(reader, socketConnector.send)

setInterval(() => {
    self.postMessage('This is message from worker')
}, 1000)

self.addEventListener('message', (event: MessageEvent) => {
    const msg = event.data
    console.log('Worker got message:', msg)
    if (msg.command === 'getAvailableSensors') {
        const t = new Timer()
        commandHelper.getAvailableSensors()
            .then((data: number[]) => {
                t.check()
                console.log('Available sensors:', aToHex(data))
                self.postMessage('GOT AVAILABLE SENSORS')
            })
    } else if (msg.command === 'getAvailableSensorsAndPoll') {
        commandHelper.getAvailableSensorsAndPoll()
    }
})
