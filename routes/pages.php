<?php
/**
 * \pages.php
 * 
 * Main route for normal pages routing.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

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
	if (!file_exists($page . "/page.php"))
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
	
	// Create new route
	$ROUTE = \Router::GET("/$name", function(...$args) use ($page) {

		/**
		 * An instance of current page. You can control page behaviour
		 * using this variable;
		 * @var \Page	$PAGE
		 */
		$PAGE = new Page($args, $page);

		// Isolate variable scope.
		(function() use ($PAGE) {
			define("PAGE_TYPE", "NORMAL");

			ob_start();
			require_once $PAGE -> location . "/page.php";
			$content = ob_get_clean();

			if (!defined("PAGE_TITLE"))
				define("PAGE_TITLE", Router::$active -> uri);

			// Load header
			require_once BASE_PATH . "/fragments/header.php";

			echo $content;

			// Load footer
			require_once BASE_PATH . "/fragments/footer.php";
		})();
	});

	if (file_exists($page . "/config.php"))
		require_once $page . "/config.php";
}