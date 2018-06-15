import * as React from 'react'

import { UserInput } from './UserInput'

import { Command, CommandEventType } from '../../consult/Command'
import { ConsultFrameReader, IPickResult } from '../../consult/ConsultFrameReader'
import { aFromHex, aToHex } from '../../consult/util'

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

export class Main extends React.Component<{}, IState> {
    private reader: ConsultFrameReader

    public constructor(props: {}) {
        super(props)
        this.state = { rawList: [], frameList: [] }
        this.reader = new ConsultFrameReader()
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
                    onInput={(value: string): void => {
                        this.reader.enqueueCommand(aFromHex(value))
                    }}
                    title="Command"
                />
                <div className="list">
                    <h4>Raw list</h4>
                    {this.state.rawList.map((s: IRawListItem, i: number) => (
                        <div key={i} className={`item-${s.type}`}>
                            {{ in: '<', out: '>' }[s.type]} {s.data}
                        </div>
                    ))}
                </div>
                <div className="list">
                    <h4>Frame list</h4>
                    {this.state.frameList.map((s: IFrameListItem, i: number) => (
                        <div key={i} className={`item-${s.type} event-${s.subtype}`}>
                            {{ in: '<', out: '>' }[s.type]} {s.data}
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}
