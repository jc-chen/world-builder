/**
 * @fileoverview This is a class encapsulating the client side of the game,
 *   which handles the rendering of the lobby and game and the sending of
 *   user input to the server.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */
/**
 * Creates a Game on the client side to render the players and entities.
 * @constructor
 * @param {Object} socket The socket connected to the server.
 */
function Game(socket) {
  this.socket = socket;

  this.objects = []
}

/**
 * Factory method to create a Game object.
 * @param {Object} socket The Socket connected to the server.
 * @param {Element} canvasElement The canvas element that the game will use to
 *   draw to.
 * @return {Game}
 */
Game.create = function(socket) {
  /**
   * Set the aspect ratio of the canvas.
   */
  return new Game(socket);
};

/**
 * Initializes the Game object and its child objects as well as setting the
 * event handlers.
 */
Game.prototype.init = function() {
  var context = this;
  this.socket.on('update', function(data) {
    context.receiveGameState(data);
  });
  this.socket.emit('player-join');
}; 

/**
 * Updates the game's internal storage of all the powerups, called each time
 * the server sends packets.
 * @param {Object} state The game state received from the server.
 */
Game.prototype.receiveGameState = function(state) {
  this.objects = state
};

/**
 * Updates the state of the game client side and relays intents to the
 * server.
 */
Game.prototype.update = function() {
  if (this.selfPlayer) {
    // Emits an event for the containing the player's input.
    this.socket.emit('player-action', {
      keyboardState: {
        left: Input.LEFT,
        right: Input.RIGHT,
        up: Input.UP,
        down: Input.DOWN
      }
    });

    //render function should go here

    //TODO: RENDER ?
  }
};