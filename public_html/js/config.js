
/**
 * Main CnC Configuration
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 */
(function(undefined) {

  window.CnC = {
    // Debugging options
    DEBUG_MODE : true,
    ENABLE_RAF : false, // DO NOT ENABLE (Decreases performance)

    // Main configuration
    CONFIG     : {
      'audio_on'     : true,
      'music_on'     : true,

      'audio_sfx'    : 90,
      'audio_gui'    : 100,
      'audio_music'  : 80
    },

    SERVER_URI   : "ws://localhost:8888/CnC",
    SERVICE_URI  : "/service.php"

  }; // Public namespace

})();

