<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/avatar.php                                                                              |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	$requestMethod = $_SERVER["REQUEST_METHOD"];

	switch ($requestMethod) {
		case "GET":
			require $_SERVER["DOCUMENT_ROOT"] ."/data/avatar/get.php";

		case "POST":
			require $_SERVER["DOCUMENT_ROOT"] ."/data/avatar/change.php";
		
		default:
			// SET PAGE TYPE
			define("PAGE_TYPE", "NORMAL");
			require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";

			stop(7, "Unexpected request method: ". $requestMethod, 405, Array( "method" => $requestMethod ));
			break;
	}