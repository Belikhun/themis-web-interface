<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  config.php                                                                                   |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";

?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>Cài đặt | <?php print APPNAME ." v". VERSION; ?></title>
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/default.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/scrollbar.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/input.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/switch.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/table.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/button.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/slider.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/editor.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/spinner.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/menu.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/static/css/configPage.css?v=<?php print VERSION; ?>" />
	<!-- Fonts -->
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/calibri/calibri.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/nunito/nunito.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/opensans/opensans.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/consolas/consolas.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/fontawesome/fontawesome.css?v=<?php print VERSION; ?>" />
</head>

<body>
	<div id="container">
		<form id="formContainer" class="menu" action="javascript:void(0);">
			<div class="group home">
				<t class="title big">Admin Control Panel</t>
				<t class="title small">Thay đổi cài đặt hệ thống</t>

				<div class="space"></div>

				<div class="item lr info sound" data-soundhoversoft>
					<div class="left">
						<t>Danh sách các biến có sẵn</t>
						<ul class="text" style="user-select: text">
							<li><b>%name%</b>: Tên dự án</li>
							<li><b>%version%</b>: Phiên bản</li>
							<li><b>%author%</b>: Tên tác giả</li>
							<li><b>%appTitle%</b>: Tên kì thi</li>
							<li><b>%root%</b>: Thư mục gốc của hệ thống</li>
							<li><b>%currentDate%</b>: Ngày hiện tại</li>
							<li><b>%currentTime%</b>: Thời gian hiện tại</li>
						</ul>
					</div>
					<div class="right"></div>
				</div>
			</div>

			<div id="configContainer">
				<div class="group">
					<div class="item lr">
						<t class="left">Đang Tải</t>
						<div class="simpleSpinner right"></div>
					</div>
				</div>
			</div>

			<div class="group home" id="footer">
				<button id="formSubmit" type="submit" class="sq-btn green sound" data-style="round" data-soundhover data-soundselect>
					<icon class="left" data-icon="save"></icon>
					<span class="text">Lưu Thay Đổi</span>
				</button>
			</div>
		</form>
	</div>

	<script>
		const API_TOKEN = `<?php print isset($_SESSION["apiToken"]) ? $_SESSION["apiToken"] : null; ?>`;
		const USERNAME = `<?php print $_SESSION["username"]; ?>`;
	</script>
	<script src="/assets/js/belibrary.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	<script src="/assets/js/errorHandler.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	<script src="/assets/js/statusBar.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	<script src="/assets/js/sounds.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	<script src="/assets/js/tooltip.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	<script src="/assets/js/scrollable.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	<script src="/assets/js/editor.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	<script src="/assets/js/md2html.js?v=<?php print VERSION; ?>" type="text/javascript"></script>

	<script src="/static/js/config.js?v=<?php print VERSION; ?>" type="text/javascript"></script>

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