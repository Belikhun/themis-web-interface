<?php

use Router\Route;

/**
 * Router.php
 * 
 * Router interface.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class Router {
	/**
	 * All routes for this router.
	 * @var	\Router\Route[]
	 */
	protected static $routes = Array();

	/**
	* All of the verbs supported by the router.
	* @var	String[]
	*/
	public static $verbs = Array("GET", "POST", "PATCH", "DELETE");

	/**
	 * Currently active route.
	 * @var	\Router\Route
	 */
	public static $active = null;

	/**
	* Register a new GET route with the router.
	*
	* @param  String			$uri
	* @param  String|Callable	$action
	*/
	public static function GET($uri, $action, $priority = 0) {
		return Router::match("GET", $uri, $action, $priority);
	}

	/**
	* Register a new POST route with the router.
	*
	* @param  String			$uri
	* @param  String|Callable	$action
	*/
    public static function POST($uri, $action, $priority = 0) {
		return Router::match("POST", $uri, $action, $priority);
    }

	/**
	* Register a new PATCH route with the router.
	*
	* @param  String			$uri
	* @param  String|Callable	$action
	*/
    public static function PATCH($uri, $action, $priority = 0) {
		return Router::match("PATCH", $uri, $action, $priority);
    }

	/**
	* Register a new DELETE route with the router.
	*
	* @param  String			$uri
	* @param  String|Callable	$action
	*/
    public static function DELETE($uri, $action, $priority = 0) {
		return Router::match("DELETE", $uri, $action, $priority);
    }

	/**
	* Register a new route with the router that
	* match every methods.
	*
	* @param  String			$uri
	* @param  String|Callable	$action
	*/
    public static function ANY($uri, $action, $priority = 0) {
		return Router::match(self::$verbs, $uri, $action, $priority);
    }

	/**
	* Register a new route with the given verbs.
	*
	* @param  Array|String		$methods
	* @param  String			$uri
	* @param  String|Callable	$action
	* @return \Router\Route
	*/
	public static function match($methods, $uri, $action, $priority = 0) {
		if (is_string($methods))
			$methods = Array($methods);

		foreach ($methods as $method)
			if (!in_array($method, Router::$verbs))
				throw new GeneralException(-1, "HTTP Method \"{$method}\" is not supported!");

		$route = new Route($methods, $uri, $action);
		$route -> priority = $priority;
		Router::$routes[] = $route;
		
		return $route;
	}

	/**
	 * Handle the requested path.
	 * @param	String	$path
	 * @param	String	$method
	 */
	public static function route(String $path, String $method) {
		$args = Array();
		$found = false;

		// Up case method just to be sure
		$method = strtoupper($method);

		// Sort routes by priority
		usort(self::$routes, function ($a, $b) {
			return $b -> priority <=> $a -> priority;
		});

		foreach (self::$routes as $route) {
			if (!in_array($method, $route -> verbs))
				continue;

			if (!self::isRouteMatch($route, $path, $args))
				continue;

			$found = true;
			self::$active = $route;
			$route -> callback($args);
			break;
		}

		if (!$found)
			throw new GeneralException(ROUTE_NOT_FOUND, "Cannot find route for {$method} \"$path\"", 404);
	}

	/**
	 * Parse URI to array of tokens
	 * @param      String		$uri
	 * @return     String[]
	 */
	private static function uriTokens(String $uri) {
		return explode("/", str_replace("\\", "/", $uri));
	}

	/**
	 * Check if Route match current URI
	 * @param      \Router\Route  $route
	 * @param      String         $path
	 * @return     bool
	 */
	private static function isRouteMatch(Route $route, String $path, Array &$args = Array()) {
		$pathTokens = self::uriTokens($path);
		$uriTokens = self::uriTokens($route -> uri);

		if (in_array("**", $uriTokens)) {
			// If route contains match rest, number of tokens don't
			// need to match the exact same count.
			if (count($pathTokens) < count($uriTokens))
				return false;
		} else {
			if (count($pathTokens) !== count($uriTokens))
				return false;
		}

		foreach ($uriTokens as $i => $token) {
			if (strlen($token) >= 2 && $token[0] === "{" && substr($token, -1) === "}") {
				$key = trim($token, "{}");
				$value = $pathTokens[$i];

				// Don't accept empty value.
				if (empty($value))
					continue;

				// Try to parse value into int or float.
				if (is_float($value))
					$value = floatval($value);
				else if (is_numeric($value))
					$value = intval($value);

				$args[$key] = $value;
				continue;
			}
			
			// Check block
			if ($token === "*")
				continue;
			if ($token === "**")
				// Pretend the rest are matched.
				return true;
			else if ($token !== $pathTokens[$i])
				return false;
		}

		return true;
	}

	public static function getRoutes() {
		return self::$routes;
	}
}