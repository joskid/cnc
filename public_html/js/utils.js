/**
 * Main CnC Utils etc
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 */

/**
 * Global helpers
 * @class
 */
var $ = (function(undefined) {

  return {
    //
    // EVENTS
    //

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

    'keyButton' : function(ev) {
      ev = ev || window.event;

      var key = ev.which || ev.keyCode;
      var chr = String.fromCharCode(key);
      var mod = null;

      var spe = {
        9  : "TAB",
        17 : "CTRL",
        18 : "ALT",
        16 : "SHIFT",
        27 : "ESC"
      };

      if ( spe[key] !== undefined ) {
        mod = spe[key];
      }

      return {
        'key'  : key,
        'char' : chr,
        'mod'  : mod
      };
    },

    //
    // DOM
    //

    getOffset : function(el) {
      var _x = 0;
      var _y = 0;
      while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
      }
      return { top: _y, left: _x };
    },

    //
    // MATH
    //

    'degToRad' : function(degree) {
      return degree*(Math.PI/180);
    },

    'isInside' : function(rsrc, rtst) {
      if ( ((rtst.x1 >= rsrc.x1) && (rtst.x2 <= rsrc.x2)) && ((rtst.y1 >= rsrc.y1) && (rtst.y2 <= rsrc.y2)) ) {
        return true;
      }
      return false;
    },

    'shortestRotation' : function(src, dst, upper, lower) {
      //return Math.atan2(Math.sin(dst - src), Math.cos(dst - src));

      upper = upper || 180;
      lower = lower || -180;

      if ( upper <= lower ) {
        throw("Rotary bounds are of negative or zero size");
      }

      var value     = dst - src;
      var distance  = upper - lower;
      var times     = Math.floor((value - lower) / distance);

      return value - (times * distance);
    },

    'roundedAngle' : function(angle, nearest) {
      nearest = nearest || 90;
      return Math.round(angle/nearest) * nearest + (360*(angle<0));
      //return Math.round((angle/nearest))*nearest;
    }


  };

})();

