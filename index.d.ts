declare class SelectiveObjectReuse {
  constructor()

  wrap<T = any>(value: T, namespace = 'default'): T

  dispose(namespace?: string): void
}