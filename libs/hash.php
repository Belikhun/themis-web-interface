<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /libs/hash.php                                                                               |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";

	$hashCache = new Cache("hashing", Array());
	$cacheData = $hashCache -> getData();

	function updateHash(String $id, String $value) {
		global $cacheData, $hashCache;
		$cacheData[$id] = md5($value);
		$hashCache -> save($cacheData);
	}

	function getAllHashes() {
		global $cacheData;
		return $cacheData;
	}

	function getHash(String $id) {
		global $cacheData;
		return (isset($cacheData[$id])) ? $cacheData[$id] : null;
	}