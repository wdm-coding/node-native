// 类（Class）作为值传递以及构造函数类型（Constructor Type）的定义和使用
class People {
  constructor(public name: string, public age: number) {}
  sayHello() {
    console.log(`${this.name} say hello`);
  }
}

// type ConstructorType = new (...args: any) => People //类型别名 ConstructorType: 是一个可以实例化出 People 对象的构造函数
interface ConstructorType {
  new (...args: any): People
}
// 使用类作为参数返回一个类实例
function create(ctor: ConstructorType) {
  // console.log(`${ctor.name}`)
  return new ctor()
}

// 创建一个 People 的实例
const p = create(People)