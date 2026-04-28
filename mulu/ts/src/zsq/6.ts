// 装饰器综合应用

class Collection<T = any> {
  static collection:Collection = new Collection() // 单例模式 所有模块共享同一份数据。
  private constructor() {} // 私有构造函数：防止外部通过 new Collection() 创建实例
  private itemsMap = new Map<string|symbol, any>() // 全局共享的 Map 容器
  public setItem(key: string|symbol, value: any) {
    this.itemsMap.set(key, value)
  }
  public getItem(key: string|symbol) {
    return this.itemsMap.get(key)
  }
  public has(id:string | symbol):boolean {
    return this.itemsMap.has(id)
  }
}

export const collection = Collection.collection

export class UserServive {
  pname:string = '张三'
  public login (name:string) {
    console.log('登录成功',name)
  }
}

// 元数据的第三方库 npm i reflect-metadata -S
