import * as React from 'react'

import * as _ from 'lodash'

import { UserInput } from './UserInput'

import { Command, CommandEventType } from '../../consult/Command'
import { CommandHelper } from '../../consult/CommandHelper'
import { GEN_SENSOR, GEN_SENSOR_C, STOP } from '../../consult/commands'
import { ConsultFrameReader, IPickResult } from '../../consult/FrameReader'
import { getSensorValue } from '../../consult/sensorTestValues'
import { SocketConnector } from '../../consult/SocketConnector'
import { Timer } from '../../consult/Timer'
import { aFromHex, aToHex } from '../../consult/util'
import { CanvasTest } from './CanvasTest'

// tslint:disable-next-line:no-submodule-imports no-implicit-dependencies
import * as W from 'worker-loader!./worker'

interface IRawListItem {
    type: 'in' | 'out'
    data: string
}

interface IFrameListItem extends IRawListItem {
    subtype?: CommandEventType
}

interface IState {
    rawList: IRawListItem[]
    frameList: IFrameListItem[]
}

const DISPLAY: boolean = false

export class Main extends React.Component<{}, IState> {
    private reader: ConsultFrameReader
    private socketConnector: SocketConnector
    private stopFlag: boolean = false
    private commandHelper: CommandHelper

    public constructor(props: {}) {
        super(props)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'c') { this.send(STOP) }
        })

        // this.testWorker()

        this.reader = new ConsultFrameReader()
        // tslint:disable-next-line:typedef
        this.reader.on('error', (error) => console.error(error))
        this.socketConnector = new SocketConnector('ws://localhost:8033', this.reader)
        this.commandHelper = new CommandHelper(this.reader, this.socketConnector.send)

        this.state = { rawList: [], frameList: [] }
        if (DISPLAY) {
            this.reader.on('picked', ((r: IPickResult): void => {
                this.setState((state: IState) => ({
                    ...state,
                    frameList: [...state.frameList, {
                        type: 'in',
                        subtype: r.type,
                        data: aToHex(r.frame),
                    }],
                }))
            }))
            this.reader.on('rawChunk', (chunk: number[]) => {
                this.setState((state: IState) => ({
                    ...state,
                    rawList: [...state.rawList, {
                        type: 'in',
                        data: aToHex(chunk),
                    }],
                }))
            })
            this.reader.on('enqueue', (command: Command) => {
                this.setState((state: IState) => ({
                    ...state,
                    rawList: [...state.rawList, {
                        type: 'out',
                        data: aToHex(command.bytes),
                    }],
                    frameList: [...state.frameList, {
                        type: 'out',
                        data: aToHex(command.bytes),
                    }],
                }))
            })
        }
        this.reader.on('error', (error: string) => {
            this.setState((state: IState) => ({
                ...state,
                frameList: [...state.frameList, {
                    type: 'out',
                    data: error,
                }],
            }))
        })
    }

    public render(): React.ReactElement<HTMLHeadingElement> {
        return (
            <div>
                <UserInput
                    onInput={(value: string): void => {
                        this.reader.processChunk(aFromHex(value))
                    }}
                    title="Incoming chunk"
                />
                <UserInput
                    onInput={(value: string): Command => this.send(aFromHex(value))}
                    title="Command"
                />
                <button onClick={this.getAvailableSensors}>Test</button>
                <button onClick={this.commandHelper.getAvailableSensorsAndPoll}>Test and poll</button>
                <button onClick={this.commandHelper.stop}>Stop</button>
                <div className="lists">
                    <div className="list">
                        <h4>Raw list</h4>
                        <div className="list-inner">
                            {this.state.rawList.map((s: IRawListItem, i: number) => (
                                <div key={i} className={`item-${s.type}`}>
                                    {{ in: '<', out: '>' }[s.type]} {s.data}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="list">
                        <h4>Frame list</h4>
                        <div className="list-inner">
                            {this.state.frameList.map((s: IFrameListItem, i: number) => (
                                <div key={i} className={`item-${s.type} event-${s.subtype}`}>
                                    {{ in: '<', out: '>' }[s.type]} {s.data}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    private send(data: number[]): Command {
        return this.socketConnector.send(data)
    }

    private getAvailableSensors = (): void => {
        const t: Timer = new Timer()
        this.commandHelper.getAvailableSensors()
            .then((data: number[]) => {
                t.check()
                console.log('Available:', aToHex(data))
            })
    }

    // tslint:disable-next-line:prefer-function-over-method
    private testWorker(): void {
        const worker: Worker = W()
        worker.addEventListener('message', (event: MessageEvent) => console.log('Message from worker:', event.data))
        worker.postMessage('Message to worker')
        window.worker = worker
    }
}
