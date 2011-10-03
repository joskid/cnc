
/**
 * Main CnC Configuration
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 */
(function(undefined) {

  var _ou = 1;
  var _ov = 2;
  var _ob = 3;

  window.CnC = {
    // INTERNALS
    OBJECT_UNIT      : _ou,
    OBJECT_VEHICLE   : _ov,
    OBJECT_BUILDING  : _ob,

    // Debugging options
    DEBUG_MODE : true,
    ENABLE_RAF : false, // DO NOT ENABLE (Decreases performance)

    // Main configuration
    CONFIG     : {
      'audio_on'     : true,
      'audio_sfx'    : 90,
      'audio_gui'    : 100,
      'audio_music'  : 80,
      'audio_codecs' : {
        "ogg" : 'audio/ogg; codecs="vorbis"', // OGG
        "mp3" : 'audio/mpeg'                  // MP3
      }
    },

    SERVER_URI   : "ws://localhost:8888/CnC",
    SERVICE_URI  : "/service.php",

    // Preloading
    PRELOAD : {
      'gfx' : {
        'count' : 16,
        'items' : {
          "desert/tile"  : null,
          "desert/rock1" : null,
          "desert/rock2" : null,
          "desert/rock3" : null,
          "desert/rock4" : null,
          "desert/rock5" : null,
          "desert/rock6" : null,
          "desert/rock7" : null,
          "desert/t04"   : null,
          "desert/t08"   : null,
          "desert/t09"   : null,
          "desert/t18"   : null,
          "jeep_sprite"  : null,
          "unit"         : null,
          "tank"         : null,
          "hq"           : null
        }
      },
      'snd' : {
        'count' : 10,
        'items' : {
          "await1" : null,
          "ackno" : null,
          "affirm1" : null,
          "yessir1" : null,
          "roger" : null,
          "movout1" : null,
          "ritaway" : null,
          "ritaway" : null,
          "ugotit" : null,
          "unit1" : null,
          "vehic1" : null
        }
      }
    },

    // Overlays
    MapOverlays : {
      'rock1' : {
        'image'  : "desert/rock1",
        'width'  : 71,
        'height' : 47,
        'x'      : 71 / 2,
        'y'      : 42 / 2
      },
      'rock2' : {
        'image'  : "desert/rock2",
        'width'  : 71,
        'height' : 23,
        'x'      : 71 / 2,
        'y'      : 23 / 2
      },
      'rock3' : {
        'image'  : "desert/rock3",
        'width'  : 71,
        'height' : 47,
        'x'      : 71 / 2,
        'y'      : 47 / 2
      },
      'rock4' : {
        'image'  : "desert/rock4",
        'width'  : 42,
        'height' : 21,
        'x'      : 42 / 2,
        'y'      : 21 / 2
      },
      'rock5' : {
        'image'  : "desert/rock5",
        'width'  : 39,
        'height' : 18,
        'x'      : 39 / 2,
        'y'      : 18 / 2
      },
      'rock6' : {
        'image'  : "desert/rock6",
        'width'  : 71,
        'height' : 47,
        'x'      : 71 / 2,
        'y'      : 42 / 2
      },
      'rock7' : {
        'image'  : "desert/rock7",
        'width'  : 109,
        'height' : 22,
        'x'      : 109 / 2,
        'y'      : 22 / 2
      },

      'tree4' : {
        'image'  : "desert/t04",
        'width'  : 23,
        'height' : 23,
        'x'      : 23 / 2,
        'y'      : 23 / 2
      },
      'tree8' : {
        'image'  : "desert/t08",
        'width'  : 48,
        'height' : 25,
        'x'      : 48 / 2,
        'y'      : 25 / 2
      },
      'tree9' : {
        'image'  : "desert/t09",
        'width'  : 47,
        'height' : 23,
        'x'      : 47 / 2,
        'y'      : 23 / 2
      },
      'tree18' : {
        'image'  : "desert/t18",
        'width'  : 71,
        'height' : 47,
        'x'      : 71 / 2,
        'y'      : 47 / 2
      }
    },

    // Objects
    MapObjects : {
      'Unit'     : {
        'type'   : _ou,
        'width'  : 50,
        'height' : 50,
        'image'  : "unit",
        'attrs'  : {
          'movable'   : true,
          'speed'     : 5,
          'turning'   : 0,
          'strength'  : 10
        }
      },


      'Vehicle'  : {
        'type'   : _ov,
        'width'  : 24,
        'height' : 24,
        'image'  : "tank",
        'sprite' : {
          'src' : "jeep_sprite",
          'cw'  : 24,
          'ch'  : 24,
          'rotation' : {
            270 : 0,
            180 : 191,
            90  : 384,
            0   : 576,
            360 : 576
          }
        },
        'attrs'  : {
          'movable'   : true,
          'speed'     : 10,
          'turning'   : 10,
          'strength'  : 10
        }
      },
      'Building' : {
        'type'   : _ob,
        'width'  : 72,
        'height' : 48,
        'image'  : "hq",
        'attrs'  : {
          'movable'   : false,
          'speed'     : 0,
          'turning'   : 0,
          'strength'  : 100
        }
      }
    }

  }; // Public namespace

})();

