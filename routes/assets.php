<?php
/**
 * Route for serving asset files
 * 
 * @copyright	2022 Hanoi Open University
 * @author		Belikhun <domanhha@hou.edu.vn>
 * @license		https://tldrlegal.com/license/mit-license MIT
 */

global $PATH;
define("ASSETS_ALLOW", Array("js", "css", "png", "jpg", "webp", "otf", "ttf", "woff", "woff2"));

// Only add asset's routes if current request indicate an asset
// request and we are in production mode.
if (\CONFIG::$PRODUCTION && !str_starts_with($PATH, "/assets"))
	return;

// Serve asset with specified path.
Router::GET("/assets", function() {
	$path = requiredParam("path");
	$filepath = realpath(BASE_PATH . $path);
	$ext = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));

	if (!$filepath)
		throw new FileNotFound($path);

	if (!in_array($ext, ASSETS_ALLOW))
		throw new IllegalAccess();
	
	// Only cache assets on production
	if (CONFIG::$PRODUCTION)
		expireHeader(CONFIG::$ASSETS_EXPIRE);
	
	contentType($ext);
	readfile($filepath);
});

// Serve asset in /assets folder.
Router::GET("/assets/**", function() {
	global $PATH;
	
	// Sanitize request path.
	$assets = BASE_PATH . "/assets";
	$filepath = str_replace("\\", "/", realpath(BASE_PATH . $PATH));
	$ext = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));

	if (!$filepath)
		throw new FileNotFound($PATH);

	// Prevent LFI.
	if (strpos($filepath, $assets) !== 0)
		throw new IllegalAccess();

	// Only cache assets on production
	if (CONFIG::$PRODUCTION)
		expireHeader(CONFIG::$ASSETS_EXPIRE);
	
	contentType($ext);
	readfile($filepath);
});

// Serve asset in /static folder.
Router::GET("/static/**", function() {
	global $PATH;
	
	// Sanitize request path.
	$assets = BASE_PATH . "/static";
	$filepath = str_replace("\\", "/", realpath(BASE_PATH . $PATH));
	$ext = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));

	if (!$filepath)
		throw new FileNotFound($PATH);

	// Prevent LFI.
	if (strpos($filepath, $assets) !== 0)
		throw new IllegalAccess();

	// Only cache assets on production
	if (CONFIG::$PRODUCTION)
		expireHeader(CONFIG::$ASSETS_EXPIRE);
	
	contentType($ext);
	readfile($filepath);
});