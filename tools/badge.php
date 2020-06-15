<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /tools/badge.php                                                                             |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/badge.php";

	$style = getQuery("s", "for-the-badge");
	$subject = getQuery("su", "badge generator by");
	$status = getQuery("st", "Belikhun");
	$color = getQuery("c", "brightgreen");
	
	print createBadge(Array(
		"style" => $style,
		"color" => $color,
		"subject" => $subject,
		"status" => $status
	));