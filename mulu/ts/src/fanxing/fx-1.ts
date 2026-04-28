//1. 泛型可以用在接口中， 类中， 函数签名。

interface Ref<T>{
  value:T
}

function useRef<T>(initialValue: T): Ref<T> {
  return { value: initialValue }
}

const myRef = useRef({
  name: 'John',
  age: 30
})
