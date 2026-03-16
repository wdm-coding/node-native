
// 3. 泛型约束
// keyof 表示获取一个类型的所有公共属性名组成的一个联合类型(对象的key组合)
interface Iobj {
  name: string
  age: number
}

type Ikeyof<T extends object> = keyof T  
type Keys = Ikeyof<{name:1}>
let keyname: Keys = 'name'

function getValue<T extends object>(obj: T, keyname: Ikeyof<T>): any {
  return obj[keyname]
}

const obj: Iobj = {
  name: '张三',
  age: 18,
}

const value = getValue(obj, keyname)




