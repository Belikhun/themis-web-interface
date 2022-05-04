<?php
/**
 * \config.inc.php
 * 
 * Base configuration file.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

class CONFIG {
	/**
	 * Page title
	 * @var String
	 */
	public static String	$APP_NAME = "Themis Web Interface";
	public static String	$AUTHOR = "Belikhun";

	/**
	 * Asset files expire header. Time in
	 * seconds.
	 * @var int
	 */
	public static int		$ASSETS_EXPIRE = 60 * 60 * 24;

	public static String	$VERSION = "2.0.0";
	public static String	$BRANCH = "dev";

	public static String	$API_SECRET = "";
	public static int		$SESSION_LIFETIME = 86400;
	public static int		$TOKEN_LIFETIME = 86400;

	public static String	$DATA_ROOT;
	public static String	$CACHE_ROOT;
	public static String	$AVATAR_ROOT;
	public static String	$IMAGES_ROOT;

	public static Array		$INCLUDES = Array(
		BASE_PATH . "/includes",
		BASE_PATH . "/includes/Metric",
		BASE_PATH . "/classes"
	);

	public static Array		$FONTS = Array(
		"Nunito" => "Nunito"
	);

	public static bool		$PRODUCTION = false;

	public static Array		$IMAGE_ALLOW = Array("png", "jpg", "webp", "gif", "tif", "jpeg", "bmp");
	public static int		$IMAGE_SIZE = 6291456;
}

CONFIG::$DATA_ROOT = $_SERVER["DOCUMENT_ROOT"] . "/data";
CONFIG::$CACHE_ROOT = CONFIG::$DATA_ROOT . "/cache";
CONFIG::$AVATAR_ROOT = CONFIG::$DATA_ROOT . "/avatars";
CONFIG::$IMAGES_ROOT = CONFIG::$DATA_ROOT . "/images";

if (!file_exists("config.php")) {
	echo "Missing configuration file (config.php)!";
	http_response_code(500);
	die();
}

require_once "config.php";