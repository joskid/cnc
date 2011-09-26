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
    },

    'degToRad' : function(degree) {
      return degree*(Math.PI/180);
    }


  };

})();

