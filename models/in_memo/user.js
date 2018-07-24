class User{
  constructor(firstName, lastName, age){
    this.firstName = firstName
    this.lastName =lastName
    this.age = age
    User.id += 1
    this.id = User.id
  }

  getName(){
    return `${this.firstName}  ${this.lastName}` 
  }

  static insert(firstName , lastName , age){
    const user = new User(firstName , lastName , age)
    User.users.push(user)
    return user 
  }

  static getOneByName( firstName, lastName ){
    return User.users.find(user => user.firstName === firstName && user.lastName === lastName)
  }

  static getOneById(userId){
    return User.users.find(user=> user.id === userId)
  }

  static list(){
    return User.users
  }
  
}

User.users = []
User.id = 0

