<?php

class CONFIG extends CoreConfig {
	/**
	 * Page title
	 * @var String
	 */
	public static String	$APP_NAME = "Themis Web Interface";

	/**
	 * Asset files expire header. Time in
	 * seconds.
	 * @var int
	 */
	public static int		$ASSETS_EXPIRE = 60 * 60 * 24;

	#[ConfigPathProperty]
	public static String	$AVATAR_ROOT = DATA_ROOT . "/avatars";

	public static Array		$FONTS = Array(
		"LeagueSpartan" => "League Spartan",
		"BeVietnamPro" => "Be Vietnam Pro",
		"JosefinSans" => "Josefin Sans",
		"Livvic" => "Livvic",
		"Roboto" => "Roboto",
		"Signika" => "Signika",
		"WorkSans" => "Work Sans",
		"Cabin" => "Cabin",
	);
}

CONFIG::$INCLUDES[] = BASE_PATH . "/includes";
CONFIG::$INCLUDES[] = BASE_PATH . "/classes";