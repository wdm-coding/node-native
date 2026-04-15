// 参数装饰器
function UrlParams(params:any){
  return (targetClassProperty: any, propertyKey: string | symbol, parameterIndex: number) => {
    console.log('targetClassProperty:', targetClassProperty)
    console.log('propertyKey:', propertyKey)
    console.log('parameterIndex:', parameterIndex)
    targetClassProperty.info =params
  }
}

class People{
  eat(
    @UrlParams('地址信息1----')
    address:string,
  ){
    console.log('地址信息:',address)
  }
}

const people = new People()
people.eat('北京')
