<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /libs/belibrary.php                                                                          |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/logger.php";

	setlocale(LC_TIME, "vi_VN.UTF-8");

	if (session_status() !== PHP_SESSION_ACTIVE) {
		if (isset($_POST["sessid"]))
			session_id($_POST["sessid"]);
		elseif (isset($_GET["sessid"]))
			session_id($_GET["sessid"]);

		// keep session data for 1 day
		$sessionLifeTime = 86400;
		ini_set("session.gc_maxlifetime", $sessionLifeTime);
		session_set_cookie_params($sessionLifeTime);

		session_start();
	}

	if (!isset($_SESSION["username"]))
		$_SESSION["username"] = null;

	if (!isset($_SESSION["id"]))
		$_SESSION["id"] = "guest";

	if (!function_exists("getallheaders")) {
		function getallheaders() {
			$headers = [];

			foreach ($_SERVER as $name => $value)
				if (substr($name, 0, 5) == "HTTP_")
					$headers[str_replace(" ", "-", ucwords(strtolower(str_replace("_", " ", substr($name, 5)))))] = $value;

			return $headers;
		}
	}

	function isLoggedIn() {
		if (session_status() !== PHP_SESSION_NONE && (isset($_SESSION["username"]) || $_SESSION["username"] !== null))
			return true;
		else
			return false;
	}

	/**
	 * Kiểm tra token trong session với token được gửi trong form
	 * @param	String	$token	Token (not required)
	 */
	function checkToken(String $token = null) {
		$sauce = $token ?? getHeader("token") ?? (isset($_POST["token"]) ? $_POST["token"] : null);

		if (empty($sauce))
			stop(4, "Token please!", 400);

		if (!isset($_SESSION["apiToken"]))
			stop(4, "No token available!", 500);

		if ($sauce !== $_SESSION["apiToken"])
			stop(5, "Wrong token!", 403, Array( "token" => $sauce ));
	}

	function getStringBetween($str, $left, $right) {
		$sub = substr($str, strpos($str, $left) + strlen($left), strlen($str));
		return substr($sub, 0, strpos($sub, $right));
	}

	function reqForm(String $key) {
		if (!isset($_POST[$key]))
			stop(1, "Undefined form: ". $key, 400);
		else
			return trim($_POST[$key]);
	}

	function reqQuery(String $key) {
		if (!isset($_GET[$key]))
			stop(1, "Undefined query: ". $key, 400);
		else
			return trim($_GET[$key]);
	}

	function reqHeader(String $key) {
		$headers = getallheaders();

		if (!isset($headers[$key]))
			stop(1, "Undefined header: ". $key, 400);
		else
			return trim($headers[$key]);
	}

	function reqKey(Array $data, String $key, String $type = "") {
		if (!isset($data[$key]))
			stop(8, "Undefined key: ". $key, 400);
		
		if ($type !== "" && gettype($data[$key]) !== $type)
			stop(3, "Variable type mismatch: key $key is not a $type");

		return $data[$key];
	}

	function reqKeys(Array $data, String ...$keys) {
		foreach ($keys as $key)
			if (!isset($data[$key]))
				stop(1, "Undefined key: ". $key, 400);
	}

	function reqData(String $type = "json") {
		$rawData = file_get_contents("php://input");

		try {
			switch ($type) {
				case "json":
					return json_decode($rawData, true);
				
				case "form":
					return $_POST;

				default:
					return $rawData;
			}
		} catch (\Exception $th) {
			errorHandler(
				$th -> getCode(),
				"reqData type $type failed: ". $th -> getMessage(),
				$th -> getFile(),
				$th -> getLine()
			);
		}
	}

	/**
	 * List of valid type:
	 *  + "boolean"
	 *  + "integer"
	 *  + "double"
	 *  + "string"
	 *  + "array"
	 *  + "object"
	 *  + "resource"
	 *  + "resource (closed)"
	 *  + "NULL"
	 *  + "unknown type"
	 * 
	 * @param	Mixed	$data	Data
	 * @param	String	$type	Type of Data
	 * @return	Mixed
	 */
	function reqType($data, $type = "string", $id = null) {
		if ($type === "boolean") {
			$data = strtolower($data);

			if ($data === "true" || $data === "false")
				return $data === "true";
			else
				stop(3, "Type Mismatch! \"$data\" is not a $type" . (isset($id) ? " in $id" : ""), 400);
		}

		if (!settype($data, $type))
			stop(3, "Type Mismatch! \"$data\" is not a $type" . (isset($id) ? " in $id" : ""), 400);
		
		return $data;
	}

	function getForm(String $key, $isNull = null) {
		return isset($_POST[$key]) ? trim($_POST[$key]) : $isNull;
	}

	function getQuery(String $key, $isNull = null) {
		return isset($_GET[$key]) ? trim($_GET[$key]) : $isNull;
	}

	function getHeader(String $key, $isNull = null) {
		$headers = getallheaders();
		return isset($headers[$key]) ? trim($headers[$key]) : $isNull;
	}

	function getKey(Array $data, String $key, $isNull = null) {
		return (isset($data[$key])
			? (is_string($data[$key])
				? trim($data[$key])
				: $data[$key])
			: $isNull);
	}

	/**
	 * List of valid type:
	 *  + "boolean"
	 *  + "integer"
	 *  + "double"
	 *  + "string"
	 *  + "array"
	 *  + "object"
	 *  + "resource"
	 *  + "resource (closed)"
	 *  + "NULL"
	 *  + "unknown type"
	 * 
	 * @param	Mixed	$data	Data
	 * @param	String	$type	Type of Data
	 * @return	Mixed
	 */
	function withType($data, $type = "string", $isNot = null) {
		if ($type === "boolean")
			return ($data === "true" || $data === "false" || $data === "0" || $data === "1")
				? ($data === "true" || $data === "0")
				: $isNot;

		if (isset($data) && !settype($data, $type))
			return $isNot;
		
		return $data;
	}

	function getAllHeadersUC() {
		$headers = getallheaders();
		$newHeaders = Array();

		foreach ($headers as $key => $item)
			$newHeaders[ucwords($key, "-")] = $item;

		return $newHeaders;
	}

	function header_set($name) {
		$name = strtolower($name);

		foreach (headers_list() as $item)
			if (strpos(strtolower($item), $name) >= 0)
				return true;
			
		return false;
	}

	/**
	 * Return the reference of the value in Object.
	 * @param	Array					$object
	 * @param	Array					$path
	 * @param	Bool					$safe
	 * @return	Array|String|Bool
	 */
	function &objectValue(Array &$object, Array $path, $value = null, Bool $safe = false) {
		if (!empty($path[0])) {
			if (count($path) > 1) {
				if (!isset($object[$path[0]]))
					if ($safe)
						$object[$path[0]] = Array();
					else
						throw new UndefinedIndex($path[0], $object);

				return objectValue($object[$path[0]], array_slice($path, 1), $value, $safe);
			}

			if ($value !== null)
				$object[$path[0]] = $value;

			if (!isset($object[$path[0]]))
				throw new UndefinedIndex($path[0], $object);
			
			return $object[$path[0]];
		} else
			throw new Error("objectValue(): Unknown Error!");
	}

	/**
	 * Remove the directory and its content recursively\
	 * (all files and subdirectories)
	 * 
	 * @param	String	$dir	Path to directory
	 * @param	Int		$count	Deleted files counter
	 */
	function rmrf($dir, Int &$count = 0) {
		foreach (glob($dir) as $file)
			if (is_dir($file)) {
				rmrf("$file/*", $count);
				rmdir($file);
			} else {
				unlink($file);
				$count++;
			}
	}

	/**
	 * Thay đổi header Content-Type tương ứng với đuôi tệp
	 * 
	 * @param	String	$ext		Đuôi tên tệp
	 * @param	String	$charset
	 * @return	Bool
	 * 
	 */
	function contentType(String $ext, String $charset = "utf-8") {
		$mimet = Array(
			"txt" => "text/plain",
			"htm" => "text/html",
			"html" => "text/html",
			"php" => "text/html",
			"css" => "text/css",
			"js" => "application/javascript",
			"json" => "application/json",
			"xml" => "application/xml",
			"swf" => "application/x-shockwave-flash",
			"crx" => "application/x-chrome-extension",
			"flv" => "video/x-flv",
			"log" => "text/x-log",
			"csv" => "text/csv",
	
			// images
			"png" => "image/png",
			"jpe" => "image/jpeg",
			"jpeg" => "image/jpeg",
			"jpg" => "image/jpeg",
			"gif" => "image/gif",
			"bmp" => "image/bmp",
			"ico" => "image/vnd.microsoft.icon",
			"tiff" => "image/tiff",
			"tif" => "image/tiff",
			"svg" => "image/svg+xml",
			"svgz" => "image/svg+xml",
			"webp" => "image/webp",
	
			// archives
			"zip" => "application/zip",
			"rar" => "application/x-rar-compressed",
			"exe" => "application/x-msdownload",
			"msi" => "application/x-msdownload",
			"cab" => "application/vnd.ms-cab-compressed",
	
			// audio/video
			"mp3" => "audio/mpeg",
			"qt" => "video/quicktime",
			"mov" => "video/quicktime",
			"flv" => "video/x-flv",
			"mp4" => "video/mp4",
			"3gp" => "video/3gpp",
			"avi" => "video/x-msvideo",
			"wmv" => "video/x-ms-wmv",

			// adobe
			"pdf" => "application/pdf",
			"psd" => "image/vnd.adobe.photoshop",
			"ai" => "application/postscript",
			"eps" => "application/postscript",
			"ps" => "application/postscript",
	
			// ms office
			"doc" => "application/msword",
			"rtf" => "application/rtf",
			"xls" => "application/vnd.ms-excel",
			"ppt" => "application/vnd.ms-powerpoint",
			"docx" => "application/msword",
			"xlsx" => "application/vnd.ms-excel",
			"pptx" => "application/vnd.ms-powerpoint",
	
			// open office
			"odt" => "application/vnd.oasis.opendocument.text",
			"ods" => "application/vnd.oasis.opendocument.spreadsheet",
		);

		if (isset($mimet[$ext])) {
			header("Content-Type: ". $mimet[$ext] ."; charset=". $charset);
			return $mimet[$ext];
		} else
			return null;
	}

	/**
	 * Generate Random Number
	 * @param	int|float		$min		Minimum Random Number
	 * @param	int|float		$max		Maximum Random Number
	 * @param   Bool			$toInt		To return an Integer Value
	 * @return	int|float		Generated number
	 */
	function randBetween($min, $max, Bool $toInt = true) {
		$rand = (float)(mt_rand() / mt_getrandmax());

		return $toInt
			? intval($rand * ($max - $min + 1) + $min)
			: ($rand * ($max - $min) + $min);
	}

	/**
	 * Generate Random String
	 * @param	Int			$len		Length of the randomized string
	 * @param	String		$charSet	Charset
	 * @return	String		Generated String
	 */
	function randString($len = 16, $charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
		$randomString = "";

		for ($i = 0; $i < $len; $i++) {
			$p = randBetween(0, strlen($charSet), true);
			$randomString .= substr($charSet, $p, 1);
		}

		return $randomString;
	}

	/**
	 *
	 * Print out response data, set some header
	 * and stop script execution!
	 * 
	 * @param	Int				$code			Response code
	 * @param	String			$description	Response description
	 * @param	Int				$HTTPStatus		Response HTTP status code
	 * @param	Array			$data			Response data (optional)
	 * @param	Bool|Mixed		$hashData		To hash the data/Data to hash
	 * @return	Void
	 *
	 */
	function stop(Int $code = 0, String $description = "", Int $HTTPStatus = 200, Array $data = Array(), $hashData = false) {
		global $runtime;
		$hash = is_bool($hashData) ? ($hashData ? md5(serialize($data)) : null) : md5(serialize($hashData));

		$output = Array(
			"code" => $code,
			"status" => $HTTPStatus,
			"description" => $description,
			"user" => $_SESSION["username"],
			"data" => $data,
			"hash" => $hash,
			"runtime" => $runtime -> stop()
		);

		// Set the HTTP status code
		http_response_code($HTTPStatus);

		if (!defined("PAGE_TYPE"))
			define("PAGE_TYPE", "NORMAL");

		switch (strtoupper(PAGE_TYPE)) {
			case "NORMAL":
				if (!headers_sent()) {
					header("Output: [$code] $description");
					header("Output-Json: ". json_encode($output));
				}

				if ($HTTPStatus >= 300 || $code !== 0)
					printErrorPage($output, true);

				break;
			
			case "API":
				if (!headers_sent()) {
					header("Content-Type: application/json", true);

					if (!header_set("Access-Control-Allow-Origin"))
						header("Access-Control-Allow-Origin: *", true);
				}
					
				print(json_encode($output, JSON_PRETTY_PRINT));
				
				break;

			default:
				print "<h1>Error $HTTPStatus</h1><p>$description</p>";

				break;
		}

		die();
	}

	/**
	 * Return new path relative to webserver's
	 * root path
	 * 
	 * @return	String
	 */
	function getRelativePath(String $fullPath, String $separator = "/") {
		$search = preg_replace("/(\\\\|\/)/m", $separator, $_SERVER["DOCUMENT_ROOT"]);
		$subject = preg_replace("/(\\\\|\/)/m", $separator, $fullPath);
		return str_replace($search, "", $subject);
	}

	/**
	 * `belibrary.stop()` friendly Exception
	 * 
	 * @copyright	`2018-2021` **Belikhun**
	 * @license		**MIT**
	 * @version		1.0
	 * @return		BLibException
	 */
	class BLibException extends Exception {
		public $code;
		public $status;
		public $description;
		public $user;
		public $data;

		/**
		 *
		 * @param	Int				$code			Response code
		 * @param	String			$description	Response description
		 * @param	Int				$HTTPStatus		Response HTTP status code
		 * @param	Array			$data			Response data (optional)
		 *
		 */
		public function __construct(Int $code, String $description, Int $HTTPStatus = 200, Array $data = Array(), Exception $previous = null) {
			$this -> code = $code;
			$this -> status = $HTTPStatus;
			$this -> description = $description;
			$this -> user = $_SESSION["username"];
			$this -> data = $data;

			parent::__construct($description, $code, $previous);

			$this -> data["file"] = getRelativePath(parent::getFile());
			$this -> data["line"] = parent::getLine();
			$this -> data["trace"] = parent::getTrace();
		}
		
		public function __toString() {
			return get_class($this) .": [HTTP {$this -> status}] [{$this -> code}]: {$this -> description}";
		}
	}

	class FileNotFound extends BLibException {
		public function __construct(String $path) {
			parent::__construct(44, "File Not Found: {$path}", 500, Array( "path" => $path ));
		}
	}

	class UndefinedIndex extends BLibException {
		public function __construct(String $key, $data) {
			parent::__construct(44, "Undefined Index: {$key}", 500, Array( "key" => $key, "data" => $data ));
		}
	}

	class JSONDecodeError extends BLibException {
		public function __construct(String $file, String $message, $data) {
			$file = getRelativePath($file);
			parent::__construct(47, "json_decode({$file}): {$message}", 500, Array( "file" => $file, "data" => $data ));
		}
	}

	class UnserializeError extends BLibException {
		public function __construct(String $file, String $message, $data) {
			$file = getRelativePath($file);
			$message = str_replace("unserialize(): ", "", $message);

			parent::__construct(47, "unserialize({$file}): {$message}", 500, Array( "file" => $file, "data" => $data ));
		}
	}

	/**
	 *
	 * Return Human Readable Size
	 * 
	 * @param	Int		$bytes		Size in byte
	 * @return	String	Readable Size
	 *
	 */
	function convertSize(Int $bytes) {
		$sizes = array("B", "KB", "MB", "GB", "TB");
		for ($i = 0; $bytes >= 1024 && $i < (count($sizes) -1); $bytes /= 1024, $i++);
		
		return (round($bytes, 2 ) . " " . $sizes[$i]);
	}

	/**
	 *
	 * Return Folder Size
	 * 
	 * @param	String		$dir			Target Directory
	 * @param   Bool		$recursive		Include Subdirectories Size
	 * @return	Int			Folder Size
	 *
	 */
	function folderSize(String $dir, Bool $recursive = false) {
		$size = 0;
		foreach (glob($dir ."/*", GLOB_NOSORT) as $i => $file)
			$size += is_file($file) ? filesize($file) : ($recursive ? folderSize($file) : 0);
		
		return $size;
	}

	/**
	 *
	 * Remove Dublication Item In An Array
	 * 
	 * @param	Array	$inp	The Array
	 * @return	Array	Cleaned Array
	 *
	 */
	function arrayRemDub(Array $inp) {
		$out = Array();
		$i = 0;

		sort($inp, SORT_NATURAL);
		foreach($inp as $k => $v)
			if (!isset($out[$i-1]) || $out[$i-1] !== $v) {
				$out[$i] = $v;
				$i++;
			}
		return $out;
	}

	/**
	 *
	 * Remove Empty Item In An Array
	 * 
	 * @param	Array	$inp	The Array
	 * @return	Array	Cleaned Array
	 *
	 */
	function arrayRemBlk($inp) {
		$out = Array();
		foreach($inp as $i => $v)
			if (isset($v))
				array_push($out, $v);
		return $out;
	}

	function diskSpace($path) {
		$free = disk_free_space($path);
		$total = disk_total_space($path);
		$used = $total - $free;
		$used_p = sprintf("%.2f",($used / $total) * 100);
		return Array(
			"path" => $path,
			"total" => $total,
			"total_f" => convertSize($total),
			"used" => $used,
			"used_f" => convertSize($used),
			"used_p" => $used_p,
			"free" => $free,
			"free_f" => convertSize($free)
		);
	}

	function getClientIP() {
		return
			   $_SERVER["REMOTE_ADDR"]
			?? $_SERVER["HTTP_CLIENT_IP"]
			?? getenv("HTTP_CLIENT_IP")
			?? getenv("HTTP_X_FORWARDED_FOR")
			?? getenv("HTTP_X_FORWARDED")
			?? getenv("HTTP_FORWARDED_FOR")
			?? getenv("HTTP_FORWARDED")
			?? getenv("REMOTE_ADDR")
			?? "UNKNOWN";
	}

	/**
	 * Check array is associative or sequential
	 * 
	 * Return `true` if the array is associative, else sequential
	 * 
	 * @param	Array	$array	Input Array
	 * @return	Boolean
	 */
	function isAssoc(Array $array) {
		if (array() === $array)
			return false;

    	return array_keys($array) !== range(0, count($array) - 1);
	}

	/**
	 *
	 * Recursive and Safe Array Object Merging
	 * 
	 * Only merge key in the object that exist in the target
	 * 
	 * @param	Array			$target				Target Object need to be merged
	 * @param	Array			$object				Array Object need to merge
	 * @param	Bool|Function	$typeSensitive		Do a type check before merging key
	 * @param	Bool			$overWriteArray		Overwrite Array instead of merging
	 * @param	Int				$counter			Number of merged keys
	 * @return	Number			Number of merged keys
	 *
	 */
	function mergeObjectRecursive(Array &$target, Array $object, $typeSensitive = true, Bool $overWriteArray = true, Int &$counter = 0, String $__path = "") {
		foreach ($target as $key => &$value)
			if (array_key_exists($key, $object)) {
				$path = $__path === ""
					? $key
					: $__path .".". $key;

				if (is_callable($typeSensitive)) {
					if (!$typeSensitive(gettype($value), gettype($object[$key]), $path))
						continue;
				} else
					if ($typeSensitive && $value !== null && (gettype($value) !== gettype($object[$key])))
						continue;

				if (gettype($object[$key]) === "array" && gettype($value) === "array") {
					if ($overWriteArray && !isAssoc($object[$key])) {
						// Target is sequential array so we set new
						// value to it directly
						$value = $object[$key];
						$counter++;
					} else
						mergeObjectRecursive($value, $object[$key], $typeSensitive, $overWriteArray, $counter, $path);
				} else if ($value !== $object[$key]) {
					$value = $object[$key];
					$counter++;
				}
			}

		return $counter;
	}

	/**
	 * Safe JSON PArsing
	 * 
	 * This function will throw an error if there is problem
	 * while parsing json data
	 * 
	 * @param	String	$json	JSON String
	 * @param	String	$path	(Optional) Provide json file path to show in the error message
	 * @throws	JSONDecodeError
	 * @return	Array
	 */
	function safeJSONParsing(String $json, String $path = "") {
		// Temporary disable `NOTICE` error reporting
		// to try unserialize data without triggering `E_NOTICE`
		error_reporting(E_ERROR);
		$json = json_decode($json, true);
		error_reporting(E_ALL);

		if ($json === null)
			throw new JSONDecodeError($path, json_last_error_msg(), Array(
				"code" => json_last_error(),
				"message" => json_last_error_msg()
			));

		return $json;
	}

	/**
	 * Simple File Input/Output
	 * 
	 * @author	Belikhun
	 * @version	2.1
	 */
	class fip {
		private $maxTry = 20;
		public $stream;
		public $path;

		public function __construct(String $path, String $defaultData = "", String $defaultType = "text") {
			$this -> path = $path;

			if (!file_exists($path))
				$this -> write($defaultData, $defaultType, "x");
		}

		public function fos(String $path, String $mode) {
			$this -> stream = fopen($path, $mode);

			if (!$this -> stream) {
				$e = error_get_last();
				throw new BLibException(8, "fip -> fos(): [". $e["type"] ."]: ". $e["message"] ." tại ". $e["file"] ." dòng ". $e["line"], 500, $e);
			}
		}

		public function fcs() {
			fclose($this -> stream);
		}

		/**
		 *
		 * Read file
		 * type: text/json/serialize
		 * 
		 * @param	String	$type	File data type
		 * @return	String|Array|Object
		 *
		 */
		public function read($type = "text") {
			if (file_exists($this -> path)) {
				$tries = 0;
				
				while (!is_readable($this -> path)) {
					$tries++;
	
					if ($tries >= $this -> maxTry)
						throw new BLibException(46, "fip -> read(): Read Timeout: Không có quyền đọc file ". basename($this -> path) ." sau $tries lần thử", 500, Array(
							"path" => $this -> path
						));
	
					usleep(200000);
				}
			}

			$this -> fos($this -> path, "r");

			if (filesize($this -> path) > 0)
				$data = fread($this -> stream, filesize($this -> path));
			else
				$data = null;

			$this -> fcs();

			switch ($type) {
				case "json":
					return safeJSONParsing($data, $this -> path);

				case "serialize":
					// Temporary disable `NOTICE` error reporting
					// to try unserialize data without triggering `E_NOTICE`
					try {
						error_reporting(0);
						$data = unserialize($data);
						error_reporting(E_ALL);
					} catch(Throwable $e) {
						// pass
					}

					if ($data === false || $data === serialize(false)) {
						$e = error_get_last();
						throw new UnserializeError($this -> path, $e["message"], $e);
					}

					return $data;
				
				default:
					return $data;
			}
		}

		/**
		 *
		 * Write data to file
		 * type: text/json/serialize
		 * 
		 * @param	String|Array|Object		$data		Data to write
		 * @param	String					$type		File data type
		 * @return
		 *
		 */
		public function write($data = "", String $type = "text", String $mode = "w") {
			if (file_exists($this -> path)) {
				$tries = 0;
				
				while (!is_writable($this -> path)) {
					$tries++;
	
					if ($tries >= $this -> maxTry)
						throw new BLibException(46, "fip -> write(): Write Timeout: Không có quyền ghi vào file ". basename($this -> path) ." sau $tries lần thử", 500, Array(
							"path" => $this -> path
						));
	
					usleep(200000);
				}
			}

			$this -> fos($this -> path, $mode);

			switch ($type) {
				case "json":
					$data = json_encode($data, JSON_PRETTY_PRINT);
					break;

				case "serialize":
					$data = serialize($data);
					break;
			}

			fwrite($this -> stream, $data);
			$this -> fcs();
			return true;
		}
	}

	class StopClock {
		private $start;

		public function __construct() {
			$this -> start = microtime(true);
		}

		public function stop() {
			return (microtime(true) - $this -> start);
		}
	}

	function unserializeSessionData($sessionData) {
		$method = ini_get("session.serialize_handler");

		switch ($method) {
			case "php": {
				$returnData = array();
				$offset = 0;

				while ($offset < strlen($sessionData)) {
					if (!strstr(substr($sessionData, $offset), "|"))
						throw new BLibException(51, "unserializeSessionData(): Invalid Data, remaining: ". substr($sessionData, $offset), 500);
					
					$pos = strpos($sessionData, "|", $offset);
					$num = $pos - $offset;
					$varname = substr($sessionData, $offset, $num);
					$offset += $num + 1;
					$data = unserialize(substr($sessionData, $offset));
					$returnData[$varname] = $data;
					$offset += strlen(serialize($data));
				}

				return $returnData;
			}
				
			case "php_binary": {
				$returnData = array();
				$offset = 0;

				while ($offset < strlen($sessionData)) {
					$num = ord($sessionData[$offset]);
					$offset += 1;
					$varname = substr($sessionData, $offset, $num);
					$offset += $num;
					$data = unserialize(substr($sessionData, $offset));
					$returnData[$varname] = $data;
					$offset += strlen(serialize($data));
				}

				return $returnData;
				break;
			}
			
			default:
				throw new BLibException(-1, "Unsupported session.serialize_handler: { $method} Supported: php, php_binary", 500);
		}
	}

	function printErrorPage(Array $data, Bool $redirect = false) {
		$_SESSION["lastError"] = $data;
		print "<!-- OUTPUT STOPPED HERE -->";
		print "<!-- ERROR DETAILS: ". json_encode($data, JSON_PRETTY_PRINT) ." -->";
		print "<!-- BEGIN ERROR PAGE -->";
		
		if ($redirect)
			header("Location: /error.php?redirect=true");
		else
			require $_SERVER["DOCUMENT_ROOT"]. "/lib/error.php";
	}

	//! Error Handler
	function errorHandler(Int $code, String $text, String $file, Int $line) {
		$errorData = Array(
			"code" => $code,
			"description" => $text,
			"file" => getRelativePath($file),
			"line" => $line,
		);
		
		if (function_exists("writeLog"))
			writeLog("ERRR", "[$code] $text tại ". getRelativePath($file) .":". $line);

		stop(-1, "Error Occurred: ". $text, 500, $errorData);
	}

	//! Exception Handler
	function exceptionHandler($e) {
		if ($e instanceof BLibException)
			stop($e -> code, $e, $e -> status, $e -> data);
		else
			stop(-1, get_class($e) ." [{$e -> getCode()}]: {$e -> getMessage()} tại {$e -> getFile()}:{$e -> getLine()}", 500);
	}

	set_exception_handler("exceptionHandler");
	set_error_handler("errorHandler", E_ALL);

	//? START TIME
	if (!isset($runtime))
		$runtime = new StopClock();