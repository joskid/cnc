/**
 * Main CnC Libraries etc
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 */

var CanvasObject = Class.extend({

  __class     : "",         // Class name for DOM objects
  __width     : -1,         // Canvas width
  __height    : -1,         // Canvas height
  __x         : 0,          // Canvas position x (px)
  __y         : 0,          // Canvas position y (px)
  __angle     : 0,          // Canvas angle (radians)
  __root      : null,       // Root DOM element
  __canvas    : null,       // Canvas DOM element
  __context   : null,       // Canvas context
  __overlay   : null,       // Canvas Overlay DOM element
  __coverlay  : null,       // Canvas Overlay context

  //
  // MAGICS
  //

  /**
   * @constructor
   */
  init : function(w, h, x, y, a, cn) {
    this.__class = cn || "MapObject";

    var m = this.__class == "MapObject" ? 20 : 0;

    this.setDimension(w, h);
    this.setPosition(x, y);
    this.setDirection(a);

    // Root DOM element
    var root              = document.createElement("div");
    root.className        = this.__class;
    root.style.width      = (this.__width) + "px";
    root.style.height     = (this.__height) + "px";
    root.style.left       = (this.__x) + "px";
    root.style.top        = (this.__y) + "px";

    // Main Canvas element
    var canvas            = document.createElement('canvas');
    var context           = canvas.getContext('2d');
    canvas.className      = this.__class + "Root";
    canvas.width          = (this.__width);
    canvas.height         = (this.__height);

    // Canvas overlay element
    var ccanvas           = document.createElement('canvas');
    var ccontext          = ccanvas.getContext('2d');
    ccanvas.className     = this.__class + "Overlay";
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

  /**
   * @destructor
   */
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

  /**
   * CanvasObject::render -- Render the object
   * return void
   */
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

  /**
   * CanvasObject::drawImage -- Draw an image upon canvas
   * @return void
   */
  drawImage : function(img, x, y) {
    this.__context.drawImage(img, x, y);
  },

  /**
   * CanvasObject::drawOverlayImage -- Draw an image upon overlay canvas
   * @return void
   */
  drawOverlayImage : function(img, x, y) {
    this.__coverlay.drawImage(img, x, y);
  },

  /**
   * CanvasObject::drawClipImage -- Draw an image upon canvas by clipping
   * @return void
   */
  drawClipImage : function(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    this.__context.clearRect(0, 0, this.__width, this.__height);
    this.__context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  },

  //
  // SETTERS
  //

  /**
   * CanvasObject::setPosition -- Set the canvas position
   * @return void
   */
  setPosition : function(x, y, set) {
    this.__x = parseInt(x, 10);
    this.__y = parseInt(y, 10);

    if ( set ) {
      this.__root.style.left = (this.__x) + "px";
      this.__root.style.top  = (this.__y) + "px";
    }
  },

  /**
   * CanvasObject::setDimension -- Set the canvas dimension
   * @return void
   */
  setDimension : function(w, h, set) {
    this.__width = parseInt(w, 10);
    this.__height = parseInt(h, 10);

    if ( set ) {
      var m = this.__class == "MapObject" ? 20 : 0;

      this.__canvas.width      = this.__width;
      this.__canvas.height     = this.__height;
      this.__overlay.width     = (this.__width + m);
      this.__overlay.height    = (this.__height + m);
      this.__root.style.width  = (this.__width) + "px";
      this.__root.style.height = (this.__height) + "px";
    }
  },

  /**
   * CanvasObject::setDirection -- Set the canvas direction (degrees)
   * @return void
   */
  setDirection : function(d) {
    if ( !isNaN(d) && d ) {
      this.__angle = $.degToRad(parseInt(d, 10));
    }
  },

  //
  // GETTERS
  //

  /**
   * CanvasObject::getPosition -- Get the current object position
   * @return Array
   */
  getPosition : function() {
    return [this.__x, this.__y];
  },

  /**
   * CanvasObject::getDimension -- Get the current object dimension
   * @return Array
   */
  getDimension : function() {
    return [this.__width, this.__height];
  },

  /**
   * CanvasObject::getDirection -- Get current canvas angle (degrees)
   * @return Float
   */
  getDirection : function() {
    return this.__angle;
  },

  /**
   * CanvasObject::getCanvas -- Get the canvas DOM element
   * @return Array
   */
  getCanvas : function(o) {
    return o ? this.__overlay : this.__canvas;
  },

  /**
   * CanvasObject::getContext -- Get the canvas context
   * @return Context
   */
  getContext : function(o) {
    return o ? this.__coverlay : this.__context;
  },

  /**
   * CanvasObject::getRect -- Get the rect of the object
   * @return Object
   */
  getRect : function() {
    return {
      x1 : this.__x,
      y1 : this.__y,
      x2 : this.__x + this.__width,
      y2 : this.__y + this.__height
    };
  },

  /**
   * CanvasObject::getRoot -- Get the root DOM element
   * @return Array
   */
  getRoot : function() {
    return this.__root;
  }

});
