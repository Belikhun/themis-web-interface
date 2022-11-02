<?php

/**
 * Cache.php
 * 
 * Cache files interface.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class Cache {
	public static String $CACHE_LOCATION;
	public String $id;
	public \Cache\Data $data;
	public String $file;
	public String $path;
	private FileIO $stream;
	private \Cache\Data $default;

	public function __construct($id, $defaultData = null) {
		$this -> id = $id;
		$this -> file = $this -> id . ".cache";
		$this -> path = self::$CACHE_LOCATION ."/". $this -> file;

		$this -> default = new \Cache\Data();
		$this -> default -> id = $this -> id;
		$this -> default -> content = $defaultData;

		$this -> fetch();
	}

	private function fetch() {
		$this -> stream = new FileIO(
			$this -> path,
			$this -> default,
			TYPE_SERIALIZED
		);

		try {
			/** @var Array */
			$this -> data = $this -> stream -> read(TYPE_SERIALIZED);
		} catch(Throwable) {
			// Discard file and create new one.
			$this -> save($this -> default);
			$this -> data = $this -> default;
		}
	}

	public function setAge(int $age) {
		$this -> data -> age = $age;
	}

	/**
	 * Validate Cache Age.
	 * Return `true` if cache lifetime is within set age.
	 * 
	 * @return Boolean
	 */
	public function validate() {
		return (time() - $this -> data -> time) < $this -> data -> age;
	}

	public function getData() {
		return $this -> data -> content;
	}

	public function save($data) {
		if (!empty($data))
			$this -> data -> content = $data;

		$this -> data -> time = time();
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