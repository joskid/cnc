<?php

/**
 * Main CnC Service
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 */

require "../main.php";
require "../src/Service.class.php";

define("ERROR_REQUEST", "Unknown Request!");
define("ERROR_FORMAT",  "Invalid format or no input recieved!");

header("Expires: Tue, 03 Jul 2001 06:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if ( isset($_GET["action"]) ) {
  switch ( $_GET["action"] ) {
    case "load_file" :
      if ( isset($_GET['type']) && isset($_GET['file']) ) {
        if ( $data = Service::LoadFile($_GET['type'], $_GET['file']) ) {
          list($mime, $out) = $data;
          if ( $mime && $out ) {
            header("Content-type: $mime");
            die($out);
          }
        }
      }
    break;
  }
}


if ( isset($_POST["action"]) ) {
  $result = Array("error" => "", "result" => null);
  $data   = isset($_POST["data"]) ? (Array)json_decode($_POST["data"]) : null;
  switch ( $_POST["action"] ) {
    case "load_file" :
      if ( isset($_POST['type']) && isset($_POST['file']) ) {
        if ( $data = Service::LoadFile($_POST['type'], $_POST['file']) ) {
          list($mime, $out) = $data;
          if ( $mime && $out ) {
            header("Content-type: $mime");
            die($out);
          }
        }
      }
    break;
    case "load_game" :
      $result["result"] = Service::LoadGame();
    break;
    case "save_game" :
      if ( is_array($data) ) {
        $result["result"] = Service::SaveGame();
      } else {
        $result["error"] = ERROR_FORMAT;
      }
    break;
    default :
      $result["error"] = ERROR_REQUEST;
    break;
  }

  header("Content-type: application/json");
  die(json_encode($result));
}

header("Content-type: text/plain");
print ERROR_REQUEST;

?>
