/**
 * Main CnC Utils etc
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 */

/**
 * Global helpers
 * @class
 */
var $ = (function(undefined) {

  return {
    'mousePosX' : function(ev, el) {
      ev = ev || window.event;

      var x = 0;
      if ( ev.pageX !== undefined ) {
        x = ev.pageX;
      } else if ( ev.clientX !== undefined ) {
        x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      }
      return x; // ev.clientX
    },

    'mousePosY' : function(ev, el) {
      ev = ev || window.event;

      var y = 0;
      if ( ev.pageY !== undefined ) {
        y = ev.pageY;
      } else if ( ev.clientY !== undefined ) {
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      return y; // ev.clientY
    },

    'mouseButton' : function(ev) {
      ev = ev || window.event;

      var button = 1;
      if ( ev.which ) {
        button= (ev.which < 2) ? 1 : ((ev.which == 2) ? 2 : 3);
      } else {
        button= (ev.button < 2) ? 1 : ((ev.button == 4) ? 2 : 3);
      }
      return button;
    },

    'addEvent'  : function(el, ev, callback, arg) {
      ev = ev || window.event;
      arg == undefined ? false : arg;

      if ( el.addEventListener ) {
        el.addEventListener(ev, callback, arg);
      } else if ( el.attachEvent ) {
        el.attachEvent("on" + ev, callback);
      } else {
        el["on" + ev] = callback;
      }
    },

    'removeEvent' : function(el, ev, callback,arg ) {
      ev = ev || window.event;
      arg == undefined ? false : arg;

      if ( el.removeEventListener ) {
        el.removeEventListener(ev, callback, arg);
      } else if ( el.detachEvent ) {
        el.detachEvent("on" + ev, callback);
      } else {
        el["on" + ev] = undefined;
      }
    },

    'stopPropagation' : function(ev) {
      ev = ev || window.event;

      if ( ev.stopPropagation ) {
        ev.stopPropagation();
      } else if ( ev.cancelBubble ) {
        ev.cancelBubble = true;
      }
    },

    'preventDefault' : function(ev) {
      ev = ev || window.event;

      if ( ev.preventDefault ) {
        ev.preventDefault();
      } else if ( ev.returnValue !== undefined ) {
        ev.returnValue = false;
      }
    },

    'disableContext' : function(el) {
      el.oncontextmenu = function() {
        return false;
      };
    }
  };

})();

/**
 * Draggable - Create a draggable element (movable)
 * TODO: addEventHandler
 * @class
 */
var Draggable = Class.extend({

  _x        : 0,
  _y        : 0,
  _root     : null,
  _active   : false,
  _position : [0, 0],
  _clickX   : -1,
  _clickY   : -1,
  _dragged  : false,

  init : function(root, position) {
    var self = this;

    this._root     = root;
    this._position = position;

    $.addEvent(this._root, "mousedown", function(ev) {
      if ( $.mouseButton(ev) == 3 ) {
        self._onmousedown(ev, self);
      }
    });
  },

  destroy : function() {

    $.removeEvent(this._root, "mousedown", self._onmousedown);
    $.removeEvent(window,     "mouseup",   self._onmouseup);
    $.removeEvent(window,     "mousemove", self._onmousemove);

    this._root             = null;
  },

  ondragstart : function(ev, self) {
  },

  ondragmove : function(ev, self) {
  },

  ondragstop : function(ev, self) {
  },

  _onmousedown : function(ev, self) {
    $.addEvent(window, "mousemove", function(e) {
      self._onmousemove(e, self);
    });
    $.addEvent(window, "mouseup", function(e) {
      self._onmouseup(e, self);
    });

    self._active  = true;
    self._dragged = false;
    self._clickX  = $.mousePosX(ev);
    self._clickY  = $.mousePosY(ev);

    self.ondragstart(ev, self, self._position);
  },

  _onmousemove : function(ev, self) {
    if ( self._active ) {
      self._x = (self._position[0] + ($.mousePosX(ev) - self._clickX));
      self._y = (self._position[1] + ($.mousePosY(ev) - self._clickY));

      self._root.style.left = (self._x) + "px";
      self._root.style.top  = (self._y) + "px";

      self._dragged = true;

      self.ondragmove(ev, self, self._position);
    }
  },

  _onmouseup : function(ev, self) {
    self._active = false;
    self._position = [
      self._x,
      self._y
    ];

    $.removeEvent(window, "mouseup",   self._onmouseup);
    $.removeEvent(window, "mousemove", self._onmousemove);

    self.ondragstop(ev, self, self._position);
  },

  dragged : function() {
    return this._dragged;
  }

});

