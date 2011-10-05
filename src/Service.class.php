<?php

/**
 * Main CnC Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 * @class
 */
class Service {

  public static function LoadFile($type, $file) {
    $pack = ($type == "sound") ? DATA_SOUNDS : DATA_GENERAL;
    $path = DIR_DATA . $pack;
    $data = null;

    if ( file_exists($path) ) {
      $zip = new ZipArchive();
      if ( ($res = $zip->open($path)) === true ) {
        if ( $entry = $zip->getFromName($file) ) {
          $ext  = substr(strrchr($file, "."), 1);
          switch ( $ext ) {
            case "png" :
              $mime = "image/png";
            break;
            case "mp3" :
              $mime = "audio/mpeg";
            break;
            case "ogg" :
              $mime = 'audio/ogg; codecs="vorbis"';
            break;
            default :
              $mime = null;
            break;
          }
          $data = Array($mime, $entry);
        }
        $zip->close();
      }
    }

    return $data;
  }

  public static function SaveGame() {
    return false;
  }

  public static function LoadGame() {
    return false;
  }
}

?>
