<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /module/config.php                                                                           |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";

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

	if (!file_exists(CONFIG_FILE))
		(new fip(CONFIG_FILE, "{}")) -> write(generateDefaultConfig(), "json");

	// Get and parse config data from config file
	$config = (new fip(CONFIG_FILE, "{}")) -> read("json");
	$rawConfig = $config;
	date_default_timezone_set($config["time"]["zone"]);
	
	function applyCustomVar(&$config, Array $list = CONFIG_CUSTOM_VAR) {
		switch (gettype($config)) {
			case "array":
				foreach ($config as $key => &$value)
					applyCustomVar($value, $list);

				break;
			
			case "string":
				foreach ($list as $key => $value)
					if (!empty($value))
						$config = str_replace("%". $key ."%", $value, $config);

				break;

			default:
				return;
		}
	}

	function getConfig($path) {
		global $config;
		global $rawConfig;

		//? Sanitize Path to prevent RCE
		$path = explode(".", preg_replace("/[^a-zA-Z0-9\.]+/", "", $path));
		$pathStr = "";

		foreach ($path as $value)
			$pathStr .= "[\"$value\"]";

		if (eval("return isset(\$config$pathStr);"))
			return eval("return \$config$pathStr;");
		// If config not found, try to return default config
		elseif (eval("return isset(CONFIG_STRUCTURE". $pathStr ."['value']);")) {
			//! NOT SAFE, Need another implementation
			$value = eval("return CONFIG_STRUCTURE". $pathStr ."['value'];");
			writeLog("WARN", "Cài đặt ". implode(".", $path) ." không có sẵn trong config.json, hiện đang sử dụng giá trị mặc định: ". $value);
			
			eval("\$rawConfig$pathStr = \$value;");
			saveConfig($rawConfig);

			return $value;
		}

		trigger_error("getConfig(): Không tìm thấy cài đặt ". implode(".", $path));
	}

	function saveConfig(Array $newConfig) {
		(new fip(CONFIG_FILE)) -> write($newConfig, "json");
	}