export default class PriceTree {
  _value = 0
  _children = new Map<string, PriceTree>()

  get value(): number | null {
    if (this._children.size) {
      const children = Array.from(this._children.values())
      let value = children[0].value
      for (const child of children) {
        if (child.value != value) value = null
      }
      return value
    } else return this._value
  }

  addData(path: string[], value: number) {
    if (path.length == 0) return (this._value = value)
    if (!this._children.has(path[0])) this._children.set(path[0], new PriceTree())
    const child = this._children.get(path[0])
    child?.addData(path.slice(1), value)
  }

  getDeepValue(path: string[]): number | null {
    if (path.length == 0) return this.value
    const child = this._children.get(path[0])
    if (!child) return this.value
    return child.getDeepValue(path.slice(1))
  }
}
