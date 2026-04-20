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
    @Reflect.metadata('first', '第一个方法callPhone')
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
console.log(Reflect.getMetadata('first', Student.prototype, 'callPhone'))

// 获取所有的方法元数据键
console.log(Reflect.getMetadataKeys(Student.prototype, 'callPhone'))

