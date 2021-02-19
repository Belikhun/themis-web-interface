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
		private Cache $hashCache;
		private Array $cacheData;
		public String $id;

		public function __construct($id) {
			$this -> hashCache = new Cache("hashing", Array());
			$this -> cacheData = $this -> hashCache -> getData();
			$this -> id = $id;
		}

		public function update(String $data) {
			$this -> cacheData[$this -> id] = md5($data);
			$this -> hashCache -> save($this -> cacheData);
		}
	
		public function getAllHashes() {
			global $cacheData;
			return $cacheData;
		}
	
		public function get() {
			return (isset($this -> cacheData[$this -> id]))
				? $this -> cacheData[$this -> id]
				: null;
		}
	}