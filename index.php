<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  index.php                                                                                    |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "NORMAL");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";
	header("Cache-Control: max-age=0, must-revalidate", true);

	define("LAN_ADDR", getHostByName(getHostName()));

	$loggedIn = false;
	$username = null;
	$userdata = null;
	$name = null;
	$id = null;

	if (isLoggedIn()) {
		require_once $_SERVER["DOCUMENT_ROOT"] ."/module/account.php";
		$loggedIn = true;
		$username = $_SESSION["username"];
		
		$userdata = (new account($username)) -> data;
		$name = $userdata["name"];
		$id = $userdata["id"];
	}

	$stripedContestDescription = strip_tags(getConfig("contest.description"));
?>

	<!DOCTYPE html>
	<html lang="vi-VN">

	<head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		<!-- Thay đổi tiêu đề trang hiện đã có trong phần Admin Control Panel -->
		<title><?php print getConfig("contest.name"); ?> | <?php print APPNAME ." v". VERSION; ?></title>

		<!-- Primary Meta Tags -->
		<meta name="title" content="<?php print getConfig("contest.name"); ?>">
		<meta name="description" content="<?php print $stripedContestDescription; ?>">

		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="website">
		<meta property="og:title" content="<?php print getConfig("contest.name"); ?>">
		<meta property="og:description" content="<?php print $stripedContestDescription; ?>">

		<!-- Twitter -->
		<meta property="twitter:card" content="summary_large_image">
		<meta property="twitter:title" content="<?php print getConfig("contest.name"); ?>">
		<meta property="twitter:description" content="<?php print $stripedContestDescription; ?>">

		<!-- Load Library First -->
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/default.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/splash.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/progressBar.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/button.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/input.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/textView.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/table.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/switch.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/slider.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/navbar.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/menu.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/spinner.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/statusBar.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/scrollBar.css?v=<?php print VERSION; ?>" />
		<!-- Page Style -->
		<link rel="stylesheet" type="text/css" media="screen" href="/static/css/core.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/static/css/dark.css?v=<?php print VERSION; ?>" />
		<!-- Fonts -->
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/calibri/calibri.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/opensans/opensans.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/nunito/nunito.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/consolas/consolas.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/fontawesome/fontawesome.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/materialicons/materialicons.css?v=<?php print VERSION; ?>" />
	</head>

	<body class="<?php print ($loggedIn ? ($id === 'admin' ? 'admin' : 'user') : 'guest'); ?>">

		<!-- Init Library and Splash First -->
		<script src="/assets/js/belibrary.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/assets/js/errorHandler.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script type="text/javascript" src="/assets/js/splash.js?v=<?php print VERSION; ?>"></script>
		<script type="text/javascript">
			var mainSplash = new splash(document.body, `<?php print getConfig("contest.name"); ?>`, `<?php print $stripedContestDescription; ?>`, "/api/images/icon");

			mainSplash.init = async set => {
				set(0, "Initializing core.js?v=<?php print VERSION; ?>");
				await core.init(set);
			}

			mainSplash.postInit = async set => {
				set(50, "Đang kiểm tra phiên bản mới");
				await core.checkUpdateAsync(IS_ADMIN);

				set(60, "Setting up statusBar");
				sbar.additem(SERVER.SERVER_SOFTWARE, "server");
				sbar.additem(SERVER.SERVER_ADDR, "globe");
				sbar.additem(SERVER.username ? SERVER.username : "Chưa đăng nhập", "account", {align: "right"});
				sbar.additem(SERVER.REMOTE_ADDR, "desktop", {align: "right"});

				set(95, "Sending Analytics Data...");
				gtag("event", "pageView", {
					version: SERVER.version,
					hostname: location.hostname,
					loadtime: ((new Date()).getTime() - window.performance.timing.navigationStart) / 1000,
					downlink: (navigator && navigator.connection) ? navigator.connection.downlink : 0,
					versiontag: SERVER.versionTag,
					contestname: SERVER.contestName,
					platform: (navigator) ? navigator.platform : null,
					darkmode: cookie.get("__darkMode"),

					event_category: "load",
					event_label: "scriptInitialized",
					send_to: "default",
					event_callback: () => clog("INFO", "Analytics data sent!")
				});
			}

			mainSplash.onErrored = async (error, e, d) => {
				if (cookie.get("splashInitSuccess", true) === "false")
					if (popup.initialized) {
						let errorDetail = document.createElement("ul");
						let errorDetailHtml = "";
						let stack = (error.data && error.data.stack) || error.stack || null

						errorDetailHtml = stack
							? stack
								.split("\n")
								.map(i => `<li>${i}</li>`)
								.join("")
							: `<li>${e} >>> ${d}</li>`;
						
						errorDetail.classList.add("textView", "small");
						errorDetail.style.flexDirection = "column";
						errorDetail.innerHTML = errorDetailHtml;

						let action = await popup.show({
							windowTitle: "Lỗi",
							title: "Toang rồi ông Giáo ạ!",
							message: "Lỗi Vẫn Đang Tiếp Diễn",
							description: "Hãy thử <b>tải lại</b> trang hoặc sử dụng thông tin dưới đây để gửi một báo cáo lỗi:",
							level: "error",
							customNode: errorDetail,
							buttonList: {
								report: {
									text: "Báo lỗi",
									color: "pink",
									resolve: false,
									onClick: () => window.open(SERVER.REPORT_ERROR, "_blank")
								},
								reload: { text: "Tải lại", color: "blue" },
								close: { text: "Đóng", color: "dark" }
							}
						})

						switch (action) {
							case "reload":
								location.reload();
								break;
						}
						
					} else
						alert(error);
			}
		</script>

		<!-- Main Content -->

		<div id="navBar" class="navBar showBottom">
			<div class="top">
				<span class="left">
					<img class="icon" src="/api/images/icon" />
					<ul class="title">
						<li class="main text-overflow">
							<?php print getConfig("contest.name"); ?>
						</li>
						<li class="sub text-overflow">
							<?php print getConfig("contest.description"); ?>
						</li>
					</ul>
				</span>
				<span id="userSettingsToggler" class="right">
					<?php if ($loggedIn) { ?>
						<ul class="info">
							<li class="tag text-overflow">
								<?php print $username ."#". $id; ?>
							</li>
							<li id="userName" class="name text-overflow">
								<?php print htmlspecialchars($name); ?>
							</li>
						</ul>
						<img id="userAvatar" class="avatar" src="/api/avatar?u=<?php print $username; ?>" />
					<?php } ?>
					<span class="hamburger">
						<span></span>
						<span></span>
						<span></span>
					</span>
				</span>
			</div>

			<div id="contestTimer" class="bottom contestTimer">
				<t id="contestTimeState">IDLE</t>
				<separator></separator>
				<timer id="contestTime"><days>00</days>+00:00:00<ms>000</ms></timer>
				<separator></separator>
				<span id="contestTimeReload" class="materialIcons reload sound" title="Làm mới" data-soundhover data-soundselect>refresh</span>

				<div class="progressBar">
					<div class="bar" id="timeProgress"></div>
					<t class="left" id="timeStart">--:--</t>
					<t class="right" id="timeEnd">--:--</t>
				</div>
			</div>
		</div>

		<span id="userSettings" class="sound" data-soundtoggle="show">
			<div class="main">
				<div class="container menu">

					<div class="group user userCard">
						<style scoped="scoped" onload="triBg(this.parentElement, { color: 'dark' })"></style>
						<span class="left">
							<input id="usett_avatarInput" type="file">

							<label for="usett_avatarInput" class="avatarBox sound" data-soundhover data-soundselect title="Nhấn hoặc thả ảnh vào đây để thay đổi ảnh đại diện">
								<img id="usett_avatar" class="avatar" src="/api/avatar?u=admin" />

								<div id="usett_avatarWrapper" class="wrapper">
									<i class="pencil"></i>
									<i class="drag"></i>
									<div class="material-spinner">
										<svg><circle cx="50%" cy="50%" r="20" fill="none"/></svg>
									</div>
								</div>
							</label>

							<span class="status" data-status="online">
								<span class="mark"></span>
								<t class="statusText">Online</t>
							</span>
						</span>

						<span class="right">
							<t class="name">Sample Name</t>
							<t class="username">belivipro9x99</t>
							<separator></separator>
						</span>
					</div>

					<div class="group home">
						<t class="title big center">Cài Đặt</t>
						<t class="title small center">Thay đổi thiết đặt chung tại đây</t>

						<div class="space"></div>

						<div id="unsecureProtocolWarning" class="item lr warning sound" style="display: none;" data-soundhoversoft>
							<t class="left">
								Kết nối của bạn tới máy chủ hiện không an toàn vì bạn đang sử dụng phương thức giao tiếp không bảo mật <b>HTTP</b><br>
								Người trong cùng mạng của bạn hiện có thể đánh cắp thông tin tài khoản và bài làm của bạn!<br>
								<br>
								Vui lòng liên hệ <b>Admin</b> để khắc phục lỗi này!
							</t>
							<div class="right"></div>
						</div>
					</div>

					<div class="group file">
						<t class="title">Tải về</t>

						<div id="settings_publicFilesToggler" class="item arr sound" data-soundhover>Các tệp công khai</div>
					</div>

					<?php if (!$loggedIn) { ?>
						<div class="group user">
							<t class="title">Tài Khoản</t>
							<div class="item form">
								<button class="sq-btn yellow sound" style="width: 100%;" data-soundhover data-soundselect onclick="window.location.href='/login.php'">Đăng Nhập / Đăng Kí</button>
							</div>
						</div>
					<?php } ?>

					<div id="usett_userPanel" class="group user">
						<t class="title">Tài Khoản</t>
						<t class="title small">Thông tin</t>

						<div class="item avatar sound" data-soundhoversoft>
							<input id="usett_avtinp" type="file">
							<label for="usett_avtinp" class="avatar sound" data-soundhover data-soundselect title="Nhấn hoặc thả ảnh vào đây để thay đổi ảnh đại diện">
								<img id="usett_avt" class="avatar" src="<?php print $loggedIn ? '/api/avatar?u='. $username : ''; ?>" />
								<div id="usett_avtw" class="wrapper">
									<i class="pencil"></i>
									<i class="drag"></i>
									<div class="material-spinner">
										<svg><circle cx="50%" cy="50%" r="20" fill="none"/></svg>
									</div>
								</div>
							</label>

							<div class="info">
								<t class="left">Tên thí sinh</t>
								<t id="usett_name" class="right"><?php print htmlspecialchars($name); ?></t>
							</div>

							<div class="info">
								<t class="left">Tên tài khoản</t>
								<t class="right"><?php print $username; ?></t>
							</div>

							<div class="info">
								<t class="left">Mã số (ID)</t>
								<t class="right"><?php print $id; ?></t>
							</div>
						</div>

						<t class="title small">Đổi tên</t>

						<div class="item lr info sound" data-soundhoversoft>
							<t class="left">Tên được phép sử dụng tất cả các kí tự và có độ dài không vượt quá <b>34 kí tự</b></t>
							<div class="right"></div>
						</div>

						<div class="item form sound" data-soundhoversoft>
							<form id="usett_edit_name_form" autocomplete="off" action="javascript:void(0);">
								<div class="formGroup sound" data-color="blue" data-soundselectsoft>
									<input id="usett_edit_name" type="text" class="formField" placeholder="Tên" maxlength="34" required>
									<label for="usett_edit_name">Tên</label>
								</div>
								<button type="submit" class="sq-btn sound" data-soundhover data-soundselect>Thay đổi</button>
							</form>
						</div>

						<t class="title small">Đổi mật khẩu</t>

						<div class="item form sound" data-soundhoversoft>
							<form id="usett_edit_pass_form" action="javascript:void(0);">
								<input type="text" autocomplete="username" value="<?php print $username; ?>" style="display: none">
								<div class="formGroup sound" data-color="blue" data-soundselectsoft>
									<input id="usett_edit_pass" type="password" autocomplete="current-password" class="formField" placeholder="Mật khẩu" required>
									<label for="usett_edit_pass">Mật khẩu</label>
								</div>
								<div class="formGroup sound" data-color="blue" data-soundselectsoft>
									<input id="usett_edit_npass" type="password" autocomplete="new-password" class="formField" placeholder="Mật khẩu mới" required>
									<label for="usett_edit_npass">Mật khẩu mới</label>
								</div>
								<div class="formGroup sound" data-color="blue" data-soundselectsoft>
									<input id="usett_edit_renpass" type="password" autocomplete="new-password" class="formField" placeholder="Nhập lại mật khẩu mới" required>
									<label for="usett_edit_renpass">Nhập lại mật khẩu mới</label>
								</div>
								<button type="submit" class="sq-btn sound" data-soundhover data-soundselect>Thay đổi</button>
							</form>
						</div>

						<t class="title small">Đăng xuất</t>

						<div class="item logout">
							<button id="usett_logout" class="sq-btn pink sound" data-soundhover data-soundselect>Đăng Xuất</button>
						</div>

					</div>

					<div class="group tools">
						<t class="title">Cài Đặt</t>

						<t class="title small">Hiển thị</t>

						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Chế độ ban đêm</t>
							<label class="sq-checkbox pink right">
								<input id="usett_nightMode" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>
						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Hoạt ảnh</t>
							<label class="sq-checkbox blue right">
								<input id="usett_transition" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>
						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Hiện millisecond</t>
							<label class="sq-checkbox blue right">
								<input id="usett_millisecond" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>
						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Thông báo</t>
							<label class="sq-checkbox pink right">
								<input type="checkbox" class="sound" data-soundcheck disabled>
								<span class="checkmark"></span>
							</label>
						</div>

						<div class="space"></div>

						<t class="title small">Âm Thanh</t>
						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Bật âm thanh</t>
							<label class="sq-checkbox pink right">
								<input id="usett_btn_sound_toggle" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>

						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Mouse Hover Sound</t>
							<label class="sq-checkbox right">
								<input id="usett_btn_sound_mouse_hover" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>

						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Button Click/Toggle Sound</t>
							<label class="sq-checkbox right">
								<input id="usett_btn_sound_button_click" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>

						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Panel Show/Hide Sound</t>
							<label class="sq-checkbox right">
								<input id="usett_btn_sound_panel_toggle" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>

						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Others</t>
							<label class="sq-checkbox right">
								<input id="usett_btn_sound_others" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>

						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Notification Sound</t>
							<label class="sq-checkbox right">
								<input id="usett_btn_sound_notification" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>

						<div class="space"></div>
						
						<t class="title small">Khác</t>

						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Mở Đề Bài trong hộp thoại</t>
							<label class="sq-checkbox blue right">
								<input id="usett_dialogProblem" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>

						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Tự động cập nhật Xếp Hạng</t>
							<label class="sq-checkbox blue right">
								<input id="usett_enableRankingUpdate" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>

						<div class="item lr sound" data-soundhoversoft>
							<t class="left">Tự động cập nhật Nhật Ký</t>
							<label class="sq-checkbox pink right">
								<input id="usett_enableLogsUpdate" type="checkbox" class="sound" data-soundcheck>
								<span class="checkmark"></span>
							</label>
						</div>

						<div class="item sound" data-soundhoversoft>
							<div class="lr">
								<t class="left">Thời gian làm mới</t>
								<t id="usett_udelay_text" class="right">0000 ms/request</t>
							</div>
							<input type="range" id="usett_udelay_slider" class="sq-slider blue sound" data-soundselectsoft data-soundchange min="1" max="10" step="1">
						</div>
						<t class="item lr warning sound" data-soundhoversoft>
							<t class="left"><b>Lưu Ý: </b>Đặt thời gian làm mới quá nhỏ sẽ khiến bạn dễ dàng bị phạt <i>(cụ thể là bị ratelimited)</i> trong một khoảng thời gian nhất định.</t>
							<div class="right"></div>
						</t>

						<div class="space"></div>
					</div>

					<div id="usett_adminConfig" class="group config">
						<t class="title">Admin</t>

						<t class="title small">Địa chỉ máy chủ</t>
						<div class="item lr">
							<t class="left">Mạng cục bộ (LAN):</t>
							<t class="right" style="user-select: text;"><?php print LAN_ADDR; ?></t>
						</div>

						<div class="space"></div>

						<t class="title small">Cài đặt</t>
						<div id="settings_cPanelToggler" class="item arr sound" data-soundhover>Admin Control Panel</div>
						<div id="settings_accountEditorToggler" class="item arr sound" data-soundhover>Quản lý tài khoản</div>
						<div id="settings_problemToggler" class="item arr sound" data-soundhover>Chỉnh Sửa Đề Bài</div>
						<div id="settings_syslogsToggler" class="item arr sound" data-soundhover>Nhật Ký Hệ Thống</div>
					</div>

					<div class="group link">
						<t class="title">Liên Kết Ngoài</t>
						<a class="item sound" data-soundhover data-soundselect href="<?php print REPORT_ERROR; ?>" target="_blank" rel="noopener">Báo lỗi</a>
						<a class="item sound" data-soundhover data-soundselect href="<?php print REPO_ADDRESS; ?>/wiki" target="_blank" rel="noopener">Wiki</a>
						<a class="item sound" data-soundhover data-soundselect href="<?php print REPO_ADDRESS; ?>" target="_blank" rel="noopener">Source Code</a>
					</div>

					<div class="group info">
						<t class="title">Thông tin Dự án</t>
						<div id="usett_aboutToggler" class="item arr sound" data-soundhover>Thông tin</div>
						<div id="usett_licenseToggler" class="item arr sound" data-soundhover>LICENSE</div>

						<div class="space"></div>
						<t class="title small">Copyright © 2018-2020 <a href="https://github.com/belivipro9x99" target="_blank" rel="noopener">Belikhun</a>. This project is licensed under the MIT License. See <a href="/LICENSE" target="_blank" rel="noopener">LICENSE</a> for more information.</t>
					</div>

				</div>
				
			</div>
			
			<div id="usett_panelContainer" class="sub">
				<!-- ========= IMPORTANT: THIS ELEMENT NEED TO BE AT THE TOP OF THIS CONTAINER ========= -->
				<div id="usett_panelUnderlay" class="underlay"></div>
				<!-- ========= IMPORTANT: THIS ELEMENT NEED TO BE AT THE TOP OF THIS CONTAINER ========= -->

				<div id="usett_publicFilesPanel" data-soundtoggle="show" class="panel large sound">
					<div class="container">
						<div class="btn-group">
							<span class="reload sound" data-soundhover data-soundselect></span>
							<span class="close sound" data-soundhover></span>
							<span class="sound" data-soundhover data-soundselect></span>
						</div>
						<div class="main">
							<iframe class="publicFiles-container" src="/public"></iframe>
						</div>
					</div>
				</div>

				<div id="settings_problem" data-soundtoggle="show" class="panel sound">
					<div class="container">
						<div class="btn-group">
							<span class="reload sound" data-soundhover data-soundselect></span>
							<span class="close sound" data-soundhover></span>
							<span class="sound" data-soundhover data-soundselect></span>
						</div>

						<div class="main problemSettings">
							<div class="header">
								<div class="left">
									<span id="problemEdit_btn_back" class="back sound" data-soundhover></span>
								</div>
								<t id="problemEdit_title" class="title">Danh sách</t>
								<div class="right">
									<span id="problemEdit_btn_add" class="add sound" data-soundhover></span>
									<span id="problemEdit_btn_check" class="check sound" data-soundhover></span>
								</div>
							</div>
							<div class="problemsContainer">
								<ul id="problemEdit_list" class="problemsList sound" data-soundtoggle="hide"></ul>
								<form id="problemEdit_form" class="problem" action="javascript:void(0);" autocomplete="off">
									<div class="formGroup" data-color="blue">
										<input id="problemEdit_id" type="text" class="formField sound" placeholder="Tên Tệp" data-soundselectsoft required>
										<label for="problemEdit_id">Mã Đề</label>
									</div>
									<div class="formGroup" data-color="blue">
										<input id="problemEdit_name" type="text" class="formField sound" placeholder="Tên Bài" data-soundselectsoft required>
										<label for="problemEdit_name">Tên Bài</label>
									</div>
									<div class="formGroup" data-color="blue">
										<input id="problemEdit_point" type="number" class="formField sound" placeholder="Điểm" data-soundselectsoft required>
										<label for="problemEdit_point">Điểm</label>
									</div>
									<div class="formGroup" data-color="blue">
										<input id="problemEdit_time" type="number" class="formField sound" placeholder="Thời gian chạy" value="1" data-soundselectsoft required>
										<label for="problemEdit_time">Thời gian chạy</label>
									</div>
									<div class="formGroup" data-color="blue">
										<input id="problemEdit_mem" type="number" class="formField sound" placeholder="Giới hạn bộ nhớ" value="1024" data-soundselectsoft required>
										<label for="problemEdit_mem">Giới hạn bộ nhớ</label>
									</div>
									<div class="formGroup" data-color="blue">
										<input id="problemEdit_inpType" type="text" class="formField sound" placeholder="Dữ liệu vào" value="Bàn Phím" data-soundselectsoft required>
										<label for="problemEdit_inpType">Dữ liệu vào</label>
									</div>
									<div class="formGroup" data-color="blue">
										<input id="problemEdit_outType" type="text" class="formField sound" placeholder="Dữ liệu ra" value="Màn Hình" data-soundselectsoft required>
										<label for="problemEdit_outType">Dữ liệu ra</label>
									</div>
									<div class="formGroup" data-color="blue">
										<input id="problemEdit_accept" type="text" class="formField sound" placeholder="Đuôi tệp" value="pas|py|cpp|java" data-soundselectsoft required>
										<label for="problemEdit_accept">Đuôi tệp (dùng | để ngăn cách)</label>
									</div>
									<div class="formGroup" data-color="blue">
										<input id="problemEdit_image" type="file" class="formField sound" accept="image/*" placeholder="Ảnh" data-soundselectsoft>
										<label for="problemEdit_image">Ảnh đính kèm (tùy chọn)</label>
									</div>
									<button class="sq-btn pink" id="problemEdit_deleteImage" type="button">Xóa ảnh đính kèm hiện tại</button>
									<div class="formGroup" data-color="blue">
										<textarea id="problemEdit_desc" class="formField sound" placeholder="Nội dung" data-soundselectsoft required></textarea>
										<label for="problemEdit_desc">Nội dung</label>
									</div>
									<div class="note info">
										<span class="inner">Nếu tệp đính kèm là <b>pdf</b>, hệ thống sẽ hiển thị tệp đó trong cửa sổ xem đề bài</span>
									</div>
									<div class="formGroup" data-color="blue">
										<input id="problemEdit_attachment" type="file" class="formField sound" placeholder="Tệp đính kèm" data-soundselectsoft>
										<label for="problemEdit_attachment">Tệp đính kèm (tùy chọn)</label>
									</div>
									<button class="sq-btn pink" id="problemEdit_deleteAttachment" type="button">Xóa tệp đính kèm hiện tại</button>
									<div class="test-container sound" data-soundhoversoft data-soundselectsoft>
										<t class="test">Test ví dụ</t>
										<div class="test-list" id="problemEdit_test_list"></div>
										<span class="test-add" id="problemEdit_test_add"></span>
									</div>
									<button id="problemEdit_submit" type="submit"></button>
								</form>
							</div>
						</div>
					</div>
				</div>

				<div id="settings_controlPanel" data-soundtoggle="show" class="panel large sound">
					<div class="container">
						<div class="btn-group">
							<span class="reload sound" data-soundhover data-soundselect></span>
							<span class="close sound" data-soundhover></span>
							<span class="custom sound" data-soundhover data-soundselect></span>
						</div>
						<div class="main">
							<iframe class="cpanel-container" src=""></iframe>
						</div>
					</div>
				</div>

				<div id="settings_accountEditor" data-soundtoggle="show" class="panel large sound">
					<div class="container">
						<div class="btn-group">
							<span class="reload sound" data-soundhover data-soundselect></span>
							<span class="close sound" data-soundhover></span>
							<span class="custom sound" data-soundhover data-soundselect></span>
						</div>
						<div class="main">
							<iframe class="cpanel-container" src=""></iframe>
						</div>
					</div>
				</div>

				<div id="settings_syslogs" data-soundtoggle="show" class="panel large sound">
					<div class="container">
						<div class="btn-group">
							<span class="reload sound" data-soundhover data-soundselect></span>
							<span class="close sound" data-soundhover></span>
							<span class="custom delete sound" data-soundhover data-soundselect></span>
						</div>
						<div class="main syslogs-settings">
							<div class="logsContainer showEmpty"></div>
							<div class="navigation">
								<span class="left"></span>
								<span class="middle">
									 <span class="icon buttonLeft sound" data-soundhover data-soundselect></span>
									 <span class="currentPage"></span>
									 <span class="icon buttonRight sound" data-soundhover data-soundselect></span>
								</span>
								<span class="right"></span>
							</div>
						</div>
					</div>
				</div>

				<div id="usett_aboutPanel" data-soundtoggle="show" class="panel sound">
					<div class="container">
						<div class="btn-group">
							<span class="reload sound" data-soundhover data-soundselect></span>
							<span class="close sound" data-soundhover></span>
							<span class="custom sound" data-soundhover data-soundselect></span>
						</div>
						<div class="main">
							<footer>
								<div class="header">
									<div class="logo"></div>
									<t class="title"><?php print APPNAME; ?></t>
									<t class="version">v<?php print VERSION."-".VERSION_TAG; ?></t>
									<t class="subtitle">Made from scratch, crafted with <font color="red">❤</font> by Belikhun</t>

									<div class="button">
										<button class="sq-btn rainbow sound" data-soundhover data-soundselect onclick="core.getRandomMeme()">memes uwu</button>
										<button class="sq-btn pink sound" data-soundhover data-soundselect>(╯°□°）╯︵ ┻━┻</button>
									</div>
								</div>

								<table class="simpleTable">
									<tbody>
										<tr>
											<th>Local</th>
											<th>Github</th>
										</tr>
										<tr>
											<td id="about_localVersion">0.0.0</td>
											<td id="about_githubVersion">0.0.0</td>
										</tr>
									</tbody>
								</table>

								<div class="badge">
									<a href="<?php print REPO_ADDRESS; ?>/releases/" target="_blank" rel="noopener"><img src="/tools/badge?su=<?php print VERSION_TAG; ?>&st=v<?php print VERSION; ?>&c=brightgreen"></a>
									<img src="/tools/badge?su=license&st=MIT&c=orange">
									<img src="/tools/badge?su=status&st=near stable&c=blue">
									<img src="/tools/badge?su=author&st=Belikhun&c=red">
								</div>
								
								<t class="description"><b><?php print APPNAME; ?></b> là một dự án mã nguồn mở, phi lợi nhuận với mục đích chính nhằm biến việc quản lí và tổ chức các buổi học lập trình, ôn tập tin học và tổ chức kì thi trở nên dễ dàng hơn.</t>
								
								<t class="contact">Liên hệ:</t>
								<ul class="contact">
									<li class="tel">0368275002</li>
									<li class="email">belivipro9x99@gmail.com</li>
									<li class="facebook">
										<a href="https://www.facebook.com/belivipro9x99" target="_blank" rel="noopener">Belikhun</a>
									</li>
									<li class="github">
										<a href="https://github.com/belivipro9x99" target="_blank" rel="noopener">Belikhun</a>
									</li>
								</ul>
							</footer>
						</div>
					</div>
				</div>

				<div id="usett_licensePanel" data-soundtoggle="show" class="panel large sound">
					<div class="container">
						<div class="btn-group">
							<span class="reload sound" data-soundhover data-soundselect></span>
							<span class="close sound" data-soundhover></span>
							<span class="custom sound" data-soundhover data-soundselect></span>
						</div>
						<div class="main">
							<iframe class="cpanel-container" src="/licenseInfo.php"></iframe>
						</div>
					</div>
				</div>
			</div>

		</span>

		<div id="wrapper">
			<panel id="wrapperPanel">
				<div class="head">
					<t class="le"></t>
					<span class="ri">
						<i class="materialIcons ref sound" title="Làm mới" data-soundhover data-soundselect>refresh</i>
						<i class="materialIcons clo sound" title="Đóng" data-soundhover data-soundselect>close</i>
					</span>
				</div>
				<div class="main">
				</div>
			</panel>
		</div>

		<div id="container">
			<div class="flexRow">
				<span class="flexColumn large">
					<panel id="problemp">
						<div class="head">
							<t class="le">Đề bài</t>
							<span class="ri">
								<i class="materialIcons bak sound" title="Quay lại" data-soundhover>keyboard_arrow_left</i>
								<i class="materialIcons ref sound" title="Làm mới" data-soundhover data-soundselect>refresh</i>
								<i class="materialIcons clo sound" title="Đóng" data-soundhover data-soundselect>close</i>
							</span>
						</div>
						<div class="main problemsContainer">
							<div class="problemsList showEmpty sound" data-soundtoggle="hide" id="problemsList">
							</div>
							<div class="problem">
								<t class="name" id="problem_name"></t>
								<t class="point" id="problem_point"></t>
								<span class="enlarge sound" id="problemViewerEnlarge" title="Phóng to" data-soundhoversoft data-soundselectsoft></span>
								<span class="close sound" id="problemViewerClose" title="Đóng" data-soundhoversoft data-soundselectsoft></span>
								
								<div class="info general">
									<t title="Tên tệp" class="filename" id="problemInfoFilename"></t>
									<dot></dot>
									<t title="Loại tệp" id="problemInfoLanguage"></t>
									<dot></dot>
									<t title="Thời gian chạy" id="problemInfoRuntime"></t>
									<dot></dot>
									<t title="Giới hạn bộ nhớ" id="problemInfoMemory">?MB</t>
								</div>

								<div class="info IO">
									<t title="INPUT" class="input" id="problemInfoInput"></t>
									<dot></dot>
									<t title="OUTPUT" class="output" id="problemInfoOutput"></t>
								</div>

								<t class="description" id="problemDescription"></t>
								<div class="lazyload image" id="problem_image"></div>

								<div id="problemAttachment" class="attachment">
									<a id="problemAttachmentLink" class="link" href=""></a>

									<div id="problemAttachmentPreviewWrapper" class="lazyload embed">
										<embed id="problemAttachmentPreview" src=""/>
										<div class="simpleSpinner"></div>
									</div>
								</div>

								<div class="simpleTableWrapper">
									<table class="simpleTable test" id="problemTests"></table>
								</div>
							</div>
						</div>
					</panel>
				</span>

				<span class="flexColumn small">
					<panel id="uploadp">
						<div class="head">
							<t class="le">Nộp bài</t>
							<span class="ri">
								<i class="materialIcons ref sound" title="Làm mới" data-soundhover data-soundselect>refresh</i>
							</span>
						</div>
						<div class="main fileupload-container">
							<div id="submitDropzone">
								<input type="file" id="submitInput" multiple>
								<t class="title">Thả tệp tại đây</t>
								<t class="sub">hoặc</t>
								<label for="submitInput" class="sq-btn dark sound" data-soundhover data-soundselect>Chọn tệp</label>
							</div>
							<div class="info">
								<t id="submitStatus">null</t>
								<t id="submitFileName">null</t>
								<div class="progressBar">
									<div class="bar" id="submitprogressBar"></div>
									<t class="left" id="submitInfoProgress">0%</t>
									<t class="right" id="submitInfoSize">00/00</t>
								</div>
							</div>
						</div>
					</panel>

					<panel id="logp">
						<div class="head">
							<t class="le">Nhật ký</t>
							<span class="ri">
								<i class="materialIcons cus sound" title="Xóa danh sách đang chấm" data-soundhover data-soundselect>gavel</i>
								<i class="materialIcons ref sound" title="Làm mới" data-soundhover data-soundselect>refresh</i>
							</span>
						</div>
						<div class="main logItemContainer">
							
						</div>
					</panel>
				</span>
			</div>

			<div class="flexRow">
				<panel id="rankp">
					<div class="head">
						<t class="le">Xếp hạng</t>
						<span class="ri">
							<i class="materialIcons cus sound" title="Xuất CSV" data-soundhover data-soundselect>import_export</i>
							<i class="materialIcons ref sound" title="Làm mới" data-soundhover data-soundselect>refresh</i>
						</span>
					</div>
					<div class="main rankingContainer">
					</div>
				</panel>
			</div>
		</div>

		<!-- Session Data -->
		<script>
			const IS_ADMIN = `<?php print ($id === "admin" ? "true" : "false"); ?>` === "true";
			const LOGGED_IN = `<?php print ($loggedIn === true ? "true" : "false"); ?>` === "true";
			const API_TOKEN = `<?php print isset($_SESSION["apiToken"]) ? $_SESSION["apiToken"] : null; ?>`;
		</script>

		<script src="/assets/js/statusBar.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script type="text/javascript">
			const sbar = new statusBar(document.body);
			sbar.__item = new Array();

			document.__onclog = (type, ts, msg) => {
				type = type.toLowerCase();
				const typeList = ["okay", "warn", "errr", "crit", "lcnt"]
				if (typeList.indexOf(type) === -1)
					return false;

				if (type === "errr")
					sbar.__item.errr.change(parseInt(sbar.__item.errr.get()) + 1);
				else if (type === "warn")
					sbar.__item.warn.change(parseInt(sbar.__item.warn.get()) + 1);

				sbar.msg(type, msg, {time: ts, lock: (type === "crit" || type === "lcnt") ? true : false});
			}

			sbar.__item.warn = sbar.additem("0", "warning", {space: false});
			sbar.__item.errr = sbar.additem("0", "error");
		</script>

		<!-- Library -->
		<script src="/assets/js/sounds.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/assets/js/tooltip.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/assets/js/navbar.js?v=<?php print VERSION; ?>" type="text/javascript"></script>

		<!-- Core script -->
		<script src="/static/js/core.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		
		<!-- Global site tag (gtag.js) - Google Analytics -->
		<script async src="https://www.googletagmanager.com/gtag/js?id=<?php print TRACK_ID; ?>"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag() { dataLayer.push(arguments) }
			gtag("js", new Date());

			gtag("config", `<?php print TRACK_ID; ?>`, {
				groups: "default",
				custom_map: {
					dimension1: "version",
					dimension2: "hostname",
					dimension3: "versiontag",
					dimension4: "contestname",
					dimension5: "platform",
					dimension6: "darkmode",
					metric1: "loadtime",
					metric2: "downlink"
				}
			});
		</script>

	</body>

	</html>