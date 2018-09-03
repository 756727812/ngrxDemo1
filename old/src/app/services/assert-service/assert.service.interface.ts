export interface IAssertService extends Chai.Assert {
  whenDev: (fn: Function) => void
}
