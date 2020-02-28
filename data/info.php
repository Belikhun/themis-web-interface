<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /data/info.php                                                                               |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	// dont claim it for your own. its not nice
	define("APPNAME", "Themis Web Interface");
	define("AUTHOR", "Belikhun");
	define("VERSION", "0.6.0");
	define("VERSION_TAG", "indev");
	define("REPO_ADDRESS", "https://github.com/belivipro9x99/themis-web-interface");
	define("REPORT_ERROR", REPO_ADDRESS . "/issues");
	define("TRACK_ID", "UA-124598427-1");

	// Size Limit
	define("MAX_UPLOAD_SIZE", 10*1024*1024);
	define("MAX_IMAGE_SIZE", 2097153);
	define("MAX_ATTACHMENT_SIZE", 268435456);
	
	define("UPLOAD_ALLOW", Array("pas", "cpp", "c", "pp", "exe", "class", "py", "java"));
	define("IMAGE_ALLOW", Array("jpg", "png", "gif", "webp"));

	// Path
	define("AVATAR_DIR", $_SERVER["DOCUMENT_ROOT"] ."/data/avatar");
	define("PROBLEM_DIR", $_SERVER["DOCUMENT_ROOT"] ."/data/problems");

	// CACHE
	define("CACHE_LOCATION", $_SERVER["DOCUMENT_ROOT"] ."/.cache");
	define("CACHE_DEFAULT_AGE", 10);