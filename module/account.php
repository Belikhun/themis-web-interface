<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /module/account.php                                                                          |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	
	define("ACCOUNTS_DIR", $_SERVER["DOCUMENT_ROOT"] ."/data/accounts");

	define("ACCOUNT_SUCCESS", 0);
	define("ACCOUNT_EXIST", 1);
	define("ACCOUNT_NOTFOUND", 2);

	define("ACCOUNT_LOGIN_WRONGPASSWORD", 3);

	class account {
		private $data = null;

		/**
		 * @param    String		$username	Username
		 */
		public function __construct(String $username) {
			$this -> username = $username;
			$this -> path = ACCOUNTS_DIR ."/". $username .".json";

			$this -> data = file_exists($this -> path)
				? (new fip($this -> data)) -> read("json")
				: null;
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
				"lastAccess" => microtime(true)
			);

			(new fip($this -> path)) -> write($this -> data, "json");
		}

		public function dataExist() {
			return !empty($this -> data);
		}

		public function update(Array $data = Array()) {
			if (!$this -> dataExist())
				return ACCOUNT_NOTFOUND;

			$data["lastAccess"] = microtime();
			mergeObjectRecursive($this -> data, $data, false);

			(new fip($this -> path, "{}")) -> write($this -> data, "json");
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