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
    ///////////////////////////////////////////////////////////////////////////
    // EVENTS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Get mouse position X in pixels
     * @param  ev    Event        Browser event
     * @param  el    DOMElement   (Unused)
     * @return int
     */
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

    /**
     * Get mouse position Y in pixels
     * @param  ev    Event        Browser event
     * @param  el    DOMElement   (Unused)
     * @return int
     */
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

    /**
     * Get which mouse button was pressed
     * @param  ev    Event        Browser event
     * @return int
     */
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

    /**
     * Add an event to a DOM element
     * @param  el         DOMElement   DOM Element
     * @param  ev         Event        Browser event
     * @param  callback   Function     Event function reference
     * @param  arg        bool         Use capturing (default, false -- W3C Only)
     * @return void
     */
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

    /**
     * Remove an event from a DOM element
     * @param  el         DOMElement   DOM Element
     * @param  ev         Event        Browser event
     * @param  callback   Function     Event function reference
     * @param  arg        bool         Use capturing (default, false -- W3C Only)
     * @return void
     */
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

    /**
     * Stop bubbling (propagation) of event
     * @param  ev         Event        Browser event
     * @return void
     */
    'stopPropagation' : function(ev) {
      ev = ev || window.event;

      if ( ev.stopPropagation ) {
        ev.stopPropagation();
      } else if ( ev.cancelBubble ) {
        ev.cancelBubble = true;
      }
    },

    /**
     * Prevent browser default event
     * @param  ev         Event        Browser event
     * @return void
     */
    'preventDefault' : function(ev) {
      ev = ev || window.event;

      if ( ev.preventDefault ) {
        ev.preventDefault();
      } else if ( ev.returnValue !== undefined ) {
        ev.returnValue = false;
      }
    },

    /**
     * Prevent browser context menu default event
     * @param  el         DOMElement   DOM Element
     * @return bool
     */
    'disableContext' : function(el) {
      el.oncontextmenu = function() {
        return false;
      };
    },

    /**
     * Get which key was pressed (including special keys)
     * @param  ev         Event        Browser event
     * @return Object
     */
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

    ///////////////////////////////////////////////////////////////////////////
    // DOM
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Get the absolute offset of an element in pixels
     * @param  el         DOMElement   DOM Element
     * @return Object
     */
    'getOffset' : function(el) {
      var _x = 0;
      var _y = 0;
      while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
      }
      return { top: _y, left: _x };
    },

    ///////////////////////////////////////////////////////////////////////////
    // MATH
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Convert degrees into radians
     * @param  degree   int    Degree to convert
     * @return float
     */
    'degToRad' : function(degree) {
      return degree*(Math.PI/180);
    },

    /**
     * Check if rect is inside another (inner-collision)
     * @param  rsrc   Object    Source rect
     * @param  rdst   Object    Test rect
     * @return bool
     */
    'isInside' : function(rsrc, rtst) {
      if ( ((rtst.x1 >= rsrc.x1) && (rtst.x2 <= rsrc.x2)) && ((rtst.y1 >= rsrc.y1) && (rtst.y2 <= rsrc.y2)) ) {
        return true;
      }
      return false;
    },

    /**
     * Get the shortest rotation angle
     * @param  src      int   Source angle
     * @param  dst      int   Destination angle
     * @param  upper    int   Upper angle (180)
     * @param  lower    int   Lower angle (-180)
     * @return float
     */
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

    /**
     * Round angle to nearest X (integer, rounded)
     * @param  angle   int    Current angle
     * @param  nearest int    Factor
     * @return int
     */
    'roundedAngle' : function(angle, nearest) {
      nearest = nearest || 90;
      return Math.round(angle/nearest) * nearest + (360*(angle<0));
    },

    /**
     * Round angle to nearest X (float)
     * @param  angle   int    Current angle
     * @param  nearest int    Factor
     * @return float
     */
    'roundedAngle2' : function(angle, nearest) {
      nearest = nearest || 90;
      return (angle/nearest) * nearest + (360*(angle<0));
    }


  };

})();

