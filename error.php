<?php
require_once "belibrary.php";

// Prevent redirection in error page
if (!defined("ERROR_NO_REDIRECT"))
	define("ERROR_NO_REDIRECT", true);

// Create dummy page
$PAGE = new \Page([], BASE_PATH . "/pages/error");

ob_start();
require_once "pages/error/page.php";
$content = ob_get_clean();

if (!defined("PAGE_TITLE"))
	define("PAGE_TITLE", $name);

// Load header
require_once BASE_PATH . "/fragments/header.php";

echo $content;

// Load footer
require_once BASE_PATH . "/fragments/footer.php";