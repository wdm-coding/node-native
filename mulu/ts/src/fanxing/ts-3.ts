// 动态追加属性


type AddAttr<T,K extends string,V> = { 
  [P in keyof T | K]: P extends keyof T ? T[P] : V;
} 

interface SquareConfig {
  color: string;
  width: number;
}
type Test = AddAttr<SquareConfig,'name',string>;

// Record 创建对象
type Record<K extends string | number | symbol, T> = {
  [P in K]: T;
}

type Test2 = Record<'name',string>;

// 多层对象

type BaseType = string | number | boolean;
// 是否是纯对象
function isPlaneObject(data:Record<string,any>){ 
  return Object.prototype.toString.call(data) === '[object Object]'
}
function deepCopy(data:Record<string,any> | BaseType){}


// 可选属性
type Test3 = {name:string,age?:number}

interface Attr {
  name:string,
  age:number,
  sex:string
}
// 将属性改为可选
type Name = Partial<Attr>



// 映射类型

interface Tode {
  name:string,
  age:number,
  sex:string,
  height:number,
  weight:number,
  isMarried:boolean
}
// P extends K ? never : P
type Omit<T,K extends keyof T> = {
  [P in keyof T as Exclude<P,K>]:T[P] // 映射类型
}

type MyOmit = Omit<Tode,'name'|'age'>

// Capitalize<T>