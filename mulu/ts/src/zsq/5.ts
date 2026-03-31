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