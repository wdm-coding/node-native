interface Phone {
    call(num: number): void
}

class NewPhone implements Phone {
    call(num: number): void {
        console.log(`NewPhone call ${num}`)
    }
}


class DIStudent {
    constructor(private phone: Phone,private name: string) {
        this.phone = phone
        this.name = name
    }

    callPhone() {
        this.phone.call(123)
    }
}


const studentIns = new DIStudent(new NewPhone(),'张三')
studentIns.callPhone()
