<?php
/**
 * ConfigStore.php
 * 
 * Config Store classes and API.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

namespace Config;

use CONFIG;
use FileIO;
use stdClass;

class StoreGroup {
	public String $title;

	/** @var StoreItem[] */
	public $items;

	public function __construct(String $title) {
		$this -> title = $title;
		$this -> items = Array();
		Store::$groups[] = $this;
	}

	public function define(
		String $name,
		String $title,
		String $description = null
	) {
		if (!property_exists("CONFIG", $name))
			throw new \CodingError("\Config\StoreGroup::define($name): config does not exist!");

		$this -> items[] = new StoreItem(
			$name,
			$title,
			gettype(CONFIG::$$name),
			$description,
		);
	}
}

class StoreItem {
	public String $name;
	public String $title;
	public String $type;
	public ?String $description = null;

	public function __construct(
		$name,
		$title,
		$type,
		$description
	) {
		$this -> name = $name;
		$this -> title = $title;
		$this -> type = $type;
		$this -> description = $description;
	}
}

class Store {
	/** @var StoreGroup[] */
	public static $groups = Array();

	/** @var FileIO */
	public static $CONFIG_FILE;

	/** @var String */
	public static $CONFIG_PATH;

	public static function init() {
		self::$CONFIG_FILE = new FileIO(self::$CONFIG_PATH, new stdClass, TYPE_JSON); 
		self::load();
	}

	/**
	 * Get all configuration names
	 * @return String[]
	 */
	protected static function names() {
		$names = Array();

		foreach (self::$groups as $group) {
			foreach ($group -> items as $item) {
				$names[] = $item -> name;
			}
		}

		return $names;
	}

	/**
	 * Get config object.
	 * @return Object
	 */
	public static function config() {
		$object = new stdClass;
		$names = self::names();
		
		foreach ($names as $name)
			$object -> $name = CONFIG::$$name;

		return $object;
	}

	public static function set(String $name, $value) {
		if (!property_exists("CONFIG", $name))
			throw new \CodingError("\Config\Store::set($name): config does not exist!");

		CONFIG::$$name = $value;
	}

	public static function load() {
		// No config groups are defined, so we better do nothing
		// from here.
		if (empty(self::$groups))
			return;

		$config = self::$CONFIG_FILE -> read(TYPE_JSON_ASSOC);

		if (empty($config)) {
			self::save();
			return;
		}

		foreach ($config as $name => $value)
			CONFIG::$$name = $value;
	}

	public static function save() {
		$config = self::config();
		self::$CONFIG_FILE -> write($config, TYPE_JSON);
	}
}
