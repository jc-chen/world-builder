/**
 * @fileoverview Client side script
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

$(document).ready(function() {
  var socket = io();

  Input.applyEventHandlers();

  var game = Game.create(socket);
  game.init();
});
