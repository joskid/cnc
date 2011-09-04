/**
 * Main CnC Utils etc
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 */

/**
 * CanvasElement - Create a Canvas element
 * TODO: addEventHandler
 * @class
 */
var Draggable = Class.extend({

  _x : 0,
  _y : 0,
  _root : null,
  _active : false,
  _position : [0, 0],
  _clickX   : -1,
  _clickY   : -1,

  init : function(root, position) {
    var self = this;

    this._root     = root;
    this._position = position;

    this._root.onmousedown = function(ev) {
      self._onmousedown(ev, self);
    };
  },

  destroy : function() {
    this._root             = null;
    this._root.onmousedown = null;

    window.onmouseup       = null;
    window.onmousemove     = null;
  },

  _onmousedown : function(ev, self) {
    window.onmousemove = function(e) {
      self._onmousemove(e, self);
    };

    window.onmouseup   = function(e) {
      self._onmouseup(e, self);
    };

    self._active = true;
    self._clickX = ev.clientX;
    self._clickY = ev.clientY;
  },

  _onmousemove : function(ev, self) {
    if ( self._active ) {
      self._x = (self._position[0] + (ev.clientX - self._clickX));
      self._y = (self._position[1] + (ev.clientY - self._clickY));

      self._root.style.left = (self._x) + "px";
      self._root.style.top  = (self._y) + "px";
    }
  },

  _onmouseup : function(ev, self) {
    self._active = false;
    self._position = [
      self._x,
      self._y
    ];

    window.onmouseup       = null;
    window.onmousemove     = null;
  }

});

