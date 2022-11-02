<?php
namespace Router;

use GeneralException;

/**
 * Route.php
 * 
 * Represent a valid route for our router to go.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class Route {
	/**
	 * All the verbs for this route.
	 * @var String[]
	 */
	public $verbs;

	/**
	 * Route URI
	 * @var	String
	 */
	public $uri;

	/**
	 * Callback action for this route if matched
	 * @var	String|Callable
	 */
	public $action;

	/**
	 * Route priority.
	 * Higher mean will be checked and executed first.
	 */
	public $priority = 0;

	/**
	 * Construct a new Route object
	 * 
     * @param  Array			$verbs
     * @param  String			$uri
     * @param  String|Callable	$action
	 */
	public function __construct($verbs, $uri, $action) {
		$this -> verbs = $verbs;
		$this -> uri = $uri;
		$this -> action = $action;
	}

	/**
	 * Call to the action of this Route. Return the result
	 * of the callback
	 * 
	 * @param	String[]	$args
	 * @return	mixed
	 */
	public function callback(Array $args) {
		if (is_callable($this -> action)) {
			try {
				return call_user_func_array($this -> action, $args);
			} catch (\TypeError $e) {
				$message = $e -> getMessage();
				$traces = $e -> getTrace();
				$matches = Array();

				// Determine that error was thrown by calling Route handler
				// Because this catch can be triggered somewhere inside handler
				if ($traces[1]["function"] === "call_user_func_array") {
					if (preg_match("/(Argument (\d+) passed to .+) must be/m", $message, $matches)) {
						$key = array_keys($args)[((int) $matches[2]) - 1];
						$message = str_replace($matches[1], "Value of \"$key\"", $message);

						throw new \RouteArgumentMismatch($this, $message);
					}
				}

				throw $e;
			} catch (\ArgumentCountError $e) {
				throw new GeneralException(ROUTE_CALLBACK_ARGUMENTCOUNT_ERROR, $e -> getMessage(), 500);
			}
		} else {
			throw new GeneralException(ROUTE_CALLBACK_INVALID, "Callback \"{$this -> action}\" for route \"{$this -> uri}\" is missing or not callable.", 500);
		}
	}

	public function __toString() {
		$verb = (count($this -> verbs) === count(\Router::$verbs))
			? "ANY"
			: implode(" ", $this ->  verbs);

		return str_pad($this -> priority, 2, "0", STR_PAD_LEFT)
			. " " . str_pad($verb, 6, " ", STR_PAD_LEFT)
			. " " . $this -> uri;
	}
}