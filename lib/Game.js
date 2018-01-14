/**
 * @fileoverview This class encapsulates an active game on the server and
 *   handles game updates.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const HashMap = require('hashmap');
const Util = require('../shared/Util');

/**
 * Constructor for a Game object.
 * @constructor
 */
function Game() {
  this.clients = new HashMap();
  this.objects = new HashMap();
  this.object_id_counter = 0;
}

/**
 * Factory method for a Game object.
 * @return {Game}
 */
Game.create = function() {
  return new Game();
};

/**
 * Returns callbacks that can be passed into an update()
 * method for an object so that it can access other elements and
 * entities in the game.
 * @return {Object<string, Function>}
 */
Game.prototype._callbacks = function() {
  return {
    objects: Util.bind(this, this.objects)
  };
};

Game.prototype.addNewPlayer = function(socket, data) {
  this.clients.set(socket.id, socket);
};

Game.prototype.removePlayer = function(id) {
  this.clients.remove(id);
}

/**
 * Updates a player based on input received from their client.
 * @param {string} id The socket ID of the client
 * @param {Object} data The input received from the client
 */
Game.prototype.placeObject = function(id, data) {
  this.objects.set(this.object_id_counter,data);
  this.object_id_counter += 1;
}

/**
 * Steps the server forward in time. Updates every entity in the game.
 */
Game.prototype.update = function() {
  //no update required for now.
};

/**
 * Sends the state of the game to every client.
 */
Game.prototype.sendState = function() {
  var ids = this.clients.keys();
  for (var i = 0; i < ids.length; ++i) {
    this.clients.get(ids[i]).emit('update', {this.objects});
  }
};

module.exports = Game;
