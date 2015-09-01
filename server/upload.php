<?php
/**
 * User: zhaobao
 * Date: 8/31/15 20:12
 */

define('SUCCESS',       0);
define('ERROR_PARAM',   1);
define('ERROR_ERROR',   2);

include 'logs.php';

$response = array();
if (empty($_FILES) || 0 == count($_FILES) || !isset($_FILES['file']['error']) || is_array($_FILES['file']['error'])) {
    $response['code'] = ERROR_PARAM;
    echo json_encode($response);
    exit;
}

$path = 'files/' . $_FILES['file']['name'];
if (move_uploaded_file($_FILES['file']['tmp_name'], $path)) {
    $response['code'] = SUCCESS;
} else {
    $response['code'] = ERROR_ERROR;
}
echo json_encode($response);