<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /modules/account.php                                                                         |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	
	define("ACCOUNTS_DIR", $_SERVER["DOCUMENT_ROOT"] ."/data/accounts");
	define("ACCOUNT_ONLINE_MAXIDLE", 10);

	if (!file_exists(ACCOUNTS_DIR))
		mkdir(ACCOUNTS_DIR);

	// CACHE VARIABLE
	$accountsCache = Array();

	// RETURN VALUE
	define("ACCOUNT_SUCCESS", 0);
	define("ACCOUNT_EXIST", 1);
	define("ACCOUNT_NOTFOUND", 2);

	define("ACCOUNT_LOGIN_WRONGPASSWORD", 3);

	function getAccountsList() {
		$files = glob(ACCOUNTS_DIR ."/*.json");
		
		foreach ($files as &$item)
			$item = pathinfo($item, PATHINFO_FILENAME);

		return $files;
	}

	class account {
		public $data;

		/**
		 * @param    String		$username	Username
		 */
		public function __construct(String $username) {
			global $accountsCache;

			$this -> username = $username;
			$this -> path = ACCOUNTS_DIR ."/$username.json";

			$this -> data = (isset($accountsCache[$username]) && !empty($accountsCache[$username]["username"]))
				? $accountsCache[$username]
				: (is_readable($this -> path)
					? (new fip($this -> path)) -> read("json")
					: null);

			$accountsCache[$this -> username] = $this -> data;
		}

		public function init($password) {
			if ($this -> dataExist())
				return ACCOUNT_EXIST;

			$this -> data = Array(
				"id" => sprintf("r%04d", randBetween(0, 9999)),
				"username" => $this -> username,
				"password" => password_hash($password, PASSWORD_DEFAULT),
				"name" => $this -> username,
				"repass" => 0,
				"lastAccess" => 0
			);

			$this -> update();

			return ACCOUNT_SUCCESS;
		}

		public function dataExist() {
			return !empty($this -> data);
		}

		public function update(Array $data = Array()) {
			if (!$this -> dataExist())
				return ACCOUNT_NOTFOUND;

			if (!empty($data))
				mergeObjectRecursive($this -> data, $data, false);

			(new fip($this -> path, "{}")) -> write($this -> data, "json");
			$accountsCache[$this -> username] = $this -> data;

			return ACCOUNT_SUCCESS;
		}

		public function isOnline() {
			return (microtime(true) - ($this -> data["lastAccess"])) < ACCOUNT_ONLINE_MAXIDLE;
		}

		public function isAdmin() {
			return ($this -> data["id"] === "admin");
		}

		public function access() {
			$this -> update(Array(
				"lastAccess" => microtime(true)
			));

			return ACCOUNT_SUCCESS;
		}

		public function auth($password) {
			if (!$this -> dataExist())
				return ACCOUNT_NOTFOUND;

			if ($this -> data["password"] === $password || password_verify($password, $this -> data["password"]))
				return ACCOUNT_SUCCESS;
			else
				return ACCOUNT_LOGIN_WRONGPASSWORD;
		}

		public function delete() {
			if (!$this -> dataExist())
				return ACCOUNT_NOTFOUND;

			unlink($this -> path);
			unset($this -> data);
			$this -> data = null;

			return ACCOUNT_SUCCESS;
		}
	}

	// Update Online Status
	if (isset($_SESSION["username"]))
		(new account($_SESSION["username"])) -> access();