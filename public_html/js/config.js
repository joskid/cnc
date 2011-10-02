
/**
 * Main CnC Configuration
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
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

    // Main configuration
    CONFIG     : {
      'audio_on'    : true,
      'audio_sfx'   : 90,
      'audio_gui'   : 100,
      'audio_music' : 80
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

