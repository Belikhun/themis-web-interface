<?php

/**
 * API class
 * 
 * @copyright	2022 Belikhun
 * @author		Belikhun <belivipro9x99@gmail.com>
 * @license		https://tldrlegal.com/license/mit-license MIT
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