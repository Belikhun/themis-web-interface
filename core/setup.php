<?php
/**
 * setup.php
 * 
 * Web core setup file for initializing components,
 * session and handle current request's routing.
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

/**
 * Server's base path.
 * @var	String
 */
define("BASE_PATH", str_replace("\\", "/", $_SERVER["DOCUMENT_ROOT"]));

/**
 * Server's data path.
 * @var	String
 */
define("DATA_ROOT", BASE_PATH . "/data");

/**
 * Core base path.
 * @var	String
 */
define("CORE_ROOT", str_replace("\\", "/", pathinfo(__FILE__, PATHINFO_DIRNAME)));

require_once CORE_ROOT . "/const.php";
require_once CORE_ROOT . "/config.php";

if (!file_exists(BASE_PATH . "/config.define.php")) {
	require_once CORE_ROOT . "/abstracts/Config.php";
} else {
	require_once BASE_PATH . "/config.define.php";
}

if (file_exists(BASE_PATH . "/config.default.php"))
	copy(BASE_PATH . "/config.default.php", BASE_PATH . "/config.php");

if (file_exists(BASE_PATH . "/config.php"))
	require_once BASE_PATH . "/config.php";

if (!class_exists("CONFIG")) {
	echo "Define your \"CONFIG\" class inside \"config.define.php\"!!!";
	http_response_code(500);
	die();
}

if (!in_array("CoreConfig", class_parents("CONFIG", false))) {
	echo "Your \"CONFIG\" class MUST extend \"CoreConfig\"!!!";
	http_response_code(500);
	die();
}

// Initialise paths in config
$configRef = new ReflectionClass(CONFIG::class);
$configProps = $configRef -> getProperties(ReflectionProperty::IS_STATIC);
foreach ($configProps as $prop) {
	$attrs = $prop -> getAttributes();

	if (empty($attrs))
		continue;

	foreach ($attrs as $attr) {
		if ($attr -> getName() === "ConfigPathProperty") {
			$value = $prop -> getValue();

			if (!file_exists($value))
				mkdir($value, recursive: true);
		}
	}
}

require_once "libs.php";

// Include optional files and classes definition
// in the includes / classes directory.
foreach (CONFIG::$INCLUDES as $include) {
	if (!is_dir($include))
		continue;

	foreach (glob("$include/*.php") as $filename)
		require_once $filename;
}

if (!class_exists("User"))
	require_once CORE_ROOT . "/abstracts/User.php";

// Initialize config store.
if (file_exists(BASE_PATH . "/config.store.php")) {
	\Config\Store::$CONFIG_PATH = DATA_ROOT . "/config.json";
	require_once BASE_PATH . "/config.store.php";
	\Config\Store::init();
}

// Pre-setup DB
require_once CORE_ROOT . "/db/DB.Abstract.php";

//* ================== Additional Page Setup ==================

// Initialize session
if (class_exists("Session"))
	\Session::start();

if (file_exists(BASE_PATH . "/setup.php"))
	require_once BASE_PATH . "/setup.php";

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
$routesPath = CONFIG::$ROUTES_ROOT;
foreach (glob("$routesPath/*.php") as $filename) {
	// Isolate scope
	(function ($currentFileLocation) {
		require_once $currentFileLocation;
	})($filename);
}

// Handle current request path
Router::route($PATH, $_SERVER["REQUEST_METHOD"]);
