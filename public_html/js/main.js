
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

  var _Main = null;
  var _Sound = null;

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

  var LOOP_INTERVAL    = (1000 / 30);
  var TILE_SIZE        = 24;
  var MINIMAP_WIDTH    = 180;
  var MINIMAP_HEIGHT   = 180;

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
    _running  : false,
    _map      : null,

    init : function() {
      console.group("Game::init()");

      // Example data
      this._map = new Map();

      this._map.addObject((new MapObject(10, 10)));
      this._map.addObject((new MapObject(10, 40)));
      this._map.addObject((new MapObject(10, 70)));

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

    loop : function() {
      this._map.render();
    },

    run : function() {
      console.group("Game::run()");

      if ( !this._running ) {
        var self = this;

        this._map.prepare(function() {

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
              self.loop();

              t(frame/*, canvas*/);
            };

            t(frame/*, canvas*/);
          } else {
            if ( !self._interval ) {
              self._interval = setInterval(function() {
                self.loop();
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

    _selected     : false,
    _angle        : 0,
    _movable      : true,
    _speed        : 5,
    _strength     : 10,
    _destination  : null,

    init : function(x, y) {
      console.group("MapObject::init()");

      this._super(30, 30, x, y, this._angle);

      this.__canvas.className    = "MapObject";
      this.__context.fillStyle   = "rgba(255,255,255,0.9)";
      this.__context.strokeStyle = "rgba(0,0,0,0.9)";
      this.__context.lineWidth   = 1;

      var self = this;

      $.addEvent(this.__canvas, "click", function(ev) {
        self.onClick(ev);
      }, true);

      console.log("Pos X", x);
      console.log("Pos Y", y);

      console.groupEnd();

      this.render();
    },

    destroy : function() {
      this.__context.onclick = null;
    },

    render : function() {
      var self = this;

      if ( this._destination ) {
        var x = this.__x;
        var y = this.__y;

        // Find direction
        var i = this._destination.x - x;
        var j = this._destination.y - y;

        // Get and check closest distance
        var mag = Math.sqrt(i * i + j * j);
        var dif = Math.min(mag, this._speed);

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

      this._super(function(c, w, h, x, y)
      {
        c.beginPath();
          c.arc((w / 2), (h / 2), 10, (Math.PI * 2), false);
          c.fill();
          if ( self._selected ) {
            c.stroke();
          }
        c.closePath();

        c.beginPath();
          c.moveTo((w / 2), (h / 2));
          c.lineTo(w, (h / 2));
          c.stroke();
        c.closePath();

        if ( self._selected ) {
          c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(10, 0);
            c.moveTo(0, 0);
            c.lineTo(0, 10);
            c.stroke();

            c.moveTo(w - 10,  0);
            c.lineTo(w, 0);
            c.moveTo(w, 0);
            c.lineTo(w, 10);
            c.stroke();

            c.moveTo(w - 10,  h);
            c.lineTo(w, h);
            c.moveTo(w, h);
            c.lineTo(w, h - 10);
            c.stroke();

            c.moveTo(0, h);
            c.lineTo(10, h);
            c.moveTo(0, h);
            c.lineTo(0, h - 10);
            c.stroke();

          c.closePath();
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
      var w  = this.getDimension()[0],
          h  = this.getDimension()[1],
          x1 = this.getPosition()[0] - (w / 2),
          y1 = this.getPosition()[1] - (h / 2),
          x2 = pos.x - (w / 2),
          y2 = pos.y - (h / 2);

      var deg      = Math.atan2((y2-y1), (x2-x1)) * (180 / Math.PI);
      var rotation = (this._angle + deg) + (x2 < 0 ? 180 : (y2 < 0 ? 360 : 0));
      var distance = Math.round(Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)));

      console.log("MapObject::move()", pos, x2, y2, rotation, "(" + deg + ")", distance);

      this.setDirection(rotation);

      this._destination = {
        x : pos.x - (w  /2),
        y : pos.y - (h / 2)
      };
    },

    onClick : function(ev) {
      $.preventDefault(ev);
      $.stopPropagation(ev);

      ObjectAction([this]);
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

    onObjectUpdate : function() {
      // Update minimap
    },

    prepare : function(callback) {
      console.group("Map::prepare()");

      var self = this;

      var img = new Image();
      var px = 0;
      var py = 0;

      // Map dragging and clicking
      var dragging = false;
      var startX = 0;
      var startY = 0;

      var mousemove = function(ev) {
        if ( dragging ) {
          var curX = $.mousePosX(ev);
          var curY = $.mousePosY(ev);

          var diffX = curX - startX;
          var diffY = curY - startY;

          self.onDragMove(ev, {x: diffX, y: diffY});
        }
      };

      var mouseup = function(ev) {
        $.removeEvent(document, "mousemove", mousemove);
        $.removeEvent(document, "mouseup", mouseup);

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
        }

        dragging = false;
      };

      var mousedown = function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);

        if ( $.mouseButton(ev) > 1 ) {
          $.addEvent(document, "mousemove", mousemove);
          $.addEvent(document, "mouseup", mouseup);

          startX = $.mousePosX(ev);
          startY = $.mousePosY(ev);

          self.onDragStart(ev, {x: startX, y: startY});

          dragging = true;
        } else {
          var mX = Math.abs(self._posX - $.mousePosX(ev)) - 10;
          var mY = Math.abs(self._posY - $.mousePosY(ev)) - 10;

          ObjectAction({x: mX, y: mY});

          dragging = false;
        }
      };

      $.addEvent(self._root, "mousedown", mousedown);
      $.disableContext(self._root);

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

        console.log("Created tiles", self._sizeX, "x", self._sizeY);

        self._root.appendChild(self.getCanvas());

        // Load objects
        for ( var i = 0; i < self._objects.length; i++ ) {
          self._root.appendChild(self._objects[i].getCanvas());
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
  // MAIN
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Window 'onload' function
   * @return void
   */
  window.onload = function() {
    console.group("window::onload()");
    console.log("Browser agent", navigator.userAgent);
    console.log("Browser features", SUPPORT);
    console.groupEnd();

    _Sound = new Sounds();

    if ( SUPPORT.canvas ) {
      _Main = new Game();
      _Main.run();
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

