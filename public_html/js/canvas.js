/**
 * Main CnC Libraries etc
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 */

/**
 * CanvasObject - Canvas abstraction class
 * @class
 */
var CanvasObject = Class.extend({


  __canvas    : null,
  __context   : null,
  __image     : null,
  __width     : null,
  __height    : null,
  __x         : 0,
  __y         : 0,
  __rotation  : null,

  init : function(type, root, width, height, image) {
    this.__width  = parseInt(width, 10);
    this.__height = parseInt(height, 10);


    var img  = new Image();
    img.src = "/img/" + image + ".png";

    var canvas             = document.createElement("canvas");
    canvas.width           = this.__width;
    canvas.height          = this.__height;
    canvas.className       = "MapObject";
    canvas.style.top       = this.__x + "px";
    canvas.style.left      = this.__y + "px";

    if ( root ) {
      root = document.getElementById(root);
      root.appendChild(canvas);
    } else {
      root = document.createDocumentFragment();
      root.appendChild(canvas);
    }

    this.__canvas   = canvas;
    this.__context  = canvas.getContext(type);
    this.__image    = img;

    // Defaults
    this.__context.fillStyle   = "rgba(255,255,255,0.5)";
    this.__context.strokeStyle = "rgba(0,0,0,0.5)";
    this.__context.lineWidth   = 1;
    this.__context.font        = "12px Times New Roman";
  },

  destroy : function() {
    if ( this.__canvas ) {
      this.__canvas.parentNode.removeChild(this.__canvas);
    }

    this.__context = null;
    this.__canvas  = null;
  },

  render : function(en) {
    var w = this.__width;
    var h = this.__height;
    var x = this.__x;
    var y = this.__y;
    var c = this.__context;

    // Move
    this.__canvas.style.left      = x + "px";
    this.__canvas.style.top       = y + "px";

    // Clear
    c.clearRect(0, 0, this.__canvas.width, this.__canvas.height);
    c.save();

    // Rotate
    c.translate(w / 2, h / 2);
    c.rotate(this.__rotation);
    c.translate(-(w / 2), -(h / 2));

    // Render
    if ( en ) {
      c.arc((w / 2), (h / 2), 15, (Math.PI * 2), false);
      c.fill();
      c.stroke();
    }

    c.drawImage(this.__image, 0, 0);

    // Save
    c.restore();
  },

  setPosition : function(x, y) {
    this.__x = parseInt(x, 10);
    this.__y = parseInt(y, 10);
  },

  setRotation : function(deg) {
    this.__rotation = ($.degToRad(deg));
  },

  getCanvas : function() {
    return this.__canvas;
  },

  getContext : function() {
    return this.__context;
  }

});

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
    var rot = ($.degToRad(deg));


    this.clear();
    this._context.save();
    this._context.translate(this._width / 2, this._height / 2);
    this._context.rotate(rot);
    this._context.translate(-(this._width / 2), -(this._height / 2));

    /*
    if ( en ) {
      this.highlight();
    }
    */
    this.redraw();
    this._context.restore();

    /* FIXME
    this.clear();
    this._context.translate(this._width / 2, this._height / 2);
    this._context.rotate(rot);
    this._context.translate(-this._width / 2, -this._height / 2);
    this.redraw();
    */

    /*
    var deg_str          = deg + "";
    var rotate_transform = "rotate(" + deg + "deg)";

    this._canvas.style["rotation"] = deg_str + "deg"; // CSS3
    this._canvas.style.MozTransform = rotate_transform; // Moz
    this._canvas.style.OTransform = rotate_transform; // Opera
    this._canvas.style.WebkitTransform = rotate_transform; // Webkit/Safari/Chrome
    */
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
