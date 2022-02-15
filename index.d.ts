export = SelectiveObjectReuse
declare class SelectiveObjectReuse {
  constructor()

  wrap<T = any>(value: T, namespace?: string): T

  dispose(namespace?: string): void
}
