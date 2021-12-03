export type StoppedEventCallbackType = () => void;
export type UpdateEventCallbackType = (time: number) => void;

export class Stopwatch {
  running: boolean;

  startTime: number;
  resolution: number;

  updated: RBXScriptSignal<Callback>;
  stopped: RBXScriptSignal<Callback>;

  updateEvent: BindableEvent<UpdateEventCallbackType>;
  stoppedEvent: BindableEvent<StoppedEventCallbackType>;

  // Create new stopwatch
  constructor(resolution = 0.5) {
    this.running = false;

    this.startTime = tick();
    this.resolution = resolution;

    this.updateEvent = new Instance("BindableEvent");
    this.stoppedEvent = new Instance("BindableEvent");

    this.updated = this.updateEvent.Event;
    this.stopped = this.stoppedEvent.Event;
  }

  // Start stopwatch method
  start() {
    if (!this.running) {
      const timerThread = async () => {
        this.running = true;
        this.startTime = tick();
        while (this.running) {
          this.updateEvent.Fire(this.read());
          await Promise.delay(this.resolution);
        }
        this.updateEvent.Fire(this.read());
        this.stoppedEvent.Fire();
      };
      timerThread().catch((e) => {
        print(e);
      });
    }
  }

  // Read stopwatch method
  read() {
    return tick() - this.startTime;
  }

  // Stop stopwatch method
  stop() {
    this.running = false;
  }
}
