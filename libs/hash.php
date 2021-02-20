<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /libs/hash.php                                                                               |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/cache.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";

	class Hash {
		/**
		 * Store cache object
		 * @var Cache
		 */
		private $hashCache;

		/**
		 * Store cache data
		 * @var Array
		 */
		private $cacheData;
		public $id;

		public function __construct($id = null) {
			$this -> hashCache = new Cache("hashing", Array());
			$this -> cacheData = $this -> hashCache -> getData();

			if (!empty($id))
				$this -> id = $id;
		}

		public function update(String $data) {
			if (empty($this -> id))
				return;

			$this -> cacheData[$this -> id] = md5($data);
			$this -> hashCache -> save($this -> cacheData);
		}
	
		public function getAllHashes() {
			/**
			 * This will not be updated if another Hash update it's
			 * value. Better implementation will be needed in the future
			 * as currently only the hash api is using this method
			 */
			return $this -> cacheData;
		}
	
		public function get() {
			return (isset($this -> cacheData[$this -> id]))
				? $this -> cacheData[$this -> id]
				: null;
		}
	}