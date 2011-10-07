<?php

/**
 * Main CnC Data Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 * @class
 */
class Data
{
  private $_oZIP = null;

  /**
   * @constructor
   */
  protected function __construct($file) {
    $zip = new ZipArchive();
    if ( ($res = $zip->open($file)) === true ) {
      $this->_oZIP = $zip;
    }
  }

  /**
   * @destructor
   */
  public function __destruct() {
    if ( $this->_oZIP ) {
      $this->_oZIP->close();
    }
  }

  /**
   * Get data from filename and archive path
   * @param  String   $archive   Archive path
   * @param  String   $name      File name
   * @see    Data::getFile
   * @return Mixed
   */
  public final static function GetDataFile($archive, $name) {
    $zip = new self($archive);

    return $zip->getFile($name);
  }

  /**
   * Get all filenames from an archive
   * @param  String   $archive   Archive path
   * @see    Data::getFiles
   * @return Mixed
   */
  public final static function GetDataEntries($archive) {
    $zip = new self($archive);
    return $zip->getFiles();
  }

  /**
   * Get all filenames from archive
   * @return Mixed
   */
  public final function getFiles() {
    if ( $this->_oZIP ) {
      $result = Array();
      $stat = true;
      $i = 0;
      while ( $stat ) {
        if ( ($stat = $this->_oZIP->statIndex($i)) !== false ) {
          if ( !preg_match("/\/$/", $stat["name"]) ) {
            $result[] = $stat["name"];
          }
        }
        $i++;
      }

      return $result;
    }

    return null;
  }

  /**
   * Get file data from filename
   * @return Mixed
   */
  public final function getFile($name) {
    if ( $this->_oZIP ) {
      if ( $entry = $this->_oZIP->getFromName($name) ) {
        return $entry;
      }
    }
    return null;
  }
}

?>
