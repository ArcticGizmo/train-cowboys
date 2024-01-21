type KeyMap = Record<string, string[]>;

const KEY_MAP: KeyMap = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD']
};

export class Input {
  private _heldKeys: string[] = [];
  constructor() {
    document.addEventListener('keydown', e => this.keyDownHandler(e));
    document.addEventListener('keyup', e => this.keyUpHandler(e));
  }

  private keyDownHandler(e: KeyboardEvent) {
    Object.entries(KEY_MAP).forEach(([key, codes]) => {
      if (codes.includes(e.code)) {
        this.onKeyPressed(key);
      }
    });
  }

  private keyUpHandler(e: KeyboardEvent) {
    Object.entries(KEY_MAP).forEach(([key, codes]) => {
      if (codes.includes(e.code)) {
        this.onKeyReleased(key);
      }
    });
  }

  get keyPressed(): keyof typeof KEY_MAP | undefined {
    return this._heldKeys[0];
  }

  private onKeyPressed(key: string) {
    // add the key to the queue if it's new
    if (this._heldKeys.indexOf(key) === -1) {
      this._heldKeys.unshift(key);
    }
  }

  private onKeyReleased(key: string) {
    const index = this._heldKeys.indexOf(key);
    if (index === -1) {
      return;
    }

    this._heldKeys.splice(index, 1);
  }
}
