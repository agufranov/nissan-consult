import * as _ from 'lodash'

import { Command, CommandEventType } from './Command'
import { GEN_SENSOR_C, STOP } from './commands'
import { ConsultFrameReader } from './FrameReader'
import { getSensorValue } from './sensorTestValues'
import { Timer } from './Timer'
import { aFromHex, aToHex } from './util'

export class CommandHelper {
    private frameReader: ConsultFrameReader
    private send: (data: number[]) => Command
    private stopFlag: boolean = false

    public constructor(frameReader: ConsultFrameReader, send: (data: number[]) => Command) {
        this.frameReader = frameReader
        this.send = send
    }

    public getAvailableSensors = (): Promise<number[]> => {
        const chunkSize = 10
        return new Promise((resolve, reject) => {
            const cs: number[][] = _.chunk(_.range(0, 256), 10).map(GEN_SENSOR_C)
            let rs: number[] = []
            // tslint:disable-next-line:typedef
            const f = (i: number = 0): void => {
                if (i >= cs.length) {
                    const allowed: number[] = rs.filter((b: number) => b !== 0xFE)
                    console.log('allowed', allowed)
                    resolve(allowed)
                    return
                }
                const command: Command = this.send(cs[i])
                command.once(CommandEventType.COMMAND_RESPONSE, (response: number[]) => {
                    // console.log(response.length, aToHex(response))
                    // console.log(aToHex(response))
                    // console.log(aToHex(response).split('a5').map(s => s.trim()).filter(s => s !== ''))
                    rs = [...rs, ..._.chunk(response, 2).map(a => a[1])]
                    // f(i + 1)
                    this.send(STOP).once(CommandEventType.COMMAND_RESPONSE, () => {
                        f(i + 1)
                    })
                })
            }
            f()
        })
    }

    public getAvailableSensorsAndPoll = (): void => {
        const chunkSize: number = 10
        this.getAvailableSensors().then((sensorCodes: number[]) => {
            const commands: number[][] = _.chunk(sensorCodes, chunkSize).map(GEN_SENSOR_C)
            console.log('Commands to poll:', commands.map(aToHex))
            const f = (i = 0) => {
                const d: number = Date.now()
                this.send(commands[i]).once(CommandEventType.VALUE, (data: number[]) => {
                    console.log(aToHex(data))
                    this.send(STOP).once(CommandEventType.COMMAND_RESPONSE, () => {
                        if (this.stopFlag) { this.stopFlag = false; return }
                        setTimeout(() => {
                            console.log(`${Date.now() - d} ms`)
                            f((i + 1) % commands.length)
                        }, 0)
                    })
                })
            }
            f()
        })
    }

    public pollAllHardcodedSensors = (): void => {
        const mySensors: number[] = aFromHex('00 01 04 05 08 09 0b 0c 0d 12 13 14 15 16 17 1a 1c 1e 1f 21')
        const t: Timer = new Timer()
        this.send(GEN_SENSOR_C(mySensors))
            .on(CommandEventType.VALUE, (data: number[]) => {
                t.check()
                console.log(data)
            })
    }

    public getSensorData = (sensorCode: number): Promise<string> => new Promise((resolve, reject) => {
        this.send(GEN_SENSOR_C([sensorCode]))
            .once(CommandEventType.VALUE, (data: number[]) => {
                console.log(getSensorValue(sensorCode)(data[2]))
                this.send(STOP)
                resolve()
            })
    })

    public stop = (): void => { this.stopFlag = true }
}
