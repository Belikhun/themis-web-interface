<?php

class CONFIG extends CoreConfig {
	/**
	 * App title
	 * @var string
	 */
	public static String	$APP_NAME = "Themis Web Interface";

	/**
	 * App version
	 * @var string
	 */
	public static String	$VERSION = "2.0.0";

	/**
	 * Asset files expire header. Time in
	 * seconds.
	 * @var int
	 */
	public static int		$ASSETS_EXPIRE = 60 * 60 * 24;

	#[ConfigPathProperty]
	public static String	$AVATAR_ROOT = DATA_ROOT . "/avatars";

	public static Array		$FONTS = Array(
		"Albula" => "Albula",
		"Arial" => "Arial"
	);
}

CONFIG::$INCLUDES[] = BASE_PATH . "/includes";
CONFIG::$INCLUDES[] = BASE_PATH . "/classes";
