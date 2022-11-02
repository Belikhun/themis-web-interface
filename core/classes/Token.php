<?php

/**
 * Token Object
 * 
 * @copyright	2022 Belikhun
 * @author		Belikhun <belivipro9x99@gmail.com>
 * @license		https://tldrlegal.com/license/mit-license MIT
 */
class Token {
	/** @var int */
	public $id;
	
	/** @var String */
	public $token;

	/** @var int */
	public $created;
	
	/** @var int */
	public $expire;

	/** @var String */
	public $username;

	public function __construct(
		int $id,
		String $token,
		int $created,
		int $expire,
		String $username
	) {
		$this -> id = $id;
		$this -> token = $token;
		$this -> created = $created;
		$this -> expire = $expire;
		$this -> username = $username;
	}

	public function validate() {
		return ($this -> expire >= time());
	}

	public function renew() {
		$this -> created = time();
		$this -> expire = $this -> created + CONFIG::$TOKEN_LIFETIME;

		DB::update("tokens", $this);
	}

	public static function getToken(String $token) {
		$record = DB::record("tokens", Array( "token" => $token ));

		if (empty($record))
			throw new InvalidToken();

		$token = self::processRecord($record);

		if (!$token -> validate())
			throw new TokenExpired();

		return $token;
	}

	/**
	 * Get usable token. Will always return a valid token.
	 * 
	 * @param	String	$username
	 * @return	\Token
	 */
	public static function get(String $username) {
		$record = DB::record("tokens", Array( "username" => $username ));

		if (empty($record))
			return self::createToken($username);

		$token = self::processRecord($record);

		if (!$token -> validate())
			$token -> renew();

		return $token;
	}

	/**
	 * Create a new token for the specified user.
	 * 
	 * @param	String	$username
	 * @return	\Token
	 */
	public static function createToken(String $username) {
		$token = bin2hex(random_bytes(64));
		$created = time();
		$expire = $created + CONFIG::$TOKEN_LIFETIME;

		$id = DB::insert("tokens", Array(
			"token" => $token,
			"created" => $created,
			"expire" => $expire,
			"username" => $username
		));

		return new self($id, $token, $created, $expire, $username);
	}

	/**
	 * Process token record from database.
	 * @param	Object	$record
	 * @return	\Token
	 */
	public static function processRecord($record) {
		return new self(
			$record -> id,
			$record -> token,
			$record -> created,
			$record -> expire,
			$record -> username
		);
	}
}