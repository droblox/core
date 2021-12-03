export type StoppedEventCallbackType = () => void;
export type FinishedEventCallbackType = () => void;
export type UpdateEventCallbackType = (time: number) => void;

export class Timer {
  running: boolean;

  duration: number;
  startTime: number;
  resolution: number;

  updated: RBXScriptSignal<Callback>;
  stopped: RBXScriptSignal<Callback>;
  finished: RBXScriptSignal<Callback>;

  updateEvent: BindableEvent<UpdateEventCallbackType>;
  stoppedEvent: BindableEvent<StoppedEventCallbackType>;
  finishedEvent: BindableEvent<FinishedEventCallbackType>;

  // Create new timer
  constructor(resolution: number) {
    this.running = false;

    this.duration = 0;
    this.startTime = tick();
    this.resolution = resolution;

    this.stoppedEvent = new Instance("BindableEvent");
    this.updateEvent = new Instance("BindableEvent");
    this.finishedEvent = new Instance("BindableEvent");

    this.updated = this.updateEvent.Event;
    this.stopped = this.stoppedEvent.Event;
    this.finished = this.finishedEvent.Event;
  }

  // Start timer method
  start(duration = 0.5) {
    if (!this.running) {
      const timerThread = async () => {
        this.running = true;
        this.duration = duration;
        this.startTime = tick();
        while (this.running && tick() - this.startTime < duration) {
          this.updateEvent.Fire(this.read());
          await Promise.delay(this.resolution);
        }
        this.updateEvent.Fire(this.read());
        if (this.running) {
          this.finishedEvent.Fire();
        } else {
          this.stoppedEvent.Fire();
        }
        this.running = false;
        this.startTime = 0;
        this.duration = 0;
      };
      timerThread().catch((e) => {
        print(e);
      });
    }
  }

  // Read timer method
  read() {
    return this.running ? math.max(0, this.startTime + this.duration - tick()) : 0;
  }

  // Stop timer method
  stop() {
    this.running = false;
  }
}
