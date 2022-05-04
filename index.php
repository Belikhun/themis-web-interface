<?php
/**
 * \index.php
 * 
 * Web initialize and handle routing.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

setlocale(LC_TIME, "vi_VN.UTF-8");
date_default_timezone_set("Asia/Ho_Chi_Minh");

require_once "const.php";
require_once "config.inc.php";
require_once "belibrary.php";

// Initialize config store.
\Config\Store::$configPath = CONFIG::$DATA_ROOT . "/config.json";
require_once BASE_PATH . "/config.store.php";
\Config\Store::init();

//* ================== Handle Page Routing ==================

/**
 * Current requested path
 * @var String
 */
$PATH = $_GET["path"];
unset($_GET["path"]);

// Little hack for nginx server
if (isset($_GET["params"])) {
	$PATH .= "?". $_GET["params"];
	unset($_GET["params"]);
}

$URL = parse_url($PATH);
$PATH = $URL["path"];

if (!empty($URL["query"])) {
	$GET = [];
	parse_str($URL["query"], $GET);
	$_GET = array_merge($_GET, $GET);
}

// Special rules for index page
if ($PATH === "/index" || $PATH === "/index.php")
	$PATH = "/";

// Include routes definition before start routing.
$routesPath = dirname(__FILE__) ."/routes";
foreach (glob("$routesPath/*.php") as $filename) {
	// Isolate scope
	(function ($currentFileLocation) {
		require_once $currentFileLocation;
	})($filename);
}

// Handle current request path
Router::route($PATH, $_SERVER["REQUEST_METHOD"]);