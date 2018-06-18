import * as React from 'react'

export class CanvasTest extends React.Component {
    private ctx: CanvasRenderingContext2D | undefined
    private canvas: HTMLCanvasElement | undefined

    public componentDidMount(): void {
        setInterval(this.push, 50)
    }

    public render(): React.ReactElement<HTMLElement> {
        return (
            <canvas
                // tslint:disable-next-line:no-magic-numbers
                width={500}
                // tslint:disable-next-line:no-magic-numbers
                height={500}
                style={{ border: '1px solid red' }}
                ref={this.canvasRef}
            ></canvas>
        )
    }

    private canvasRef = (el: HTMLCanvasElement): void => {
        this.canvas = el
        this.ctx = el.getContext('2d') || undefined
    }

    private push = (): void => {
        if (this.ctx === undefined) { throw new Error('No canvas context') }
        this.ctx.moveTo(Math.random() * 200, Math.random() * 200)
        this.ctx.lineTo(Math.random() * 200, Math.random() * 200)
        this.ctx.stroke()
    }
}
