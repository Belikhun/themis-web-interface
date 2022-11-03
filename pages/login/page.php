<?php
global $PAGE;

$action = getParam("action", default: "login");

define("PAGE_TITLE", "Đăng Nhập");

$PAGE -> css("login.css");
$PAGE -> js("login.js", "login", Array(
	"action" => $action
));

?>

<div class="flex-row flex-middle login">
	<div id="left">
		<div id="overlay">
			<div class="spinner"></div>
		</div>
	</div>

	<!-- <div id="right">

	</div> -->
</div>