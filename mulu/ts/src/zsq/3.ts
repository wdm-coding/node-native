// 泛型工场类装饰器
// 日志记录装饰器
// 对已经开发好的项目中的任何一个类，创建实例时，自动添加日志记录功能
type ClassType = { // 表示具有构造函数的类类型
  new (...args: any): any // 表示类的实例函数，用于创建类的实例。
  name: string // 表示类的名称，用于在日志中引用类的实例。
}
function logger<T extends ClassType>(targetClass: T) {
  // 返回一个新类，继承自 targetClass（被装饰的原始类），并保留了原始类的所有属性和方法。
  return class extends targetClass { // 继承自 targetClass（被装饰的原始类），因此保留了原始类的所有属性和方法。
    constructor(...args: any) {
      super(...args) // 调用 super(...args) 执行父类（原始类）的构造函数，确保实例的初始化逻辑不变。
      console.log(`new ${targetClass.name}(${args.join(', ')})`)
    }
  }
}

// 目标类
@logger
class Person {
  constructor(public name: string) {}
  say() {
    console.log(`I'm ${this.name}`)
  }
}
const p = new Person('张三')