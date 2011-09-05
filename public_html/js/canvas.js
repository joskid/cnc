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

  init : function(type, root, width, height, zi) {
    zi = zi || 0;

    var canvas             = document.createElement("canvas");
    canvas.width           = width;
    canvas.height          = height;
    canvas.style.position  = "absolute";
    canvas.style.zIndex    = zi;

    if ( root ) {
      root = document.getElementById(root);
      root.appendChild(canvas);
    } else {
      root = document.createDocumentFragment();
      root.appendChild(canvas);
    }

    this._canvas   = canvas;
    this._context  = canvas.getContext(type);

    // Defaults
    this._context.fillStyle   = "#00ff00";
    this._context.strokeStyle = "#00ff00";
    this._context.lineWidth   = 1;
    this._context.font        = "20px Times New Roman";
  },

  destroy : function() {
    this._canvas = null;
  },

  clear : function() {

  },

  rotate : function(deg) {
    // FIXME
    //this._context.save();
    //this._context.rotate(0.5);
    //this._context.restore();

    var deg_str          = deg + "";
    var rotate_transform = "rotate(" + deg + "deg)";

    this._canvas.style["rotation"] = deg_str + "deg"; // CSS3
    this._canvas.style.MozTransform = rotate_transform; // Moz
    this._canvas.style.OTransform = rotate_transform; // Opera
    this._canvas.style.WebkitTransform = rotate_transform; // Webkit/Safari/Chrome
  },

  rectangle : function(en) {
    this._context.strokeStyle = en ? "#00ff00" : "#ffffff";
    this._context.beginPath();
    this._context.rect(0, 0, this._canvas.width, this._canvas.height);
    this._context.closePath();
    this._context.stroke();
  },

  append : function(img, x, y) {
    this._context.drawImage(img, x, y);
  },

  save : function(type) {
    type = type || "image/png";
    return this._canvas.toDataURL(type);
  },

  get : function() {
    return this._canvas;
  }

});
