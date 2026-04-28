# 装饰器

## 装饰器的定义

1. 装饰器(拦截器思想)是一种用于对函数或类行为添加额外的功能，通常用于日志记录、访问控制、输入验证等场景。
2. 高阶组件也是装饰器的一种实现方式。
3. 解决依赖注入的问题。

## 装饰器的分类
1. 函数装饰器
2. 类装饰器
3. 属性装饰器
4. 参数装饰器
5. 元数据装饰器

## 装饰器的语法
1. 使用时不传参
2. 装饰器工场函数传参


## 类装饰器
```ts
// 不带参数的装饰器
function FirstClassDecorator(target: any) {
  let ins = new target()
  ins.order() 
  console.log('装饰器执行了',ins) 
}
// 带参数的装饰器
function FirstClassDecorator(params:any){
  return function(target: any) {
    let ins = new target()
    ins.order() 
    console.log('params',params)
    console.log('装饰器执行了',ins) 
  }
}
@FirstClassDecorator('xxx')
// @FirstClassDecorator
class CustomerService {
  name: string = '下单'
  constructor() {
    console.log('构造函数')
  }
  order() {
    console.log('下单了')
  }
  pay() {
    console.log('支付了')
  }
}
```
+ 泛型工场类装饰器
```ts
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
```

## 方法装饰器
```ts
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
```

## 属性装饰器
```ts
/* 属性装饰器 
 * @param params - 登录参数
 * @param targetClassPrototype - 目标类的原型对象，通过它可以访问类的其他方法和属性
 * @param propertyKey - 被装饰属性的名称
 * @param descriptor - 属性的属性描述符，包含属性的实现和其他配置
*/
function loginProperty(params:any){
  return function (targetClassPrototype: object, propertyKey: string | symbol) {
      console.log(params, targetClassPrototype.constructor.name, propertyKey)
  }
}

class CustomerService {
  public name: string = '张三'
  @loginProperty('顾客登记')
  public loginName: string = '张三'
  constructor() {}
  show(){
    console.log('顾客姓名',this.loginName)
  }
}

const customerService = new CustomerService()
customerService.show()
```
## 元数据的第三方库 `npm i reflect-metadata -S`

## 装饰器执行顺序
1. 属性装饰器
2. 方法参数装饰器
3. 方法装饰器
4. 类装饰器

## 元数据（Metadata）
附加在对象，属性，方法，类，参数上的额外信息
```ts
import 'reflect-metadata'

// 1. 定义一个对象
const obj = {
  name: '张三',
  age: 18,
  info() {
    return {
      sex: '男'
    }
  }
}
// Reflect.defineMetadata 定义对象元数据 
Reflect.defineMetadata('desc', '对象描述', obj)
// Reflect.getMetadata 获取对象元数据 
console.log(Reflect.getMetadata('desc', obj))
// 定义方法元数据
Reflect.defineMetadata('desc', '方法描述', obj.info)
// 获取方法元数据
console.log(Reflect.getMetadata('desc', obj.info))
// 定义属性元数据
Reflect.defineMetadata('desc', '属性描述', obj, 'name')
// 获取属性元数据
console.log(Reflect.getMetadata('desc', obj, 'name'))

// 2. 定义一个类的元数据
// 定义类元数据
@Reflect.metadata('desc', '类描述')
class Student {
    constructor(private name: string) {
        this.name = name
    }
    callPhone() {
        console.log(`Student callPhone ${this.name}`)
    }
}
// 获取类元数据
console.log(Reflect.getMetadata('desc', Student))
// 定义类参数元数据
Reflect.defineMetadata('desc', '参数描述', Student, 'name')
// 获取类参数元数据
console.log(Reflect.getMetadata('desc', Student, 'name'))
// 定义类方法元数据
Reflect.defineMetadata('desc', '方法描述', Student.prototype, 'callPhone')
// 获取类方法元数据
console.log(Reflect.getMetadata('desc', Student.prototype, 'callPhone'))

// Reflect.hasMetadata查看是否有元数据
console.log(Reflect.hasMetadata('desc', Student))
console.log(Reflect.hasMetadata('desc', Student.prototype, 'callPhone'))
// 查看自有属性元数据
console.log(Reflect.hasOwnMetadata('desc', Student.prototype, 'callPhone'))
// 获取所有的方法元数据键
console.log(Reflect.getMetadataKeys(Student.prototype, 'callPhone'))
```
::: tip
内置的元数据键
1. design:type 用于获取类属性的类型。`Reflect.getMetadata("design:type", target, propertyKey);`
2. design:paramtypes 用于获取构造函数或方法的参数类型。。
```ts
// 获取构造函数的参数类型
Reflect.getMetadata("design:paramtypes", TargetClass);

// 获取普通方法的参数类型
Reflect.getMetadata("design:paramtypes", target, methodName);
```
3. design:returntype 用于获取方法的返回值类型。`Reflect.getMetadata("design:returntype", target, methodName);`
:::

