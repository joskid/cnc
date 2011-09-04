/**
 * Main CnC Libraries etc
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 */

/**
 * CanvasElement - Create a Canvas element
 * @class
 */
var CanvasElement = Class.extend({

  _canvas   : null,
  _context  : null,
  _try      : [
    /*
    "moz-webgl",          // Firefox
    "webkit-3d",          // Webkit
    "experimental-webgl", // Misc
    "3d",                 // Test
    */
    "2d"                  // Default fallback
  ],

  init : function(root, width, height, zi) {
    zi = zi || 0;

    var canvas             = document.createElement("canvas");
    canvas.width           = width;
    canvas.height          = height;
    canvas.style.position  = "absolute";
    canvas.style.zIndex    = zi;

    if ( canvas ) {
      if ( root ) {
        root = document.getElementById(root);
        root.appendChild(canvas);
      } else {
        root = document.createDocumentFragment();
        root.appendChild(canvas);
      }

      this._canvas   = canvas;

      var gl = null, i = 0, c = null;
      while ( !gl ) {
        c = this._try[i];
        gl = canvas.getContext(c);
        i++;
      }

      if ( gl ) {
        this._context  = gl;
        console.info("Found canvas context", c, gl);
      } else {
        throw "Failed to get Canvas Context!";
      }
    } else {
      throw "Failed to create Canvas.";
    }
  },

  destroy : function() {
    this._canvas = null;
  },

  clear : function() {

  },

  move : function(x, y) {
    this._canvas.style.top  = (y + "px");
    this._canvas.style.left = (x + "px");
  },

  append : function(img, x, y) {
    this._context.drawImage(img, x, y);
  },

  save : function(type) {
    type = type || "image/png";
    return this._canvas.toDataURL(type);
  }

});
