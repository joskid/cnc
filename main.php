<?php
/**
 * PHP Internals
 */
error_reporting(E_ALL | E_STRICT);

/**
 * Path definitions
 */
define("DIR_ROOT",  dirname(__FILE__));
define("DIR_SRC",   DIR_ROOT . "/src/");
define("DIR_HTML",  DIR_ROOT . "/public_html/");
define("DIR_DATA",  DIR_ROOT . "/data/");

/**
 * Data definitions
 */
define("DATA_SOUNDS",   DIR_DATA . "sounds.zip");
define("DATA_GENERAL",  DIR_DATA . "general.zip");

/**
 * Error messages
 */
define("ERROR_REQUEST", "Unknown Request!");
define("ERROR_FORMAT",  "Invalid format or no input recieved!");

/**
 * Requirements
 */
require DIR_SRC . "Data.class.php";
require DIR_SRC . "Server.class.php";
require DIR_SRC . "Service.class.php";

?>
