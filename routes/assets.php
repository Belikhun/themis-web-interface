<?php
/**
 * assets.php
 * 
 * Route for serving asset files
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2023 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

use Blink\Exception\FileNotFound;
use Blink\Exception\IllegalAccess;
use Blink\Response\FileResponse;
use Blink\Router;

global $PATH;
define("ASSETS_ALLOW", Array("js", "css", "png", "jpg", "webp", "otf", "ttf", "woff", "woff2"));

// Only add asset's routes if current request indicate an asset
// request and we are in production mode.
if (!CONFIG::$DEBUG && !str_starts_with($PATH, "/assets"))
	return;

// Serve asset with specified path.
Router::GET("/asset", function() {
	$path = requiredParam("path");
	$filepath = realpath(BASE_PATH . $path);
	$ext = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));

	if (!$filepath)
		throw new FileNotFound($path);

	if (!in_array($ext, ASSETS_ALLOW))
		throw new IllegalAccess();
	
	$response = new FileResponse($filepath);

	// Only cache assets on production
	if (!CONFIG::$DEBUG)
		$response -> expire(CONFIG::$ASSETS_EXPIRE);

	return $response;
});

// Serve asset in /static folder.
Router::GET("/static/**", function() {
	global $PATH;
	
	// Sanitize request path.
	$assets = BASE_PATH . "/static";
	$filepath = str_replace("\\", "/", realpath(BASE_PATH . $PATH));

	if (!$filepath)
		throw new FileNotFound($PATH);

	// Prevent LFI.
	if (strpos($filepath, $assets) !== 0)
		throw new IllegalAccess();

	$response = new FileResponse($filepath);

	// Only cache assets on production
	if (!CONFIG::$DEBUG)
		$response -> expire(CONFIG::$ASSETS_EXPIRE);

	return $response;
});
