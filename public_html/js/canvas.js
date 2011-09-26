/**
 * Main CnC Libraries etc
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 */

var CanvasObject = Class.extend({

  __width   : -1,
  __height  : -1,
  __x       : 0,
  __y       : 0,
  __angle   : 0,
  __canvas  : null,
  __context : null,

  /// MAGICS

  init : function(w, h, x, y, a) {
    this.setDimension(w, h);
    this.setPosition(x, y);
    this.setDirection(a);

    var canvas            = document.createElement('canvas');
    var context           = canvas.getContext('2d');
    canvas.width          = (this.__width);
    canvas.height         = (this.__height);
    canvas.style.position = "absolute";
    canvas.style.left     = (this.__x) + "px";
    canvas.style.top      = (this.__y) + "px";

    this.__canvas = canvas;
    this.__context = context;
  },

  /// METHODS

  render : function(callback) {
    callback = callback || function() {};

    var w = this.__width;
    var h = this.__height;
    var x = this.__x;
    var y = this.__y;
    var c = this.__context;

    // Clear
    c.clearRect(0, 0, w, h);
    c.save();

    // Transform
    c.translate(w / 2, h / 2);
    c.rotate(this.__angle);
    c.translate(-(w / 2), -(h / 2));

    // Draw
    callback(c, w, h, x, y);

    // Display
    c.restore();
  },

  drawImage : function(img, x, y) {
    this.__context.drawImage(img, x, y);
  },

  /// SETTERS

  setPosition : function(x, y, set) {
    this.__x = parseInt(x, 10);
    this.__y = parseInt(y, 10);

    if ( set ) {
      this.__canvas.style.left = (x) + "px";
      this.__canvas.style.top  = (y) + "px";
    }
  },

  setDimension : function(w, h) {
    this.__width = parseInt(w, 10);
    this.__height = parseInt(h, 10);
  },

  setDirection : function(d) {
    this.__angle = parseFloat(d, 10);
  },

  /// GETTERS

  getPosition : function() {
    return [this.__x, this.__y];
  },

  getDimension : function() {
    return [this.__width, this.__height];
  },

  getDirection : function() {
    return this.__angle;
  },

  getCanvas : function() {
    return this.__canvas;
  },

  getContext : function() {
    return this.__context;
  }

});
