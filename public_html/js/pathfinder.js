
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

    _mapStatus        : [],    // Movment tile checks
    _openList         : [],    // Open tile list
    _environmentData  : [],    // Block/Cost data
    _rows             : 0,
    _cols             : 0,


    /**
     * @constructor
     */
    init : function(ed) {
      this._environmentData  = ed;
      this._rows             = ed.length;
      this._cols             = ed[0].length;

      console.log("PathFinder::init()");

      var row, col;
      for ( row = 0; row < this._rows; row++ ) {
        this._mapStatus[row] = [];
        for ( col = 0; col < this._cols; col++ ) {
          this._mapStatus[row][col] = {};
        }
      }
    },

    /**
     * @destructor
     */
    destruct : function() {

    },

    //
    // TILE METHODS
    //

    /**
     * open -- Open a tile
     * @return void
     */
    open : function(row, col, parent, movementCost, heuristic, replacing) {
      if ( replacing === undefined ) {
        replacing = false;
      }

      // Opens a square
      if (!replacing) {
        this._openList.push([row,col]);
        this._mapStatus[row][col] = {heuristic:heuristic, open:true, closed:false};
      }
      this._mapStatus[row][col].parent = parent;
      this._mapStatus[row][col].movementCost = movementCost;
    },

    /**
     * close -- Close a tile
     * @return void
     */
    close : function(row, col) {
      var len = this._openList.length;
      var i = 0;
      for ( i; i < len; i++) {
        if (this._openList[i][0] == row) {
          if (this._openList[i][1] == col) {
            this._openList.splice(i, 1);
            break;
          }
        }
      }

      this._mapStatus[row][col].open = false;
      this._mapStatus[row][col].closed = true;
    },

    //
    // METHODS
    //

    /**
     * find -- Find a path
     * @return Array
     */
    find : function(startRow, startCol, endRow, endCol) {
      console.group("PathFinder::find()");

      var row, col;

      this._openList = [];

      this.open(startRow, startCol, undefined, 0);

      while ( (this._openList.length > 0) && !this.getClosed(endRow, endCol) ) {
        var i      = this.getNearest();
        var nowRow = this._openList[i][0];
        var nowCol = this._openList[i][1];

        this.close(nowRow, nowCol);

        // Open all nearby tiles for movment
        for ( row = nowRow-1; row < nowRow+2; row++ ) {
          for ( col = nowCol-1; col < nowCol+2; col++ ) {
            //if ( row >= 0 && row < this._rows && col >= 0 && col < this._cols && !(row == nowRow && col == nowCol ) && (ALLOW_DIAGONAL || row == nowRow || col == nowCol ) && 
            //         (ALLOW_DIAGONAL_CORNERING || row == nowRow || col == nowCol || (this._environmentData[row][nowCol].isWalkable() && this._environmentData[nowRow][col])) ) {
            if ( row >= 0 && row < this._rows && col >= 0 && col < this._cols && !(row == nowRow && col == nowCol ) && (ALLOW_DIAGONAL || row == nowRow || col == nowCol ) && 
                      (ALLOW_DIAGONAL_CORNERING || row == nowRow || col == nowCol (this._environmentData[nowRow][col])) ) {
              // If not outside the boundaries or at the same point or a diagonal (if disabled) or a diagonal (with a block next to it)...
              //if ( this._environmentData[row][col].isWalkable() ) {
              if ( true ) {

                // Is not a blocked tile
                if ( !this.getClosed(row,col) ) {
                  // Not a closed tile
                  //var movementCost = this._mapStatus[nowRow][nowCol].movementCost + ((row == nowRow || col == nowCol ? HV_COST : D_COST) * this._environmentData[row][col].getCost());
                  var movementCost = this._mapStatus[nowRow][nowCol].movementCost + ((row == nowRow || col == nowCol ? HV_COST : D_COST) * 1);
                  if ( this.getOpen(row,col) ) {
                    if (movementCost < this._mapStatus[row][col].movementCost) {
                      // Cheaper: simply replaces with new cost and parent.
                      this.open(row, col, [nowRow, nowCol], movementCost, undefined, true); // heuristic not passed: faster, not needed 'cause it's already set
                    }
                  } else {
                    // Normal tile
                    var heuristic = (Math.abs (row - endRow) + Math.abs (col - endCol)) * 10;
                    this.open(row, col, [nowRow, nowCol], movementCost, heuristic, false);
                  }
                } else {
                  // Closed tile, ignore
                  (function() {})();
                }
              } else {
                // Bloced tile, ignore
                (function() {})();
              }

            }
          }
        }
      }

      var result = [];
      var found = this.getClosed(endRow, endCol);
      if ( found ) {
        nowRow = endRow;
        nowCol = endCol;

        while ( (nowRow != startRow || nowCol != startCol) ) {
          result.push([nowRow, nowCol]);
          var newRow = this._mapStatus[nowRow][nowCol].parent[0];
          var newCol = this._mapStatus[nowRow][nowCol].parent[1];

          nowRow = newRow;
          nowCol = newCol;
        }

        result.push([startRow,startCol]);
      }

      console.log("Result", result);
      console.groupEnd();

      return result;
    },

    //
    // GETTERS / SETTERS
    //

    /**
     * getNearest -- Find the nearest tile index
     * @return int
     */
    getNearest : function() {
      var minimum     = 999999;
      var indexFound  = 0;  // Lowest
      var thisF       = undefined;
      var thisTile    = undefined;
      var list        = this._openList;
      var i           = list.length - 1;
      //var i           = list.length;

      // Finds lowest
      while (i > 0) {
        thisTile = this._mapStatus[list[i][0]][list[i][1]];
        thisF    = thisTile.heuristic + thisTile.movementCost;
        if (thisF <= minimum) {
          minimum = thisF;
          indexFound = i;
        }

        i--;
      }

      return indexFound;
    },

    /**
     * getOpen -- Check if tile is open
     * @return bool
     */
    getOpen : function(row, col) {
      return this._mapStatus[row][col].open;
    },

    /**
     * getClosed -- Check if tile is closed
     * @return bool
     */
    getClosed : function(row, col) {
      return this._mapStatus[row][col].closed;
    }

  });

})();

