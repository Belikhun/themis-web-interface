<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  account.php                                                                                  |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";

	if ($_SESSION["id"] !== "admin")
		stop(31, "Xin lỗi! Bạn không có quyền để xem trang này.", 403);
?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>Quản lý tài khoản | <?php print APPNAME ." v". VERSION; ?></title>
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/default.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/statusBar.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/scrollBar.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/input.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/switch.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/button.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/spinner.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/menu.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/accountPage.css?v=<?php print VERSION; ?>" />
	<!-- Fonts -->
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/calibri/calibri.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/nunito/nunito.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/opensans/opensans.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/consolas/consolas.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/fontawesome/fontawesome.css?v=<?php print VERSION; ?>" />
</head>

<body id="container">
	<div class="wrapper">
		<div class="menu">
			<div class="group home">
				<t class="title big">Quản lý tài khoản</t>
				<t class="title small">Thêm, chỉnh sửa hoặc xóa tài khoản</t>

				<div class="space"></div>
			</div>

			<div class="group plus">
				<div class="item sound" data-soundhover>
					<button id="accountAdd" class="sq-btn dark sound" data-soundhover data-soundselect>Thêm một tài khoản mới</button>
				</div>

				<div id="accountAddContainer" class="accountEditor">
					<form id="accountAddEditor" class="editor" action="javascript:void(0);">
						<input type="file" class="avatarInput" id="addUserAvatar" accept="image/*">
						<label id="addAvatarPreviewContainer" class="lazyload column avatar sound" data-soundhover data-soundselect for="addUserAvatar">
							<img id="addAvatarPreview" onload="this.parentNode.dataset.loaded = 1" src="/api/avatar"/>
							<div class="simpleSpinner"></div>
						</label>
		
						<span class="column grow">
							<div class="row">
								<div class="formGroup sound userID" data-color="blue" data-soundselectsoft>
									<input id="addUserID" type="text" class="formField" autocomplete="off" placeholder="ID" required>
									<label for="addUserID">ID</label>
								</div>
		
								<div class="formGroup sound username" data-color="blue" data-soundselectsoft>
									<input id="addUserUsername" type="text" class="formField" autocomplete="off" placeholder="Tên người dùng" required>
									<label for="addUserUsername">Tên người dùng</label>
								</div>
							</div>
							
							<div class="row formGroup sound" data-color="blue" data-soundselectsoft>
								<input id="addUserPassword" type="text" class="formField" autocomplete="off" placeholder="Mật khẩu" required>
								<label for="addUserPassword">Mật khẩu</label>
							</div>
		
							<div class="row formGroup sound" data-color="blue" data-soundselectsoft>
								<input id="addUserName" type="text" class="formField" autocomplete="off" placeholder="Tên" required>
								<label for="addUserName">Tên</label>
							</div>
						</span>
		
						<span class="column">
							<button id="addSubmit" class="row sq-btn blue sound" data-soundhover data-soundselect>Thêm</button>
							<button id="addCancel" class="row sq-btn red sound" type="button" data-soundhover data-soundselect>Hủy</button>
						</span>
					</form>
				</div>
			</div>

			<div id="accountContainer">
			</div>
		</div>
	</div>

	<script>
		const API_TOKEN = `<?php print isset($_SESSION["apiToken"]) ? $_SESSION["apiToken"] : null; ?>`;
		const USERNAME = `<?php print $_SESSION["username"]; ?>`;
	</script>
	<script src="/assets/js/belibrary.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	<script src="/assets/js/errorHandler.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	<script src="/assets/js/statusBar.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	<script src="/assets/js/sounds.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
	<script src="/assets/js/account.js?v=<?php print VERSION; ?>" type="text/javascript"></script>

	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=<?php print TRACK_ID; ?>"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() { dataLayer.push(arguments) }
		gtag("js", new Date());

		gtag("config", `<?php print TRACK_ID; ?>`);
	</script>
</body>