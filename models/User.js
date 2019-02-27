var { db, helpers } = require('../database')
 
class User {
  static insert(name, email, passwordHash) {
    // run the insert query
    var userId = helpers.insertRow(
      'INSERT INTO user (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    )
    return userId
  }

  static findUserById(id) {
    var row = helpers.getRow('SELECT * FROM user WHERE id = ?', [id])

    if (row) {
      return new User(row)
    } else {
      return null
    }
  }

  static findByEmail(email) {
    var row = helpers.getRow('SELECT * FROM user WHERE email = ?', [email])

    if (row) {
      return new User(row)
    } else {
      return null
    }
  }

  static deleteUser(id) {
    helpers.runAndExpectNoRows('DELETE FROM user WHERE id = ?', [id]);
  }
  
  constructor(databaseRow) {
    this.id = databaseRow.id
    this.name = databaseRow.name
    this.email = databaseRow.email
    this.passwordHash = databaseRow.password_hash
  }
}

module.exports = User
