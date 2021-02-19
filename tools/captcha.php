<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /tools/captcha.php                                                                           |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";

	function generateCaptchaImage($text = "test") {
		$width = 260;
		$height = 60;
		$angle = randBetween(-15, 5);
		$xPos = (int)($width / 2) + (strlen($text) * randBetween(-16, 0));
		$yPos = (int)($height / 2) + randBetween(-8, 4);
		$sT = randBetween(-8, 8);
		$font = $_SERVER["DOCUMENT_ROOT"] ."/assets/fonts/comicbd.ttf";

		//? INIT IMAGE OBJECT
		$im = imagecreatetruecolor($width, $height);
		
		//? COLORS
		$white  = imagecolorallocate($im, 255, 255, 255);
		$gray   = imagecolorallocate($im, 188, 188, 188);
		$grey   = imagecolorallocate($im, 128, 128, 128);
		$black  = imagecolorallocate($im, 0, 0, 0);
		imagefilledrectangle($im, 0, 0, $width, $height, $white);

		//* ADD NOISE - DRAW background squares
		$squareCount = 8;
		
		for ($i = 0; $i < $squareCount; $i++) {
		  $cx = (int)rand(0, $width / 2);
		  $cy = (int)rand(0, $height);
		  $h  = $cy + (int)rand(0, $height / 5);
		  $w  = $cx + (int)rand($width / 3, $width);
		  imagefilledrectangle($im, $cx, $cy, $w, $h, $gray);
		}

		//* ADD NOISE - DRAW ELLIPSES
		$ellipseCount = 10;
		for ($i = 0; $i < $ellipseCount; $i++) {
		  $cx = (int)rand(-1 * ($width / 2), $width + ($width / 2));
		  $cy = (int)rand(-1 * ($height / 2), $height + ($height / 2));
		  $h  = (int)rand($height / 2, 2 * $height);
		  $w  = (int)rand($width / 2, 2 * $width);
		  imageellipse($im, $cx, $cy, $w, $h, $grey);
		}

		//* ADD NOISE - TEXT SHADOW
		imagettftext($im, 18, $angle, $xPos + $sT, $yPos + $sT, $grey, $font, $text);

		//* TEXT
		imagettftext($im, 18, $angle, $xPos, $yPos, $black, $font, $text);

		//* CREATE IMAGE
		contentType("png");
		imagepng($im);
		imagedestroy($im);
	}

	if (!isset($_SESSION["captcha"]) || isset($_GET["generate"]))
		$_SESSION["captcha"] = randString(8);

	generateCaptchaImage($_SESSION["captcha"]);