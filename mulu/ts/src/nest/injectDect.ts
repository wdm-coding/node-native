// 注入装饰器
import 'reflect-metadata'
type MyPropDecorator = (targetClassProperty: any,propertyKey: string | symbol) => void
export function Inject(injectId: string): MyPropDecorator {
  return (targetClassProperty: any, propertyKey: string | symbol) => {
    const PropClass = Reflect.getMetadata('design:type', targetClassProperty, propertyKey)
    console.log('PropClass:', PropClass)
  }
}