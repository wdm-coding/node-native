import { Inject } from './injectDect'
import { UserService } from './UserService'
class Controller {
  @Inject('userService')
  private userService?: UserService
  public login(): void {
    console.log('login')
  }
}


export { Controller }