<?php
/**
 * Define routes for api
 * 
 * @copyright	2022 Hanoi Open University
 * @author		Belikhun <domanhha@hou.edu.vn>
 * @license		https://tldrlegal.com/license/mit-license MIT
 */

global $PATH;

// Only scan for routes if current request indicate an api
// request and we are in production mode.
if (\CONFIG::$PRODUCTION && !str_starts_with($PATH, "/api"))
	return;

$dir = new RecursiveDirectoryIterator(BASE_PATH . "/api");
$ite = new RecursiveIteratorIterator($dir);
$files = new RegexIterator($ite, "/.*\.php/", RegexIterator::GET_MATCH);
$paths = Array();

foreach ($files as $file) {
	// Normalize slash.
	$file = str_replace("\\", "/", $file[0]);

	// Remove base path and .php extension
	$path = pathinfo(getRelativePath($file));
	$path = $path["dirname"] . "/" . $path["filename"];

	$verb = null;
	$haveParam = false;
	$tokens = explode("/", trim($path, "/"));
	
	foreach ($tokens as &$token) {
		// Try to parse api method (METHOD#api)
		$matches = Array();
		if (preg_match("/(.+)\#.+/m", $token, $matches)) {
			$verb = strtoupper($matches[1]);
			$token = str_replace("{$matches[1]}#", "", $token);
		}

		if ($token[0] === "%" && substr($token, -1) === "%") {
			$token = trim($token, "%");
			$token = "{" . $token . "}";
			$haveParam = true;
		}
	}

	// Process index file
	if ($tokens[count($tokens) - 1] === "index")
		array_pop($tokens);
	
	$path = implode("/", $tokens);

	// Register route
	\Router::match(
		empty($verb) ? \Router::$verbs : $verb,
		"/$path",
		function(...$args) use ($path, $file) {
			define("PAGE_TYPE", "API");
			initializeDB();

			// Check for token header.
			$token = getHeader("Authorization");

			if (!empty($token))
				\Session::token($token);

			/**
			 * An instance of current api.
			 * @var \API
			 */
			global $API;

			$API = new API($_SERVER["REQUEST_METHOD"], $path, $file, $args);

			// Isolate variable scope.
			(function() use ($API) {
				require_once $API -> file;

				// The api file should have stopped script execution
				// and code bellow should be considered dead code.
				// If not, this script is probally empty or forgot to
				// use stop(), so we will stop it to prevent invalid
				// JSON being passed to client.
				stop(NOT_IMPLEMENTED, "This API ({$API -> method} /{$API -> path}) haven't been implemented yet!", 501);
			})();
		},
		$haveParam ? 1 : 2
	);
}

// Create master route for handling undefined apis.
\Router::ANY("/api/**", function() {
	if (!defined("PAGE_TYPE"))
		define("PAGE_TYPE", "API");
	
	stop(API_NOT_FOUND, "No API registered to handle this request!", 404);
});