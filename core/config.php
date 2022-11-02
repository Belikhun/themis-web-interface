<?php

/**
 * Property attribute that declare an config property
 * is a path. This path will be initialized if it's not
 * already.
 */
#[Attribute(Attribute::TARGET_PROPERTY)]
class ConfigPathProperty {}

/**
 * Config
 * 
 * @copyright	2022 Belikhun
 * @author		Belikhun <belivipro9x99@gmail.com>
 * @license		https://tldrlegal.com/license/mit-license MIT
 */
class CoreConfig {
	/**
	 * Page title
	 * @var String
	 */
	public static String	$APP_NAME = "My Web App";

	public static int		$SESSION_LIFETIME = 86400;
	public static int		$TOKEN_LIFETIME = 86400;

	public static String	$DB_HOST = "127.0.0.1";
	public static String	$DB_USER = "";
	public static String	$DB_PASS = "";
	public static String	$DB_NAME = "";

	#[ConfigPathProperty]
	public static String	$FILES_ROOT = DATA_ROOT . "/files";

	#[ConfigPathProperty]
	public static String	$IMAGES_ROOT = DATA_ROOT . "/images";

	#[ConfigPathProperty]
	public static String	$CACHE_ROOT = DATA_ROOT . "/caches";
	
	#[ConfigPathProperty]
	public static String	$ROUTES_ROOT = BASE_PATH . "/routes";

	public static Array		$INCLUDES = Array(
		CORE_ROOT . "/includes",
		CORE_ROOT . "/classes/Metric",
		CORE_ROOT . "/classes"
	);

	public static bool		$PRODUCTION = false;

	public static Array		$IMAGE_ALLOW = Array("png", "jpg", "webp", "gif", "tif", "jpeg", "bmp");
	public static int		$IMAGE_SIZE = 6291456;
}