// 类（Class）作为值传递以及构造函数类型（Constructor Type）的定义和使用
class People {
  constructor(public name: string, public age: number) {}

  sayHello() {
    console.log(`${this.name} say hello`);
  }
}

type ConstructorType = new (...args: any) => People //类型别名 ConstructorType: 是一个可以实例化出 People 对象的构造函数
// 1. new (...): 表示这是一个构造函数类型，必须能通过 new 关键字调用。
// 2. (...args: any): 表示构造函数接受任意数量和类型的参数。
// 3. => People: 表示调用 new 后，返回的是一个 People 类型的实例。
let ins: ConstructorType = People //People本身也是一个值（函数对象）

const p = new ins('liu', 20) // 因为 ins 指向 People 类，所以这行代码等价于 new People('liu', 20)

// p.sayHello()

// 常见应用场景
// 1. 工厂函数 :接收一个类作为参数，然后返回该类的一个实例
function createInstance(cls: ConstructorType) {
  return new cls('liu', 20)
}

const p1 = createInstance(People)
// 2. 依赖注入 在框架中，经常需要传递类的构造器，以便框架在内部按需实例化它，而不是直接传递实例。
class Logger {
  log(message: string) {
    console.log(message)
  }
}
class App {
  constructor(private logger: Logger) {}

  start() {
    this.logger.log('App started')
  }
}
const logger = new Logger() // 创建 Logger 实例
const app = new App(logger) // 创建 App 实例时，将 Logger 类的构造器作为参数传递给 App 的构造函数