<?php
/**
 * pages.php
 * 
 * Main route for normal pages routing
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2023 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

use Blink\Request;
use Blink\Response;
use Blink\Router;

global $PATH;

// We can skip normal page if user is requesting api
// endpoint and we are in production mode.
if (\CONFIG::$PRODUCTION && str_starts_with($PATH, "/api"))
	return;

// Scan all available pages and add route for it.
$pageDirs = glob(BASE_PATH . "/pages/*", GLOB_ONLYDIR);

foreach ($pageDirs as $page) {
	$name = pathinfo($page, PATHINFO_BASENAME);

	// Check valid page.
	if (!file_exists($page . "/index.php") && !file_exists($page . "/page.php"))
		continue;

	// Process path tokens
	$tokens = explode(".", $name);

	foreach ($tokens as &$token) {
		if ($token[0] === "%" && substr($token, -1) === "%") {
			$token = trim($token, "%");
			$token = "{" . $token . "}";
		}
	}

	$name = implode("/", $tokens);
	
	// Special route for index page.
	if ($name === "index")
		$name = "";
	
	/**
	 * An instance of current route.
	 * @var Router\Route
	 */
	global $ROUTE;

	// Create new route
	$ROUTE = Router::ANY("/$name", function(Request $request, ...$args) use ($page) {
		\Blink\initializeDB();

		/**
		 * An instance of current page. You can control page behaviour
		 * using this variable.
		 * @var \Page
		 */
		global $PAGE;

		/**
		 * An instance of current request.
		 * @var \Blink\Request
		 */
		global $REQUEST;

		/**
		 * An instance of initialized response for current request.
		 * @var \Blink\Response
		 */
		global $RESPONSE;
		
		$PAGE = new Page($page);
		$REQUEST = $request;
		$RESPONSE = new Response();

		ob_start();

		(function() use ($PAGE) {
			define("PAGE_TYPE", "NORMAL");

			ob_start();

			if (file_exists($PAGE -> location . "/index.php")) {
				// Try to include file which match folder name.
				require_once $PAGE -> location . "/index.php";
			} else {
				// Fallback to default page.php file.
				require_once $PAGE -> location . "/page.php";
			}

			$content = ob_get_clean();

			if (!defined("PAGE_TITLE"))
				define("PAGE_TITLE", Router::$active -> uri);

			// Load header
			require_once BASE_PATH . "/fragments/header.php";

			echo $content;

			// Load footer
			require_once BASE_PATH . "/fragments/footer.php";
		})();

		$body = ob_get_clean();
		$RESPONSE -> body($body);
		return $RESPONSE;
	});

	if (file_exists($page . "/config.php"))
		require_once $page . "/config.php";
}
