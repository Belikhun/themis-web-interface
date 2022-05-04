<?php
define("CACHE_AGE_INF", -1);

/**
 * \Cache.php
 * 
 * Cache Interface/Object
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class Cache {
	public static int $CACHE_AGE = CACHE_AGE_INF;
	public static String $CACHE_LOCATION;

	public $id;
	public $data = Array();
	public $file;
	public $path;
	
	/** @var FileIO */
	private $stream;

	private $template = Array(
		"id" => "",
		"age" => CACHE_AGE_INF,
		"time" => 0,
		"data" => null
	);

	public function __construct($id, $defaultData = null) {
		$this -> id = $id;
		$this -> file = $this -> id . ".cache";
		$this -> path = self::$CACHE_LOCATION ."/". $this -> file;
		$this -> template["id"] = $this -> id;
		$this -> template["data"] = $defaultData;

		$this -> fetch();
	}

	private function fetch() {
		$this -> stream = new FileIO(
			$this -> path,
			$this -> template,
			TYPE_SERIALIZED
		);

		try {
			$this -> data = $this -> stream -> read(TYPE_SERIALIZED);
		} catch(Throwable) {
			// Discard file and create new one.
			$this -> save($this -> template);
		}
	}

	public function setAge(int $age) {
		$this -> data["age"] = $age;
	}

	/**
	 * Validate Cache Age.
	 * Return `true` if cache lifetime is within set age.
	 * 
	 * @return Boolean
	 */
	public function validate() {
		return (time() - $this -> data["time"]) < $this -> data["age"];
	}

	public function getData() {
		return $this -> data["data"];
	}

	public function save($data) {
		if (isset($data))
			$this -> data["data"] = $data;

		$this -> data["time"] = time();
		$this -> stream -> write($this -> data, TYPE_SERIALIZED);
	}

	public static function remove(String $id) {
		$path = self::$CACHE_LOCATION . "/{$id}.cache";
		
		if (file_exists($path))
			unlink($path);
	}

	public static function clearAll() {
		$counter = 0;

		if (file_exists(self::$CACHE_LOCATION)) {
			$di = new RecursiveDirectoryIterator(self::$CACHE_LOCATION, FilesystemIterator::SKIP_DOTS);
			$ri = new RecursiveIteratorIterator($di, RecursiveIteratorIterator::CHILD_FIRST);

			foreach ($ri as $file) {
				$file -> isDir() ? rmdir($file) : unlink($file);
				$counter += 1;
			}
		}

		return $counter;
	}
}

Cache::$CACHE_LOCATION = &\CONFIG::$CACHE_ROOT;