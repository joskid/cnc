<?php
require "../main.php";
?>
<!DOCTYPE html>
<!--

/**
 * Main CnC HTML document
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 */

-->
<html>
  <head>
    <title>CnC</title>

    <!-- Stylesheets -->
    <link rel="stylesheet" type="text/css" href="/css/main.css" />

    <!-- JavaScript -->
    <script type="text/javascript" src="/js/vendor.js"></script>
    <script type="text/javascript" src="/js/utils.js"></script>
    <script type="text/javascript" src="/js/canvas.js"></script>
    <script type="text/javascript" src="/js/main.js"></script>

    <script type="text/javascript">
      // Make sure everything runs without a debugging console
      (function(undefined) {
        if ( (window.console === undefined) || (!window.console) ) {
          window.console = {
            log      : function() {},
            info     : function() {},
            error    : function() {},
            group    : function() {},
            groupEnd : function() {}
          };
        }
       })();
    </script>
  </head>
  <body>
    <!-- Sidebar -->
    <div id="Sidebar">
      <div id="MiniMap"><!-- Canvas --><div id="MiniMapRect"></div></div>
    </div>

    <!-- Main Container -->
    <div id="Main">
      <div id="MainContainer"><!-- Canvas --></div>
    </div>
  </body>
</html>
