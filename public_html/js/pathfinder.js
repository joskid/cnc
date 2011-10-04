
/**
 * CnC Pathfinder
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 */
(function(undefined) {


  var HV_COST                  = 10;    // "Movement cost" for horizontal/vertical moves
  var D_COST                   = 14;    // "Movement cost" for diagonal moves
  var ALLOW_DIAGONAL           = true;  // If diagonal movements are allowed at all
  var ALLOW_DIAGONAL_CORNERING = true;  // If diagonal movements over corners are allowed


  CnC.PathFinder = Class.extend({

    /**
     * @constructor
     */
    init : function() {

    },

    /**
     * @destructor
     */
    destruct : function() {

    },

    getPath : function() {
      return [];
    }

  });

})();

