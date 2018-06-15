import * as React from 'react'

import * as _ from 'lodash'

interface IProps {
    title: string
    onInput(value: string): void
}

interface IState {
    value: string
    isValid: boolean
}

export class UserInput extends React.Component<IProps, IState> {
    private input?: HTMLInputElement

    public constructor(props: IProps) {
        super(props)
        this.state = { value: '', isValid: false }
    }

    public render(): React.ReactElement<HTMLElement> {
        return (
            <form onSubmit={this.submit}>
                <h4>{this.props.title}</h4>
                <input type="text" ref={this.getInputRef} value={this.state.value} onChange={this.setValue}/>
                <div>{this.state.value}</div>
                {this.state.isValid &&
                    <span>Valid</span>
                }
            </form>
        )
    }

    private setValue = (): void => {
        const validRgx: RegExp = /^(?:[0-9a-fA-F]{2})*(?:[0-9a-fA-F]{2})$/
        const allowedRgx: RegExp = /[^0-9a-fA-F]/
        this.setState((state: IState) => {
            if (!this.input) { return state }

            const value: string = this.input.value.replace(/\s/g, '')
            const isValid: boolean = validRgx.test(value)
            const isAllowed: boolean = !allowedRgx.test(value)

            return {
                ...state,
                isValid,
                value: isAllowed
                    // tslint:disable-next-line:no-magic-numbers
                    ? _.chunk(value, 2).map((c: string[]) => c.join('')).join(' ')
                    : state.value,
                }
        })
    }

    private submit = (e: React.FormEvent): void => {
        e.preventDefault()
        if (this.state.isValid) {
            this.props.onInput((this.input && this.input.value) || '')
        }
    }

    private getInputRef = (el: HTMLInputElement): void => {
        this.input = el
    }
}
