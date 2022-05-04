<?php
/**
 * \page.php
 * 
 * General error page.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

/** @var \Page $PAGE */
$PAGE;

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
$redirected = getParam("redirect", TYPE_BOOL, false);

if (($errCode >= 400 || $redirected) && isset($_SESSION["lastError"])) {
	$lastError = $_SESSION["lastError"];
	$errData = $lastError["data"];
	$_SESSION["lastError"] = null;

	$errCode = $lastError["status"];
	http_response_code($errCode);
	$errDetail = "<b>Lỗi [". $lastError["code"] ."]:</b> <sr><i>". $lastError["description"] ."</i></sr>". (isset($errData["file"]) && isset($errData["line"]) ? (" tại <i>" . $errData["file"] . "</i> dòng " . $errData["line"]) : "");
}

switch ($errCode) {
	case 200:
		$error = "This is not an error";
		$description = "Who take you here?";
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

if (isset($lastError) && $errCode >= 500) {
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
}

// Set Up Page
$PAGE -> css("error.css");

if (!defined("PAGE_TITLE"))
	define("PAGE_TITLE", "Lỗi $errCode");

?>

<div id="error" class="cap-width">
	<div class="content">
		<span class="protocol"><?php print $sv_pr; ?></span>
		<p class="code"><?php print $errCode; ?></p>
		<p class="error"><?php print $error; ?></p>

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

		<a href="/" class="button">Về Trang Chủ</a>
	</div>
</div>