<?php

/**
 * Main CnC Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 * @class
 */
class Service
{

  /**
   * Load a file from ZIP
   * @param String    $type    File type
   * @param String    $file    File name
   * @return Mixed
   */
  public static function LoadFile($type, $file) {
    $pack = ($type == "sound") ? DATA_SOUNDS : DATA_GENERAL;

    if ( file_exists($pack) ) {
      if ( $entry = Data::GetDataFile($pack, $file) ) {
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
        return Array($mime, $entry);
      }
    }

    return null;
  }

  /**
   * TODO Save a Game
   * @return void
   */
  public static function SaveGame() {
    return false;
  }

  /**
   * Load a Game
   * @return Mixed
   */
  public static function LoadGame($level = "000") {
    $file = "level{$level}.json";
    $pack = DATA_LOCAL;
    if ( file_exists($pack) ) {
      if ( $entry = Data::GetDataFile($pack, $file) ) {
        return $entry;
      }

    }
    return false;
  }
}

?>
