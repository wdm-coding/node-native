
// 4. 泛型约束

class ObjectRefImpl<T extends object, K extends keyof T>{
  constructor(public obj: T, public keyname: K) {}
  get value(){
    return this.obj[this.keyname]
  }
  set value(newVal){
    this.obj[this.keyname] = newVal
  }
}

type objType = {
  name: string,
  age: number
}
type KeysType<T extends object,K> = K extends keyof T ? K : never

type Test = KeysType<objType,'name' | 'age'>


const obj = new ObjectRefImpl<objType,keyof objType>({name: 'liu', age: 23}, 'name')
