// 带参数的装饰器
function FirstClassDecorator(params?:any){
  return function(target: CustomerService) {
    console.log('装饰器执行了') 
  }
}
@FirstClassDecorator('xxx')
@FirstClassDecorator()
class CustomerService {
  name: string = '下单'
  constructor() {
    console.log('构造函数')
  }
}