// models/Message.js
// Modèle de message pour la messagerie instantanée

class Message {
  constructor({ id, from, to, text, read, timestamp }) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.text = text;
    this.read = read;
    this.timestamp = timestamp;
  }
}

module.exports = Message;
