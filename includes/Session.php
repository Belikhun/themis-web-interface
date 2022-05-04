<?php

class Session {
	/**
	 * Session lifespan. Default to 1 day.
	 * @var	int
	 */
	public static $lifetime;

	/**
	 * Current active username in session.
	 * @var	String
	 */
	public static $username;

	/**
	 * Current logged-in user.
	 * @var \User
	 */
	public static $user;

	/**
	 * Store logout token user need to perform
	 * logout.
	 * @var String
	 */
	public static $logoutToken;

	public static function start(String $sessionID = null) {
		session_name("Session");

		if (!empty($sessionID))
			session_id($sessionID);

		if (session_status() !== PHP_SESSION_ACTIVE) {
			ini_set("session.gc_maxlifetime", self::$lifetime);
			session_set_cookie_params(self::$lifetime);
			session_start();
			
			setcookie(session_name(), session_id(), time() + self::$lifetime, "/");
		}

		if (empty($_SESSION["username"])) {
			$_SESSION["username"] = null;
			return;
		}

		self::$username = $_SESSION["username"];
		self::$user = $_SESSION["user"];
		self::$logoutToken = $_SESSION["logoutToken"];
	}

	/**
	 * Start session using token string.
	 * @param	String	$token
	 */
	public static function token(String $token) {
		$token = \Token::getToken($token);

		self::$username = $token -> username;
		self::$user = \User::getByUsername($token -> username);
		self::$logoutToken = null;
	}

	/**
	 * Create access token for this user.
	 * @param	\User	$user
	 * @return	\Token
	 */
	public static function createToken(\User $user) {
		self::$username = $user -> username;
		self::$user = $user;
		self::$logoutToken = null;
		
		return \Token::createToken($user -> username);
	}

	public static function completeLogin(\User $user) {
		$_SESSION["username"] = $user -> username;
		$_SESSION["user"] = $user;
		$_SESSION["logoutToken"] = bin2hex(random_bytes(12));
		self::$user = $user;

		session_regenerate_id();
	}

	public static function terminate() {
		unset($_SESSION["username"]);
		unset($_SESSION["user"]);
		unset($_SESSION["logoutToken"]);
		self::$username = null;
		self::$user = null;
		self::$logoutToken = null;

		session_destroy();
	}

	public static function loggedIn() {
		if (session_status() !== PHP_SESSION_NONE && !empty(self::$username))
			return true;
		else
			return false;
	}
}

Session::$lifetime = &CONFIG::$SESSION_LIFETIME;
