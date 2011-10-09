
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

  //
  // Supported browser features
  //
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

  //
  // Internals
  //
  var LOOP_INTERVAL      = (1000 / 30);     // FPS (setInterval)
  var SLEEP_INTERVAL     = 500;             // Standard waiting interval
  var TILE_SIZE          = 24;              // Tile size (x)x(x)
  var MINIMAP_WIDTH      = 180;             // MiniMap Width in pixels
  var MINIMAP_HEIGHT     = 180;             // MiniMap Height in pixles
  var OBJECT_ICON_WIDTH  = 62;              // GUI MapObject icon Width in pixels
  var OBJECT_ICON_HEIGHT = 46;              // GUI MapObject icon Height in pixels
  var SELECTION_SENSE    = 10;              // Rectangle selection sensitivity

  /////////////////////////////////////////////////////////////////////////////
  // GLOBALS
  /////////////////////////////////////////////////////////////////////////////

  //
  // References
  //
  var _Main     = null;
  var _Graphic  = null;
  var _Sound    = null;
  var _Net      = null;
  var _GUI      = null;

  //
  // Variables
  //
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

  //
  // MapObject "statics"
  //
  var _MapObjectCount = 0;

  //
  // Debugging elements
  //
  var _DebugMap     = null;
  var _DebugFPS     = null;
  var _DebugObjects = null;

  /////////////////////////////////////////////////////////////////////////////
  // HELPER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Print or hide loading statuses
   * @return void
   */
  var LoadingStatus = (function() {

    function _print(el, text) {
      el.innerHTML += "<div>" + text + "</div>";
      el.scrollTop = el.scrollHeight;
    }

    return function(text) {
      var _el = document.getElementById("Loading");
      if ( text === false ) {
        _el.style.display = "none";
      } else {
        _el.style.display = "block";
        _print(_el, text);
      }
    };

  })();

  /**
   * CreateObject -- Create an object
   * @return MapObject
   */
  var CreateObject = function(type, player, x, y, a) {
    var team = _PlayerTeam;
    /*if ( player != _Player ) {
      team = _EnemyTeam;
    }*/
    var args;
    if ( CnC.MapObjectsMeta[team].structures[type]  ) {
      args = CnC.MapObjectsMeta[team].structures[type].object;
    } else if ( CnC.MapObjectsMeta[team].units[type]  ) {
      args = CnC.MapObjectsMeta[team].units[type].object;
    }

    if ( !args ) {
      throw("Cannot create '" + type + "'.");
    }

    return new MapObject(this /* == Map */, player, x, y, a, args);
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

    return {
      dom : root,
      x   : x,
      y   : y,
      tw  : 1,
      th  : 1
    };
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

          if ( (!snd) && o.getSound(CnC.SOUND_SELECT) ) {
            snd = o.getSound(CnC.SOUND_SELECT);
          }
        }
      }

      if ( snd !== null ) {
        _Sound.play(snd, true);
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

          if ( !snd && o.getSound(CnC.SOUND_MOVE) ) {
            snd = o.getSound(CnC.SOUND_MOVE);
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

    _sidebar       : true,      // Sidebar visibilty
    _menu          : false,     // Menu visibility
    _structure_top : 0,         // Structure construction containar scrollTop
    _unit_top      : 0,         // Unit construction container scrollTop

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

    /**
     * GUI::prepare -- Prepare GUI elements
     * @return void
     */
    prepare : (function() {

      function _createItem(self, cname, root, src, key, title, price, time, type) {
        var el        = document.createElement("div");
        el.className  = cname;

        var img       = document.createElement("img");
        img.alt       = key;
        img.src       = src;
        img.title     = title + (" ($" + price  + ", " + time + "s)");

        el.onclick = function() {
          self.constructOverlay(this, root);

          _Main.getMap().setConstruction({
            object : CnC.MapObjectsMeta[_PlayerTeam][type][key].object,
            type : key
          });
        };

        el.appendChild(img);
        root.appendChild(el);
      }

      return function(team) {
        var price, time, title, src, tw, th;

        // Structures
        var structures = CnC.MapObjectsMeta[team].structures;
        var left       = document.getElementById("ConstructionLeftScroll");
        while ( left.hasChildNodes() )
          left.removeChild(left.firstChild);

        for ( var s in structures ) {
          if ( structures.hasOwnProperty(s) ) {
            if ( structures[s].image !== null ) {
              price         = structures[s].price     === undefined ? 0 : structures[s].price;
              time          = structures[s].time      === undefined ? 0 : structures[s].time;
              title         = structures[s].title     === undefined ? s : structures[s].title;
              src           = "/img/gui/sidebar/" + team.toLowerCase() + "/structures/" + structures[s].image + ".jpg";

              _createItem(this, "ConstructMapObjectBuilding", left, src, s, title, price, time, "structures");
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
              price         = units[u].price     === undefined ? 0 : units[u].price;
              time          = units[u].time      === undefined ? 0 : units[u].time;
              title         = units[u].title     === undefined ? u : units[u].title;
              src           = "/img/gui/sidebar/" + team.toLowerCase() + "/units/" + units[u].image + ".jpg";
              _createItem(this, "ConstructMapObjectUnit", right, src, u, title, price, time, "units");
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

    /**
     * GUI::toggleSidebar -- Toggle Sidebar display
     * @return void
     */
    toggleSidebar : function() {
      this._sidebar = !this._sidebar;
      document.getElementById("Sidebar").style.display = this._sidebar ? "block" : "none";
    },

    /**
     * GUI::toggleMenu -- Toggle Main Menu display
     * @return void
     */
    toggleMenu : function() {
      this._menu = !this._menu;
      document.getElementById("WindowBackground").style.display = this._menu ? "block" : "none";
      document.getElementById("Window").style.display = this._menu ? "block" : "none";
    },

    /**
     * GUI::scrollContainer -- Scroll the construction containers event
     * @return void
     */
    scrollContainer : function(c, dir) {
      var el = document.getElementById((c ? "ConstructionRightScroll" : "ConstructionLeftScroll"));
      var th = (el.scrollHeight) - (el.offsetHeight);
      var tmp;

      if ( c ) { // Right
        if ( !dir ) { // Up
          tmp = this._unit_top - (OBJECT_ICON_HEIGHT + 11);
        } else {
          tmp = this._unit_top + (OBJECT_ICON_HEIGHT + 11);
        }
        if ( tmp >= 0 && tmp <= th ) {
          el.scrollTop = tmp;
          this._unit_top = tmp;
        }
      } else { // Left
        if ( !dir ) { // Up
          tmp = this._structure_top - (OBJECT_ICON_HEIGHT + 11);
        } else {
          tmp = this._structure_top + (OBJECT_ICON_HEIGHT + 11);
        }
        if ( tmp >= 0 && tmp <= th ) {
          el.scrollTop = tmp;
          this._structure_top = tmp;
        }
      }
    },

    /**
     * GUI::constructOverlay -- Render a timer
     * @return void
     */
    constructOverlay : function(clicked, root) {
      var time = 2;
      var r    = parseInt(OBJECT_ICON_WIDTH / 2, 10) + 10;

      var el            = document.createElement("div");
      el.className      = "Timer";

      var canvas          = document.createElement("canvas");
      var context         = canvas.getContext("2d");
      canvas.width        = OBJECT_ICON_WIDTH;
      canvas.height       = OBJECT_ICON_HEIGHT;
      context.fillStyle   = "rgba(255,255,255,0.1)";
      context.strokeStyle = "rgba(255,255,255,0.1)";
      context.lineWidth   = 0.1;
      //context.fillRect(0, 0, OBJECT_ICON_WIDTH, OBJECT_ICON_HEIGHT);

      var interval = setInterval(function() {
      }, 1000);

      setTimeout(function() {
        clearInterval(interval);
        el.parentNode.removeChild(el);
      }, (time * 1000));

      el.appendChild(canvas);
      clicked.appendChild(el);
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

    _supported  : SUPPORT.WebSocket,    // WebSocket support
    _xsupported : SUPPORT.xhr,          // AJAX support
    _socket     : null,                 // Current socket
    _started    : null,                 // Session started timestamp
    _ended      : null,                 // Sesion ended timestamp
    _connected  : false,                // Connection state

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
     * Networking::preload -- Create a preloading URL
     * @return String
     */
    preload : function(type, file) {
      return CnC.SERVICE_URI + "?preload=" + type + "&file=" + encodeURIComponent(file);
    },

    /**
     * Networking::service -- Do a service request
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

            /*
            console.group("Networking::service() => Response");
            console.log("URI", uri);
            console.log("Action", action);
            console.log("Success", success);
            console.log("Response data", in_data);
            console.groupEnd();
            */
          }
        };

        /*
        console.group("Networking::service() => Request");
        console.log("URI", uri);
        console.log("Action", action);
        console.log("Request data", data);
        console.groupEnd();
        */

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
     * Networking::connect -- Connect to socket
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
     * Networking::disconnect -- Disconnect from socket
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
     * Networking::send -- Send data over socket
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

    /**
     * Networking::onConnect>WebSocket::Event
     * @return void
     */
    onConnect : function(ev) {
      this._connected = true;
      this._started   = new Date();

      console.log("Networking::onConnect()", ev);
    },

    /**
     * Networking::onDisconnect>WebSocket::Event
     * @return void
     */
    onDisconnect : function(ev) {
      this._connected = false;
      this._ended     = new Date();

      console.log("Networking::onDisconnect()", ev);
    },

    /**
     * Networking::onRecieve>WebSocket::Event
     * @return void
     */
    onRecieve : function(ev) {
      console.log("Networking::onRecieve()", ev.data);
    },

    /**
     * Networking::onError>WebSocket::Event
     * @return void
     */
    onError : function(ev) {
      console.log("Networking::onError()", ev.data);
    }

  });

  /**
   * Graphics -- Graphics Manager
   * @class
   */
  var Graphics = Class.extend({

    _preloaded   : {},        // Preloaded objects container

    /**
     * @constructor
     */
    init : function() {
      console.group("Graphics::init()");
      console.groupEnd();
    },

    /**
     * @destructor
     */
    destroy : function() {
      console.group("Graphics::destroy()");
      this.unload();
      console.groupEnd();
    },

    /**
     * Graphics::preload -- Preload data for game session
     * @return void
     */
    preload : function(preload, callback) {
      console.group("Graphics::preload()");

      var self = this;
      var count = preload.length;
      var item, img, src, tsrc, s;
      for ( var i = 0; i < count; i++ ) {
        item = preload[i];
        tsrc = item + ".png";
        src  = _Net.preload("general", tsrc);

        LoadingStatus([i+1 + "/" + count, item].join(" "));

        s = new Image();
        s.onload = (function(ii, cc, cb) {
          return function() {
            if ( (ii + 1) >= cc ) {
              cb();
            }
          };
        })(i, count, callback);

        s.src = src;

        if ( (i + 1) >= count ) {
          console.log("Loaded",count,"files");
        }

        this._preloaded[item] = s;
      }

      console.groupEnd();
    },

    /**
     * Graphics::unload -- Unload data from game session
     * @return void
     */
    unload : function() {
      for ( var i in this._preloaded ) {
        if ( this._preloaded.hasOwnProperty(i) ) {
          if ( this._preloaded[i] ) {
            delete this._preloaded[i];
            console.log("Unloaded", i);
          }
        }
      }
    },

    /**
     * Graphics::getImge -- Get a preloaded image
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

    _codec       : "mp3",     // Current <audio> codec
    _ext         : "mp3",     // Current <audio> file-extension

    _webaudio    : false,     // WebAudio supported and enabled
    _context     : null,      // WebAudio context
    _csource     : null,      // WebAudio context sources
    _cfilters    : {},        // WebAudio context filters
    _cpanners    : null,      // WebAudio context filter:panner

    _preloaded   : {},        // Preloaded objects container

    /**
     * @constructor
     */
    init : function() {
      var self = this;

      console.group("Sounds::init()");

      if ( this._enabled ) {
        var i, s, t, codec, types;

        // First check if we have audio support, and find codec
        types = CnC.AUDIO_CODECS;
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

      console.groupEnd();
    },

    /**
     * @destructor
     */
    destroy : function() {
      console.group("Sounds::destroy()");
      this.unload();
      console.groupEnd();
    },

    /**
     * Sounds::preload -- Preload data for game session
     * @return void
     */
    preload : function(preload, callback) {
      console.group("Sound::preload()");

      // Preload audio files
      if ( this._enabled ) {

        var self = this;
        var count = preload.length;
        var item, img, src, tsrc;
        for ( i = 0; i < count; i++ ) {
          item = preload[i];
          tsrc = this._codec + "/" + item + "." + this._ext;
          src  = _Net.preload("sound", tsrc); //

          LoadingStatus([i+1 + "/" + count, item].join(" "));

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

          this._preloaded[item] = s;

          if ( (i + 1) >= count ) {
            console.log("Loaded",count,"files");

            callback();
          }

        }
      }

      console.groupEnd();
    },
    /**
     * Sounds::unload -- Unload data from game session
     * @return void
     */
    unload : function() {
      for ( var i in this._preloaded ) {
        if ( this._preloaded.hasOwnProperty(i) ) {
          if ( this._preloaded[i] ) {
            delete this._preloaded[i];
            console.log("Unloaded", i);
          }
        }
      }
    },

    /**
     * Sounds::play -- Play a preloaded sound
     * @return void
     */
    play : function(snd, obj) {
      var t = obj ? "audio_sfx" : "audio_gui";

      if ( this._enabled ) {
        var s    = this._preloaded[snd];
        var vol  = (parseInt(CnC.CONFIG[t], 10) || 100) / 100;
        //var time = 0;
        if ( s ) {
          var ss = new Audio(s.src);
          //ss.currentTime = time;
          ss.volume = vol;
          ss.play();
        }
      }
    }
  });

  /**
   * Game -- Main Class
   * @class
   */
  var Game = Class.extend({

    _interval : null,       // Game interval timer for main loop
    _started  : null,       // Game session started timestamp
    _last     : null,       // Last tick timestamp
    _running  : false,      // Running state
    _map      : null,       // Map instance reference
    _game     : null,       // Game data object (From AJAX)

    /**
     * @constructor
     */
    init : function(game) {
      var self = this;

      console.group("Game::init()");

      this._game = game;
      console.log("Game data", this._game);

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

      console.groupEnd();
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
     * Game::keypress -- keypress event
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

        if ( CnC.DEBUG_MODE ) {
          _Main.getMap().renderEnvironment();
        }

        $.preventDefault(ev); // NO tabindex-ing!
        return false;
      }

      return true;
    },

    /**
     * Game::resize -- onresize event
     * @return void
     */
    resize : function() {
      if ( this._map ) {
        this._map.onResize();
      }
    },

    /**
     * Game::loop -- main loop
     * @return void
     */
    loop : function(tick) {
      if ( this._last ) {
        _FPS = tick - this._last;
      }

      this._map.render();

      this._last = tick;

      //if ( CnC.DEBUG_MODE ) {
        _DebugFPS.innerHTML = _FPS;
        _DebugObjects.innerHTML = this._map._objects.length;
      //}
    },

    //
    // METHODS
    //


    /**
     * Game::stop -- Stop Game
     * @return void
     */
    stop : function() {
      console.group("Game::stop()");
      if ( this._running ) {
        // Stop timer
        if ( this._interval ) {
          clearInterval(this._interval);
          this._interval = null;
          console.log("Timer stopped");
        }

        // Destroy map
        if ( this._map ) {
          this._map.destroy();
          this._map = null;
          console.log("Map destroyed");
        }

        // Unload data
        _Sound.unload();
        _Graphic.unload();

        console.log("Data unloaded");

        this._running = false;
      }
      console.groupEnd();
    },

    /**
     * Game::run -- internal
     */
    _run : function() {
      var self = this;

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
    },

    /**
     * Game::run -- Run Game
     * @return void
     */
    run : function() {
      console.group("Game::run()");
      console.groupEnd();

      if ( !this._running ) {
        var self = this;
        LoadingStatus("<b>Loading audio files...</b>");
        _Sound.preload(self._game.preload.snd, function() {
          setTimeout(function() {
            LoadingStatus("<b>Loading graphic files...</b>");
            _Graphic.preload(self._game.preload.gfx, function() {
              setTimeout(function() {
                self.prepare(self._game.data);
                self._run();

                setTimeout(function() {
                  LoadingStatus(false);
                }, 500);
              }, 0);
            });
          }, 0);
        });
      }
    },

    /**
     * Game::prepare -- Prepare the game for running
     * @return void
     */
    prepare : function(data) {
      if ( !this._running ) {
        LoadingStatus("<b>Loading game...</b>");

        // Set players
        _Player     = data.player.index === undefined ? _Player      : parseInt(data.player.index, 10);
        _PlayerTeam = data.player.team  === undefined ? _PlayerTeam  : data.player.team;
        _Enemy      = data.enemy.index  === undefined ? _Enemy       : parseInt(data.enemy.index, 10);
        _EnemyTeam  = data.enemy.team   === undefined ? _EnemyTeam   : data.enemy.team;

        LoadingStatus("<b>Player:</b> " + _Player + " (" + _PlayerTeam + ")");

        // Create map
        var mt = data.map.type;
        var dt = data.map.data;
        var sx = parseInt(data.map.sx, 10);
        var sy = parseInt(data.map.sy, 10);

        this._map = new Map(mt, sx, sy, dt);

        LoadingStatus("<b>Map:</b> " + sx + "x" + sy + " (" + mt + ")");

        // Create objects
        var os = data.objects;
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
     * Game::reset -- Reset the Game
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
     * Game::getMap -- Get the current Map instance
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
    _iid           : -1,            // Internal id (counter)
    _type          : -1,            // Object type
    _image         : null,          // Object image (static image)
    _image_loaded  : false,         // Object image loaded (static image)
    _sprite        : null,          // Object sprite (dynamic images)
    _selected      : false,         // Selected state
    _angle         : 0,             // Current angle
    _sonuds        : null,          // Object sounds
    _color         : "255,255,255", // Object color (minimap, debugging)

    // Instance attributes
    _player        : 0,             // Object player Id
    _selectable    : true,          // Object selectable
    _movable       : true,          // Object movable
    _primary       : false,         // Object primary state
    _speed         : 0,             // Object movment speed
    _turning_speed : 0,             // Object turning speed
    _strength      : 10,            // Object strength

    // Rendering
    _blank         : null,          // Blank image overlay DOM
    _mask          : null,          // Clickable mask overlay DOM
    _destination   : null,          // Current object destination (movment)
    _heading       : null,          // Current object heading (movment)
    _path          : null,          // Current object path (movment)
    _frame         : 0,             // Current sprite frame

    /**
     * MapObject::init()
     * @constructor
     */
    init : function(mapRef, player, x, y, ang, opts) {
      var self = this;

      // Validate input data
      var a  = parseInt(ang, 10) || 0;
      var w  = parseInt(opts.width, 10);
      var h  = parseInt(opts.height, 10);

      // Set base attributes
      this._iid           = _MapObjectCount;
      this._type          = opts.type;
      this._sprite        = opts.sprite !== undefined ? opts.sprite : null;
      this._sounds        = opts.sounds;
      this._color         = opts.color !== undefined ? opts.color : this._color;
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

      if ( self._type != CnC.OBJECT_BUILDING ) {
        x += parseInt(w / 2, 10);
        y += parseInt(h / 2, 10);
      }

      // Init canvas
      this._super(w, h, x, y, a, "MapObject");
      this.__coverlay.fillStyle   = "rgba(" + this._color + ",0.2)";
      this.__coverlay.strokeStyle = "rgba(0,0,0,0.9)";
      this.__coverlay.strokeStyle = "rgba(0,0,0,0.9)";
      this.__coverlay.lineWidth   = 0.5;

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
        if ( $.mouseButton(ev) <= 1 ) {
          $.stopPropagation(ev);
        }
      });

      $.addEvent(this._mask, "click", function(ev) {
        self.onClick(ev);
      }, true);


      // Misc
      this.getRoot().className = "MapObject MapObjectBuilding";

      console.group("MapObject[" + this._iid + "]::" + CnC.OBJECT_CLASSNAMES[this._type] + "::init()", "x:" + x, "y:" + y, "a:" + a);
      console.log(opts, this);
      console.groupEnd();

      _MapObjectCount++;
    },

    /**
     * @destructor
     */
    destroy : function() {
      // Remove DOM
      if ( this._blank ) {
        // Remove events
        $.removeEvent(this._blank, "mousedown", function(ev) {
          $.preventDefault(ev);
          if ( $.mouseButton(ev) <= 1 ) {
            $.stopPropagation(ev);
          }
        });

        $.removeEvent(this._mask, "click", function(ev) {
          self.onClick(ev);
        }, true);

        this._blank.parentNode.removeChild(this._blank);
        this._mask.parentNode.parentNode.removeChild(this._mask.parentNode);

        this._blank = null;
        this._mask  = null;
      }

      this._image = null;

      // Destroy canvas
      this._super();
    },

    /**
     * MapObject::render -- Render the MapObject (CanvasObject)
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
          cc.fillStyle   = "rgba(" + this._color +  ",0.2)";
          cc.strokeStyle = "rgba(0,0,0,0.9)";

          cc.beginPath();
          cc.fillRect((tw/2 - w/2), (th/2 - h/2), w, h);
          //cc.arc((tw / 2), (th / 2), (w / 2), (Math.PI * 2), false);
          //cc.fill();

          if ( self._selected ) {
            cc.stroke();
          }
          cc.closePath();

          cc.beginPath();
            cc.moveTo((tw / 2), (th / 2));
            cc.lineTo((tw / 2), 0);
            cc.stroke();
          cc.closePath();
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
     * MapObject::_toggle -- Toggle selection state of MapObject
     * @return void
     */
    _toggle : function(t) {
      this._selected = t;

      console.group("MapObject[" + this._iid + "]::" + CnC.OBJECT_CLASSNAMES[this._type] + "::toggle()");
      console.log("Selected", this._selected);
      console.groupEnd();
    },

    /**
     * MapObject::select -- Select the MapObject
     * @return void
     */
    select : function() {
      this._toggle(true);
    },

    /**
     * MapObject::unselect -- Unselect the MapObject
     * @return void
     */
    unselect : function() {
      this._toggle(false);
    },

    /**
     * MapObject::move -- Move the MapObject
     * @return void
     */
    move : function(pos) {
      if ( !this._movable || (this._player !== _Player) ) {
        return;
      }

      console.group("MapObject[" + this._iid + "]::" + CnC.OBJECT_CLASSNAMES[this._type] + "::move()");

      // Calculate positions
      var w  = this.getDimension()[0],
          h  = this.getDimension()[1],
          x1 = this.getPosition()[0] - this.__width / 2,
          y1 = this.getPosition()[1] - this.__height / 2,
          x2 = pos.x - (w / 2),
          y2 = pos.y - (h / 2),
          tx = Math.round(x2 / (TILE_SIZE)),
          ty = Math.round(y2 / (TILE_SIZE)),
          sx = Math.round(x1 / (TILE_SIZE)),
          sy = Math.round(y1 / (TILE_SIZE));

      // Calculate rotation and distance to target
      var deg      = Math.atan2((y2-y1), (x2-x1)) * (180 / Math.PI);
      var rotation = (/*this._angle + */deg + 90) + (x2 < 0 ? 180 : (y2 < 0 ? 360 : 0));
      var distance = Math.round(Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)));

      // Set destination and heading
      this._destination = {
        x  : pos.x - this.__width / 2,
        y  : pos.y - this.__height / 2,
        tx : tx,
        ty : ty
      };
      this._heading     = parseInt(rotation, 10);
      try {
        this._path      = _Main.getMap().calculateObjectPath(this, sx, sy, tx, ty);
      } catch ( exc ) {
        this._path      = [];
        console.error("Failed to calculate path", exc);
      }


      console.log("Destination", this._destination.x, "x", this._destination.y);
      console.log("Heading", this._heading, "degrees");
      console.log("Distance", distance, "px");
      console.log("Tile", tx, "x", ty);
      console.log("Path", this._path);
      console.groupEnd();
    },

    /**
     * MapObject::onClick -- Click event
     * @return void
     */
    onClick : function(ev) {
      $.preventDefault(ev);
      $.stopPropagation(ev);

      ObjectAction([this]);
    },

    /**
     * MapObject::onRender -- Handle sprite rendering
     * @return void
     */
    onRenderSprite : function() {
      // If we have a sprite (animation) -- do it
      if ( this._sprite ) {
        var srcX = 0;
        var srcY = 0;
        var srcW = this._sprite.cw;
        var srcH = this._sprite.ch;


        if ( this._type == CnC.OBJECT_BUILDING ) {
          srcX = this._sprite.animation[this._frame];

          if ( this._frame >= (this._sprite.animation.length - 1) ) {
            this._frame = 0;
          } else {
            this._frame++;
          }
        } else {
          var j = Math.abs($.roundedAngle(Math.round(this._angle), this._sprite.rot));
          if ( this._sprite.rotation[j] !== undefined ) {
            srcX = this._sprite.rotation[j];
          }
        }

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
     * MapObject::getMovable -- Get movable state
     * @return bool
     */
    getMovable : function() {
      return this._movable;
    },

    /**
     * MapObject::getSelectable -- Get selectable state
     * @return bool
     */
    getSelectable : function() {
      return this._selectable;
    },

    /**
     * MapObject::getIsSelected -- Get if this MapObject is selected
     * @return bool
     */
    getIsSelected : function() {
      return this._selected;
    },

    /**
     * MapObject::getIsMine -- Get if this MapObject is the current player's
     * @return bool
     */
    getIsMine : function() {
      return (this._player == _Player);
    },

    /**
     * MapObject::getColor -- Get the color of the object
     * @return String
     */
    getColor : function() {
      return this._color;
    },

    /**
     * MapObject::getSound -- Get the sound of the MapObject
     * @return String
     */
    getSound : function(snd) {
      var s = null;

      if ( snd  !== null ) {
        /*
        if ( _MapObjectSounds[this._type] !== undefined ) {
        }
        */
        if ( this._sounds && this._sounds[snd] !== undefined ) {
          var snds = this._sounds[snd];
          if ( snds !== undefined && snds.length ) {
            s = snds[ Math.floor(Math.random()* (snds.length)) ];
          }
        }
      }

      return s;
    },

    /**
     * MapObject::getRect -- Get the rect of an object
     * @return Object
     */
    getRect : function() {
      return {
        x1 : this.__x,
        y1 : this.__y,
        x2 : this.__x + this.__width,
        y2 : this.__y + this.__height
      };
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
    _type       : null,     // Map type (theme)
    _objects    : [],       // MapObjects
    _data       : [],       // Map Data
    _env        : [],       // Map Environmental Data
    _envstatic  : null,     // Map Environmental Data image

    // Base attributes
    _marginX    : -1,       // Map container left margin
    _marginY    : -1,       // Map container top margin
    _sizeX      : 100,      // Map width in tiles
    _sizeY      : 100,      // Map height in tiles
    _posX       : 0,        // Map position x in pixels
    _posY       : 0,        // Map position y in pixels

    // DOM Elements
    _main       : null,     // #Main
    _root       : null,     // #MapContainer
    _minimap    : null,     // #MiniMap
    _minirect   : null,     // #MiniMapRect
    _rect       : null,     // #Rectangle
    _mincanvas  : null,     // MiniMap canvas overlay
    _mincontext : null,     // MiniMap canvas overlay context
    _mask       : null,     // Construction mask overlay

    // Minimap variables
    _scaleX     : -1,       // MiniMap scaling X factor
    _scaleY     : -1,       // MiniMap scaling Y factor

    // Event variables
    _constructing : false,  // Construction state (construction)
    _selecting    : false,  // Selection state (rectangle)
    _dragging     : false,  // Dragging state (map)
    _scrolling    : false,  // Scrolling state (minimap)
    _startX       : -1,     // Mouse starting X position
    _startY       : -1,     // Mouse starting Y position

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
      this._mask     = document.getElementById("Mask");

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

      this.__coverlay.fillStyle   = "rgba(255,0,0,0.2)";
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

      //if ( CnC.DEBUG_MODE ) {
        _DebugMap.innerHTML = (this._sizeX + "x" + this._sizeY) + (" (" + (w + "x" + h) + ")");
      //}

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
        self._onMiniMapMouseClick(ev);
      });
      $.addEvent(this._main, "click", function(ev) {
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
      // Remove events
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
        self._onMiniMapMouseClick(ev);
      });
      $.removeEvent(this._main, "click", function(ev) {
        self._onMouseClick(ev);
      });

      // Remove objects
      this.clearObjects();

      // Remove minimap
      this._mincanvas.parentNode.removeChild(this._mincanvas);
      delete this._mincontext;
      delete this._mincanvas;

      var cn = this._root.childNodes;
      while ( cn.length > 2 ) {
        if ( cn[cn.length - 1].nodeType == 1 ) {
          this._root.removeChild(cn[cn.length - 1]);
        }
      }
      delete cn;

      // Unset
      this._main       = null;
      this._root       = null;
      this._minimap    = null;
      this._minirect   = null;
      this._rect       = null;
      this._mask       = null;
      this._env        = null;
      this._envstatic  = null;

      // Destroy canvas
      this._super();
    },

    //
    // OBJECT EVENTS
    //

    /**
     * Map::addObject -- Add a MapObject
     * @return void
     */
    addObject : function(o, dom) {
      if ( o instanceof MapObject ) {
        this._objects.push(o);

        if ( dom ) {
          this._root.appendChild(o.getRoot());
        }
      }
    },

    /**
     * Map::removeObject -- Remove a MapObject
     * TODO
     * @return bool
     */
    removeObject : function(o) {
      return false;
    },

    /**
     * Map::clearObjects -- Remove all MapObjects
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

    /**
     * Map::calculateObjectPath -- Calculate the path of MapObject
     * @see    CnC.PathFinder
     * @return Array
     */
    calculateObjectPath : function(obj, x1, y1, x2, y2, ang) {
      return (new CnC.PathFinder(this.getEnvironmentData())).find(x1, y1, x2, y2);
    },

    //
    // DOM EVENTS
    //

    /**
     * Map::_onMouseDown>Window.Event
     * @return Mixed
     */
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

    /**
     * Map::_onMouseUp>Window.Event
     * @return Mixed
     */
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

    /**
     * Map::_onMouseMove>Window.Event
     * @return Mixed
     */
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
        this._onMiniMapMouseClick(ev);
      }
      // Update construction indicator
      else if ( this._constructing ) {
        var px = Math.round((mX - this._marginX - this._posX));
        var py = Math.round((mY - this._marginY - this._posY));

        this.onConstructMask(ev, px, py);
      }
    },

    _onMouseClick : function(ev) {
      var mX = $.mousePosX(ev);
      var mY = $.mousePosY(ev);

      if ( this._constructing ) {
        var w  = this._constructing.object.width;
        var h  = this._constructing.object.height;
        var px = Math.round((mX - this._marginX - this._posX));
        var py = Math.round((mY - this._marginY - this._posY));
        var tx = Math.round((px - (w / 2)) / (TILE_SIZE)) * TILE_SIZE;
        var ty = Math.round((py - (h / 2)) / (TILE_SIZE)) * TILE_SIZE;

        this.onConstructClick(ev, tx, ty);
      }
    },

    /**
     * Map::_onMiniMapMouseClick>Window.Event
     * @return Mixed
     */
    _onMiniMapMouseClick : function(ev) {
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
      var mapX = -parseInt((rectX * this._scaleX), 10);
      var mapY = -parseInt((rectY * this._scaleY), 10);

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
     * Map::onDragStart -- Drag starting event
     * @return void
     */
    onDragStart : function(ev, pos) {
      this._root.style.top  = (this._posY) + "px";
      this._root.style.left = (this._posX) + "px";

      document.body.className = "CursorMove";
    },

    /**
     * Map::onDragStop -- Drag stopping event
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
     * Map::onDragMove -- Drag moving event
     * @return void
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
     * Map::onSelect -- Selection rectangle event
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

    /**
     * Map::onConstructMask -- Construction mask event
     * @return void
     */
    onConstructMask : function(ev, x, y) {
      if ( ev ) {
        var w  = this._constructing.object.width;
        var h  = this._constructing.object.height;
        var tx = Math.round((x - (w / 2)) / (TILE_SIZE)) * TILE_SIZE;
        var ty = Math.round((y - (h / 2)) / (TILE_SIZE)) * TILE_SIZE;

        this._mask.style.left     = (tx) + "px";
        this._mask.style.top      = (ty) + "px";
        this._mask.style.width    = (w) + "px";
        this._mask.style.height   = (h) + "px";
        this._mask.style.display  = "block";
      } else {
        this._mask.style.display  = "none";
      }
    },

    /**
     * Map::onConstructClick -- Construction click event
     * @return void
     */
    onConstructClick : function(ev, px, py) {
      try {
        var type = this._constructing.type;
        var obj  = CreateObject.apply(this, [type, _Player, px, py]);
        this.addObject(obj, true);
      } catch ( e ) {
        alert("Cannot create this type!");
        console.error(e);
      }

      this.onConstructMask(false);
      this.setConstruction(false);
    },

    // METHODS

    /**
     * Map::prepare -- Prepare the map (Load)
     * @return void
     */
    prepare : function() {
      var self = this;

      console.group("Map::prepare()");

      var img, obj, rect;
      var blocked_tiles = [];
      var cc            = this.__coverlay;

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
      var tx = 0,
          ty = 0;
      for ( var o = 0; o < this._data.length; o++ ) {
        obj = CreateOverlay(this._data[o]);
        tx  = Math.round(obj.x / TILE_SIZE);
        ty  = Math.round(obj.y / TILE_SIZE);

        if ( blocked_tiles[tx] === undefined ) {
          blocked_tiles[tx] = [];
        }
        blocked_tiles[tx][ty] = true;

        this._root.appendChild(obj.dom);
      }

      console.log("Created", o, "overlay objects");


      //
      // Set environment data
      //
      var src, tst;
      for ( x = 0; x < this._sizeX; x++ ) {
        if ( this._env[x] === undefined ) {
          this._env[x] = [];
        }
        for ( y = 0; y < this._sizeY; y++ ) {
          if ( this._env[x][y] === undefined ) {
            this._env[x][y] = 0;
            if ( blocked_tiles[x] !== undefined && blocked_tiles[x][y] !== undefined ) {
              this._env[x][y] = 1;
            }
          }
        }
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
      // Initialize minimap etc
      //
      this.onResize();
      this.onDragMove(null, {x : this._posX, y : this._posY});

      // Draw environment on to minimap
      var canvas          = document.createElement("canvas");
      var context         = canvas.getContext("2d");
      canvas.width        = MINIMAP_WIDTH;
      canvas.height       = MINIMAP_HEIGHT;

      context.fillStyle   = "rgb(170,133,85)";
      context.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

      context.beginPath();
      context.fillStyle   = "rgb(0, 0, 0)";
      for ( x = 0; x < this._sizeX; x++ ) {
        for ( y = 0; y < this._sizeY; y++ ) {
          if ( this._env[x][y] > 0 ) {
            context.fillRect(
              Math.round((x * TILE_SIZE) / this._scaleX),
              Math.round((y * TILE_SIZE) / this._scaleY),
              Math.round(TILE_SIZE / this._scaleX),
              Math.round(TILE_SIZE / this._scaleY) );
          }
        }
      }
      context.closePath();

      // Copy the image and store it for later rendering
      img = new Image();
      img.onload = function() {
        self._envstatic = this;
      };
      img.src = canvas.toDataURL("image/png");
      delete canvas;
      delete context;

      console.groupEnd();
    },

    /**
     * Map::render -- Render the Map (CanvasObject)
     * @return void
     */
    render : function() {
      // Update objects and minimap
      var cc = this._mincontext;
      var o, color;

      cc.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
      if ( this._envstatic ) {
        cc.drawImage(this._envstatic, 0, 0);
      }
      for ( var i = 0; i < this._objects.length; i++ ) {
        o = this._objects[i];

        // Render minimap object
        color = "255,0,0";
        if ( o.getIsMine() ) {
          color = o.getColor();
        }

        cc.fillStyle = "rgb(" + color + ")";

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

      //this._super(); // Do not call!
    },

    /**
     * Map::renderEnvironment -- Render the environment overlay (paths)
     * @return void
     */
    renderEnvironment : function() {
      console.group("Map::renderEnvironment()");
      var x, y, e;
      var cc = this.__coverlay;

      cc.clearRect(0, 0, this.__width, this.__height);

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

      for ( x = 0; x < this._sizeX; x++ ) {
        for ( y = 0; y < this._sizeY; y++ ) {
          e = this._env[x][y];
          if ( e > 0 ) {
            cc.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }


      console.groupEnd();
    },

    //
    // GETTERS/SETTERS
    //

    /**
     * Map::setConstruction -- Set the construction type
     * @return void
     */
    setConstruction : function(cons) {
      this._constructing = cons;
    },

    /**
     * Map::getEnvironmentData -- Get the environment data
     * @see    CnC.PathFinder
     * @return Array
     */
    getEnvironmentData : function() {
      return this._env;
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // MAIN
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Main runner function
   * @return void
   */
  function main(args) {
    _Sound    = new Sounds();    // Initialize Sounds
    _Graphic  = new Graphics();  // Initialize Graphics
    _Main     = new Game(args);  // Initialize Game


    _Main.run();
  }

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
    console.groupEnd();

    // Initialize graphics engine (required)
    if ( SUPPORT.json && SUPPORT.canvas && SUPPORT.xhr ) {
      _GUI = new GUI();                // Initialize GUI
      _Net = new Networking();         // Initialize Networking
      _Net.service("load_game", {}, function(conn, response) {
        if ( response && (response instanceof Object) && response.result ) {
          main(response.result);
        } else {
          alert("Failed to validate game data!");
        }
      }, function() {
        alert("Failed to load game data!");
      });
    } else {
      alert("Your browser is not supported!");
    }
  };

  /**
   * Window 'onbeforeunload' function
   * @return void
  window.onbeforeunload = function(ev) {
    ev = ev || window.event;

    var ret = CnC.DEBUG_MODE ? false : "Are you sure you want to quit?";
    if ( ev ) {
      ev.returnValue = ret;
    }
    return ret;
  };
   */

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

    window.onload         = undefined;
    window.onresize       = undefined;
    window.onbeforeunload = undefined;
    window.onunload       = undefined;
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

