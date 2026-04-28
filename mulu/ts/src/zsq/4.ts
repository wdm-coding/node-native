/* 方法装饰器
* @param targetClassPrototype - 目标类的原型对象，通过它可以访问类的其他方法和属性
* @param propertyKey - 被装饰方法的名称
* @param descriptor - 方法的属性描述符，包含方法的实现和其他配置
*/
function myMethodDecorator(params:any){
  return function (targetClassPrototype: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log('方法装饰器',params, targetClassPrototype, propertyKey, descriptor)
    // 前置拦截器
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      console.log('前置拦截器',params, this, propertyKey, args)
      originalMethod.apply(this, args)
      console.log('后置拦截器',params, this, propertyKey, args)
    }
    return descriptor
  }
}
// 目标类
class Person {
  constructor(public name: string) {}

  // 目标方法
  @myMethodDecorator('1')
  say() {
    console.log(`I'm ${this.name}`)
  }
}


const p = new Person('张三')
p.say()