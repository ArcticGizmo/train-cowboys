const KEY_MAP = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD']
};

type Key = keyof typeof KEY_MAP;

export class Input {
  private _heldKeys: Key[] = [];
  constructor() {
    document.addEventListener('keydown', e => this.keyDownHandler(e));
    document.addEventListener('keyup', e => this.keyUpHandler(e));
  }

  private keyDownHandler(e: KeyboardEvent) {
    Object.entries(KEY_MAP).forEach(([key, codes]) => {
      if (codes.includes(e.code)) {
        this.onKeyPressed(key as Key);
      }
    });
  }

  private keyUpHandler(e: KeyboardEvent) {
    Object.entries(KEY_MAP).forEach(([key, codes]) => {
      if (codes.includes(e.code)) {
        this.onKeyReleased(key as Key);
      }
    });
  }

  get currentKeyDown(): Key | undefined {
    return this._heldKeys[0];
  }

  isKeyDown(key: Key) {
    return this._heldKeys.includes(key);
  }

  private onKeyPressed(key: Key) {
    // add the key to the queue if it's new
    if (this._heldKeys.indexOf(key) === -1) {
      this._heldKeys.unshift(key);
    }
  }

  private onKeyReleased(key: Key) {
    const index = this._heldKeys.indexOf(key);
    if (index === -1) {
      return;
    }

    this._heldKeys.splice(index, 1);
  }
}
