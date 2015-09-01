<?php
/**
 * Created by PhpStorm.
 * User: zb
 * Date: 15-6-19
 * Time: 下午4:47
 */

// set path to error.log file ()
ini_set('error_log', dirname(__FILE__) . '/error.log');

// set error reporting level
error_reporting(E_ALL); // set '0' to disable error reporting, 'E_ALL' to view all errors, 'E_ALL & ~E_NOTICE' to view all except notices

// do not show errors in pages (must be FALSE in production)
ini_set('display_errors', FALSE);

// disable HTML in screen error messages
ini_set('html_errors', FALSE);


// handle exceptions like errors
function apiExceptionHandler($e) {
    $logLines = array();
    while ($e) {
        $eClass = get_class($e);
        $logLines[]= $eClass . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine();
        if (method_exists($e, 'getPrevious') || $eClass == 'apiException') {
            $e = $e->getPrevious();
        }
        else {
            break;
        }
    }
    $log = implode("\n...", $logLines) . "\n";
    trigger_error($log, E_USER_ERROR);
}

set_exception_handler('apiExceptionHandler');

// handle errors in usual way (logfile) instead of set earlier by drupal etc.
restore_error_handler();


// write logs
function api_log($str, $file='api.log') {
    $path = dirname(__FILE__).DIRECTORY_SEPARATOR;
    @file_put_contents($path.$file, date('[d-m-Y H:i:s] ') . $str . "\n", FILE_APPEND);
}

function api_log_array($a, $file='api.log') {
    ob_start();
    var_dump($a);
    $my_string = ob_get_contents();
    ob_end_clean();
    api_log($my_string, $file);
}

// get timestamp which have microsecond
function get_microtime() {
    $mtime = explode(' ', microtime());
    $timestamp = $mtime[1] + $mtime[0];
    return $timestamp;
}

function time_log($action, $time, $type) {
    $d = date('Y_m_d');
    $filename = S_ROOT.'/log/time_'.$d.'.log';
    $content = 'time:'.date('[d-m-Y:H:i:s]')." action:".$action." last:".$time." type:".$type."\n";
    @file_put_contents($filename, $content, FILE_APPEND);
}