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

  init : function(root) {
    var canvas = document.createElement("canvas");

    if ( root ) {
      root = document.getElementById(root);
      root.appendChild(canvas);
    }

    this._canvas = canvas;
  },

  destroy : function() {
    this._canvas = null;
  },

  clear : function() {

  },

  append : function(img, x, y) {

  }

});
