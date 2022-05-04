<?php
/**
 * \error.php
 * 
 * Route for serving error page.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

\Router::GET("/error", function() {
	require_once BASE_PATH . "/error.php";
});