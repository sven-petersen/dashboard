class Clock extends EventTarget {
  constructor (updateInterval) {
    super()

    this.interval = updateInterval
    this.intervalId = undefined
    this.run()
  }

  run () {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        const event = new Event('tick')
        event.date = new Date()
        this.dispatchEvent(event)
      }, this.interval)
    }
  }
}

export const clockSecondsAccuracy = new Clock(1000)
export const clockHalfAMinuteAccuracy = new Clock(1000 * 30)
export const clockHalfAnHourAccuracy = new Clock(1000 * 60 * 30)
