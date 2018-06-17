setInterval(() => {
    self.postMessage('This is message from worker')
}, 1000)

self.addEventListener('message', (event: MessageEvent) => {
    console.log('Worker got message:', event.data)
})
