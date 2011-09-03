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

  var CANVAS_CONTAINER = "Main";
  var LOOP_INTERVAL    = 10;
  var TILE_SIZE        = 24;

  /////////////////////////////////////////////////////////////////////////////
  // UTIL CLASSES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * CanvasElement - Create a Canvas element
   * @class
   */
  var CanvasElement = Class.extend({

    init : function(root) {
      var canvas = document.createElement("canvas");

      if ( root ) {
        root = document.getElementById(root);
        root.appendChild(canvas);
      }

      this._canvas = canvas;
    },

    destroy : function() {
      this._canvas = null;
    },

    clear : function() {

    },

    append : function(img, x, y) {

    }

  });

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

      console.group("Map::init()");
      console.log("Container", CANVAS_CONTAINER);
      console.log("Tiles",  this._sizeX, "x", this._sizeY);
      console.log("Width",  this._width);
      console.log("Height", this._height);
      console.log("Scheme", this._scheme);

      console.log("Creating canvas...");
      this._canvas  = new CanvasElement(CANVAS_CONTAINER, this._width, this._height);

      var x = 0;
      var y = 0;
      var px = 0;
      var py = 0;

      var tile = _Resources.getTile(this._scheme);
      for ( y; y < this._height; y++ ) {
        px = 0;
        for ( x; x < this._width; x++ ) {
          // Insert tile

          this._canvas.append(tile, px, py);

          px += TILE_SIZE;
        }
        py += TILE_SIZE;
      }

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
      this._canvas  = new CanvasElement();

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
     * Render MapObject
     * @return void
     */
    render : function() {

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
      "tropic" : "img/tile_tropic.png",
      "desert" : "img/tile_desert.png"
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

    /**
     * Constructor
     * @return void
     */
    init : function() {
      console.group("GameCore::init()");

      // Load some example data

      console.log("Creating Map");
      this._map = new Map(64,64, "desert");

      /*
      console.log("Creating MapObject(s)");
      this._map.addObject(new MapObject(1, 1, "tank"));
      */

      console.log("Going into main loop");
      //this._loop = setInterval(this.loop, LOOP_INTERVAL);
      this.loop(); // FIXME TODO

      console.groupEnd();
    },

    /**
     * Destructor
     * @return void
     */
    destroy : function() {
      console.log("GameCore::destroy()");

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
     * @return void
     */
    loop : function() {
      this._map.render();
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
