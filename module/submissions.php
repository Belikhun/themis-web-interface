<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /module/submissions.php                                                                      |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";
	
	define("SUBMISSIONS_DIR", getConfig("folders.submissions"));

	if (!file_exists(SUBMISSIONS_DIR))
		mkdir(SUBMISSIONS_DIR, 0777, true);

	function getSubmissionsList() {
		$dirs = glob(SUBMISSIONS_DIR ."/*", GLOB_ONLYDIR);
			
		foreach ($dirs as &$item)
			$item = pathinfo($item, PATHINFO_FILENAME);

		return $dirs;
	}

	function submissionExist($username) {
		return in_array($username, getSubmissionsList());
	}

	/**
	 * User's Submissions Manager Module
	 * 
	 * @package submissions
	 */
	class submissions {

		/**
		 * @param    username		Username
		 */
		public function __construct(String $username) {
			$this -> username = $username;
			$this -> path = SUBMISSIONS_DIR ."/". $username;

			if (!file_exists($this -> path))
				mkdir($this -> path, 0777, true);
		}

		public function list() {
			$dirs = glob($this -> path ."/*", GLOB_ONLYDIR);
			
			foreach ($dirs as &$item)
				$item = pathinfo($item, PATHINFO_FILENAME);

			return $dirs;
		}

		private function submissionInit(String $id) {
			mkdir($this -> path ."/". $id, 0777, true);

			(new fip($this -> path ."/". $id ."/meta.json", "{}")) -> write(Array(
				"id" => $id,
				"username" => $this -> username,
				"createDate" => time(),
				"lastModify" => Array(
					"log" => null,
					"data" => null,
					"code" => null
				),
				"codeFile" => null
			), "json");
		}

		public function exist(String $id) {
			return in_array($id, $this -> list());
		}

		public function getMeta(String $id) {
			return (new fip($this -> path ."/". $id ."/meta.json", "{}")) -> read("json");
		}

		public function updateMeta(String $id, Array $data = Array()) {
			$meta = $this -> getMeta($id);

			mergeObjectRecursive($meta, $data);
			(new fip($this -> path ."/". $id ."/meta.json", "{}")) -> write($meta, "json");
		}

		public function remove(String $id) {
			unlink($this -> path ."/". $id);
		}

		//* ====== LOG FILE ======

		public function getLog(String $id) {
			if (!file_exists($this -> path ."/". $id ."/log.log"))
				return null;

			return (new fip($this -> path ."/". $id ."/log.log")) -> read();
		}

		public function saveLog(String $id, String $data) {
			if (!file_exists($this -> path ."/". $id))
				$this -> submissionInit($id);

			if (file_exists($data))
				rename($data, $this -> path ."/". $id ."/log.log");
			else
				(new fip($this -> path ."/". $id ."/log.log")) -> write($data);

			$this -> updateMeta($id, Array(
				"lastModify" => Array(
					"log" => time()
				)
			));
		}

		//* ====== PARSED DATA FILE ======

		public function getData(String $id) {
			if (!file_exists($this -> path ."/". $id ."/parsed.data"))
				return null;

			return (new fip($this -> path ."/". $id ."/parsed.data")) -> read("serialize");
		}

		public function saveData(String $id, Array $data) {
			if (!file_exists($this -> path ."/". $id))
				$this -> submissionInit($id);

			(new fip($this -> path ."/". $id ."/parsed.data")) -> write($data, "serialize");

			$this -> updateMeta($id, Array(
				"lastModify" => Array(
					"data" => time()
				)
			));
		}

		//* ====== CODE FILE ======

		public function getCode(String $id) {
			$meta = $this -> getMeta($id);

			if (!$meta["codeFile"] || !file_exists($this -> path ."/". $id ."/". $meta["codeFile"]))
				return null;

			return (new fip($this -> path ."/". $id ."/". $meta["codeFile"])) -> read();
		}

		public function saveCode(String $id, String $data, String $extension = null) {
			if (!file_exists($this -> path ."/". $id))
				$this -> submissionInit($id);

			$codeFile = null;

			if (file_exists($data)) {
				$codeFile = pathinfo($data, PATHINFO_BASENAME);
				rename($data, $this -> path ."/". $id ."/". $codeFile);
			} else {
				$codeFile = "code.". $extension;
				(new fip($this -> path ."/". $id ."/". $codeFile)) -> write($data);
			}

			$this -> updateMeta($id, Array(
				"lastModify" => Array(
					"code" => time()
				),
				"codeFile" => $codeFile
			));
		}
	}