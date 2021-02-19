<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/hash.php                                                                                |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/hash.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";
	
	stop(0, "Success", 200, (new Hash()) -> getAllHashes(), true);