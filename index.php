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
?>

	<!DOCTYPE html>
	<html lang="vi-VN">

	<head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		<title>Themis Web Interface</title>

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
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/smenu.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/menu.css?v=<?php print VERSION; ?>" />
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/wavec.css?v=<?php print VERSION; ?>" />
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
	</head>

	<body>
		<!--
			Load Important Library, Draw Splash Screen
			Initialize Themis Web Interface Core
		-->
		<script src="/assets/js/belibrary.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/assets/js/errorHandler.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script type="text/javascript" src="/assets/js/splash.js?v=<?php print VERSION; ?>"></script>
		<script type="text/javascript">
			var mainSplash = new splash(document.body, `Themis Web Interface`, "Sample Text", "/api/images/icon");

			mainSplash.init = async set => {
				set({ p: 0, m: "main", d: "Getting Basic Server Info" });
				let response = await myajax({ url: "/api/server" });
				window.SERVER = response.data;
				window.SESSION = response.data.SESSION;
				window.API_TOKEN = SESSION.API_TOKEN;

				set({ p: 0, m: "main", d: "Initializing Themis Web Interface Core" });
				await twi.init(set);
			}

			mainSplash.postInit = async set => {
				// set(50, "Đang kiểm tra phiên bản mới");
				// await core.checkUpdateAsync(IS_ADMIN);

				// set(60, "Setting up statusBar");
				// sbar.additem(SERVER.SERVER_SOFTWARE, "server");
				// sbar.additem(SERVER.SERVER_ADDR, "globe");
				// sbar.additem(SERVER.username ? SERVER.username : "Chưa đăng nhập", "account", {align: "right"});
				// sbar.additem(SERVER.REMOTE_ADDR, "desktop", {align: "right"});

				// set(95, "Sending Analytics Data...");
				// gtag("event", "pageView", {
				// 	version: SERVER.version,
				// 	hostname: location.hostname,
				// 	loadtime: ((new Date()).getTime() - window.performance.timing.navigationStart) / 1000,
				// 	downlink: (navigator && navigator.connection) ? navigator.connection.downlink : 0,
				// 	versiontag: SERVER.versionTag,
				// 	contestname: SERVER.contestName,
				// 	platform: (navigator) ? navigator.platform : null,
				// 	darkmode: cookie.get("__darkMode"),

				// 	event_category: "load",
				// 	event_label: "scriptInitialized",
				// 	send_to: "default",
				// 	event_callback: () => clog("INFO", "Analytics data sent!")
				// });
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

		<!--
			Main Content Goes Here
		-->
		<div id="navbar"></div>

		<div id="superContainer">
			<div id="userSettings"></div>
			<div id="waveContainer"></div>

			<div id="content">
				<div id="mainContainer">
					<span class="flexColumn large">
						<panel id="problemsPanel">
							<div class="header">
								<t class="title">Đề bài</t>

								<span class="buttons"></span>
							</div>

							<div class="main problemsContainer">
								<div class="problemsList showEmpty sound" data-soundtoggle="hide" id="problemsList"></div>

								<div class="problem">
									<t class="name" id="problemName"></t>
									<t class="point" id="problemPoint"></t>
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
									<div class="image" id="problemImage"></div>
	
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

					<span class="flexColumn">
						<div class="flexRow">
							<panel id="submitPanel">
								<div class="header">
									<t class="title">Nộp bài</t>
									<span class="buttons"></span>
								</div>

								<div class="main submitContainer">
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
						</div>

						<div class="flexRow large">
							<panel id="logsPanel">
								<div class="header">
									<t class="title">Nhật ký</t>
									<span class="buttons"></span>
								</div>

								<div class="main logsItemContainer"></div>
							</panel>
						</div>
					</span>
				</div>

				<div class="rankingContainer">
					<div class="header">
						<icon data-icon="table"></icon>
						<t class="title">xếp hạng</t>

						<span class="heartbeat" id="rankingUpdateHeartbeat"></span>
						<button id="rankingRefresh" class="sq-btn sound" data-soundhover data-soundselect>Làm Mới</button>
					</div>

					<div id="ranking" class="showEmpty"></div>
				</div>
			</div>
		</div>

		<div id="dummyContainer">
			<!--
				This Container Store Elements Will
				Be Moved Into Another Location.
			-->

			<footer id="mainFooter">
				<div class="header">
					<div class="logo"></div>
					<t class="title"><?php print APPNAME; ?></t>
					<t class="version">v<?php print VERSION."-".VERSION_TAG; ?></t>
					<t class="subtitle">Made from scratch, crafted with <font color="red">❤</font> by Belikhun</t>

					<div class="button">
						<button class="sq-btn rainbow sound" data-soundhover data-soundselect onclick="twi.getRandomMeme()">memes uwu</button>
						<button class="sq-btn pink sound" data-soundhover data-soundselect>(╯°□°）╯︵ ┻━┻</button>
					</div>
				</div>

				<div class="badge">
					<a href="<?php print REPO_ADDRESS; ?>/releases/" target="_blank" rel="noopener"><img src="/tools/badge?su=<?php print VERSION_TAG; ?>&st=v<?php print VERSION; ?>&c=brightgreen"></a>
					<img src="/tools/badge?su=license&st=MIT&c=orange">
					<img src="/tools/badge?su=status&st=near stable&c=blue">
					<img src="/tools/badge?su=author&st=Belikhun&c=red">
				</div>
				
				<t class="description"><b><?php print APPNAME; ?></b> là một dự án mã nguồn mở, phi lợi nhuận với mục đích chính nhằm biến việc quản lí và tổ chức các buổi học lập trình, ôn tập tin học và tổ chức kì thi trở nên dễ dàng hơn.</t>
			</footer>

			<div id="syslogs" class="container">
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

		<!--
			Less Important/Heavy Scripts will be loaded later
			After all DOMs has been loaded to reduce browser
			bottleneck
		-->

		<!-- Library -->
		<script src="/assets/js/sounds.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/assets/js/tooltip.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/assets/js/scrollable.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/assets/js/wavec.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/assets/js/navbar.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
		<script src="/assets/js/smenu.js?v=<?php print VERSION; ?>" type="text/javascript"></script>

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