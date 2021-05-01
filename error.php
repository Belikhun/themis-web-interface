<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /error.php                                                                              |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/logger.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";

	$sv = $_SERVER["SERVER_SOFTWARE"] . " + PHP/" . phpversion();
	$sv_ar = $_SERVER["SERVER_ADDR"];
	$sv_hs = $_SERVER["HTTP_HOST"];
	$sv_pr = $_SERVER["SERVER_PROTOCOL"];
	$uri = $_SERVER["REQUEST_URI"];
	$cl_ar = getClientIP();
	$cl = $_SERVER["HTTP_USER_AGENT"];

	if (isset($_SERVER["REDIRECT_STATUS"]))
		$errCode = $_SERVER["REDIRECT_STATUS"];
	elseif (isset($_GET["code"]))
		$errCode = trim($_GET["code"]);
	else
		$errCode = 200;
	
	$errDetail = null;
	$errDetailSub = null;

	if ($errCode >= 400 && isset($_SESSION["lastError"]) || (getQuery("redirect") && isset($_SESSION["lastError"]))) {
		$lastError = $_SESSION["lastError"];
		$errData = $lastError["data"];
		$_SESSION["lastError"] = null;

		$errCode = $lastError["status"];
		http_response_code($errCode);
		$errDetail = "<b>Lỗi [". $lastError["code"] ."]:</b> <sg><i>". $lastError["description"] ."</i></sg>". (isset($errData["file"]) && isset($errData["line"]) ? (" tại <i>" . $errData["file"] . "</i> dòng " . $errData["line"]) : "");
	}

	switch ($errCode) {
		case 200:
			$error = "This is not a error";
			$description = "Who take you here?";
			$errDetailSub = "Maybe... you?";
			break;
		case 400:
			$error = "Bad Request";
			$description = "The request cannot be fulfilled due to bad syntax.";
			break;
		case 401:
			$error = "Unauthorized";
			$description = "Authentication is required and has failed or has not yet been provided.";
			$errDetailSub = "Vui lòng đăng nhập để tiếp tục";
			break;
		case 403:
			$error = "Forbidden";
			$description = "Hey, Thats illegal! You are not allowed to access <sy>$sv_hs$uri</sy>";
			$errDetailSub = "Or iS iT ?";
			break;
		case 404:
			$error = "Not Found";
			$description = "Không thể tìm thấy <sy>$sv_hs$uri</sy> trên máy chủ.";
			$errDetailSub = "thanos: <sg>*snap fingers*</sg><br>this page:<br>you:<br><img src=\"/assets/img/pikachu.jpg\" width=\"20%\" style=\"margin-top: 6px\">";
			break;
		case 405:
			$error = "Method Not Allowed";
			$description = "A request method is not supposed for the requested resource.";
			break;
		case 406:
			$error = "Not Acceptable";
			$description = "The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.";
			break;
		case 408:
			$error = "Request Timeout";
			$description = "The client did not produce a request within the time that the server was prepared to wait.";
			$errDetailSub = "The client MAY repeat the request without modifications at any later time.";
			break;
		case 414:
			$error = "URI Too Long";
			$description = "The URI provided was too long for the server to process.";
			break;
		case 429:
			$error = "Too Many Request";
			$description = "Hey, you! Yes you. Why you spam here?";
			break;
		case 500:
			$error = "Internal Server Error";
			$description = "the server did an oopsie";
			break;
		case 502:
			$error = "Bad Gateway";
			$description = "The server received an invalid response while trying to carry out the request.";
			break;
		default:
			$error = "Sample Text";
			$description = "Much strangery page, Such magically error, wow";
			break;
	}

	$errDetail = empty($errDetail) ? $errDetailSub : $errDetail;
	$reportData = null;

	if (isset($lastError) && $errCode >= 500)
		$reportData = join("\n", Array(
			"----------------BEGIN ERROR REPORT DATA----------------",
			"Protocol       : " . $sv_pr,
			"HTTP Code      : " . $errCode,
			"Error Code     : " . (isset($lastError["code"]) ? $lastError["code"] : "null"),
			"Error String   : " . $error,
			"Error Detail   : " . (isset($lastError["description"]) ? $lastError["description"] : strip_tags($description)),
			"URI            : " . (isset($errData["uri"]) ? $errData["uri"] : $uri),
			"",
			"Server         : " . $sv,
			"Client         : " . $cl,
			"",
			"ERROR DATA     : " . json_encode($lastError, JSON_PRETTY_PRINT),
			"-----------------END ERROR REPORT DATA-----------------"
		));

	try {
		// This might trigger an error as this function's
		// module might include another faulty modules
		// and then trigger another error
		writeLog("WARN", "Got statuscode \"". $errCode ." ". $error ."\" when trying to access: ". $uri);
	} catch(Exception $e) {
		// pass
	}
?>

<!DOCTYPE html>
<html lang="vi-VN">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge">

		<title><?php print $errCode ." ". $error; ?> | <?php print APPNAME ." v". VERSION; ?></title>

		<meta name="viewport" content="width=device-width, initial-scale=1">

		<!-- Primary Meta Tags -->
		<meta name="title" content="<?php print $error; ?>">
		<meta name="description" content="<?php print $description; ?>">

		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="website">
		<meta property="og:title" content="<?php print $error; ?>">
		<meta property="og:description" content="<?php print $description; ?>">

		<!-- Twitter -->
		<meta property="twitter:card" content="summary_large_image">
		<meta property="twitter:title" content="<?php print $error; ?>">
		<meta property="twitter:description" content="<?php print $description; ?>">

		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/error.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/scrollbar.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/button.css?v=<?php print VERSION; ?>" />
		
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/opensans/opensans.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/calibri/calibri.css?v=<?php print VERSION; ?>" />
	</head>

	<body>
		<div class="background"></div>
		<div class="container">
			<div class="left">
				<span class="protocol"><?php print $sv_pr; ?></span>
				<p class="code"><?php print $errCode; ?></p>
				<p class="error"><?php print $error; ?></p>
			</div>

			<div class="right">
				<p class="description"><?php print $description; ?></p>
				<p class="detail"><?php print $errDetail; ?></p>

				<?php if (!empty($reportData)) { ?>
					<t class="reportIns">Sử dụng thông tin dưới đây để báo cáo lỗi:</t>
					<textarea class="report" onclick="this.select()" readonly><?php print $reportData; ?></textarea>
				<?php } ?>
				
				<p class="info">
					Client: <?php print $cl; ?><br>
					Server: <?php print $sv; ?><br>
					Your IP: <?php print $cl_ar; ?><br>
				</p>

				<div class="button">
					<a class="sq-btn pink" href="<?php print REPORT_ERROR; ?>" target="_blank" rel="noopener">Báo Lỗi</a>
					<a class="sq-btn" href="/">Về Trang Chủ</a>
				</div>
			</div>
		</div>

		<div class="footer">
			<img src="/assets/img/icon.webp" class="icon">
			<p><?php print APPNAME; ?>. Copyright (c) <?php print AUTHOR; ?>. This project is licensed under the MIT License.</p>
		</div>

		<!-- Global site tag (gtag.js) - Google Analytics -->
		<script async src="https://www.googletagmanager.com/gtag/js?id=<?php print TRACK_ID; ?>"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag() { dataLayer.push(arguments) }
			gtag("js", new Date());

			gtag("config", `<?php print TRACK_ID; ?>`);
		</script>
	</body>
</html>