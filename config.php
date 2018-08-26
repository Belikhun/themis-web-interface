<?php
	//Tên kỳ thi
	$contestName = "Bài tập tin học"; 
	//Mô tả kỳ thi
	$description = "Bài làm nộp lên được chấm bằng phần mềm <a href='http://dsapblog.wordpress.com/'>Themis (Lê Minh Hoàng & Đỗ Đức Đông)</a>";
	//Thư mục lưu bài làm trực tuyến của học sinh
	$uploadDir = "D:\Themis\data\uploadDir";
	//Thư mục chứa file logs
	$logsDir = "D:\Themis\data\uploadDir\Logs";
	//Thời gian bắt đầu kỳ thi
	$bt = Array(
		"gio" => 00,
		"phut" => 00,
		"giay" => 00,
		"ngay" => 1,
		"thang" => 1,
		"nam" => 2018
	);
	date_default_timezone_set("Asia/Ho_Chi_Minh"); //Timezone
	$beginTime = mktime($bt["gio"], $bt["phut"], $bt["giay"], $bt["thang"], $bt["ngay"], $bt["nam"]);
	//Thời gian làm bài - (đặt 0: không giới hạn)
	$duringTime = 0; //(phút)
	//Thời gian bù:
	$bonusTime = 30; //(giây)
	//1: Công bố kết quả sau khi chấm, 0: không công bố.
	$publish = true;
	//Cho phép người dùng thay đổi thông tin:
	$allowEditInfo = true;
?>