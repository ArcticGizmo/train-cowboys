type TimelineStep = () => Promise<void>;

export class TimelineBuilder {
  private _steps: TimelineStep[] = [];

  then(step: TimelineStep) {
    this._steps.push(step);
    return this;
  }

  build() {
    return new Timeline(this._steps);
  }
}

export class Timeline {
  private _steps: TimelineStep[];
  constructor(steps: TimelineStep[]) {
    this._steps = steps;
  }

  async run(onStepComplete?: (index: number) => void) {
    for (let [index, step] of this._steps.entries()) {
      await step();
      onStepComplete?.(index);
    }
  }
}

/*
await tl()
  .then(() => ...)
  .then(() => ...)
  .then(() =>)

*/
