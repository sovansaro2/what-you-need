import { AppEventMap, EventType, EventHandler } from './types';

class TypedEventBus {
  private listeners: { [K in EventType]?: EventHandler<K>[] } = {};

  public on<T extends EventType>(event: T, handler: EventHandler<T>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    (this.listeners[event] as EventHandler<T>[]).push(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  public off<T extends EventType>(event: T, handler: EventHandler<T>): void {
    const handlers = this.listeners[event];
    if (!handlers) return;
    this.listeners[event] = (handlers as EventHandler<T>[]).filter((h) => h !== handler) as any;
  }

  public once<T extends EventType>(event: T, handler: EventHandler<T>): void {
    const wrapper: EventHandler<T> = (payload) => {
      this.off(event, wrapper);
      handler(payload);
    };
    this.on(event, wrapper);
  }

  public emit<T extends EventType>(event: T, payload: AppEventMap[T]): void {
    const handlers = this.listeners[event];
    if (!handlers || handlers.length === 0) return;

    // Execute handlers safely so one failure does not break the bus
    handlers.slice().forEach((handler) => {
      try {
        (handler as EventHandler<T>)(payload);
      } catch (err) {
        console.error(`[EventBus] Error executing listener for event '${event}':`, err);
      }
    });
  }

  public clearAll(): void {
    this.listeners = {};
  }
}

export const appEventBus = new TypedEventBus();
