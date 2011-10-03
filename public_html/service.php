<?php

/**
 * Main CnC Service
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 */

require "../main.php";

define("ERROR_REQUEST", "Unknown Request!");
define("ERROR_FORMAT", "Invalid format or no input recieved!");

if ( isset($_POST["action"]) ) {
  $result = Array("error" => "", "result" => null);
  $data   = isset($_POST["data"]) ? (Array)json_decode($_POST["data"]) : null;
  switch ( $_POST["action"] ) {
    case "save" :
      if ( is_array($data) ) {
        $result["result"] = true;
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
