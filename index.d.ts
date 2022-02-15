declare module 'selective-object-reuse' {
  class SelectiveObjectReuse {
    constructor()
    wrap<T>(newEntry: T, namespace?: string): T;
    dispose(namespace?: string): void;
  }
  export = SelectiveObjectReuse
}
