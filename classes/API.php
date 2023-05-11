<?php
use Blink\Exception\MissingParam;

/**
 * API.php
 * 
 * API interface. Provide request information for API request.
 * 
 * @author    Belikhun
 * @since     1.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2023 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

class API {
	/**
	 * Request method
	 * @var string
	 */
	public $method;

	/**
	 * Route path
	 * @var string
	 */
	public $path;

	/**
	 * Current API .php file being processed
	 * @var string
	 */
	public $file;

	/**
	 * Arguments passed into this API by router.
	 * @var array
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