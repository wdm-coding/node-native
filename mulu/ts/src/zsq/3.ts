// 泛型工场类装饰器
// 日志记录装饰器
function logger(target: any) {}

// 目标类
class Person {
  constructor(public name: string) {}
  say() {
    console.log(`I'm ${this.name}`)
  }
}