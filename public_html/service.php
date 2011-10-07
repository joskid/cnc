<?php

/**
 * Main CnC Service
 *
 * TODO Input security
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 */

require "../main.php";

/**
 * Disable Cache on browser
 */
header("Expires: Tue, 03 Jul 2001 06:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

/**
 * Handle GET Requests
 */
if ( isset($_GET["preload"]) ) {
  if ( isset($_GET['file']) ) {
    if ( $data = Service::LoadFile($_GET['preload'], $_GET['file']) ) {
      list($mime, $out) = $data;
      if ( $mime && $out ) {
        header("Content-type: $mime");
        die($out);
      }
    }
  }
  return;
}

/**
 * Handle POST Requests
 */
if ( isset($_POST["action"]) ) {
  $result = Array("error" => "", "result" => null);
  $data   = isset($_POST["data"]) ? (Array)json_decode($_POST["data"]) : null;
  switch ( $_POST["action"] ) {
    // Load a game from data directory
    case "load_game" :
      $result["result"] = json_decode(Service::LoadGame());
    break;

    // Save a game to personal directory
    case "save_game" :
      if ( is_array($data) ) {
        $result["result"] = Service::SaveGame();
      } else {
        $result["error"] = ERROR_FORMAT;
      }
    break;

    // Default event
    default :
      $result["error"] = ERROR_REQUEST;
    break;
  }

  // Always output JSON data on POST
  header("Content-type: application/json");
  die(json_encode($result));
}

// Print an error message upon no request
header("Content-type: text/plain");
print ERROR_REQUEST;

?>
