import * as _ from 'lodash'

export type EventCallback<T> = (value: T) => void

export class TypedEvent<T> {

    private callbacks: Array<EventCallback<T>> = []
    private onceCallbacks: Array<EventCallback<T>> = []

    public emit(value: T): void {
        this.onceCallbacks.forEach((cb: EventCallback<T>) => cb(value))
        this.onceCallbacks = []
        this.callbacks.forEach((cb: EventCallback<T>) => cb(value))
    }

    public subscribe = (callback: EventCallback<T>): (() => void) => {
        this.callbacks.push(callback)

        return (): void => { _.pull(this.callbacks, callback) }
    }

    public subscribeOnce = (callback: EventCallback<T>): (() => void) => {
        this.onceCallbacks.push(callback)

        return (): void => { _.pull(this.onceCallbacks, callback) }
    }
}
