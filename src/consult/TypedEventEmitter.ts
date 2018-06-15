import * as _ from 'lodash'

import { EventCallback, TypedEvent } from './TypedEvent'

export class TypedEventEmitter<TEvents> {
    private events: { [key in keyof TEvents]: TypedEvent<TEvents[key]> }

    public constructor(events: { [key in keyof TEvents]: TypedEvent<TEvents[key]> }) {
        if (!events) { throw new Error('Events should be passed to constructor') }
        this.events = events
    }

    public on<EventName extends keyof TEvents>(
        eventName: EventName,
        callback: EventCallback<TEvents[EventName]>,
    ): (() => void) {
        return this.events[eventName].subscribe(callback)
    }

    public once<EventName extends keyof TEvents>(
        eventName: EventName,
        callback: EventCallback<TEvents[EventName]>,
    ): (() => void) {
        return this.events[eventName].subscribeOnce(callback)
    }

    public emit<EventName extends keyof TEvents>(
        eventName: EventName,
        value: TEvents[EventName],
    ): void {
        this.events[eventName].emit(value)
    }
}
