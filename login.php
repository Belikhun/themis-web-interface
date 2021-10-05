<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  login.php                                                                                    |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "NORMAL");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";
	header("Cache-Control: max-age=0, must-revalidate", true);

?>

<!DOCTYPE html>
<html lang="vi-VN">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>Đăng nhập</title>

		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/default.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/button.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/input.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/progressBar.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/scrollbar.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/spinner.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/static/css/login.css?v=<?php print VERSION; ?>" />

		<!-- Fonts -->
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/calibri/calibri.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/nunito/nunito.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/opensans/opensans.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/consolas/consolas.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/fontawesome/fontawesome.css?v=<?php print VERSION; ?>" />
	</head>

	<body>
		<div id="splash">
			<div class="spinner"></div>
		</div>

		<div id="container"></div>

		<script src="/assets/js/belibrary.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/assets/js/errorHandler.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/assets/js/sounds.js?v=<?php print VERSION; ?>" type="text/javascript"></script>

		<script src="/static/js/init.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/static/js/login.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	</body>
</html>