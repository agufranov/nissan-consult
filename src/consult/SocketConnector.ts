import { connect } from 'socket.io-client'
import { ConsultFrameReader } from '../consult/FrameReader'
import { Command } from './Command'

export class SocketConnector {
    private socket: SocketIOClient.Socket
    private frameReader: ConsultFrameReader

    public constructor(uri: string, frameReader: ConsultFrameReader) {
        this.socket = connect(uri)
        this.frameReader = frameReader

        this.socket.on('message', ((data: ArrayBuffer): void => {
            const chunk: number[] = Array.from(new Uint8Array(data))
            this.frameReader.processChunk(chunk)
        }))
    }

    public send = (data: number[]): Command => {
        this.socket.send(data)
        return this.frameReader.enqueueCommand(data)
    }
}
