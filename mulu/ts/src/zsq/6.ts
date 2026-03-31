// 装饰器综合应用

class Collection<T = any> {
  static collection:Collection = new Collection()
  private constructor() {}
  private itemsMap = new Map<string|symbol, any>()
  public setItem(key: string|symbol, value: any) {
    this.itemsMap.set(key, value)
  }
  public getItem(key: string|symbol) {
    return this.itemsMap.get(key)
  }
  public has(id:string | symbol):boolean {
    return this.itemsMap.has(id)
  }
  public removeItem(key: string|symbol) {
    this.itemsMap.delete(key)
  }
  public clear() {
    this.itemsMap.clear()
  }
  public size() {
    return this.itemsMap.size
  }
  public isEmpty() {
    return this.itemsMap.size === 0
  }
  public keys() {
    return this.itemsMap.keys()
  }
}

export default Collection.collection
 