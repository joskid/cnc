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
  _image    : null,
  _width    : -1,
  _height   : -1,

  init : function(type, root, width, height) {
    this._width  = parseInt(width, 10);
    this._height = parseInt(height, 10);
    var canvas             = document.createElement("canvas");
    canvas.width           = this._width;
    canvas.height          = this._height;

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
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
  },

  rotate : function(deg, en) {
    /* FIXME
    var rot = ($.degToRad(deg));
    this.clear();
    this._context.save();
    this._context.translate(this._width / 2, this._height / 2);
    this._context.rotate(rot);
    this._context.translate(-this._width / 2, -this._height / 2);
    this.redraw();
    if ( en ) {
      this.highlight();
    }
    this._context.restore();
    */

    var deg_str          = deg + "";
    var rotate_transform = "rotate(" + deg + "deg)";

    this._canvas.style["rotation"] = deg_str + "deg"; // CSS3
    this._canvas.style.MozTransform = rotate_transform; // Moz
    this._canvas.style.OTransform = rotate_transform; // Opera
    this._canvas.style.WebkitTransform = rotate_transform; // Webkit/Safari/Chrome
  },

  highlight : function() {
    this._context.strokeStyle = "#00ff00";
    this._context.beginPath();
    this._context.rect(0, 0, this._canvas.width, this._canvas.height);
    this._context.closePath();
    this._context.stroke();
  },

  rectangle : function(en) {
    this.clear();
    this.redraw();

    if ( en ) {
      this.highlight();
    }
  },

  append : function(img, x, y) {
    this._context.drawImage(img, x, y);
  },

  appendString : function(str, x, y) {
    var self = this;
    var img = new Image();
    img.onload = function() {
      self.append(img, 0, 0);
    };
    img.src = str;
  },

  save : function(type) {
    type = type || "image/png";
    return this._canvas.toDataURL(type);
  },

  redraw : function() {
    if ( this._image ) {
      this.append(this._image, 0, 0);
    }
  },

  setImage : function(path, draw) {
    var self = this;

    var img = new Image();
    img.onload = function() {
      self.append(img, 0, 0);
    };
    img.src = path;

    this._image = img;
  },

  get : function() {
    return this._canvas;
  }

});
