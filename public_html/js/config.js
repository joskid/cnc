
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
        'count' : 17,
        'items' : {
          // Desert theme stuff
          "desert/tile"            : null,
          "desert/rock1"           : null,
          "desert/rock2"           : null,
          "desert/rock3"           : null,
          "desert/rock4"           : null,
          "desert/rock5"           : null,
          "desert/rock6"           : null,
          "desert/rock7"           : null,
          "desert/t04"             : null,
          "desert/t08"             : null,
          "desert/t09"             : null,
          "desert/t18"             : null,

          // GDI Stuff
          "gdi/units/jeep_sprite"  : null,
          "gdi/units/unit"         : null,
          "gdi/units/tank"         : null,
          "gdi/structures/hq"      : null,
          "gdi/structures/barracs" : null
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
        'x'      : 31, //71 / 2,
        'y'      : 43 //42 / 2
      },
      'rock2' : {
        'image'  : "desert/rock2",
        'width'  : 71,
        'height' : 23,
        'x'      : 21, //71 / 2,
        'y'      : 23 /// 2
      },
      'rock3' : {
        'image'  : "desert/rock3",
        'width'  : 71,
        'height' : 47,
        'x'      : 20, //71 / 2,
        'y'      : 42 //47 / 2
      },
      'rock4' : {
        'image'  : "desert/rock4",
        'width'  : 42,
        'height' : 21,
        'x'      : 12, //42 / 2,
        'y'      : 21 / 2
      },
      'rock5' : {
        'image'  : "desert/rock5",
        'width'  : 39,
        'height' : 18,
        'x'      : 12, //39 / 2,
        'y'      : 18 /// 2
      },
      'rock6' : {
        'image'  : "desert/rock6",
        'width'  : 71,
        'height' : 47,
        'x'      : 30, //71 / 2,
        'y'      : 47 //42 / 2
      },
      'rock7' : {
        'image'  : "desert/rock7",
        'width'  : 109,
        'height' : 22,
        'x'      : 48, //109 / 2,
        'y'      : 22 /// 2
      },

      'tree4' : {
        'image'  : "desert/t04",
        'width'  : 23,
        'height' : 23,
        'x'      : 8, //23 / 2,
        'y'      : 17 //23 / 2
      },
      'tree8' : {
        'image'  : "desert/t08",
        'width'  : 48,
        'height' : 25,
        'x'      : 17, //48 / 2,
        'y'      : 20 //25 / 2
      },
      'tree9' : {
        'image'  : "desert/t09",
        'width'  : 47,
        'height' : 23,
        'x'      : 10, //47 / 2,
        'y'      : 22 //23 / 2
      },
      'tree18' : {
        'image'  : "desert/t18",
        'width'  : 71,
        'height' : 47,
        'x'      : 32, //71 / 2,
        'y'      : 40 //47 / 2
      }
    },

    // Objects
    MapObjects : {
      'GDI_Minigunner'     : {
        'type'   : _ou,
        'width'  : 50,
        'height' : 50,
        'image'  : "gdi/units/unit",
        'attrs'  : {
          'movable'   : true,
          'speed'     : 5,
          'turning'   : 0,
          'strength'  : 10
        }
      },


      'GDI_Jeep'  : {
        'type'   : _ov,
        'width'  : 24,
        'height' : 24,
        'image'  : "gdi/units/tank",
        'sprite' : {
          'src' : "gdi/units/jeep_sprite",
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

      'GDI_Headquarter' : {
        'type'   : _ob,
        'width'  : 72,
        'height' : 48,
        'image'  : "gdi/structures/hq",
        'attrs'  : {
          'movable'   : false,
          'speed'     : 0,
          'turning'   : 0,
          'strength'  : 100
        }
      },

      'GDI_Barracs' : {
        'type'   : _ob,
        'width'  : 48,
        'height' : 48,
        'image'  : "gdi/structures/barracs",
        'attrs'  : {
          'movable'   : false,
          'speed'     : 0,
          'turning'   : 0,
          'strength'  : 50
        }
      }
    }

  }; // Public namespace

})();

