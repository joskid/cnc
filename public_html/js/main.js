
/**
 * Main CnC Libraries etc
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 */
(function(undefined) {

  /////////////////////////////////////////////////////////////////////////////
  // GLOBALS
  /////////////////////////////////////////////////////////////////////////////

  var _FPS      = 0;
  var _Main     = null;
  var _Graphic  = null;
  var _Sound    = null;
  var _Player   = 0;

  var _DebugMap = null;
  var _DebugFPS = null;
  var _DebugObjects = null;

  /////////////////////////////////////////////////////////////////////////////
  // CONSTANTS
  /////////////////////////////////////////////////////////////////////////////

  var SUPPORT = {
    'canvas'         : (!!document.createElement('canvas').getContext),
    'audio'          : (!!document.createElement('audio').canPlayType),
    'video'          : (!!document.createElement('video').canPlayType),
    'localStorage'   : (('localStorage'   in window) && (window['localStorage']   !== null)),
    'sessionStorage' : (('sessionStorage' in window) && (window['sessionStorage'] !== null)),
    'globalStorage'  : (('globalStorage'  in window) && (window['globalStorage']  !== null)),
    'openDatabase'   : (('openDatabase'   in window) && (window['openDatabase']   !== null)),
    'WebSocket'      : (('WebSocket'      in window) && (window['WebSocket']      !== null))
  };

  var DEBUG_MODE       = true;

  var LOOP_INTERVAL    = (1000 / 30);
  var TILE_SIZE        = 24;
  var MINIMAP_WIDTH    = 180;
  var MINIMAP_HEIGHT   = 180;
  var SELECTION_SENSE  = 10;

  var OBJECT_UNIT      = 1;
  var OBJECT_TANK      = 2;
  var OBJECT_BUILDING  = 3;

  /////////////////////////////////////////////////////////////////////////////
  // HELPER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  var ObjectAction = (function() {
    var _Selected = [];

    function SelectObjects(lst) {
      for ( var i = 0; i < lst.length; i++ ) {
        lst[i].select();
      }
    }

    function UnSelectObjects(lst) {
      for ( var i = 0; i < lst.length; i++ ) {
        lst[i].unselect();
      }
    }

    function MoveObjects(lst, pos) {
      for ( var i = 0; i < lst.length; i++ ) {
        lst[i].move(pos);
      }
    }

    return function (act) {
      if ( act instanceof Array ) {
        if ( _Selected.length ) {
          UnSelectObjects(_Selected);
        }

        _Selected = act;

        if ( _Selected.length ) {
          SelectObjects(_Selected);

          _Sound.play("await1");
        }
      } else if ( act instanceof Object ) {
        if ( _Selected.length ) {
          MoveObjects(_Selected, act);

          _Sound.play("ackno");
        }
      }
    };
  })();

  /////////////////////////////////////////////////////////////////////////////
  // BASE CLASSES
  /////////////////////////////////////////////////////////////////////////////

  var Graphics = Class.extend({

    _preloaded : {
      "unit" : null,
      "tank" : null,
      "hq"   : null
    },

    init : function(callback) {
      console.group("Graphics::init()");

      console.group("Preloading gfx");
      var index = 1;
      for ( var i in this._preloaded ) {
        if ( this._preloaded.hasOwnProperty(i) ) {
          var src  = "/img/"  + i + ".png";

          console.log(i, src);

          s = new Image();
          s.onload = function() {
            if ( index >= 3 ) {
              callback();
            }
            index++;
          };
          s.src = src;

          this._preloaded[i] = s;
        }
      }
      console.groupEnd();

      console.groupEnd();
    },

    destroy : function() {
      console.group("Graphics::destroy()");
      for ( var i in this._preloaded ) {
        if ( this._preloaded.hasOwnProperty(i) ) {
          if ( this._preloaded[i] ) {
            delete this._preloaded[i];
            console.log("Unloaded", i);
          }
        }
      }
      console.groupEnd();
    },

    getImage : function(img) {
      return this._preloaded[img];
    }

  });

  /**
   * Sounds -- Sound Manager
   * @class
   */
  var Sounds = Class.extend({
    _enabled   : (CnC.CONFIG.audio_on && SUPPORT.audio),
    _codec     : "mp3",
    _ext       : "mp3",

    _preloaded : {
      "await1"   : null,
      "ackno"    : null
    },

    init : function() {

      console.group("Sounds::init()");
      if ( this._enabled ) {
        var s, t, codec;

        // Check for supported audio codec
        var types = {
          "ogg" : 'audio/ogg; codecs="vorbis"', // OGG
          "mp3" : 'audio/mpeg'                  // MP3
        };

        for ( s in types ) {
          if ( types.hasOwnProperty(s) ) {
            t = types[s];
            if ( (!!document.createElement('audio').canPlayType(t)) ) {
              codec = s;
              break;
            }
          }
        }

        if ( codec ) {
          this._codec = codec;
          this._ext   = codec;
        } else {
          this._enabled = false;
        }
      }

      console.log("Supported", this._enabled);
      console.log("Enabled", CnC.CONFIG.audio_on);
      console.log("Codec", this._codec, this._ext);

      // Preload audio files
      if ( this._enabled ) {
        console.group("Preloading audio");
        for ( var i in this._preloaded ) {
          if ( this._preloaded.hasOwnProperty(i) ) {
            var src  = "/snd/" + this._codec + "/" + i + "." + this._ext;

            console.log(i, src);

            s = new Audio(src);
            s.type = this._codec;
            s.preload = "auto";
            s.controls = false;
            s.autobuffer = true;
            s.loop = false;
            s.load();

            this._preloaded[i] = s;
          }
        }
        console.groupEnd();
      }

      console.groupEnd();
    },

    destroy : function() {
      console.group("Sounds::destroy()");
      for ( var i in this._preloaded ) {
        if ( this._preloaded.hasOwnProperty(i) ) {
          if ( this._preloaded[i] ) {
            delete this._preloaded[i];
            console.log("Unloaded", i);
          }
        }
      }
      console.groupEnd();
    },

    play : function(snd) {
      if ( this._enabled ) {
        if ( this._preloaded[snd] ) {
          this._preloaded[snd].play();
        }
      }
    }
  });

  /**
   * Game -- Main Class
   * @class
   */
  var Game = Class.extend({

    _interval : null,
    _started  : null,
    _last     : null,
    _running  : false,
    _map      : null,

    init : function() {
      console.group("Game::init()");

      // Example data
      this._map = new Map();

      this._map.addObject((new MapObjectTank(50, 30)));
      this._map.addObject((new MapObjectTank(50, 90)));
      this._map.addObject((new MapObjectTank(50, 150)));
      this._map.addObject((new MapObjectBuilding(143, 143)));
      this._map.addObject((new MapObjectUnit(170, 10)));
      this._map.addObject((new MapObjectUnit(170, 40)));
      this._map.addObject((new MapObjectUnit(170, 70)));

      console.groupEnd();
    },

    destroy : function() {
      console.group("Game::destroy()");

      if ( this._interval ) {
        clearInterval(this._interval);
        this._interval = null;
      }

      if ( this._map ) {
        this._map.destroy();
        this._map = null;
      }

      console.groupEnd();
    },

    resize : function() {
      if ( this._map ) {
        this._map.onResize();
      }
    },

    loop : function(tick) {
      if ( this._last ) {
        _FPS = tick - this._last;
      }

      this._map.render();

      this._last = tick;

      if ( DEBUG_MODE ) {
        _DebugFPS.innerHTML = _FPS;
        _DebugObjects.innerHTML = this._map._objects.length;
      }
    },

    run : function() {
      console.group("Game::run()");

      if ( !this._running ) {
        var self = this;

        this._map.prepare(function() {

          self._started = new Date();

          /*
          var t = (window.requestAnimationFrame       ||
                   window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame    ||
                   window.oRequestAnimationFrame      ||
                   window.msRequestAnimationFrame     ||
                   null);
        */
          var t = null;

          if ( t ) {
            //var canvas = self.getCanvas();
            var frame = function() {
              var tick = ((new Date()) - self._started);
              self.loop(tick);

              t(frame/*, canvas*/);
            };

            t(frame/*, canvas*/);
          } else {
            if ( !self._interval ) {
              self._interval = setInterval(function() {
                var tick = ((new Date()) - self._started);
                self.loop(tick);
              }, LOOP_INTERVAL);
            }
          }

          console.groupEnd();
        });

        this._running = true;
      }
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // ABSTRACT CLASSES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * MapObject -- Map Object Base Class
   * @class
   */
  var MapObject = CanvasObject.extend({

    _player        : 0,
    _type          : -1,
    _image         : null,
    _selected      : false,
    _angle         : 0,
    _movable       : true,
    _speed         : 0,
    _turning_speed : 0,
    _strength      : 10,

    _destination  : null,
    _heading      : null,

    init : function(t, w, h, x, y, a) {
      a = a || 0;

      console.group("MapObject::init()");

      // Set internals
      this._type = parseInt(t, 10);
      if ( this._type == OBJECT_BUILDING ) {
        this._movable = false;
      } else if ( this._type == OBJECT_UNIT ) {
        this._speed = 5;
      } else {
        this._speed = 10;
        this._turning_speed = 10;
      }

      // Init canvas
      this._super(w, h, x, y, a);
      this.__coverlay.fillStyle   = "rgba(255,255,255,0.9)";
      this.__coverlay.strokeStyle = "rgba(0,0,0,0.9)";
      this.__coverlay.lineWidth   = 1;

      // Add events
      var self = this;
      $.addEvent(this.__overlay, "mousedown", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
      });
      $.addEvent(this.__overlay, "click", function(ev) {
        self.onClick(ev);
      }, true);

      console.log("Pos X", x);
      console.log("Pos Y", y);

      console.groupEnd();
    },

    destroy : function() {
      this.__context.onclick = null;

      this._super();
    },

    render : function() {
      var self = this;

      var mag, dif, dir;
      // First handle rotation
      if ( this._heading !== null ) {
        if ( this._turning_speed ) {
          if ( this._heading !== this._angle ) {
            dir = $.shortestRotation(this._angle, this._heading);

            if ( dir > 0 ) {
              mag = this._angle + this._turning_speed;
              if ( mag >= this._heading ) {
                mag = this._heading;
              }
            } else {
              mag = this._angle - this._turning_speed;
              if ( mag <= this._heading ) {
                mag = this._heading;
              }
            }

            this.setDirection(mag);
            this._angle = mag;
          } else {
            this._heading = null;
          }
        } else {
          this._angle   = this._heading;
          this._heading = null;
          this.setDirection(this._angle);
        }
      }
      // Then movment
      else if ( this._destination !== null ) {
        var x = this.__x;
        var y = this.__y;

        // Find direction
        var i = this._destination.x - x;
        var j = this._destination.y - y;

        // Get and check closest distance
        mag = Math.sqrt(i * i + j * j);
        dif = Math.min(mag, this._speed);

        if ( dif < this._speed ) {
          this._destination = null;
          return;
        }

        // Direction vector
        i /= mag;
        j /= mag;

        // Velocity vector
        i *= dif;
        j *= dif;

        this.setPosition(x + i, y + j, true);
      }

      this._super(function(c, cc, w, h, x, y)
      {
        var tw = w + 20;
        var th = h + 20;

        if ( self._type == OBJECT_UNIT ) {
          cc.fillStyle   = "rgba(100,255,100,0.2)";
        } else if ( self._type == OBJECT_TANK ) {
          cc.fillStyle   = "rgba(100,100,255,0.2)";
        } else {
          cc.fillStyle   = "rgba(255,255,255,0.2)";
        }
        cc.strokeStyle = "rgba(0,0,0,0.9)";

        cc.beginPath();
          if ( self._type == OBJECT_BUILDING ) {
            cc.fillRect((tw/2 - w/2), (th/2 - h/2), w, h);
          } else {
            cc.arc((tw / 2), (th / 2), (w / 2), (Math.PI * 2), false);
            cc.fill();
          }
          if ( self._selected ) {
            cc.stroke();
          }
        cc.closePath();

        cc.beginPath();
          cc.moveTo((tw / 2), (th / 2));
          cc.lineTo(tw, (th / 2));
          cc.stroke();
        cc.closePath();

        if ( self._image ) {
          self.drawImage(self._image, 0, 0);
        }
      }, function(c, cc, w, h, x, y) {
        var tw = w + 20;
        var th = h + 20;

        if ( self._selected ) {

          cc.strokeStyle = "rgba(255,255,255,0.9)";

          cc.beginPath();
            cc.moveTo(0, 0);
            cc.lineTo(10, 0);
            cc.moveTo(0, 0);
            cc.lineTo(0, 10);
            cc.stroke();

            cc.moveTo(tw - 10,  0);
            cc.lineTo(tw - 0, 0);
            cc.moveTo(tw - 0, 0);
            cc.lineTo(tw - 0, 10);
            cc.stroke();

            cc.moveTo(tw - 10,  th - 0);
            cc.lineTo(tw - 0, th - 0);
            cc.moveTo(tw - 0, th - 0);
            cc.lineTo(tw - 0, th - 10);
            cc.stroke();

            cc.moveTo(0, th - 0);
            cc.lineTo(10, th - 0);
            cc.moveTo(0, th - 0);
            cc.lineTo(0, th - 10);
            cc.stroke();

          cc.closePath();
        }
      });
    },

    select : function() {
      console.log("MapObject::select()", this);

      this._selected = true;
    },

    unselect : function() {
      console.log("MapObject::unselect()", this);

      this._selected = false;
    },

    move : function(pos) {
      if ( !this._movable ) {
        return;
      }

      var w  = this.getDimension()[0],
          h  = this.getDimension()[1],
          x1 = this.getPosition()[0] - (w / 2),
          y1 = this.getPosition()[1] - (h / 2),
          x2 = pos.x - (w / 2),
          y2 = pos.y - (h / 2);

      var deg      = Math.atan2((y2-y1), (x2-x1)) * (180 / Math.PI);
      var rotation = (/*this._angle + */deg) + (x2 < 0 ? 180 : (y2 < 0 ? 360 : 0));
      var distance = Math.round(Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)));

      console.log("MapObject::move()", pos, x2, y2, rotation, "(" + deg + ")", distance);

      this._destination = {
        x : pos.x - (w  /2),
        y : pos.y - (h / 2)
      };

      this._heading = parseInt(rotation, 10);
    },

    onClick : function(ev) {
      $.preventDefault(ev);
      $.stopPropagation(ev);

      ObjectAction([this]);
    },

    setImage : function(img) {
      this._image = img;
    },

    getMovable : function() {
      return this._movable;
    },

    getIsMine : function() {
      return (this._player == _Player);
    }

  });

  /**
   * Map -- Main Map Class
   * @class
   */
  var Map = CanvasObject.extend({

    _objects  : [],
    _sizeX    : 100,
    _sizeY    : 100,
    _posX     : 0,
    _posY     : 0,
    _main     : null,
    _root     : null,
    _minimap  : null,
    _minirect : null,

    init : function() {
      console.group("Map::init()");

      var w = TILE_SIZE * this._sizeX;
      var h = TILE_SIZE * this._sizeY;

      this._super(w, h, 0, 0, 0);

      this._main     = document.getElementById("Main");
      this._root     = document.getElementById("Map");
      this._minimap  = document.getElementById("MiniMap");
      this._minirect = document.getElementById("MiniMapRect");

      this._root.style.width = w + "px";
      this._root.style.height = h + "px";

      this.__context.fillStyle   = "rgba(255,255,255,0.9)";
      this.__context.strokeStyle = "rgba(0,0,0,0.9)";
      this.__context.lineWidth   = 0.1;

      if ( DEBUG_MODE ) {
        _DebugMap.innerHTML = (this._sizeX + "x" + this._sizeY) + (" (" + (w + "x" + h) + ")");
      }

      console.log("Size X", this._sizeX);
      console.log("Size Y", this._sizeY);
      console.log("Dimension", w, "x", h);
      console.groupEnd();
    },

    destroy : function() {
      for ( var i = 0; i < this._objects.length; i++ ) {
        this._objects[i].destroy();
        this._objects[i] = null;
      }
      this._objects = [];
    },

    addObject : function(o) {
      if ( o instanceof MapObject ) {
        this._objects.push(o);
      }
    },

    onDragStart : function(ev, pos) {
      this._root.style.top  = (this._posY) + "px";
      this._root.style.left = (this._posX) + "px";
    },

    onDragStop : function(ev, pos) {
      if ( pos === false ) {
        ObjectAction([]);
      } else {
        this._posX = this._posX + pos.x;
        this._posY = this._posY + pos.y;
      }
    },

    onResize : function() {
      // Resize minimap rectangle
      var scaleX = this._root.offsetWidth / this._main.offsetWidth;
      var scaleY = this._root.offsetHeight / this._main.offsetHeight;

      var rw = Math.round(MINIMAP_WIDTH / scaleX);
      var rh = Math.round(MINIMAP_HEIGHT / scaleY);

      this._minirect.style.width  = (rw) + 'px';
      this._minirect.style.height = (rh) + 'px';
    },

    onDragMove : function(ev, pos) {
      // Move the map container
      var x = this._posX + pos.x;
      var y = this._posY + pos.y;

      this._root.style.left = (x) + "px";
      this._root.style.top  = (y) + "px";

      // Move minimap rectangle
      var w  = this._root.offsetWidth;
      var h  = this._root.offsetHeight;
      var rx = -((MINIMAP_WIDTH / w) * x);
      var ry = -((MINIMAP_HEIGHT / h) * y);

      this._minirect.style.left = (rx - 1) + 'px';
      this._minirect.style.top  = (ry - 1) + 'px';
    },

    onSelect : function(ev, rect) {
      console.group("Map::onSelect");
      console.log("Rect", rect);

      // Select object within rectangle
      var select = [];
      for ( var i = 0; i < this._objects.length; i++ ) {
        if ( $.isInside(rect, this._objects[i].getRect()) ) {
          select.push(this._objects[i]);
        }
      }

      console.log("Hits", select.length);

      ObjectAction(select);

      console.groupEnd();
    },

    onObjectUpdate : function() {
      // Update minimap
    },

    prepare : function(callback) {
      console.group("Map::prepare()");

      var self = this;

      var rect = document.getElementById("Rectangle");
      var img = new Image();
      var px = 0;
      var py = 0;

      // Map dragging and clicking
      var dragging  = false;
      var selecting = false;
      var startX    = 0;
      var startY    = 0;

      var mousemove = function(ev) {
        if ( dragging ) {
          var curX = $.mousePosX(ev);
          var curY = $.mousePosY(ev);

          var diffX = curX - startX;
          var diffY = curY - startY;

          self.onDragMove(ev, {x: diffX, y: diffY});
        } else if ( selecting ) {
          var mX = $.mousePosX(ev);
          var mY = $.mousePosY(ev);

          var rx = Math.min((mX - 10), (startX - 10));
          var ry = Math.min((mY - 10), (startY - 10));
          var rw = Math.abs((mX - 10) - (startX - 10));
          var rh = Math.abs((mY - 10) - (startY - 10));

          rect.style.left    = (rx) + 'px';
          rect.style.top     = (ry) + 'px';
          rect.style.width   = (rw) + 'px';
          rect.style.height  = (rh) + 'px';
        }
      };

      var mouseup = function(ev) {
        $.removeEvent(document, "mousemove", mousemove);
        $.removeEvent(document, "mouseup", mouseup);

        rect.style.display = 'none';
        rect.style.top     = '0px';
        rect.style.left    = '0px';
        rect.style.width   = '0px';
        rect.style.height  = '0px';

        if ( dragging ) {
          var curX = $.mousePosX(ev);
          var curY = $.mousePosY(ev);

          var diffX = curX - startX;
          var diffY = curY - startY;

          if ( diffX || diffY ) {
            self.onDragStop(ev, {x: diffX, y: diffY});
          } else {
            self.onDragStop(ev, false);
          }
        } else {
          if ( selecting ) {
            var mX = $.mousePosX(ev);
            var mY = $.mousePosY(ev);

            var rx = Math.min((mX - 10), (startX - 10));
            var ry = Math.min((mY - 10), (startY - 10));
            var rw = Math.abs((mX - 10) - (startX - 10));
            var rh = Math.abs((mY - 10) - (startY - 10));

            var re = {
              'x1' : Math.abs(self._posX - rx),
              'y1' : Math.abs(self._posY - ry),
              'x2' : Math.abs(self._posX - rx) + rw,
              'y2' : Math.abs(self._posY - ry) + rh
            };


            //if ( re.x1 != re.x2 || re.y1 != re.y2 ) {
            if ( (Math.sqrt((re.x2 - re.x1) * (re.y2 - re.y1))) > (SELECTION_SENSE) ) {
              self.onSelect(ev, re);
            } else {

              mX = Math.abs(self._posX - mX) - 10;
              mY = Math.abs(self._posY - mY) - 10;

              ObjectAction({x: mX, y: mY});
            }
          }
        }

        dragging = false;
        selecting = false;
      };

      var mousedown = function(ev) {
        if ( $.mouseButton(ev) > 1 ) {
          $.preventDefault(ev);
          $.stopPropagation(ev);

          $.addEvent(document, "mousemove", mousemove);
          $.addEvent(document, "mouseup", mouseup);

          startX = $.mousePosX(ev);
          startY = $.mousePosY(ev);

          self.onDragStart(ev, {x: startX, y: startY});

          rect.style.display = 'none';
          rect.style.top     = '0px';
          rect.style.left    = '0px';
          rect.style.width   = '0px';
          rect.style.height  = '0px';

          dragging  = true;
          selecting = false;
        }
      };

      var main_mousedown = function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);

        $.addEvent(document, "mousemove", mousemove);
        $.addEvent(document, "mouseup", mouseup);

        if ( $.mouseButton(ev) <= 1 ) {
          var mX = $.mousePosX(ev);
          var mY = $.mousePosY(ev);
          var rX = mX - 10;
          var rY = mY - 10;

          startX = mX;
          startY = mY;

          rect.style.display = 'block';
          rect.style.left    = rX + 'px';
          rect.style.top     = rY + 'px';
          rect.style.width   = '0px';
          rect.style.height  = '0px';

          dragging  = false;
          selecting = true;
        }
      };

      $.addEvent(self._root, "mousedown", mousedown);
      $.disableContext(self._root);

      $.addEvent(self._main, "mousedown", main_mousedown);
      $.disableContext(self._main);

      // Load tiles (async)
      img.onload = function() {
        console.log("Loaded image", this.src);

        for ( var y = 0; y < self._sizeY; y++ ) {
          px = 0;
          for ( var x = 0; x < self._sizeX; x++ ) {
            self.drawImage(img, px, py);
            px += TILE_SIZE;
          }
          py += TILE_SIZE;
        }

        if ( DEBUG_MODE ) {
          var cc = self.__context;
          cc.beginPath();
          for ( y = 0; y < self._sizeY; y++ ) {
            cc.moveTo(0, y * TILE_SIZE);
            cc.lineTo(self.__width, y * TILE_SIZE);
          }
          for ( x = 0; x < self._sizeX; x++ ) {
            cc.moveTo(x * TILE_SIZE, 0);
            cc.lineTo(x * TILE_SIZE, self.__height);
          }
          cc.stroke();
          cc.closePath();
        }

        console.log("Created tiles", self._sizeX, "x", self._sizeY);

        self._root.appendChild(self.getCanvas());

        // Load objects
        for ( var i = 0; i < self._objects.length; i++ ) {
          self._root.appendChild(self._objects[i].getRoot());
        }

        console.log("Inserted", i, "object(s)");

        // Re-init map stuff
        self.onResize();
        self.onDragMove(null, {x : self._posX, y : self._posY});

        // Run callback to continue
        setTimeout(function() {
          callback();
        }, 0);
      };
      img.src = "/img/tile_desert.png";

      console.groupEnd();
    },

    render : function() {
      for ( var i = 0; i < this._objects.length; i++ ) {
        this._objects[i].render();
      }

      //this._super(); // Do not call!
    }


  });

  /////////////////////////////////////////////////////////////////////////////
  // OBJECT CLASSES
  /////////////////////////////////////////////////////////////////////////////

  var MapObjectUnit = MapObject.extend({
    init : function(x, y, a) {
      this._super(OBJECT_UNIT, 50, 39, x, y, a);
      this.setImage(_Graphic.getImage("unit"));
    }
  });

  var MapObjectTank = MapObject.extend({
    init : function(x, y, a) {
      this._super(OBJECT_TANK, 24, 24, x, y, a);
      this.setImage(_Graphic.getImage("tank"));
    }
  });

  var MapObjectBuilding = MapObject.extend({
    init : function(x, y, a) {
      this._super(OBJECT_BUILDING, 72, 48, x, y, a);
      this.setImage(_Graphic.getImage("hq"));
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  // MAIN
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Window 'onload' function
   * @return void
   */
  window.onload = function() {
    _DebugMap = document.getElementById("GUI_Map");
    _DebugFPS = document.getElementById("GUI_FPS");
    _DebugObjects = document.getElementById("GUI_Objects");

    console.group("window::onload()");
    console.log("Browser agent", navigator.userAgent);
    console.log("Browser features", SUPPORT);
    console.groupEnd();

    _Sound = new Sounds();

    if ( SUPPORT.canvas ) {
      _Graphic = new Graphics(function() {
        setTimeout(function() {
          _Main = new Game();
          _Main.run();
        }, 100);
      });
    } else {
      alert("Your browser is not supported!");
    }
  };

  /**
   * Window 'onunload' function
   * @return void
   */
  window.onunload = function() {
    if ( _Main ) {
      _Main.destroy();
      delete _Main;
    }
    if ( _Graphic ) {
      _Graphic.destroy();
      delete _Graphic;
    }
    if ( _Sound ) {
      _Sound.destroy();
      delete _Sound;
    }

    window.onload   = undefined;
    window.onunload = undefined;
    window.onresize = undefined;
  };

  /**
   * Window 'onresize' function
   * @return void
   */
  window.onresize = function() {
    if ( _Main ) {
      _Main.resize();
    }
  };

})();

