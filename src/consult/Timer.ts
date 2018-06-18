export class Timer {
    private t0: number = Date.now()

    public check(): void {
        console.warn(`[${Date.now() - this.t0} ms]`)
    }
}