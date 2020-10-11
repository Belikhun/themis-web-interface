<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /libs/config.php                                                                             |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";

	if (!defined("CONFIG_FILE"))
		define("CONFIG_FILE", $_SERVER["DOCUMENT_ROOT"] ."/data/config.json");
	
	if (!defined("CONFIG_EXCLUDE_TYPE"))
		define("CONFIG_EXCLUDE_TYPE", Array());

	if (!defined("CONFIG_STRUCTURE"))
		define("CONFIG_STRUCTURE", Array(
			"system" => Array(
				"__icon" => "server",
				"__title" => "Config",

				"emptyNote" => Array(
					"type" => "note",
					"level" => "info",
					"text" => "Đây là template mặc định của config. Thay đổi tại /module/config.php"
				)
			)
		));

	/**
	 * @return Array
	 */
	function generateDefaultConfig($child = CONFIG_STRUCTURE) {
		$parent = Array();

		if (isset($child["type"])) {
			if (in_array($child["type"], CONFIG_EXCLUDE_TYPE))
				return null;

			if (isset($child["value"]))
				return $child["value"];
		} else
			foreach ($child as $key => $value) {
				if (gettype($value) !== "array" || substr($key, 0, 2) === "__")
					continue;

				$_c = generateDefaultConfig($value);

				if ($_c !== null)
					$parent[$key] = $_c;
			}

		return $parent;
	}

	define("DEFAULT_CONFIG", generateDefaultConfig());

	if (!file_exists(CONFIG_FILE))
		(new fip(CONFIG_FILE, "{}")) -> write(DEFAULT_CONFIG, "json");

	// Get and parse config data from config file
	$config = (new fip(CONFIG_FILE, "{}")) -> read("json");
	$rawConfig = $config;
	
	function applyCustomVar(&$config) {
		if (!defined("CONFIG_CUSTOM_VAR"))
			throw new BLibException(-1, "CONFIG_CUSTOM_VAR Is not defined! Please define it in module/config.php!", 500);

		switch (gettype($config)) {
			case "array":
				foreach ($config as $key => &$value)
					applyCustomVar($value);

				break;
			
			case "string":
				foreach (CONFIG_CUSTOM_VAR as $key => $value)
					if (!empty($value))
						$config = str_replace("%". $key ."%", $value, $config);

				break;

			default:
				return;
		}
	}

	function getConfig($path, $applyVars = true) {
		global $config;
		global $rawConfig;

		//? Sanitize Path to prevent RCE
		$path = explode(".", preg_replace("/[^a-zA-Z0-9\.]+/", "", $path));

		try {
			return objectValue($config, $path);
		} catch (UndefinedIndex $e) {
			// Config not found, try to return default config
			try {
				$defaultConfig = DEFAULT_CONFIG;
				$value = objectValue($defaultConfig, $path);
				writeLog("WARN", "Cài đặt ". implode(".", $path) ." không có sẵn trong config.json". (gettype($value) !== "array" ? "hiện đang sử dụng giá trị mặc định: ". strval($value) : ""));

				if ($applyVars)
					applyCustomVar($value);

				objectValue($rawConfig, $path, $value, true);
				saveConfig($rawConfig);
				unset($defaultConfig);

				return $value;
			} catch(UndefinedIndex $e) {
				throw new BLibException(-1, "getConfig(): Không tìm thấy cài đặt ". implode(".", $path), 500, (Array) $e);
			}
		}
	}

	function saveConfig(Array $newConfig) {
		(new fip(CONFIG_FILE)) -> write($newConfig, "json");
	}

	// SET TIMEZONE
	date_default_timezone_set(getConfig("time.zone", false));