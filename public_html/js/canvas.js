/**
 * Main CnC Libraries etc
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 */

var CanvasObject = Class.extend({

  __width     : -1,
  __height    : -1,
  __x         : 0,
  __y         : 0,
  __angle     : 0,
  __root      : null,
  __canvas    : null,
  __context   : null,
  __overlay   : null,
  __coverlay  : null,

  /// MAGICS

  init : function(w, h, x, y, a, cn) {
    cn = cn || "MapObject";

    var m = cn == "MapObject" ? 20 : 0;

    this.setDimension(w, h);
    this.setPosition(x, y);
    this.setDirection(a);

    // Root DOM element
    var root              = document.createElement("div");
    root.className        = cn;
    root.width            = (this.__width);
    root.height           = (this.__height);
    root.style.left       = (this.__x) + "px";
    root.style.top        = (this.__y) + "px";

    // Main Canvas element
    var canvas            = document.createElement('canvas');
    var context           = canvas.getContext('2d');
    canvas.className      = cn + "Root";
    canvas.width          = (this.__width);
    canvas.height         = (this.__height);

    // Canvas overlay element
    var ccanvas           = document.createElement('canvas');
    var ccontext          = ccanvas.getContext('2d');
    ccanvas.className     = cn + "Overlay";
    ccanvas.width         = (this.__width + m);
    ccanvas.height        = (this.__height + m);

    root.appendChild(canvas);
    root.appendChild(ccanvas);

    this.__canvas   = canvas;
    this.__context  = context;
    this.__overlay  = ccanvas;
    this.__coverlay = ccontext;
    this.__root     = root;
  },

  destroy : function() {
    if ( this.__root ) {
      this.__root.parentNode.removeChild(this.__root);
    }

    this.__canvas   = null;
    this.__context  = null;
    this.__overlay  = null;
    this.__coverlay = null;

    delete this.__root;
  },

  /// METHODS

  render : function(d_callback, f_callback) {
    d_callback = d_callback || function() {};
    f_callback = f_callback || function() {};

    var w   = this.__width;
    var h   = this.__height;
    var x   = this.__x;
    var y   = this.__y;
    var c   = this.__context;
    var cc  = this.__coverlay;

    /* This handles the rotation and transformation of the overlay */

    // Clear
    cc.clearRect(0, 0, w + 20, h + 20);
    cc.save();

    //c.clearRect(0, 0, w, h);
    //c.save();

    // Transform
    //c.translate(w / 2, h / 2);
    //c.rotate(this.__angle);
    //c.translate(-(w / 2), -(h / 2));

    cc.translate((w + 20) / 2, (h + 20) / 2);
    cc.rotate(this.__angle);
    cc.translate(-((w + 20) / 2), -((h + 20) / 2));

    // Draw
    d_callback(c, cc, w, h, x, y);

    // Display
    //c.restore();
    cc.restore();

    f_callback(c, cc, w, h, x, y);
  },

  drawImage : function(img, x, y) {
    this.__context.drawImage(img, x, y);
  },

  drawOverlayImage : function(img, x, y) {
    this.__coverlay.drawImage(img, x, y);
  },

  drawClipImage : function(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    this.__context.clearRect(0, 0, this.__width, this.__height);
    this.__context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  },

  /// SETTERS

  setPosition : function(x, y, set) {
    this.__x = parseInt(x, 10);
    this.__y = parseInt(y, 10);

    if ( set ) {
      this.__root.style.left = (this.__x) + "px";
      this.__root.style.top  = (this.__y) + "px";
    }
  },

  setDimension : function(w, h) {
    this.__width = parseInt(w, 10);
    this.__height = parseInt(h, 10);
  },

  setDirection : function(d) {
    if ( !isNaN(d) && d ) {
      this.__angle = $.degToRad(parseInt(d, 10));
    }
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

  getCanvas : function(o) {
    return o ? this.__overlay : this.__canvas;
  },

  getContext : function() {
    return this.__context;
  },

  getRect : function() {
    return {
      x1 : this.__x,
      y1 : this.__y,
      x2 : this.__x + this.__width,
      y2 : this.__y + this.__height
    };
  },

  getRoot : function() {
    return this.__root;
  }

});
