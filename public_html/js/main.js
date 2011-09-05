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

  var _Inited     = false;

  // Class instance references
  var _Core       = null;
  var _Resources  = null;
  var _Sound      = null;

  // Object helpers
  var _Selected   = [];
  var _Objects    = 0;

  /////////////////////////////////////////////////////////////////////////////
  // CONSTANTS
  /////////////////////////////////////////////////////////////////////////////

  // Network internals
  var WEBSOCKET_URI    = "ws://localhost:8888";

  // Game internals
  var LOOP_INTERVAL    = 500;
  var RESIZE_INTERVAL  = 50;
  var TILE_SIZE        = 24;
  var MARGIN_LEFT      = 10;
  var MARGIN_TOP       = 10;
  var MINIMAP_WIDTH    = 180;
  var MINIMAP_HEIGHT   = 180;

  // Browser support
  var SUPPORT_CANVAS   = (!!document.createElement('canvas').getContext);
  var SUPPORT_LSTORAGE = (('localStorage' in window) && window['localStorage'] !== null);
  var SUPPORT_SSTORAGE = (('sessionStorage' in window) && window['sessionStorage'] !== null);
  var SUPPORT_GSTORAGE = (('globalStorage' in window) && window['globalStorage'] !== null);
  var SUPPORT_DSTORAGE = (('openDatabase' in window) && window['openDatabase'] !== null);
  var SUPPORT_SOCKET   = ('WebSocket' in window && window['WebSocket'] !== null);
  var SUPPORT_VIDEO    = (!!document.createElement('video').canPlayType);
  var SUPPORT_AUDIO    = (!!document.createElement('audio').canPlayType);

  // DOM Elements
  var MAIN_CONTAINER     = "Main";
  var CANVAS_CONTAINER   = "MainContainer";
  var MINIMAP_CONTAINER  = "MiniMap";
  var MINIMAP_RECTANGLE  = "MiniMapRect";

  // Canvas support
  var CANVAS_TYPE      = "";
  var CANVAS_TYPES = [
    /*
    "moz-webgl",          // Firefox
    "webkit-3d",          // Webkit
    "experimental-webgl", // Misc
    "3d",                 // Test
    */
    "2d"                  // Default fallback
  ];

  // Sound support
  var SOUND_TYPE  = "";
  var SOUND_TYPES = [
    'audio/ogg; codecs="vorbis"', // OGG
    'audio/mpeg'                  // MP3
  ];

  // Video support
  var VIDEO_TYPE = "";
  var VIDEO_TYPES = [

  ];

  /////////////////////////////////////////////////////////////////////////////
  // HELPER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Select MapObject(s)
   * @param  Mixed   o    Either an array or Object
   * @return void
   */
  function SelectMapObjects(o) {
    var i;

    console.group("SelectMapObjects()");

    // Unselect old objects
    for ( i = 0; i < _Selected.length; i++ ) {
      _Selected[i].select(false);
    }

    // Now figure out what to select
    if ( o instanceof MapObject ) {
      _Selected = [o];
    } else if ( o instanceof Array ) {
      _Selected = o;
    } else {
      _Selected = [];
    }

    // Then select them
    for ( i = 0; i < _Selected.length; i++ ) {
      _Selected[i].select(true);
    }

    console.groupEnd();
  }

  /**
   * Move selected MapObject(s)
   * @param  Array   pos    Position coordinates
   * @return void
   */
  function MoveMapObjects(pos) {
    if ( _Selected.length ) {
      console.group("MoveMapObjects()");
      console.log("Position", pos);
      console.log("Objects", _Selected);

      for ( i = 0; i < _Selected.length; i++ ) {
        _Selected[i].addPath(pos, true);
      }

      console.groupEnd();
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // ABSTRACT CLASSES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * MiniMap - Creates a MiniMap
   * @class
   */
  var MiniMap = Class.extend({

    _mmap  : null,
    _mmapr : null,
    _main  : null,
    _root  : null,

    /**
     * Constructor
     * @return void
     */
    init : function(main, root, map) {
      console.log("MiniMap::init()");

      this._main  = main;
      this._root  = root;
      this._mmap  = document.getElementById(MINIMAP_CONTAINER);
      this._mmapr = document.getElementById(MINIMAP_RECTANGLE);
    },

    /**
     * Destructor
     * @return void
     */
    destroy : function() {
      console.log("MiniMap::destroy()");

      this._main  = null;
      this._root  = null;
      this._mmap  = null;
      this._mmapr = null;
    },

    /**
     * Update MiniMap
     * @return void
     */
    setPosition : function(x, y) {
      var w  = this._root.offsetWidth;
      var h  = this._root.offsetHeight;
      var rx = -((MINIMAP_WIDTH / w) * x);
      var ry = -((MINIMAP_HEIGHT / h) * y);

      this._mmapr.style.left = (rx - 1) + 'px';
      this._mmapr.style.top  = (ry - 1) + 'px';
    },

    /**
     * Update MiniMap Size
     * @return void
     */
    resize : function() {
      var scaleX = this._root.offsetWidth / this._main.offsetWidth;
      var scaleY = this._root.offsetHeight / this._main.offsetHeight;

      var rw = Math.round(MINIMAP_WIDTH / scaleX);
      var rh = Math.round(MINIMAP_HEIGHT / scaleY);

      this._mmapr.style.width  = (rw) + 'px';
      this._mmapr.style.height = (rh) + 'px';
    },

    /**
     * Render the MiniMap
     * @return void
     */
    render : function() {

    }

  });

  /**
   * Map - Creates a tiled Map
   * @class
   */
  var Map = Class.extend({

    _width   : -1,
    _height  : -1,
    _scheme  : null,
    _objects : [],
    _canvas  : null,
    _pos     : [0, 0],

    /**
     * Constructor
     * @return void
     */
    init : function(sx, sy, scheme) {
      this._sizeX   = parseInt(sx, 10);
      this._sizeY   = parseInt(sy, 10);
      this._width   = parseInt(this._sizeX * TILE_SIZE, 10);
      this._height  = parseInt(this._sizeY * TILE_SIZE, 10);
      this._scheme  = scheme || "tropic";
      this._canvas  = new CanvasElement(CANVAS_TYPE, CANVAS_CONTAINER, this._width, this._height);

      console.group("Map::init()");
      console.log("Container", CANVAS_CONTAINER);
      console.log("Tiles",  this._sizeX, "x", this._sizeY);
      console.log("Width",  this._width);
      console.log("Height", this._height);
      console.log("Scheme", this._scheme);
      console.groupEnd();
    },

    /**
     * Destructor
     * @return void
     */
    destroy : function() {
      console.log("Map::destroy()");

      for ( var o in this._objects ) {
        if ( o && this._objects.hasOwnProperty(o) ) {
          this.removeObject(this._objects[o]);
        }
      }

      this._canvas.destroy();
    },

    /**
     * Insert Map
     * @return void
     */
    insert : function(drag) {
      var self = this;

      var x, y;
      var px = 0;
      var py = 0;

      // Create a temporary Canvas and export to PNG, then append to Map Canvas
      var canvas = new CanvasElement(CANVAS_TYPE, null, this._width, this._height);
      var tile = _Resources.getTile(this._scheme);

      for ( y = 0; y < this._sizeY; y++ ) {
        px = 0;
        for ( x = 0; x < this._sizeX; x++ ) {
          // Insert tile
          canvas.append(tile, px, py);

          px += TILE_SIZE;
        }
        py += TILE_SIZE;
      }

      // Insert Map background to canvas
      var img = new Image();
      img.onload = function() {
        self._canvas.append(img, 0, 0);
      };
      img.src = canvas.save();

      canvas.destroy();
      delete canvas;

      // Add events
      $.addEvent(this._canvas.get(), "mouseup", function(ev) {
        if ( $.mouseButton(ev) > 1 ) {
          if ( !drag.dragged() ) {
            SelectMapObjects(null);
          }
        } else {
          MoveMapObjects(self.getRelativePosition(ev));
        }
      });
    },

    /**
     * Insert MapObject into Map
     * @param  MapObject o
     * @return bool
     */
    addObject : function(o) {
      if ( o instanceof MapObject ) {
        console.log("Map::adObject()", "Added", o);

        this._objects.push(o);

        o.insert(); // FIXME

        return true;
      }

      return false;
    },

    /**
     * Remove MapObject from Map
     * @param  MapObject o
     * @return bool
     */
    removeObject : function(o) {
      var os = this._objects;
      var i  = 0;
      var l  = os.length;

      console.log("Map::removeObject()", o);

      for ( i; i < l; i++ ) {
        if ( os[i] === o ) {
          console.log("Map::removeObject()", "Removing", i);

          this._objects.splice(i, 1);
          return true;
        }
      }

      return false;
    },

    /**
     * Move the map
     * @param  int   x    X-Coordinate
     * @param  int   y    Y-Coordinate
     * @return void
     */
    move : function(x, y) {
      this._pos[0] += x;
      this._pos[1] += y;

      this._canvas.get().style.top  = (this._pos[1] + "px");
      this._canvas.get().style.left = (this._pos[0] + "px");
    },

    /**
     * Render Map
     * @return void
     */
    render : function() {
      var os = this._objects;
      var i  = 0;
      var l  = os.length;

      for ( i; i < l; i++ ) {
        os[i].render();
      }
    },

    setPosition : function(x, y) {
      this._pos = [x, y];
    },

    getRelativePosition : function(ev) {
      var mX = $.mousePosX(ev) - MARGIN_LEFT;
      var mY = $.mousePosY(ev) - MARGIN_TOP;
      var rX = (mX - this._pos[0]);
      var rY = (mY - this._pos[1]);

      return [rX, rY];
    }

  });

  /**
   * MapObject - Creates a Map Object
   * @class
   */
  var MapObject = Class.extend({

    _id         : -1,
    _x          : -1,
    _y          : -1,
    _angle      : 90,
    _width      : 32,
    _height     : 32,
    _gfx        : null,
    _canvas     : null,
    _selected   : false,
    _path       : [],
    _health     : 100,
    _shield     : 0,

    // Default attributes
    _attributes : {
      player   : -1,
      type     : 0,
      health   : 100,
      shield   : 0,
      speed    : 1,
      strength : 1,
      price    : 100
    },

    /**
     * Constructor
     * @return void
     */
    init : function(x, y, gfx) {
      this._id      = _Objects;
      this._x       = parseInt(x, 10);
      this._y       = parseInt(y, 10);
      this._gfx     = gfx;
      this._canvas  = new CanvasElement(CANVAS_TYPE, CANVAS_CONTAINER, this._width, this._height, 10);

      console.group("MapObject::init()");
      console.log("Index",      this._id);
      console.log("Position X", this._x);
      console.log("Position Y", this._y);
      console.log("Graphics",   this._gfx);
      console.log("Canvas",     this._canvas.get());
      console.groupEnd();

      _Objects++;
    },

    /**
     * Destructor
     * @return void
     */
    destroy : function() {
      console.log("MapObject::destroy()");

      this._canvas.destroy();
    },

    /**
     * Insert MapObject
     * @return void
     */
    insert : function() {
      var self = this;

      // Set CSS
      var canvas = this._canvas.get();
      canvas.className  = "MapObject";
      canvas.id         = "MapObject" + this._id;
      canvas.style.top  = (this._y) + 'px';
      canvas.style.left = (this._x) + 'px';

      // Load the image
      var img = new Image();
      img.onload = function() {
        self._canvas.append(img, 0, 0);
        self._canvas.rectangle(false);
      };
      img.src = "/img/" + this._gfx + ".png";

      // Add events
      $.addEvent(this._canvas.get(), "click", function(ev) {
        if ( $.mouseButton(ev) == 1 ) {
          SelectMapObjects(self);
        }
      });

    },

    /**
     * Set/Get Select MapObject
     * @return void
     */
    select : function(s) {
      if ( s !== undefined ) {
        this._selected = s;
        console.log(this._selected ? "Selected" : "Unselected", this._id, this._canvas.get());

        this._canvas.rectangle(this._selected);
      }

      return this._selected;
    },

    /**
     * Move the MapObject
     * @param  int   x    X-Coordinate
     * @param  int   y    Y-Coordinate
     * @return void
     */
    move : function(x, y) {
      var x1 = this._x,
          y1 = this._y,
          x2 = x,
          y2 = y;

      //var distance = Math.round(Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)));

      this.rotate(x1, y1, x2, y2);

      this._x = parseInt(x, 10) - (this._width / 2);
      this._y = parseInt(y, 10) - (this._height / 2);

      this._canvas.get().style.top  = (this._y + "px");
      this._canvas.get().style.left = (this._x + "px");
    },

    rotate : function(x1, y1, x2, y2) {
      var deg      = Math.atan2((y2-y1),(x2-x1)) * (180 / Math.PI);
      var rotation = (this._angle + deg) + (x2 < 0 ? 180 : (y2 < 0 ? 360 : 0));

      this._canvas.rotate(rotation);
    },

    /**
     * Render MapObject
     * @return void
     */
    render : function() {
      if ( this._path.length ) {
        var p = this._path.shift();
        this.move(p[0], p[1]);
      }
    },

    addPath : function(path, override) {
      console.group("MapObject::addPath()");
      console.log("MapObject Id", this._id);

      if ( override === true ) {
        this._path = [path];
        console.log("New coordinate", path);
      } else {
        this._path.push(path);
        console.log("Append coordinate", path, "total", this._path);
      }

      console.groupEnd();
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // CORE CLASSES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * ResourceCore - Resource Manager
   * @class
   */
  var ResourceCore = Class.extend({

    _tiles : {
      "tropic" : "/img/tile_tropic.png",
      "desert" : "/img/tile_desert.png"
    },

    /**
     * Constructor
     * @return void
     */
    init : function() {
      console.group("ResourceCore::init()");
      console.groupEnd();
    },

    /**
     * Destructor
     * @return void
     */
    destroy : function() {
      console.log("ResourceCore::destroy()");
    },

    /**
     * Get tile graphics
     * @return Mixed
     */
    getTile : function(tile) {
      console.log("ResourceCore::getTile()", tile);
      if ( this._tiles[tile] ) {
        var img = new Image();
        img.src = this._tiles[tile];
        return img;
      }

      return null;
    }

  });

  /**
   * SoundCore - Sound Manager
   * @class
   */
  var SoundCore = Class.extend({

    _sounds : {
      "unit_move"       : [],
      "unit_toggle"     : [],
      "unit_attack"     : [],
      "unit_die"        : [],
      "building_toggle" : [],
      "building_action" : []
    },

    /**
     * Constructor
     * @return void
     */
    init : function() {
      console.group("SoundCore::init()");
      console.groupEnd();
    },

    /**
     * Destructor
     * @return void
     */
    destroy : function() {
      console.log("SoundCore::destroy()");
    },

    /**
     * Play a sound
     * @return void
     */
    play : function(snd) {
      console.log("SoundCore::play()", snd);
      if ( this._sounds[snd] ) {
        (function(){})();
      }
    }

  });

  /**
   * GameCore - Main Game Core
   * @class
   */
  var GameCore = Class.extend({

    _map   : null,
    _mmap  : null,
    _loop  : null,
    _main  : null,
    _root  : null,
    _drag  : null,
    _time  : -1,

    /**
     * Constructor
     * @return void
     */
    init : function() {
      var self = this;
      console.log("GameCore::init()");

      this._main  = document.getElementById(MAIN_CONTAINER);
      this._root  = document.getElementById(CANVAS_CONTAINER);
    },

    /**
     * Destructor
     * @return void
     */
    destroy : function() {
      console.log("GameCore::destroy()");

      if ( this._root ) {
        this._root.onmousedown = null;
        window.onmousemove     = null;
        window.onmouseup       = null;
      }

      if ( this._loop ) {
        clearInterval(this._loop);
        this._loop = undefined;
      }

      if ( this._map ) {
        this._map.destroy();
        this._map = undefined;
      }
    },

    /**
     * Run the Game
     * FIXME: This is just example data
     * @return void
     */
    run : function() {
      var self = this;

      console.group("GameCore::run()");

      this._time = new Date().getTime();

      this._map  = new Map(64, 64, "desert");
      this._root.style.width = (this._map._width) + "px";
      this._root.style.height = (this._map._height) + "px";

      this._mmap = new MiniMap(this._main, this._root, this._map);

      this._drag = new Draggable(this._root, this._map._pos);
      this._drag.ondragstop = function(ev, ref, pos) {
        self._map.setPosition(pos[0], pos[1]);
        self._mmap.setPosition(pos[0], pos[1]);
      };

      console.log("Inserting Map and Objects");
      this._map.insert(this._drag);
      this._map.addObject(new MapObject(50, 50, "tank_n"));
      this._map.addObject(new MapObject(100, 100, "tank_n"));

      console.log("Going into main loop");
      this._loop = setInterval(function(ev) { self.loop(ev); }, LOOP_INTERVAL);

      console.groupEnd();

      this.resize();
    },

    /**
     * The resize event from browser
     * @return void
     */
    resize : function() {
      this._mmap.resize();
    },

    /**
     * Main loop
     * @param  Event    timer event
     * @return void
     */
    loop : function(ev) {
      var now = new Date().getTime();
      var diff = Math.floor(1000/(now - this._time));

      this._map.render();
      this._mmap.render();

      this._time = now;
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // OBJECT CLASSES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @class
   */
  var MapObjectBuilding = MapObject.extend({
    init    : function(type) {
      this._super();
    },
    destroy : function() {
      this._super();
    }
  });

  /**
   * @class
   */
  var MapObjectSoldier = MapObject.extend({
    init    : function(type) {
      this._super();
    },
    destroy : function() {
      this._super();
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
    console.info("window::onload()");

    // Check compability
    var canvas;
    var context;
    var sound;

    console.group("Checking compability");

    try {
      if ( SUPPORT_CANVAS ) {
        canvas = document.createElement("canvas");

        if ( canvas ) {
          var ctype = "";
          var i = 0;
          for ( i = 0; i < CANVAS_TYPES.length; i++ ) {
            context = canvas.getContext(CANVAS_TYPES[i]);
            if ( context ) {
              CANVAS_TYPE = CANVAS_TYPES[i];
              break;
            }
          }
        }
      }

      if ( SUPPORT_AUDIO ) {
        for ( i = 0; i < SOUND_TYPES.length; i++ ) {
          if ( (!!document.createElement('audio').canPlayType(SOUND_TYPES[i])) ) {
            SOUND_TYPE = SOUND_TYPES[i];
            break;
          }
        }
      }
    } catch ( eee ) {
      console.error("FATAL ERROR:". eee);
    }


    console.log("Browser: ", navigator.appName, navigator.appVersion);
    console.log("Headers: ", navigator.userAgent);
    console.log("Canvas Context: ", CANVAS_TYPE || "ERROR - None found");
    console.log("Sound Support: ", SUPPORT_AUDIO ? "YES" : "NO" ,",", SOUND_TYPE || "ERROR - None found");
    console.log("Video Support: ", SUPPORT_VIDEO ? "YES" : "NO");
    console.log("WebSocket Support: ", SUPPORT_SOCKET ? "YES" : "NO");
    console.log("Local Storage Support: ", SUPPORT_LSTORAGE ? "YES" : "NO");
    console.log("Session Storage Support: ", SUPPORT_SSTORAGE ? "YES" : "NO");
    console.log("Global Storage Support: ", SUPPORT_GSTORAGE ? "YES" : "NO");
    console.log("OpenDatabase Support: ", SUPPORT_DSTORAGE ? "YES" : "NO");

    console.groupEnd();

    if ( !CANVAS_TYPE || !SOUND_TYPE ) {
      try {
        throw "Your browser is not supported!";
      } catch ( eee ) {
        alert("Your browser is not supported!");
      }
      return;
    }

    console.group("Configuration");
    console.log("Server", WEBSOCKET_URI);
    console.log("Interval", LOOP_INTERVAL);
    console.groupEnd();

    $.disableContext(document.getElementById("Main"));
    $.disableContext(document.getElementById("MainContainer"));

    _Resources = new ResourceCore();
    _Sound     = new SoundCore();
    _Core      = new GameCore();

    if ( _Resources && _Sound && _Core ) {
      _Core.run();
      _Inited = true;
    } else {
      try {
        throw "Failed to start up!";
      } catch ( eee ) {
        alert("Failed to start up!");
      }
    }
  };

  /**
   * Window 'onunload' function
   * @return void
   */
  window.onunload = function() {
    console.info("window::onunload()");

    if ( _Core ) {
      _Core.destroy();
      _Core = undefined;
    }

    if ( _Sound ) {
      _Sound.destroy();
      _Sound = undefined;
    }

    if ( _Resources ) {
      _Resources.destroy();
      _Resources = undefined;
    }

    window.onload   = undefined;
    window.onunload = undefined;
    window.onresize = undefined;
  };

  window.onresize = (function() {
    var _t = null;
    return function() {
      if ( _Inited ) {
        if ( _t ) {
          clearTimeout(_t);
          _t = null;
        }
        _t = setTimeout(function() {
          _Core.resize();
        }, RESIZE_INTERVAL);
      }
    };

  })();

})();
