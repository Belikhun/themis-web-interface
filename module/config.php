<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /data/config.php                                                                             |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";

	define("CONFIG_FILE", $_SERVER["DOCUMENT_ROOT"] ."/data/config.json");
	define("CONFIG_EXCLUDE_TYPE", Array("note", "image"));

	define("CONFIG_STRUCTURE", Array(
		"system" => Array(
			"__icon" => "server",
			"__title" => "Hệ Thống",

			"title" => Array(
				"type" => "text",
				"label" => "Tiêu Đề Trang",
				"color" => "blue",
				"value" => "%contestName%",
				"required" => true
			),

			"image" => Array(
				"__display" => "row",

				"landing" => Array(
					"__title" => "Ảnh nền",
					"type" => "image",
					"label" => "Ảnh nền",
					"api" => "/api/images/landing",
					"display" => "square"
				),

				"icon" => Array(
					"__title" => "Icon",
					"type" => "image",
					"label" => "Icon",
					"api" => "/api/images/icon",
					"display" => "circle"
				)
			),

			"allowRegister" => Array(
				"type" => "checkbox",
				"label" => "Cho phép đăng kí tài khoản",
				"color" => "blue",
				"value" => true
			),

			"edit" => Array(
				"__title" => "Chỉnh sửa thông tin",
				"__display" => "column",

				"name" => Array(
					"type" => "checkbox",
					"label" => "Cho phép thay đổi tên",
					"color" => "blue",
					"value" => true
				),

				"password" => Array(
					"type" => "checkbox",
					"label" => "Cho phép thay đổi mật khẩu",
					"color" => "pink",
					"value" => true
				),

				"avatar" => Array(
					"type" => "checkbox",
					"label" => "Cho phép thay đổi Avatar",
					"color" => "blue",
					"value" => true
				)
			),
		),

		"contest" => Array(
			"__icon" => "file",
			"__title" => "Kì Thi",

			"htmlNote" => Array(
				"type" => "note",
				"level" => "warning",
				"text" => "<b>LƯU Ý:</b> Tên kì thi, Mô tả kì thi chấp nhận mã HTML. Hãy cẩn thận khi chèn mã HTML vào những trường này.</t>"
			),

			"name" => Array(
				"type" => "text",
				"label" => "Tên kì thi",
				"color" => "blue",
				"value" => "Ôn tập",
				"required" => true
			),

			"description" => Array(
				"type" => "text",
				"label" => "Mô tả kì thi",
				"color" => "blue",
				"value" => "Bài làm nộp lên được chấm bằng phần mềm <a href=\"http://dsapblog.wordpress.com/\" target=\"_blank\" rel=\"noopener\">Themis (Lê Minh Hoàng & Đỗ Đức Đông)</a>",
				"required" => true
			),

			"result" => Array(
				"__title" => "Kết Quả",
				"__display" => "column",

				"publish" => Array(
					"type" => "checkbox",
					"label" => "Công bố kết quả",
					"color" => "pink",
					"value" => true
				),

				"enableSS" => Array(
					"type" => "checkbox",
					"label" => "Sử dụng SubmissionScore v1 <i>(thử nghiệm)</i>",
					"color" => "blue",
					"value" => false
				),
			),

			"submit" => Array(
				"__display" => "column",
				"__title" => "Nộp Bài",

				"enabled" => Array(
					"type" => "checkbox",
					"label" => "Cho phép nộp bài",
					"color" => "pink",
					"value" => true
				),

				"inProblemsList" => Array(
					"type" => "checkbox",
					"label" => "Các bài nộp lên phải có trong danh sách đề",
					"color" => "blue",
					"value" => true,
					"note" => "<b>LƯU Ý:</b> Khi cài đặt này bị tắt, tên tệp nộp lên sẽ được chuyển thành chữ HOA"
				)
			),

			"ranking" => Array(
				"__display" => "column",
				"__title" => "Xếp Hạng",

				"enabled" => Array(
					"type" => "checkbox",
					"label" => "Bật bảng xếp hạng",
					"color" => "pink",
					"value" => true
				),

				"viewTask" => Array(
					"type" => "checkbox",
					"label" => "Hiển thị điểm các bài làm trong bảng Xếp Hạng",
					"color" => "blue",
					"value" => true
				),

				"hideDisabled" => Array(
					"type" => "checkbox",
					"label" => "Ẩn điểm của đề bài đã bị tắt",
					"color" => "blue",
					"value" => true
				)
			),

			"log" => Array(
				"__display" => "column",
				"__title" => "Nhật Ký",

				"enabled" => Array(
					"type" => "checkbox",
					"label" => "Cho phép xem tệp nhật ký",
					"color" => "pink",
					"value" => true
				),

				"viewOther" => Array(
					"type" => "checkbox",
					"label" => "Cho phép xem tệp nhật ký của người khác",
					"color" => "blue",
					"value" => true
				)
			),

			"problem" => Array(
				"__display" => "column",
				"__title" => "Đề Bài",

				"public" => Array(
					"type" => "checkbox",
					"label" => "Cho phép Khách xem đề bài",
					"color" => "blue",
					"value" => true
				)
			),
		),

		"folders" => Array(
			"__icon" => "folder",
			"__title" => "Thư Mục",

			"submit" => Array(
				"type" => "text",
				"label" => "Thư mục lưu bài làm",
				"color" => "blue",
				"value" => "D:\Themis\data\uploadDir"
			),

			"submitLogs" => Array(
				"type" => "text",
				"label" => "Thư mục lưu nhật ký",
				"color" => "blue",
				"value" => "%submitFolder%/Logs"
			)
		),

		"time" => Array(
			"__icon" => "clock",
			"__title" => "Thời Gian",

			"zone" => Array(
				"type" => "text",
				"label" => "Khu Vực",
				"color" => "blue",
				"value" => "Asia/Ho_Chi_Minh"
			),

			"contest" => Array(
				"__display" => "column",
				"__title" => "Kì Thi",

				"begin" => Array(
					"type" => "datetime",
					"label" => "Bắt đầu kì thi",
					"color" => "blue",
					"value" => 0
				),

				"during" => Array(
					"type" => "number",
					"label" => "Thời gian làm bài (phút)",
					"color" => "blue",
					"value" => 0
				),

				"offset" => Array(
					"type" => "number",
					"label" => "Thời gian bù (giây)",
					"color" => "blue",
					"value" => 0
				)
			),
		),

		"clientSettings" => Array(
			"__icon" => "config",
			"__title" => "Cài Đặt Mặc Định của Client",

			"sounds" => Array(
				"type" => "checkbox",
				"label" => "Bật tiếng",
				"color" => "pink",
				"value" => false
			),

			"nightmode" => Array(
				"type" => "checkbox",
				"label" => "Chế độ ban đêm",
				"color" => "pink",
				"value" => false
			),

			"showMs" => Array(
				"type" => "checkbox",
				"label" => "Hiển thị millisecond",
				"color" => "pink",
				"value" => false
			),

			"transition" => Array(
				"type" => "checkbox",
				"label" => "Hiệu ứng",
				"color" => "blue",
				"value" => true
			),
			
			"dialogProblem" => Array(
				"type" => "checkbox",
				"label" => "Xem đề bài trong cửa sổ",
				"color" => "pink",
				"value" => false
			),

			"rankUpdate" => Array(
				"type" => "checkbox",
				"label" => "Tự động cập nhật Xếp Hạng",
				"color" => "blue",
				"value" => true
			),

			"logsUpdate" => Array(
				"type" => "checkbox",
				"label" => "Tự động cập nhật Nhật Kí",
				"color" => "blue",
				"value" => true
			),

			"updateDelay" => Array(
				"type" => "range",
				"label" => "Thời gian làm mới",
				"value" => 2,
				"min" => 1,
				"max" => 10,
				"step" => 1,
				"unit" => "ms/yêu cầu",
				"valueList" => Array(1 => 500, 2 => 1000, 3 => 2000, 4 => 10000, 5 => 60000, 6 => 120000, 7 => 240000, 8 => 300000, 9 => 600000, 10 => 3600000),
				"valueWarn" => Array(
					"type" => "lower",
					"value" => 1000,
					"color" => "pink"
				)
			)
		),

		"ratelimit" => Array(
			"__icon" => "clock",
			"__title" => "Rate Limiter",

			"enabled" => Array(
				"type" => "checkbox",
				"label" => "Bật",
				"color" => "blue",
				"value" => true
			),

			"maxRequest" => Array(
				"type" => "number",
				"label" => "Số yêu cầu tối đa",
				"color" => "blue",
				"value" => 40
			),

			"requestTime" => Array(
				"type" => "number",
				"label" => "Thời gian tối đa thực hiện yêu cầu (giây)",
				"color" => "blue",
				"value" => 10
			),

			"banTime" => Array(
				"type" => "number",
				"label" => "Thời gian cấm yêu cầu (giây)",
				"color" => "blue",
				"value" => 30
			)
		),

		"cache" => Array(
			"__icon" => "file",
			"__title" => "Cache Age",

			"note" => Array(
				"type" => "note",
				"level" => "info",
				"text" => "Increasing Cache Age will reduce backend calculation. But in return it will delay live data update.<br><b>Only change these value if you know what you are doing!</b>"
			),

			"contestRank" => Array(
				"type" => "number",
				"label" => "contestRank",
				"color" => "blue",
				"value" => 1
			)
		)
	));

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/config.php";

	define("CONFIG_CUSTOM_VAR", Array(
		"name" => APPNAME,
		"version" => VERSION,
		"author" => AUTHOR,
		"contestName" => $config["contest"]["name"],
		"submitFolder" => $config["folders"]["submit"],
		"root" => $_SERVER["DOCUMENT_ROOT"],
		"currentDate" => date("d/m/Y"),
		"currentTime" => date("H:i:s")
	));

	applyCustomVar($config);