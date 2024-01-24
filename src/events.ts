type Caller = object;

type EventCallback = (value: any) => void;

interface EventSubscription {
  id: number;
  eventName: string;
  caller: Caller;
  callback: EventCallback;
}

class Events {
  private _subscriptions: EventSubscription[] = [];
  private _nextId = 0;

  private getNextId() {
    return ++this._nextId;
  }

  emit(eventName: string, value: any) {
    // this does not feel efficient
    this._subscriptions.forEach(s => {
      if (s.eventName === eventName) {
        s.callback(value);
      }
    });
  }

  on(eventName: string, caller: Caller, callback: EventCallback) {
    const id = this.getNextId();
    this._subscriptions.push({
      id,
      eventName,
      caller,
      callback
    });
    return id;
  }

  off(id: number) {
    this._subscriptions = this._subscriptions.filter(s => s.id !== id);
  }

  unsubscribe(caller: Caller) {
    this._subscriptions.filter(s => s.caller !== caller);
  }
}

export const events = new Events();
