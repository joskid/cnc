
/**
 * Main CnC Libraries etc
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 */
(function(undefined) {

  /////////////////////////////////////////////////////////////////////////////
  // CONSTANTS
  /////////////////////////////////////////////////////////////////////////////

  // Supported browser features
  var SUPPORT = {
    'json'           : (!!window.JSON),
    'canvas'         : (!!document.createElement('canvas').getContext),
    'audio'          : (!!document.createElement('audio').canPlayType),
    'video'          : (!!document.createElement('video').canPlayType),
    'localStorage'   : (('localStorage'   in window) && (window['localStorage']   !== null)),
    'sessionStorage' : (('sessionStorage' in window) && (window['sessionStorage'] !== null)),
    'globalStorage'  : (('globalStorage'  in window) && (window['globalStorage']  !== null)),
    'openDatabase'   : (('openDatabase'   in window) && (window['openDatabase']   !== null)),
    'WebSocket'      : (('WebSocket'      in window) && (window['WebSocket']      !== null)),
    'Worker'         : (('Worker'         in window) && (window['Worker']         !== null)),
    'geolocation'    : (!!navigator.geolocation),
    'microdata'      : (!!document.getItems),
    'history'        : (!!(window.history && history.pushState)),
    'offline'        : (!!window.applicationCache),
    'webaudio'       : (!!window.AudioContext || !!window.webkitAudioContext),
    'xhr'            : (!!window.XMLHttpRequest)
  };

  // Internals
  var LOOP_INTERVAL      = (1000 / 30);
  var SLEEP_INTERVAL     = 500;
  var TILE_SIZE          = 24;
  var MINIMAP_WIDTH      = 180;
  var MINIMAP_HEIGHT     = 180;
  var OBJECT_ICON_WIDTH  = 62 + 2;
  var OBJECT_ICON_HEIGHT = 46 + 2;
  var SELECTION_SENSE    = 10;

  var SOUND_SELECT     = 0;
  var SOUND_MOVE       = 1;
  var SOUND_ATTACK     = 2;
  var SOUND_DIE        = 3;

  /////////////////////////////////////////////////////////////////////////////
  // GLOBALS
  /////////////////////////////////////////////////////////////////////////////

  // References
  var _Main     = null;
  var _Graphic  = null;
  var _Sound    = null;
  var _Net      = null;
  var _GUI      = null;

  // Variables
  var _FPS        = 0;
  var _Player     = 0;
  var _PlayerTeam = "GDI";
  var _Enemy      = 1;
  var _EnemyTeam  = "NOD";
  var _Keyboard   = {
    "CTRL"  : false,
    "SHIFT" : false,
    "ALT"   : false
  };

  // MapObject "statics"
  var _MapObjectCount = 0;
  var _MapObjectTypes = {};
      _MapObjectTypes[CnC.OBJECT_UNIT]      =  "MapObjectUnit";
      _MapObjectTypes[CnC.OBJECT_VEHICLE]   =  "MapObjectVehicle";
      _MapObjectTypes[CnC.OBJECT_BUILDING]  =  "MapObjectBuilding";

  var _MapObjectSounds = {};
      _MapObjectSounds[CnC.OBJECT_UNIT]     =  {
        /*SOUND_SELECT*/ 0 : ["await1", "yessir1"],
        /*SOUND_MOVE*/   1 : ["roger", "movout1", "ritaway", "ritaway", "ugotit", "affirm1", "ackno"]
      };
      _MapObjectSounds[CnC.OBJECT_VEHICLE]  =  {
        /*SOUND_SELECT*/ 0 : ["unit1", "vehic1"],
        /*SOUND_MOVE*/   1 : ["roger", "movout1", "ritaway", "ritaway", "ugotit", "affirm1", "ackno"]
      };
      _MapObjectSounds[CnC.OBJECT_BUILDING] =  {
      };


  // Debugging elements
  var _DebugMap     = null;
  var _DebugFPS     = null;
  var _DebugObjects = null;

  /////////////////////////////////////////////////////////////////////////////
  // HELPER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * CreateObject -- Create an object
   * @return MapObject
   */
  var CreateObject = function(opts, player, x, y, a) {
    var team = _PlayerTeam;
    /*if ( player != _Player ) {
      team = _EnemyTeam;
    }*/
    var args;
    if ( CnC.MapObjectsMeta[team].structures[opts]  ) {
      args = CnC.MapObjectsMeta[team].structures[opts].object;
    } else if ( CnC.MapObjectsMeta[team].units[opts]  ) {
      args = CnC.MapObjectsMeta[team].units[opts].object;
    }

    if ( !args ) {
      throw("Cannot create '" + opts + "'.");
    }

    return new MapObject(player, x, y, a, args);
  };

  /**
   * CreateOverlay -- Create an overlay for map
   * @return DOMElement
   */
  var CreateOverlay = function(opts) {
    var type = opts[0];
    var x    = opts[1];
    var y    = opts[2];
    var obj  = CnC.MapOverlays[type];
    var img  = _Graphic.getImage(obj.image);

    // Root DOM element
    var root              = document.createElement("div");
    root.className        = "MapOverlayObject";
    root.width            = parseInt(obj.width, 10);
    root.height           = parseInt(obj.height, 10);
    root.style.left       = parseInt(x - obj.x + (TILE_SIZE / 2), 10) + "px";
    root.style.top        = parseInt(y - obj.y + (TILE_SIZE / 2), 10) + "px";

    // Main Canvas element
    var canvas            = document.createElement('canvas');
    var context           = canvas.getContext('2d');
    canvas.className      = "MapOverlayObjectRoot";
    canvas.width          = parseInt(obj.width, 10);
    canvas.height         = parseInt(obj.height, 10);

    context.drawImage(img, 0, 0);
    root.appendChild(canvas);

    return root;
  };

  /**
   * ObjectAction -- Perform a MapObject operation
   *
   * Select, Unselect or Move object(s)
   * This function also takes care of sound events for handling
   *
   * @return void
   */
  var ObjectAction = (function() {
    var _Selected = [];

    /**
     * Select Objects
     */
    function SelectObjects(lst) {
      var snd = null;
      var o;
      for ( var i = 0; i < lst.length; i++ ) {
        o = lst[i];
        if ( o.getSelectable() ) {
          o.select();

          if ( (!snd) && o.getSound(SOUND_SELECT) ) {
            snd = o.getSound(SOUND_SELECT);
          }
        }
      }

      if ( snd !== null ) {
        _Sound.play(snd);
      }
    }

    /**
     * Un-Select Objects
     */
    function UnSelectObjects(lst) {
      for ( var i = 0; i < lst.length; i++ ) {
        lst[i].unselect();
      }
    }

    /**
     * Move Objects
     */
    function MoveObjects(lst, pos) {
      var snd = null;
      var o;
      for ( var i = 0; i < lst.length; i++ ) {
        o = lst[i];
        if ( o.getMovable() ) {
          o.move(pos);

          if ( !snd && o.getSound(SOUND_MOVE) ) {
            snd = o.getSound(SOUND_MOVE);
          }
        }
      }

      if ( snd !== null ) {
        _Sound.play(snd);
      }
    }

    // Main function
    return function (act) {
      if ( act instanceof Array ) { // Select/Unselect
        if ( _Selected.length ) {
          UnSelectObjects(_Selected);
        }

        _Selected = act;

        if ( _Selected.length ) {
          SelectObjects(_Selected);
        }
      } else if ( act instanceof Object ) { // Move
        if ( _Selected.length ) {
          MoveObjects(_Selected, act);
        }
      }
    };
  })();

  /////////////////////////////////////////////////////////////////////////////
  // GUI CLASSES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * GUI -- GUI Manager
   * @class
   */
  var GUI = Class.extend({

    _structure_top : 0,
    _unit_top      : 0,

    /**
     * @constructor
     */
    init : function() {
      var self = this;

      console.group("GUI::init()");

      // Sidebar
      $.addEvent(document.getElementById("Sidebar"), "mousedown", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
        return false;
      });
      /*
      $.addEvent(document.getElementById("Sidebar"), "mouseup", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
        return false;
      });
      */
      $.addEvent(document.getElementById("Sidebar"), "click", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
        return false;
      });
      $.addEvent(document.getElementById("Sidebar"), "dblclick", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
        return false;
      });

      // Sidebar buttons
      $.addEvent(document.getElementById("ConstructionLeftUp"), "mousedown", function(ev) {
        $.preventDefault(ev);
        self.scrollContainer(0, 0);
      });
      $.addEvent(document.getElementById("ConstructionLeftDown"), "mousedown", function(ev) {
        $.preventDefault(ev);
        self.scrollContainer(0, 1);
      });
      $.addEvent(document.getElementById("ConstructionRightUp"), "mousedown", function(ev) {
        $.preventDefault(ev);
        self.scrollContainer(1, 0);
      });
      $.addEvent(document.getElementById("ConstructionRightDown"), "mousedown", function(ev) {
        $.preventDefault(ev);
        self.scrollContainer(1, 1);
      });

      // Top buttons
      $.addEvent(document.getElementById("TopBarButtonSideBar"), "click", function(ev) {
        self.toggleSidebar();
      });
      $.addEvent(document.getElementById("TopBarButtonMenu"), "click", function(ev) {
        self.toggleMenu();
      });

      console.groupEnd();
    },

    /**
     * @destructor
     */
    destroy : function() {
      var self = this;
      console.group("GUI::destroy()");

      // Sidebar
      $.removeEvent(document.getElementById("Sidebar"), "mousedown", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
        return false;
      });
      /*
      $.removeEvent(document.getElementById("Sidebar"), "mouseup", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
        return false;
      });
      */
      $.removeEvent(document.getElementById("Sidebar"), "click", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
        return false;
      });
      $.removeEvent(document.getElementById("Sidebar"), "dblclick", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
        return false;
      });

      // Sidebar buttons
      $.removeEvent(document.getElementById("ConstructionLeftUp"), "mousedown", function(ev) {
        $.preventDefault(ev);
        self.scrollContainer(0, 0);
      });
      $.removeEvent(document.getElementById("ConstructionLeftDown"), "mousedown", function(ev) {
        $.preventDefault(ev);
        self.scrollContainer(0, 1);
      });
      $.removeEvent(document.getElementById("ConstructionRightUp"), "mousedown", function(ev) {
        $.preventDefault(ev);
        self.scrollContainer(1, 0);
      });
      $.removeEvent(document.getElementById("ConstructionRightDown"), "mousedown", function(ev) {
        $.preventDefault(ev);
        self.scrollContainer(1, 1);
      });

      // Top buttons
      $.removeEvent(document.getElementById("TopBarButtonSideBar"), "click", function(ev) {
        self.toggleSidebar();
      });
      $.removeEvent(document.getElementById("TopBarButtonMenu"), "click", function(ev) {
        self.toggleMenu();
      });

      var left  = document.getElementById("ConstructionLeftScroll");
      var right = document.getElementById("ConstructionRightScroll");

      while ( left.hasChildNodes() )
        left.removeChild(left.firstChild);
      while ( right.hasChildNodes() )
        right.removeChild(right.firstChild);

      console.groupEnd();
    },

    //
    // METHODS
    //

    prepare : (function() {

      function _createItem(cname, root, src, key, title, price, time) {
        var el        = document.createElement("div");
        el.className  = cname;

        var img       = document.createElement("img");
        img.alt       = key;
        img.src       = src;
        img.title     = title + (" ($" + price  + ", " + time + "s)");

        el.appendChild(img);
        root.appendChild(el);
      }

      return function(team) {
        var price, time, title, src;

        // Structures
        var structures = CnC.MapObjectsMeta[team].structures;
        var left       = document.getElementById("ConstructionLeftScroll");
        while ( left.hasChildNodes() )
          left.removeChild(left.firstChild);

        for ( var s in structures ) {
          if ( structures.hasOwnProperty(s) ) {
            if ( structures[s].image !== null ) {
              price         = structures[s].price === undefined ? 0 : structures[s].price;
              time          = structures[s].time  === undefined ? 0 : structures[s].time;
              title         = structures[s].title === undefined ? s : structures[s].title;
              src           = "/img/" + team.toLowerCase() + "/sidebar/structures/" + structures[s].image + ".jpg";
              _createItem("ConstructMapObjectBuilding", left, src, s, title, price, time);
            }
          }
        }

        // Units / Vehicles
        var units = CnC.MapObjectsMeta[team].units;
        var right = document.getElementById("ConstructionRightScroll");
        while ( right.hasChildNodes() )
          right.removeChild(right.firstChild);

        for ( var u in units ) {
          if ( units.hasOwnProperty(u) ) {
            if ( units[u].image !== null ) {
              price         = units[u].price === undefined ? 0 : units[u].price;
              time          = units[u].time  === undefined ? 0 : units[u].time;
              title         = units[u].title === undefined ? u : units[u].title;
              src           = "/img/" + team.toLowerCase() + "/sidebar/units/" + units[u].image + ".jpg";
              _createItem("ConstructMapObjectBuilding", right, src, u, title, price, time);
            }
          }
        }


        this._structure_top = 0;
        this._unit_top      = 0;
        document.getElementById("ConstructionRightScroll").scrollTop = 0;
        document.getElementById("ConstructionLeftScroll").scrollTop  = 0;
      };
    })(),

    //
    // EVENTS
    //

    toggleSidebar : function() {
      this._sidebar = !this._sidebar;
      document.getElementById("Sidebar").style.display = this._sidebar ? "block" : "none";
    },

    toggleMenu : function() {
        this._menu = !this._menu;
        document.getElementById("WindowBackground").style.display = this._menu ? "block" : "none";
        document.getElementById("Window").style.display = this._menu ? "block" : "none";
    },

    scrollContainer : function(c, dir) {
      var el = document.getElementById((c ? "ConstructionRightScroll" : "ConstructionLeftScroll"));
      var th = (el.scrollHeight) - (el.offsetHeight);
      var tmp;

      if ( c ) { // Right
        if ( !dir ) { // Up
          tmp = this._unit_top - (OBJECT_ICON_HEIGHT + 9);
        } else {
          tmp = this._unit_top + (OBJECT_ICON_HEIGHT + 9);
        }
        if ( tmp >= 0 && tmp <= th ) {
          el.scrollTop = tmp;
          this._unit_top = tmp;
        }
      } else { // Left
        if ( !dir ) { // Up
          tmp = this._structure_top - (OBJECT_ICON_HEIGHT + 9);
        } else {
          tmp = this._structure_top + (OBJECT_ICON_HEIGHT + 9);
        }
        if ( tmp >= 0 && tmp <= th ) {
          el.scrollTop = tmp;
          this._structure_top = tmp;
        }
      }
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // BASE CLASSES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Networking -- Networking Manager
   * @class
   */
  var Networking = Class.extend({

    _supported  : SUPPORT.WebSocket,
    _xsupported : SUPPORT.xhr,
    _socket     : null,
    _started    : null,
    _ended      : null,
    _connected  : false,

    /**
     * @constructor
     */
    init : function() {
      console.group("Networking::init()");

      console.log("Supported", this._supported);
      console.groupEnd();
    },

    /**
     * @destructor
     */
    destroy : function() {
      delete this._socket;
    },

    //
    // Service METHODS
    //

    /**
     * service -- Do a service request
     * @return bool
     */
    service : function(action, data, callback_success, callback_error) {
      if ( this._xsupported && action ) {
        action           = action           || null;
        data             = data             || {};
        callback_success = callback_success || function() {};
        callback_error   = callback_error   || function() {};

        var uri = CnC.SERVICE_URI;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
          if (req.readyState == 4) {
            var in_data = {};
            var success = false;

            if ( req.status == 200 ) {
              try {
                in_data = JSON.parse(req.responseText);
                success = true;
              } catch ( exc ) {
                in_data = {"error" : "Internal parsing error", "result" : null, "exception" : exc};
              }

              callback_success(req, in_data);
            } else {
              callback_error(req, req.statusText);
            }

            console.group("Networking::service() => Response");
            console.log("URI", uri);
            console.log("Action", action);
            console.log("Success", success);
            console.log("Response data", in_data);
            console.groupEnd();
          }
        };

        console.group("Networking::service() => Request");
        console.log("URI", uri);
        console.log("Action", action);
        console.log("Request data", data);
        console.groupEnd();

        req.open("POST", uri, true);
        req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        req.send("action=" + action + "&data=" + JSON.stringify(data));

        return true;
      }

      return false;
    },

    //
    // WebSocket METHODS
    //

    /**
     * connect -- Connect to socket
     * @return bool
     */
    connect : function(uri) {
      uri = uri || CnC.SERVER_URI;

      var self = this;
      if ( this._supported ) {
        if ( !this._connected ) {
          console.group("Networking::connect()");

          var websocket       = new WebSocket(uri);
          websocket.onopen    = function (evt) { self.onConnect(evt);    };
          websocket.onclose   = function (evt) { self.onDisconnect(evt); };
          websocket.onmessage = function (evt) { self.onRecieve(evt);    };
          websocket.onerror   = function (evt) { self.onError(evt);      };

          this._socket = websocket;

          console.log("URI", uri);
          console.groupEnd();

          return true;
        }
      }

      return false;
    },

    /**
     * disconnect -- Disconnect from socket
     * @return bool
     */
    disconnect : function() {
      if ( this._connected ) {
        console.log("Networking::disconnect()");

        this._socket.close();

        return true;
      }

      return false;
    },

    /**
     * send -- Send data over socket
     * @return bool
     */
    send : function(data) {
      if ( this._connected ) {
        console.log("Networking::send()", data);

        this._socket.send(data);

        return true;
      }

      return false;
    },

    //
    // EVENTS
    //

    onConnect : function(ev) {
      this._connected = true;
      this._started   = new Date();

      console.log("Networking::onConnect()", ev);
    },

    onDisconnect : function(ev) {
      this._connected = false;
      this._ended     = new Date();

      console.log("Networking::onDisconnect()", ev);
    },

    onRecieve : function(ev) {
      console.log("Networking::onRecieve()", ev.data);
    },

    onError : function(ev) {
      console.log("Networking::onError()", ev.data);
    }

  });

  /**
   * Graphics -- Graphics Manager
   * @class
   */
  var Graphics = Class.extend({

    // Preloaded items
    _preloaded     : CnC.PRELOAD.gfx.items,
    _preload_count : CnC.PRELOAD.gfx.count,

    /**
     * @constructor
     */
    init : function(callback) {
      console.group("Graphics::init()");

      // Preload all images
      console.group("Preloading gfx");
      var index = 1;
      var self = this;
      for ( var i in this._preloaded ) {
        if ( this._preloaded.hasOwnProperty(i) ) {
          var src  = "/img/"  + i + ".png";

          console.log(i, src);

          s = new Image();
          s.onload = function() {
            if ( index >= self._preload_count ) {
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

    /**
     * @destructor
     */
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

    /**
     * Get a preloaded image
     * @return Image
     */
    getImage : function(img) {
      return this._preloaded[img];
    }

  });

  /**
   * Sounds -- Sound Manager
   * @class
   */
  var Sounds = Class.extend({
    _enabled     : (CnC.CONFIG.audio_on),

    // <audio>
    _codec       : "mp3",
    _ext         : "mp3",

    // Webaudio
    _webaudio    : false,
    _context     : null,
    _csource     : null,
    _cfilters    : {},
    _cpanners    : null,

    // Preloaded items
    _preloaded     : CnC.PRELOAD.snd.items,
    _preload_count : CnC.PRELOAD.snd.count,

    /**
     * @constructor
     */
    init : function(callback) {
      var self = this;

      console.group("Sounds::init()");

      if ( this._enabled ) {
        var i, s, t, codec, types;

        // First check if we have audio support, and find codec
        types = CnC.CONFIG.audio_codecs;
        for ( s in types ) {
          if ( types.hasOwnProperty(s) ) {
            t = types[s];
            if ( (!!document.createElement('audio').canPlayType(t)) ) {
              codec = s;
              break;
            }
          }
        }

        this._codec   = codec;
        this._ext     = codec;
        this._enabled = codec ? true : false;

        // Check for supported audio context
        if ( SUPPORT.webaudio ) {
          types = [window.AudioContext, window.webkitAudioContext];
          for ( i = 0; i < types.length; i++ ) {
            if ( types[i] ) {
              this._context = new types[i](); //construct(types[i], []);
              break;
            }
          }

          if ( this._context ) {
            this._webaudio = true;
            try {
              this._cpanner  = this._context.createPanner();
            } catch ( exc ) {
              this._cpanner  = null;
            }
          }
        }
      }

      console.log("Supported", this._enabled);
      console.log("Enabled", CnC.CONFIG.audio_on);
      console.log("Codec", this._codec, this._ext);
      console.log("WebAudio", !!this._context, this._context);

      // Preload audio files
      if ( this._enabled ) {
        console.group("Preloading audio");

        var src;
        var index = 1;
        for ( i in this._preloaded ) {
          if ( this._preloaded.hasOwnProperty(i) ) {
            src  = "/snd/" + this._codec + "/" + i + "." + this._ext;

            console.log(i, src);

            s            = new Audio(src);
            s.type       = this._codec;
            s.preload    = "auto";
            s.controls   = false;
            s.autobuffer = true;
            s.loop       = false;
            s.load();

            if ( this._cpanner ) {
              (this._context.createMediaElementSource(s)).connect(this._cpanner);
            }

            this._preloaded[i] = s;

            if ( index >= this._preload_count ) {
              callback();
            }

            index++;
          }
        }
        console.groupEnd();
      }

      console.groupEnd();
    },

    /**
     * @destructor
     */
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

    /**
     * Play a preloaded sound
     * @return void
     */
    play : function(snd) {
      if ( this._enabled ) {
        var s = this._preloaded[snd];
        if ( s ) {
          s.play();
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
    _game     : null,
    _sidebar  : true,
    _menu     : false,

    /**
     * @constructor
     */
    init : function(game) {
      var self = this;

      console.group("Game::init()");
      console.log("Using game data", game);
      console.groupEnd();

      // Set the game variable
      this._game = game;

      // Create events
      $.addEvent(document, "keydown", function(ev) {
        return self.keypress(ev);
      });
      $.addEvent(document.getElementById("Window"), "mousedown", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
      });
      $.addEvent(document.getElementById("Window"), "click", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
      });
    },

    /**
     * @destructor
     */
    destroy : function() {
      var self = this;
      console.group("Game::destroy()");

      // Stop the game
      this.stop();

      // Remove events
      $.removeEvent(document, "keydown", function(ev) {
        return self.keypress(ev);
      });
      $.removeEvent(document.getElementById("Window"), "mousedown", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
      });
      $.removeEvent(document.getElementById("Window"), "click", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
      });

      console.groupEnd();
    },

    //
    // EVENTS
    //

    /**
     * keypress -- keypress event
     * @return void
     */
    keypress : function(ev) {
      var key = $.keyButton(ev);

      _Keyboard   = {
        "CTRL"  : false,
        "SHIFT" : false,
        "ALT"   : false
      };

      if ( key.mod == "CTRL" ) {
        _Keyboard.CTRL = true;
      } else if ( key.mod == "SHIFT" ) {
        _Keyboard.SHIFT = true;
      } else if ( key.mod == "ALT" ) {
        _Keyboard.ALT = true;
      } else if ( key.mod == "TAB" ) {
        $.preventDefault(ev); // NO tabindex-ing!
        return false;
      }

      return true;
    },

    /**
     * resize -- onresize event
     * @return void
     */
    resize : function() {
      if ( this._map ) {
        this._map.onResize();
      }
    },

    /**
     * loop -- main loop
     * @return void
     */
    loop : function(tick) {
      if ( this._last ) {
        _FPS = tick - this._last;
      }

      this._map.render();

      this._last = tick;

      if ( CnC.DEBUG_MODE ) {
        _DebugFPS.innerHTML = _FPS;
        _DebugObjects.innerHTML = this._map._objects.length;
      }
    },

    //
    // METHODS
    //


    /**
     * stop -- Stop Game
     * @return void
     */
    stop : function() {
      console.group("Game::stop()");
      if ( this._running ) {
        // Stop timer
        if ( this._interval ) {
          clearInterval(this._interval);
          this._interval = null;
        }

        // Destroy map
        if ( this._map ) {
          this._map.destroy();
          this._map = null;
        }

        this._running = false;
      }
      console.groupEnd();
    },

    /**
     * run -- Run Game
     * @return void
     */
    run : function() {
      console.group("Game::run()");

      if ( !this._running ) {
        var self = this;

        //
        // INSERT INIT DATA
        //
        this.prepare();

        //
        // START
        //
        this._started = new Date();
        this._running = true;

        var t = null;
        if ( CnC.ENABLE_RAF ) {
          t = (window.requestAnimationFrame       ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame    ||
               window.oRequestAnimationFrame      ||
               window.msRequestAnimationFrame     ||
               null);
        }

        if ( t ) {
          //var canvas = self.getCanvas();
          var frame = function() {
            if ( self._running ) {
              var tick = ((new Date()) - self._started);
              self.loop(tick);

              t(frame/*, canvas*/);
            }
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
      }

      console.groupEnd();
    },

    /**
     * prepare -- Prepare the game for running
     * @return void
     */
    prepare : function() {
      var self = this;
      if ( !this._running ) {


        // Set players
        _Player     = this._game.player.index === undefined ? _Player      : parseInt(this._game.player.index, 10);
        _PlayerTeam = this._game.player.team  === undefined ? _PlayerTeam  : this._game.player.team;
        _Enemy      = this._game.enemy.index  === undefined ? _Enemy       : parseInt(this._game.enemy.index, 10);
        _EnemyTeam  = this._game.enemy.team   === undefined ? _EnemyTeam   : this._game.enemy.team;

        // Create map
        var mt = this._game.map.type;
        var dt = this._game.map.data;
        var sx = parseInt(this._game.map.sx, 10);
        var sy = parseInt(this._game.map.sy, 10);

        this._map = new Map(mt, sx, sy, dt);

        // Create objects
        var os = this._game.objects;
        if ( os && os.length ) {
          for ( var i = 0; i < os.length; i++ ) {
            this._map.addObject(CreateObject.apply(this, os[i]));
          }
        }

        // Init GUI
        _GUI.prepare(_PlayerTeam);

        // Init map
        this._map.prepare();
      }
    },

    /**
     * reset -- Reset the Game
     * @return void
     */
    reset : function() {
      var self = this;
      if ( this._running ) {
        this.stop();
        setTimeout(function() {
          self.run();
        }, SLEEP_INTERVAL);
      }
    },

    //
    // GETTERS/SETTERS
    //

    /**
     * getMap -- Get the current Map instance
     * @return Map
     */
    getMap : function() {
      return this._map;
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // MAP OBJECT
  /////////////////////////////////////////////////////////////////////////////

  /**
   * MapObject -- Map Object Base Class
   * @class
   */
  var MapObject = CanvasObject.extend({

    // Base attributes
    _iid           : -1,
    _type          : -1,
    _image         : null,
    _image_loaded  : false,
    _selected      : false,
    _angle         : 0,

    // Instance attributes
    _player        : 0,
    _selectable    : true,
    _movable       : true,
    _speed         : 0,
    _turning_speed : 0,
    _strength      : 10,

    // Rendering
    _blank         : null,
    _mask          : null,
    _sprite        : null,
    _destination   : null,
    _heading       : null,

    /**
     * @constructor
     */
    init : function(player, x, y, ang, opts) {
      var self = this;

      // Validate input data
      var a  = parseInt(ang, 10) || 0;
      var w  = parseInt(opts.width, 10);
      var h  = parseInt(opts.height, 10);

      // Set base attributes
      this._iid           = _MapObjectCount;
      this._type          = opts.type;
      this._sprite        = opts.sprite !== undefined ? opts.sprite : null;
      if ( this._sprite ) {
        this._image       = _Graphic.getImage(opts.sprite.src);
      } else {
        this._image       = opts.image  !== undefined ? _Graphic.getImage(opts.image)  : null;
      }

      // Set instance attributes
      this._player        = parseInt(player, 10);
      this._selectable    = opts.attrs.selectable !== undefined ? opts.attrs.selectable : this._selectable;
      this._movable       = opts.attrs.movable;
      this._speed         = opts.attrs.speed;
      this._turning_speed = opts.attrs.turning;
      this._strength      = opts.attrs.strength;

      // Init canvas
      this._super(w, h, x, y, a, "MapObject");
      this.__coverlay.fillStyle   = "rgba(255,255,255,0.9)";
      this.__coverlay.strokeStyle = "rgba(0,0,0,0.9)";
      this.__coverlay.lineWidth   = 1;

      // Init mask
      var img        = document.createElement("img");
      img.src        = "/img/blank.gif";
      img.className  = "MapObjectMask";
      img.width      = w;
      img.height     = h;
      img.useMap     = "#MapObjectMask" + this._iid;

      var map        = document.createElement("map");
      map.name       = "MapObjectMask" + this._iid;

      var area       = document.createElement("area");
      area.shape     = (opts.mask.length == 4) ? "rect" : "plygon";
      area.coords    = (opts.mask).join(",");
      //area.href      = "javascript:;";
      //area.href      = "void(0)";
      area.className = "MapObjectArea";
      area.onmouseover = function() {
        document.body.className = "CursorSelect";
      };
      area.onmouseout = function() {
        document.body.className = "CursorDefault";
      };

      this._blank  = img;
      this._mask   = area;

      map.appendChild(this._mask);
      this.getRoot().appendChild(this._blank);
      this.getRoot().appendChild(map);

      // Add events
      $.addEvent(this._mask, "mousedown", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
      });

      $.addEvent(this._mask, "click", function(ev) {
        self.onClick(ev);
      }, true);


      // Misc
      this.getRoot().className = "MapObject MapObjectBuilding";

      console.group("MapObject[" + this._iid + "]::" + _MapObjectTypes[this._type] + "::init()", "x:" + x, "y:" + y, "a:" + a);
      console.log(opts, this);
      console.groupEnd();

      _MapObjectCount++;
    },

    /**
     * @destructor
     */
    destroy : function() {
      if ( this._blank ) {
        this._blank.parentNode.removeChild(this._blank);
        this._blank = null;
        this._mask = null;
      }

      // Remove events
      $.removeEvent(this._blank, "mousedown", function(ev) {
        $.preventDefault(ev);
        $.stopPropagation(ev);
      });
      $.removeEvent(this._mask, "click", function(ev) {
        self.onClick(ev);
      }, true);

      // Destroy canvas
      this._super();
    },

    /**
     * render -- Render the MapObject (CanvasObject)
     * @return void
     */
    render : function() {
      var self = this;

      var mag, dif, dir;
      // First handle rotation
      if ( this._heading !== null ) {
        if ( this._turning_speed ) {
          if ( this._heading !== this._angle ) {
            dir = $.shortestRotation(this._angle, this._heading);

            // Set direction
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
        if ( CnC.DEBUG_MODE ) {
          var tw = w + 20;
          var th = h + 20;

          // Select correct debugging color
          if ( self._type != CnC.OBJECT_BUILDING ) {
            if ( self._type == CnC.OBJECT_UNIT ) {
              cc.fillStyle   = "rgba(100,255,100,0.2)";
            } else if ( self._type == CnC.OBJECT_VEHICLE ) {
              cc.fillStyle   = "rgba(100,100,255,0.2)";
            } else {
              cc.fillStyle   = "rgba(255,255,255,0.2)";
            }
            cc.strokeStyle = "rgba(0,0,0,0.9)";

            cc.beginPath();
              if ( self._type == CnC.OBJECT_BUILDING ) {
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
          }
        }

        self.onRenderSprite();

      }, function(c, cc, w, h, x, y) {
        var tw = w + 20;
        var th = h + 20;

        // Selected rectangle indicator
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

    /**
     * _toggle -- Toggle selection state of MapObject
     * @return void
     */
    _toggle : function(t) {
      this._selected = t;

      console.group("MapObject[" + this._iid + "]::" + _MapObjectTypes[this._type] + "::toggle()");
      console.log("Selected", this._selected);
      console.groupEnd();
    },

    /**
     * select -- Select the MapObject
     * @return void
     */
    select : function() {
      this._toggle(true);
    },

    /**
     * unselect -- Unselect the MapObject
     * @return void
     */
    unselect : function() {
      this._toggle(false);
    },

    /**
     * move -- Move the MapObject
     * @return void
     */
    move : function(pos) {
      if ( !this._movable || (this._player !== _Player) ) {
        return;
      }

      // Calculate positions
      var w  = this.getDimension()[0],
          h  = this.getDimension()[1],
          x1 = this.getPosition()[0] - (w / 2),
          y1 = this.getPosition()[1] - (h / 2),
          x2 = pos.x - (w / 2),
          y2 = pos.y - (h / 2);

      // Calculate rotation and distance to target
      var deg      = Math.atan2((y2-y1), (x2-x1)) * (180 / Math.PI);
      var rotation = (/*this._angle + */deg) + (x2 < 0 ? 180 : (y2 < 0 ? 360 : 0));
      var distance = Math.round(Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)));

      // Set destination and heading
      this._destination = {
        x : pos.x - (w  /2),
        y : pos.y - (h / 2)
      };

      this._heading = parseInt(rotation, 10);

      console.group("MapObject[" + this._iid + "]::" + _MapObjectTypes[this._type] + "::move()");
      console.log("Destination", this._destination.x, "x", this._destination.y);
      console.log("Heading", this._heading, "degrees");
      console.log("Distance", distance, "px");
      console.groupEnd();
    },

    /**
     * onClick -- Click event
     * @return void
     */
    onClick : function(ev) {
      $.preventDefault(ev);
      $.stopPropagation(ev);

      ObjectAction([this]);
    },

    /**
     * onRender -- Handle sprite rendering
     * @return void
     */
    onRenderSprite : function() {
      // If we have a sprite (animation) -- do it
      if ( this._sprite ) {
        var srcX = 0;
        var srcY = 0;
        var srcW = this._sprite.cw;
        var srcH = this._sprite.ch;
        var rndA = Math.abs($.roundedAngle(Math.round(this._angle), 45));

        if ( this._sprite.rotation[rndA] !== undefined ) {
          srcX = this._sprite.rotation[rndA];
        }/* else {
          console.info("No position found for", rndA, this._angle);
        }*/
        this.drawClipImage(this._image, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
      }

      // Or else just display the image
      else {
        if ( this._image && !this._image_loaded ) {
          this.drawImage(this._image, 0, 0);
          this._image_loaded = true;
        }
      }
    },

    /**
     * getMovable -- Get movable state
     * @return bool
     */
    getMovable : function() {
      return this._movable;
    },

    /**
     * getSelectable -- Get selectable state
     * @return bool
     */
    getSelectable : function() {
      return this._selectable;
    },

    /**
     * getIsSelected -- Get if this MapObject is selected
     * @return bool
     */
    getIsSelected : function() {
      return this._selected;
    },

    /**
     * getIsMine -- Get if this MapObject is the current player's
     * @return bool
     */
    getIsMine : function() {
      return (this._player == _Player);
    },

    /**
     * getSound -- Get the sound of the MapObject
     * @return String
     */
    getSound : function(snd) {
      var s = null;

      if ( snd  !== null ) {
        if ( _MapObjectSounds[this._type] !== undefined ) {
          var snds = _MapObjectSounds[this._type][snd];
          if ( snds !== undefined && snds.length ) {
            s = snds[ Math.floor(Math.random()* (snds.length)) ];
          }
        }
      }

      return s;
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // MAP
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Map -- Main Map Class
   * FIXME: Cleanup events (redundacy)
   * TODO: Move minimap to separate class ?!
   * @class
   */
  var Map = CanvasObject.extend({

    // Objects etc
    _type     : null,
    _objects  : [],
    _data     : [],

    // Base attributes
    _marginX    : -1,
    _marginY    : -1,
    _sizeX      : 100,
    _sizeY      : 100,
    _posX       : 0,
    _posY       : 0,

    // DOM Elements
    _main       : null,
    _root       : null,
    _minimap    : null,
    _minirect   : null,
    _rect       : null,
    _mincanvas  : null,
    _mincontext : null,

    // Minimap variables
    _scaleX     : -1,
    _scaleY     : -1,

    // Event variables
    _constructing : false,
    _selecting    : false,
    _dragging     : false,
    _scrolling    : false,
    _startX       : -1,
    _startY       : -1,

    /**
     * @constructor
     */
    init : function(type, sx, sy, data) {
      var self = this;

      console.group("Map::init()");

      this._sizeX   = parseInt(sx, 10) || this._sizeX;
      this._sizeY   = parseInt(sy, 10) || this._sizeY;
      this._objects = [];
      this._data    = data || [];
      this._type    = type || "desert";

      var w = TILE_SIZE * this._sizeX;
      var h = TILE_SIZE * this._sizeY;

      //
      // Do some DOM stuff
      //
      this._main     = document.getElementById("Main");
      this._root     = document.getElementById("MapContainer");
      this._minimap  = document.getElementById("MiniMap");
      this._minirect = document.getElementById("MiniMapRect");
      this._rect     = document.getElementById("Rectangle");

      this._root.style.width  = w + "px";
      this._root.style.height = h + "px";

      var t = $.getOffset(this._main);
      this._marginX = t.left;
      this._marginY = t.top;

      //
      // Do some Canvas stuff
      //

      // Init canvas
      this._super(w, h, 0, 0, 0, "Map");

      this.__coverlay.fillStyle   = "rgba(255,255,255,0.9)";
      this.__coverlay.strokeStyle = "rgba(0,0,0,0.9)";
      this.__coverlay.lineWidth   = 0.1;

      // Init minimap canvas
      var canvas            = document.createElement('canvas');
      var context           = canvas.getContext('2d');
      canvas.className      = "MiniMapCanvas";
      canvas.width          = (MINIMAP_WIDTH);
      canvas.height         = (MINIMAP_HEIGHT);
      context.fillStyle     = "rgba(255,255,255,0.9)";
      context.strokeStyle   = "rgba(0,0,0,0.9)";
      context.lineWidth     = 1.0;

      this._mincanvas  = canvas;
      this._mincontext = context;
      this._scaleX     = this.__width / MINIMAP_WIDTH;
      this._scaleY     = this.__height / MINIMAP_HEIGHT;

      this._minimap.appendChild(canvas);

      //
      // EVENTS
      //

      if ( CnC.DEBUG_MODE ) {
        _DebugMap.innerHTML = (this._sizeX + "x" + this._sizeY) + (" (" + (w + "x" + h) + ")");
      }

      // Map dragging and clicking
      $.addEvent(document, "mousemove", function(ev) {
        self._onMouseMove(ev);
      });
      $.addEvent(this._root, "mousedown", function(ev) {
        self._onMouseDown(ev, false);
      });
      $.addEvent(this._main, "mousedown", function(ev) {
        self._onMouseDown(ev, true);
      });
      $.addEvent(this._minimap, "mousedown", function(ev) {
        self._onMouseDown(ev, undefined, true);
      });
      $.addEvent(this._minimap, "click", function(ev) {
        self._onMouseClick(ev);
      });
      $.disableContext(this._main);
      $.disableContext(this._root);

      console.log("Size X", this._sizeX);
      console.log("Size Y", this._sizeY);
      console.log("Dimension", w, "x", h);
      console.groupEnd();
    },

    /**
     * @destructor
     */
    destroy : function() {
      this.clearObjects();

      this._mincanvas.parentNode.removeChild(this._mincanvas);
      delete this._mincontext;
      delete this._mincanvas;

      $.removeEvent(document, "mousemove", function(ev) {
        self._onMouseMove(ev, false);
      });
      $.removeEvent(this._root, "mousedown", function(ev) {
        self._onMouseDown(ev, false);
      });
      $.removeEvent(this._main, "mousedown", function(ev) {
        self._onMouseDown(ev, true);
      });
      $.removeEvent(this._minimap, "mousedown", function(ev) {
        self._onMouseDown(ev, undefined, true);
      });
      $.removeEvent(this._minimap, "click", function(ev) {
        self._onMouseClick(ev);
      });

      this._super();
    },

    //
    // OBJECT EVENTS
    //

    /**
     * addObject -- Add a MapObject
     * @return void
     */
    addObject : function(o) {
      if ( o instanceof MapObject ) {
        this._objects.push(o);
      }
    },

    /**
     * removeObject -- Remove a MapObject
     * TODO
     * @return bool
     */
    removeObject : function(o) {
      return false;
    },

    /**
     * clearObjects -- Remove all MapObjects
     * @return void
     */
    clearObjects : function() {
      for ( var i = 0; i < this._objects.length; i++ ) {
        this._objects[i].destroy();
        this._objects[i] = null;
      }
      this._objects = [];

      _MapObjectCount = 0;
    },

    //
    // DOM EVENTS
    //

    _onMouseDown : function(ev, main, minimap) {
      var self = this;

      if ( main ) {
        // First mouse button triggers rectangle selction
        if ( $.mouseButton(ev) <= 1 ) {
          $.preventDefault(ev);
          $.stopPropagation(ev);

          var mX = $.mousePosX(ev);
          var mY = $.mousePosY(ev);

          this._startX = mX;
          this._startY = mY;

          this._rect.style.display = 'none';
          this._rect.style.top     = '0px';
          this._rect.style.left    = '0px';
          this._rect.style.width   = '0px';
          this._rect.style.height  = '0px';

          this._dragging  = false;
          this._selecting = true;
        }
      } else {
        if ( minimap ) {
          $.preventDefault(ev);
          $.stopPropagation(ev);

          this._dragging  = false;
          this._selecting = false;
          this._scrolling = true;
        } else {
          // Second mouse button triggers map moving
          if ( $.mouseButton(ev) > 1 ) {
            $.preventDefault(ev);
            $.stopPropagation(ev);

            this._startX = $.mousePosX(ev);
            this._startY = $.mousePosY(ev);

            this.onDragStart(ev, {x: this._startX, y: this._startY});

            this._rect.style.display = 'none';
            this._rect.style.top     = '0px';
            this._rect.style.left    = '0px';
            this._rect.style.width   = '0px';
            this._rect.style.height  = '0px';

            this._dragging  = true;
            this._selecting = false;
          }
        }
      }

      $.addEvent(document, "mouseup", function(ev) {
        self._onMouseUp(ev);
      });
    },

    _onMouseUp : function(ev) {
      this._rect.style.display = 'none';
      this._rect.style.top     = '0px';
      this._rect.style.left    = '0px';
      this._rect.style.width   = '0px';
      this._rect.style.height  = '0px';

      // Map dragging has ended
      if ( this._dragging ) {
        var curX = $.mousePosX(ev);
        var curY = $.mousePosY(ev);

        var diffX = curX - this._startX;
        var diffY = curY - this._startY;

        if ( diffX || diffY ) {
          this.onDragStop(ev, {x: diffX, y: diffY});
        } else {
          this.onDragStop(ev, false);
        }
      } else {
        // Selection rectangle has ended
        if ( this._selecting ) {
          var mX = $.mousePosX(ev);
          var mY = $.mousePosY(ev);

          var rx = Math.min((mX - this._marginX), (this._startX - this._marginX));
          var ry = Math.min((mY - this._marginY), (this._startY - this._marginY));
          var rw = Math.abs((mX - this._marginX) - (this._startX - this._marginX));
          var rh = Math.abs((mY - this._marginY) - (this._startY - this._marginY));

          // The rectangle to use as selection mask
          var re = {
            'x1' : Math.abs(this._posX - rx),
            'y1' : Math.abs(this._posY - ry),
            'x2' : Math.abs(this._posX - rx) + rw,
            'y2' : Math.abs(this._posY - ry) + rh
          };


          // If the rectangle is too small we want to perform an object action instead
          if ( (Math.sqrt((re.x2 - re.x1) * (re.y2 - re.y1))) > (SELECTION_SENSE) ) {
            this.onSelect(ev, re);
          } else {
            mX = Math.abs(this._posX - mX) - this._marginX;
            mY = Math.abs(this._posY - mY) - this._marginY;

            ObjectAction({x: mX, y: mY});
          }
        }
      }

      this._dragging  = false;
      this._selecting = false;
      this._scrolling = false;

      $.removeEvent(this._main, "mouseup", function(ev) {
        self._onMouseUp(ev, true);
      });
    },

    _onMouseMove : function(ev) {
      var mX = $.mousePosX(ev);
      var mY = $.mousePosY(ev);

      // Update map position
      if ( this._dragging ) {
        var curX = $.mousePosX(ev);
        var curY = $.mousePosY(ev);

        var diffX = curX - this._startX;
        var diffY = curY - this._startY;

        this.onDragMove(ev, {x: diffX, y: diffY});
      }
      // Update selection rectangle
      else if ( this._selecting ) {
        var rx = Math.min((mX - this._marginX), (this._startX - this._marginX));
        var ry = Math.min((mY - this._marginY), (this._startY - this._marginY));
        var rw = Math.abs((mX - this._marginX) - (this._startX - this._marginX));
        var rh = Math.abs((mY - this._marginY) - (this._startY - this._marginY));

        this._rect.style.display = 'block';
        this._rect.style.left    = (rx) + 'px';
        this._rect.style.top     = (ry) + 'px';
        this._rect.style.width   = (rw) + 'px';
        this._rect.style.height  = (rh) + 'px';
      }
      // Scroll map to minimap selection
      else if ( this._scrolling ) {
        this._onMouseClick(ev);
      }
      // Update construction indicator
      else if ( this._constructing ) {
        (function(){})(); // TODO
      }
    },

    _onMouseClick : function(ev) {
      // Center the click position for the rectangle and update scrolling
      var rel = $.getOffset(this._minimap);
      var mx  = $.mousePosX(ev) - rel.left;
      var my  = $.mousePosY(ev) - rel.top;


      // Rectangle
      var rectX = parseInt((mx - (this._minirect.offsetWidth / 2)), 10);
      var rectY = parseInt((my - (this._minirect.offsetHeight / 2)), 10);

      this._minirect.style.left = (rectX - 1) + 'px';
      this._minirect.style.top  = (rectY - 1) + 'px';

      // Map
      var scaleX = this.__width / MINIMAP_WIDTH;
      var scaleY = this.__height / MINIMAP_HEIGHT;
      var mapX = -parseInt((rectX * scaleX), 10);
      var mapY = -parseInt((rectY * scaleY), 10);

      this._root.style.left     = (mapX) + "px";
      this._root.style.top      = (mapY) + "px";

      // Update internals
      this._posX = mapX;
      this._posY = mapY;
    },

    //
    // INTERNAL EVENTS
    //

    /**
     * onDragStart -- Drag starting event
     * @return void
     */
    onDragStart : function(ev, pos) {
      this._root.style.top  = (this._posY) + "px";
      this._root.style.left = (this._posX) + "px";

      document.body.className = "CursorMove";
    },

    /**
     * onDragStop -- Drag stopping event
     * @return void
     */
    onDragStop : function(ev, pos) {
      if ( pos === false ) {
        ObjectAction([]);
      } else {
        this._posX = this._posX + pos.x;
        this._posY = this._posY + pos.y;
      }

      document.body.className = "CursorDefault";
    },

    /**
     * onDragMove -- Drag moving event
     * @return Position
     */
    onDragMove : function(ev, pos) {
      // Move the map container
      var x = this._posX + pos.x;
      var y = this._posY + pos.y;

      this._root.style.left = (x) + "px";
      this._root.style.top  = (y) + "px";

      var w  = this._root.offsetWidth;
      var h  = this._root.offsetHeight;
      x = -((MINIMAP_WIDTH / w) * x);
      y = -((MINIMAP_HEIGHT / h) * y);

      this._minirect.style.left = (parseInt(x, 10) - 1) + 'px';
      this._minirect.style.top  = (parseInt(y, 10) - 1) + 'px';
    },

    /**
     * onResize -- Window onresize event
     * @return void
     */
    onResize : function() {
      // Resize minimap rectangle
      var scaleX = this._root.offsetWidth / this._main.offsetWidth;
      var scaleY = this._root.offsetHeight / this._main.offsetHeight;

      var rw = Math.round(MINIMAP_WIDTH / scaleX);
      var rh = Math.round(MINIMAP_HEIGHT / scaleY);

      this._minirect.style.width  = (rw) + 'px';
      this._minirect.style.height = (rh) + 'px';
    },

    /**
     * onSelect -- Selection rectangle event
     * @return void
     */
    onSelect : function(ev, rect) {
      console.group("Map::onSelect");
      console.log("Rect", rect);

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

    // METHODS

    /**
     * prepare -- Prepare the map (Load)
     * @return void
     */
    prepare : function() {
      console.group("Map::prepare()");

      var img, obj;
      var cc = this.__coverlay;

      //
      // Load tiles
      //
      img = _Graphic.getImage("desert/tile");
      var px = 0;
      var py = 0;
      for ( var y = 0; y < this._sizeY; y++ ) {
        px = 0;
        for ( var x = 0; x < this._sizeX; x++ ) {
          this.drawImage(img, px, py);
          px += TILE_SIZE;
        }
        py += TILE_SIZE;
      }
      this._root.appendChild(this.getRoot());
      console.log("Created tiles", this._sizeX, "x", this._sizeY);

      //
      // Draw map data
      //
      for ( var o = 0; o < this._data.length; o++ ) {
        this._root.appendChild(CreateOverlay(this._data[o]));
      }
      console.log("Created", o, "overlay objects");

      //
      // Draw grid
      //
      if ( CnC.DEBUG_MODE ) {
        cc.beginPath();
        for ( y = 0; y < this._sizeY; y++ ) {
          cc.moveTo(0, y * TILE_SIZE);
          cc.lineTo(this.__width, y * TILE_SIZE);
        }
        for ( x = 0; x < this._sizeX; x++ ) {
          cc.moveTo(x * TILE_SIZE, 0);
          cc.lineTo(x * TILE_SIZE, this.__height);
        }
        cc.stroke();
        cc.closePath();
      }

      //
      // Load objects
      //
      for ( var i = 0; i < this._objects.length; i++ ) {
        //if ( this._objects[i] ) {
        this._root.appendChild(this._objects[i].getRoot());
        //}
      }
      console.log("Inserted", i, "object(s)");

      //
      // Initialize minimap
      //
      this.onResize();
      this.onDragMove(null, {x : this._posX, y : this._posY});

      console.groupEnd();
    },

    /**
     * render -- Render the Map (CanvasObject)
     * @return void
     */
    render : function() {
      // Update objects and minimap
      var cc = this._mincontext;
      var o;

      cc.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
      for ( var i = 0; i < this._objects.length; i++ ) {
        o = this._objects[i];

        // Render minimap object
        cc.fillStyle = ( o.getIsSelected() ?
          "rgba(0,0,255,0.9)" : // Selected
          (o.getIsMine() ?
            "rgba(255,255,255,0.9)" : // Current player
            "rgba(255,0,0,0.9)") );   // Other player

        cc.fillRect(
          Math.round(o.__x / this._scaleX),
          Math.round(o.__y / this._scaleY),
          Math.round(o.__width / this._scaleX),
          Math.round(o.__height / this._scaleY) );

        if ( o.getIsSelected() ) {
          cc.stroke();
        }

        // Render object
        o.render();
      }

        /*
      if ( CnC.DEBUG_MODE ) {
        var cc = this.__coverlay;
        var rect;
        cc.clearRect(0, 0, this.__width, this.__height);
        cc.beginPath();
        for ( var y = 0; y < this._sizeY; y++ ) {
          rect = {
            x1 : 0,
            y1 : y * TILE_SIZE,
            x2 : this.__width,
            y2 : y * TILE_SIZE
          };
        }

        for ( var x = 0; x < this._sizeX; x++ ) {
          rect = {
            x1 : x * TILE_SIZE,
            y1 : 0,
            x2 : x * TILE_SIZE,
            y2 : this.__height
          };
        }
        cc.stroke();
        cc.closePath();
      }
        */

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
    // Debugging elements
    _DebugMap     = document.getElementById("GUI_Map");
    _DebugFPS     = document.getElementById("GUI_FPS");
    _DebugObjects = document.getElementById("GUI_Objects");

    console.group("window::onload()");
    console.log("Browser agent", navigator.userAgent);
    console.log("Browser features", SUPPORT);

    // Example data
    var game_data = {
      'player' : {
        'team' : "GDI"
      },
      'enemy' : {
        'team' : "NOD"
      },
      'map' : {
        'type' : "desert",
        'sx'   : 100,
        'sy'   : 100,
        'data' : [
          ["rock1", (TILE_SIZE * 10), (TILE_SIZE * 10)],
          ["rock2", (TILE_SIZE * 19), (TILE_SIZE * 10)],
          ["rock3", (TILE_SIZE * 30), (TILE_SIZE * 30)],
          ["rock4", (TILE_SIZE * 22), (TILE_SIZE * 22)],
          ["rock5", (TILE_SIZE * 3), (TILE_SIZE * 15)],
          ["rock6", (TILE_SIZE * 8), (TILE_SIZE * 13)],

          ["tree4", (TILE_SIZE * 5), (TILE_SIZE * 5)],
          ["tree8", (TILE_SIZE * 23), (TILE_SIZE * 23)],
          ["tree8", (TILE_SIZE * 12), (TILE_SIZE * 12)],
          ["tree18", (TILE_SIZE * 29), (TILE_SIZE * 32)],
          ["tree8", (TILE_SIZE * 40), (TILE_SIZE * 3)],
          ["tree8", (TILE_SIZE * 38), (TILE_SIZE * 10)]
        ]
      },
      'objects' : [
        // Player 1
        ["HUMVee",        0, 50,  30],
        ["HUMVee",        0, 50,  90],
        ["HUMVee",        0, 50,  150],
        ["ConstructionYard", 0, 143, 143],
        ["Barracks",     0, 240, 143],
        ["Minigunner",  0, 170, 10],
        ["Minigunner",  0, 170, 40],
        ["Minigunner",  0, 170, 70],

        // Player 2
        ["HUMVee",        1, 2000, 1700],
        ["HUMVee",        1, 2000, 1750],
        ["HUMVee",        1, 2000, 1800],
        ["ConstructionYard", 1, 2000, 2000]
      ]
    };

    // Initialize graphics engine (required)
    if ( SUPPORT.json && SUPPORT.canvas && SUPPORT.xhr ) {
      _GUI        = new GUI();                // Initialize GUI
      _Net        = new Networking();         // Initialize Networking
      _Sound      = new Sounds(function() {   // Initialize Sounds
        _Graphic  = new Graphics(function() { // Initialize Graphics
            _Main = new Game(game_data);      // Initialize Game
              setTimeout(function() {
                _Main.run();
              }, SLEEP_INTERVAL);
        });
      });

    } else {
      alert("Your browser is not supported!");
    }

    console.groupEnd();
  };

  /**
   * Window 'onunload' function
   * @return void
   */
  window.onunload = function() {
    // Unset main engine instances
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
    if ( _Net ) {
      _Net.destroy();
      delete _Net;
    }
    if ( _GUI ) {
      _GUI.destroy();
      delete _GUI;
    }

    // Unset other variables
    _DebugMap     = null;
    _DebugFPS     = null;
    _DebugObjects = null;

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

