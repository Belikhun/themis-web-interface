<?php
/**
 * Error route for serving error page.
 * 
 * @copyright	2022 Hanoi Open University
 * @author		Belikhun <domanhha@hou.edu.vn>
 * @license		https://tldrlegal.com/license/mit-license MIT
 */

\Router::GET("/error", function() {
	require_once BASE_PATH . "/error.php";
});