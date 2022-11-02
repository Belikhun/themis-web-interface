<?php

/**
 * API.php
 * 
 * API interface. Provide request information for API request.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class API {
	/**
	 * Request method
	 * @var String
	 */
	public $method;

	/**
	 * Route path
	 * @var String
	 */
	public $path;

	/**
	 * Current API .php file being processed
	 * @var String
	 */
	public $file;

	/**
	 * Arguments passed into this API by router.
	 * @var Array
	 */
	public $args;

	public function __construct(
		String $method,
		String $path,
		String $file,
		Array $args
	) {
		$this -> method = $method;
		$this -> path = $path;
		$this -> file = $file;
		$this -> args = $args;
	}

	public function getArgument($name, $type = TYPE_TEXT, $default = null) {
		if (isset($this -> args[$name]))
			$param = $this -> args[$name];
		else
			return $default;

		return cleanParam($param, $type);
	}

	public function requiredArgument($name, $type = TYPE_TEXT) {
		$param = $this -> getArgument($name, $type);

		if ($param === null)
			throw new MissingParam($name);

		return $param;
	}
}