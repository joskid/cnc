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

  var _Core       = null;
  var _Resources  = null;
  var _Sound      = null;

  /////////////////////////////////////////////////////////////////////////////
  // CONSTANTS
  /////////////////////////////////////////////////////////////////////////////

  var WEBSOCKET_URI    = "ws://localhost:8888";

  var SUPPORT_CANVAS   = (!!document.createElement('canvas').getContext);
  var SUPPORT_LSTORAGE = (('localStorage' in window) && window['localStorage'] !== null);
  var SUPPORT_SSTORAGE = (('sessionStorage' in window) && window['sessionStorage'] !== null);
  var SUPPORT_GSTORAGE = (('globalStorage' in window) && window['globalStorage'] !== null);
  var SUPPORT_DSTORAGE = (('openDatabase' in window) && window['openDatabase'] !== null);
  var SUPPORT_SOCKET   = ('WebSocket' in window && window['WebSocket'] !== null);
  var SUPPORT_VIDEO    = (!!document.createElement('video').canPlayType);
  var SUPPORT_AUDIO    = (!!document.createElement('audio').canPlayType);

  var CANVAS_CONTAINER = "MainContainer";
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

  var SOUND_TYPE  = "";
  var SOUND_TYPES = [
    'audio/ogg; codecs="vorbis"', // OGG
    'audio/mpeg'                  // MP3
  ];

  var VIDEO_TYPE = "";
  var VIDEO_TYPES = [

  ];

  var LOOP_INTERVAL    = 1000;
  var TILE_SIZE        = 24;

  /////////////////////////////////////////////////////////////////////////////
  // ABSTRACT CLASSES
  /////////////////////////////////////////////////////////////////////////////

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
      var self = this;

      this._sizeX   = parseInt(sx, 10);
      this._sizeY   = parseInt(sy, 10);
      this._width   = parseInt(this._sizeX * TILE_SIZE, 10);
      this._height  = parseInt(this._sizeY * TILE_SIZE, 10);
      this._scheme  = scheme || "tropic";

      console.group("Map::init()");
      console.log("Container", CANVAS_CONTAINER);
      console.log("Tiles",  this._sizeX, "x", this._sizeY);
      console.log("Width",  this._width);
      console.log("Height", this._height);
      console.log("Scheme", this._scheme);

      console.log("Creating canvas...");
      this._canvas  = new CanvasElement(CANVAS_TYPE, CANVAS_CONTAINER, this._width, this._height);

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

      var img = new Image();
      img.onload = function() {
        self._canvas.append(img, 0, 0);
      };
      img.src = canvas.save();

      console.log("Created canvas");

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

        o.insert(this._canvas); // FIXME

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

      this._canvas.move(this._pos[0], this._pos[1]);
    },

    /**
     * Render Map
     * @return void
     */
    render : function() {
      /* FIXME
      var os = this._objects;
      var i  = 0;
      var l  = os.length;

      for ( i; i < l; i++ ) {
        os[i].render(this._canvas);
      }
      */
    }

  });

  /**
   * MapObject - Creates a Map Object
   * @class
   */
  var MapObject = Class.extend({

    _x       : -1,
    _y       : -1,
    _gfx     : null,
    _canvas  : null,

    /**
     * Constructor
     * @return void
     */
    init : function(x, y, gfx) {
      this._x       = parseInt(x, 10);
      this._y       = parseInt(y, 10);
      this._gfx     = gfx;
      this._canvas  = new CanvasElement(CANVAS_TYPE, CANVAS_CONTAINER, 32, 32, 10);

      console.group("MapObject::init()");
      console.log("Position X", this._x);
      console.log("Position Y", this._y);
      console.log("Graphics",   this._gfx);
      console.groupEnd();
    },

    /**
     * Destructor
     * @return void
     */
    destroy : function() {
      console.log("MapObject::destroy()");
    },

    /**
     * Insert MapObject
     * @param  Canvas   canvas   Destination canvas
     * @return void
     */
    insert : function(canvas) {
      var self = this;

      var img = new Image();
      img.onload = function() {
        self._canvas.append(img, self._x, self._y);
      };
      img.src = "/img/" + this._gfx + ".png";
    },

    /**
     * Render MapObject
     * @return void
     */
    render : function(canvas) {
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
      console.log("ResourceCore::getResource()", tile);
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
    _loop  : null,
    _root  : null,
    _drag  : null,
    _time  : -1,

    /**
     * Constructor
     * @return void
     */
    init : function() {
      var self = this;

      console.group("GameCore::init()");

      this._root = document.getElementById(CANVAS_CONTAINER);

      // Load some example data

      console.log("Creating Map");
      this._map = new Map(64, 64, "desert");

      console.log("Creating MapObject(s)");
      this._map.addObject(new MapObject(1, 1, "tank_n"));

      console.log("Initializing Input");
      this._drag = new Draggable(this._root, this._map._pos);

      console.log("Going into main loop");
      this._time = new Date().getTime();
      this._loop = setInterval(function(ev) { self.loop(ev); }, LOOP_INTERVAL);

      console.groupEnd();
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
     * Main loop
     * @param  Event    timer event
     * @return void
     */
    loop : function(ev) {
      var now = new Date().getTime();
      var diff = Math.floor(1000/(now - this._time));

      this._map.render();

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

    $.disableContext(document.getElementById("Main"));
    $.disableContext(document.getElementById("MainContainer"));

    _Resources = new ResourceCore();
    _Sound     = new SoundCore();
    _Core      = new GameCore();
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

    window.onload = undefined;
    window.onunload = undefined;
  };

})();
