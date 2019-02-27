var { db, helpers } = require('../database')

class JogTime {
  static insert(userId, date, distance, duration) {
    // run the insert query
    var timeId = helpers.insertRow(
      'INSERT INTO time (userId, date, distance, duration) VALUES (?, ?, ?, ?)',
      [userId, date, distance, duration]
    )
    return timeId
  }

  static select() {
      var rows = helpers.getRows('SELECT * FROM time');
      return rows;
  }

  static deleteJog(id) {
    helpers.runAndExpectNoRows('DELETE FROM time WHERE id = ?', [id]);
  }

  static updateJog(date, distance, duration, id) {
    helpers.runAndExpectNoRows('UPDATE time SET date = ?, distance = ?, duration = ? WHERE id = ?', [date, distance, duration, id]);
  }

  static findJogById(id, userId) {
    var row = helpers.getRow('SELECT * FROM time WHERE id = ? AND userId = ?', [id, userId])

    if (row) {
      return new JogTime(row)
    } else {
      return null
    }
  };

  static findJogByUserId(userId) {
    var rows = helpers.getRows('SELECT * FROM time WHERE userId = ?', [userId])

    if (rows) {
      return rows.map((row) => new JogTime(row))
    } else {
      return null
    }
  }

  constructor(databaseRow) {
    this.id = databaseRow.id
    this.date = databaseRow.date
    this.distance = databaseRow.distance
    this.duration = databaseRow.duration
  }
}

module.exports = JogTime