<?php

require 'info.php';


// LOGIC
$errors = [];

$present = isset($_REQUEST['phoneNumber']) &&
           isset($_REQUEST['pin']) &&
           isset($_REQUEST['firstName']) &&
           isset($_REQUEST['lastName']);
//
if(!$present) $errors[] = "Missing values";

header('Content-Type: text/json');

if( $errors ) {
$error_string = implode(',',$errors);
$output =  <<< JSON
{
    "authenticated": false,
    "error": "{$error_string}"
}
JSON;

} else {

$output = <<< JSON
{
    "authenticated": true,
    "error": null
}
JSON;

}
echo $output;
fputs($stderr, "OUTPUT:\n {$output} \n");
fclose($stderr);