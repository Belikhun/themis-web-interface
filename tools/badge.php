<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /tools/badge.php                                                                             |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/badge.php";

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