<?php
/**
 * \belibrary.php
 * 
 * Init / Global function definition.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

require_once "const.php";

//* ========================== Exception classes ==========================

class GeneralException extends Exception {
	/**
	 * Error Code
	 * @var	int
	 */
	public $code;

	/**
	 * Error Description/Message
	 * @var	string
	 */
	public $description;

	/**
	 * HTTP Status Code
	 * @var	int
	 */
	public $status;

	/**
	 * Optional Error Data
	 * @var	array|stdClass
	 */
	public $data;

	/**
	 * Exception class designed for detailed error report.
	 * 
	 * @param	int					$code			Error Code
	 * @param	string				$description	Error Description/Message
	 * @param	int					$status			HTTP Status Code
	 * @param	Array|stdClass		$data			Optional Error Data
	 */
	public function __construct(int $code, string $description, int $status = 500, Array|stdClass $data = null) {
		$this -> code = $code;
		$this -> description = $description;
		$this -> status = $status;
		$this -> data = $data;
		parent::__construct($description, $code);

		$this -> data["file"] = getRelativePath(parent::getFile());
		$this -> data["line"] = parent::getLine();
		$this -> data["trace"] = parent::getTrace();
	}

	public function __toString() {
		return "HTTP {$this -> status} ({$this -> code}) ". get_class($this) .": {$this -> description}";
	}
}

class JSONDecodeError extends GeneralException {
	public function __construct(String $file, String $message, $data) {
		$file = getRelativePath($file);
		parent::__construct(INVALID_JSON, "json_decode({$file}): {$message}", 500, Array( "file" => $file, "data" => $data ));
	}
}

class UnserializeError extends GeneralException {
	public function __construct(String $file, String $message, $data) {
		$file = getRelativePath($file);
		$message = str_replace("unserialize(): ", "", $message);

		parent::__construct(47, "unserialize({$file}): {$message}", 500, Array( "file" => $file, "data" => $data ));
	}
}

class MissingParam extends GeneralException {
	public function __construct(String $param) {
		parent::__construct(MISSING_PARAM, "missing required param: $param", 400, Array( "param" => $param ));
	}
}

class FileNotFound extends GeneralException {
	public function __construct(String $path) {
		parent::__construct(FILE_MISSING, "File \"$path\" does not exist on this server.", 404, Array( "path" => $path ));
	}
}

class IllegalAccess extends GeneralException {
	public function __construct(String $message = null) {
		parent::__construct(ACCESS_DENIED, $message ?: "You don't have permission to access this resource.", 403);
	}
}

class SQLError extends GeneralException {
	public function __construct(int $code, String $description, String $query = null) {
		parent::__construct(SQL_ERROR, $description, 500, Array(
			"code" => $code,
			"description" => $description,
			"query" => $query
		));
	}
}

class CodingError extends GeneralException {
	public function __construct($message) {
		parent::__construct(CODING_ERROR, $message, 500);
	}
}

class UserNotFound extends GeneralException {
	public function __construct(Array $field) {
		$key = array_key_first($field);
		$value = $field[$key];

		parent::__construct(USER_NOT_FOUND, "Cannot find user with $key = $value", 404, $field);
	}
}

class RouteArgumentMismatch extends GeneralException {
	public function __construct(\Router\Route $route, $message) {
		parent::__construct(DATA_TYPE_MISMATCH, $message, 400, (Array) $route);
	}
}

class InvalidToken extends GeneralException {
	public function __construct() {
		parent::__construct(INVALID_TOKEN, "The token supplied is invalid or does not exist.", 403);
	}
}

class TokenExpired extends GeneralException {
	public function __construct() {
		parent::__construct(TOKEN_EXPIRED, "The token supplied is expired.", 403);
	}
}

//* ========================== Function definitions ==========================

if (!function_exists("getallheaders")) {
	function getallheaders() {
		$headers = [];

		foreach ($_SERVER as $name => $value)
			if (substr($name, 0, 5) == "HTTP_")
				$headers[str_replace(" ", "-", ucwords(strtolower(str_replace("_", " ", substr($name, 5)))))] = $value;

		return $headers;
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

/**
 * Safe JSON Parsing
 * 
 * This function will throw an error if there is problem
 * while parsing json data.
 * 
 * @param	String	$json	JSON String
 * @param	String	$path	(Optional) Provide json file path to show in the error message
 * @throws	JSONDecodeError
 * @return	Array|Object
 */
function safeJSONParsing(String $json, String $path = "", bool $assoc = false) {
	// Temporary disable `NOTICE` error reporting
	// to try unserialize data without triggering `E_NOTICE`
	error_reporting(E_ERROR);
	$json = json_decode($json, $assoc);
	error_reporting(E_ALL);

	if ($json === null)
		throw new JSONDecodeError($path, json_last_error_msg(), Array(
			"code" => json_last_error(),
			"message" => json_last_error_msg()
		));

	return $json;
}

/**
 * Makes sure the data is using valid utf8, invalid characters are discarded.
 * @param	mixed	$value
 * @return	mixed	with proper utf-8 encoding
 */
function cleanUTF8($value) {
    if (is_null($value) || $value === "")
        return $value;

    if (is_string($value)) {
        if ((string)(int) $value === $value)
            return $value;

        // No null bytes expected in our data, so let's remove it.
        $value = str_replace("\0", "", $value);

        static $buggyiconv = null;
        if ($buggyiconv === null) {
            $buggyiconv = (!function_exists("iconv") or @iconv("UTF-8", "UTF-8//IGNORE", "100".chr(130)."€") !== "100€");
        }

        if ($buggyiconv) {
            if (function_exists("mb_convert_encoding")) {
                $subst = mb_substitute_character();
                mb_substitute_character("none");
                $result = mb_convert_encoding($value, "utf-8", "utf-8");
                mb_substitute_character($subst);
            } else {
                $result = $value;
            }

        } else {
            $result = @iconv("UTF-8", "UTF-8//IGNORE", $value);
        }

        return $result;
    }
	
	if (is_array($value)) {
        foreach ($value as $k => $v)
            $value[$k] = cleanUTF8($v);

        return $value;
    }
	
	if (is_object($value)) {
        $value = clone($value);
        foreach ($value as $k => $v)
            $value -> $k = cleanUTF8($v);

        return $value;
    }

	// This is some other type, no utf-8 here.
	return $value;
}

/**
 * This function is used to clean, or cast value into
 * different type.
 * 
 * @param	mixed	$param		Target variable to clean
 * @param	string	$type		Target variable type
 * @return	mixed
 */
function cleanParam($param, $type) {
	if (is_array($param) || is_object($param))
		throw new GeneralException(-1, "cleanParam(): this function does not accept array or object!");

	switch ($type) {
		case TYPE_INT:
			return (int) $param;

		case TYPE_FLOAT:
			return (float) $param;

		case TYPE_DOUBLE:
			return (double) $param;

		case TYPE_TEXT:
		case TYPE_STRING:
			$param = cleanUTF8($param);
			return strip_tags($param);

		case TYPE_RAW:
			return cleanUTF8($param);

		case TYPE_BOOL:
			if (is_bool($param))
				return $param;

			$p = strtolower($param);
			
			if ($p === "on" || $p === "yes" || $p === "true")
				$param = true;
			else if ($p === "off" || $p === "no" || $p === "false")
				$param = false;
			else
				$param = empty($param);
			
			return $param;
		
		case TYPE_JSON:
			return safeJSONParsing($param, "cleanParam");

		case TYPE_JSON_ASSOC:
			return safeJSONParsing($param, "cleanParam", true);

		default:
			throw new GeneralException(-1, "cleanParam(): unknown param type: $type", 400);
	}
}

/**
 * Validate an value.
 * Return false or throw an exception if value is not an valid
 * format of provided type.
 * 
 * @param	mixed		$value		Value to check
 * @param	String		$type		Value type
 * @param	bool		$throw		Throw an exception or just return false?
 * 
 * @return	bool
 * @throws	InvalidValue
 */
function validate($value, $type, $throw = true) {
	$valid = false;

	switch ($type) {
		case TYPE_INT:
			$valid = (is_int($value) || ctype_digit($value));
			break;

		case TYPE_FLOAT:
			$valid = (is_float($value) || is_numeric($value));
			break;

		case TYPE_EMAIL:
			$valid = (bool) preg_match(
				"/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/", $value);
			break;
		
		case TYPE_USERNAME:
			$valid = (bool) preg_match("/^[a-zA-Z0-9]+$/", $value);
			break;

		case TYPE_PHONE:
			$valid = (bool) preg_match("/^0[0-9]{9,11}$/", $value);
			break;

		case TYPE_TEXT:
		case TYPE_RAW:
			$valid = true;
			break;

		default:
			throw new GeneralException(-1, "validate(): unknown param type: $type", 400);
			break;
	}

	if (!$valid) {
		if ($throw)
			throw new InvalidValue($value, $type);

		return false;
	}

	return true;
}

/**
 * Returns a particular value for the named variable, taken from
 * POST or GET, otherwise returning a given default.
 * 
 * @param	string		$name		Param name
 * @param	string		$type
 * @param	mixed		$default
 */
function getParam(string $name, $type = TYPE_TEXT, $default = null) {
	if (isset($_POST[$name]))
        $param = $_POST[$name];
    else if (isset($_GET[$name]))
        $param = $_GET[$name];
    else
        return $default;

	return cleanParam($param, $type);
}

/**
 * Returns a particular value for the named variable, taken from
 * POST or GET. If the parameter doesn't exist then an error is
 * thrown because we require this variable.
 * 
 * @param	string		$name		Param name
 * @param	string		$type
 * @param	mixed		$default
 * @throws	MissingParam
 */
function requiredParam(string $name, $type = TYPE_TEXT) {
	$param = getParam($name, $type);

	if ($param === null)
		throw new MissingParam($name);

	return $param;
}

/**
 * Returns a particular value for the named variable, taken from
 * request headers. This is done in a case-insensitive matter.
 * 
 * @param	string		$name		Header name
 * @param	string		$type
 * @param	mixed		$default
 */
function getHeader(string $name, $type = TYPE_TEXT, $default = null) {
	$param = null;

	foreach (getallheaders() as $key => $value) {
		if (strcasecmp($name, $key) === 0) {
			$param = $value;
			break;
		}
	}

	if ($param === null)
		return $default;

	return cleanParam($param, $type);
}

/**
 * Set Content-Type header using file extension
 * 
 * @param	String	$ext		File extension
 * @param	String	$charset
 * @return	Bool
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

function expireHeader($time) {
	header("Cache-Control: public, max-age=$time");
	header("Expires: " . gmdate("D, d M Y H:i:s \G\M\T", time() + $time));
	header_remove("pragma");
}

/**
 * Return new path relative to webserver"s
 * root path
 * 
 * @return	String
 */
function getRelativePath(String $fullPath, String $separator = "/", String $base = BASE_PATH) {
	$search = preg_replace("/(\\\\|\/)/m", $separator, $base);
	$subject = preg_replace("/(\\\\|\/)/m", $separator, $fullPath);
	return str_replace($search, "", $subject);
}

function header_set($name) {
	$name = strtolower($name);

	foreach (headers_list() as $item)
		if (strpos(strtolower($item), $name) >= 0)
			return true;
		
	return false;
}

function getClientIP() {
	return $_SERVER["REMOTE_ADDR"]
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
 * Return Human Readable Size
 * 
 * @param	int		$bytes		Size in byte
 * @return	String	Readable Size
 */
function convertSize(int $bytes) {
	$sizes = array("B", "KB", "MB", "GB", "TB");
	for ($i = 0; $bytes >= 1024 && $i < (count($sizes) -1); $bytes /= 1024, $i++);
	
	return (round($bytes, 2 ) . " " . $sizes[$i]);
}

class FileWithPriority {
	public String $path;
	public int $priority;

	public function __construct(String $path, int $priority) {
		$this -> path = $path;
		$this -> priority = $priority;
	}

	public function __serialize() {
        return Array(
			$this -> path,
			$this -> priority
		);
    }

    public function __unserialize(Array $data) {
		list(
			$this -> path,
			$this -> priority
		) = $data;
	}
}

/**
 * Glob files and sort them by priority defined by
 * `@priority` in comment doc.
 * 
 * It's a good idea to cache the return data of this function as
 * reading big files and performing a regex match with a large
 * string take a lot of time.
 *
 * @param	String		$pattern	Pattern relative to web root.
 * @return	FileWithPriority[]
 */
function globFilesPriority($pattern, int $flags = 0) {
	$files = glob(BASE_PATH . $pattern, $flags);
	$list = Array();

	// Parse files to priority list
	foreach ($files as $file) {
		$content = (new FileIO($file)) -> read();
		$item = new FileWithPriority($file, 0);
		$matches = null;

		if (preg_match("/\@priority(?:[\s\t]+)(\d+)/m", $content, $matches))
			$item -> priority = (int) $matches[1];

		$list[] = $item;
	}

	usort($list, function ($a, $b) {
		return $b -> priority <=> $a -> priority;
	});

	return $list;
}

/**
 * Glob files and sort them by priority defined by
 * `@priority` in comment doc. Return cached data if possible.
 *
 * @param	String		$pattern	Pattern relative to web root.
 * @return	FileWithPriority[]
 */
function globFilesPriorityCached($pattern, int $flags = 0) {
	$id = md5($pattern . $flags);
	$cache = new Cache($id);

	if (empty($cache -> getData())) {
		$data = globFilesPriority($pattern, $flags);
		$cache -> save($data);
		return $data;
	}

	return $cache -> getData();
}

/**
 * Simple File Input/Output
 * 
 * @author	Belikhun
 * @version	2.1
 */
class FileIO {
	private $maxTry = 20;
	public $stream;
	public $path;

	public function __construct(
		String $path,
		mixed $defaultData = "",
		String $defaultType = TYPE_TEXT
	) {
		$this -> path = $path;

		// Create folder if not exist.
		$base = pathinfo($path, PATHINFO_DIRNAME);
		if (!file_exists($base))
			mkdir($base, recursive: true);

		if (!file_exists($path))
			$this -> write($defaultData, $defaultType, "x");
	}

	public function fos(String $path, String $mode) {
		$this -> stream = fopen($path, $mode);

		if (!$this -> stream) {
			$e = error_get_last();
			throw new GeneralException(
				8,
				"FileIO -> fos(): [". $e["type"] ."]: "
					. $e["message"] . " tại "
					. $e["file"] . " dòng ". $e["line"],
				500,
				$e
			);
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
	public function read($type = TYPE_TEXT) {
		if (file_exists($this -> path)) {
			$tries = 0;
			
			while (!is_readable($this -> path)) {
				$tries++;

				if ($tries >= $this -> maxTry) {
					throw new GeneralException(
						46,
						"FileIO -> read(): Read Timeout: Không có quyền đọc file "
							. basename($this -> path) ." sau $tries lần thử",
						500,
						Array( "path" => $this -> path )
					);
				}
				
				usleep(200000);
			}
		}

		$metric = new \Metric\File("r", $type, $this -> path);
		$this -> fos($this -> path, "r");

		if (filesize($this -> path) > 0)
			$data = fread($this -> stream, filesize($this -> path));
		else
			$data = null;

		$this -> fcs();
		$metric -> time($data ? mb_strlen($data, "utf-8") : 0);

		if ($data === null)
			return null;

		switch ($type) {
			case TYPE_JSON:
				return safeJSONParsing($data, $this -> path);

			case TYPE_JSON_ASSOC:
				return safeJSONParsing($data, $this -> path, true);

			case TYPE_SERIALIZED:
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
	public function write($data, String $type = TYPE_TEXT, String $mode = "w") {
		if (file_exists($this -> path)) {
			$tries = 0;
			
			while (!is_writable($this -> path)) {
				$tries++;

				if ($tries >= $this -> maxTry)
					throw new GeneralException(46, "FileIO -> write(): Write Timeout: Không có quyền ghi vào file ". basename($this -> path) ." sau $tries lần thử", 500, Array(
						"path" => $this -> path
					));

				usleep(200000);
			}
		}

		$metric = new \Metric\File($mode, $type, $this -> path);
		$this -> fos($this -> path, $mode);

		switch ($type) {
			case TYPE_JSON:
				$data = json_encode($data, JSON_PRETTY_PRINT);
				break;

			case TYPE_SERIALIZED:
				$data = serialize($data);
				break;
		}

		fwrite($this -> stream, $data);
		$this -> fcs();
		$metric -> time(mb_strlen($data, "utf-8"));
		return true;
	}
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
 *
 * Print out response data, set some header
 * and stop script execution!
 * 
 * @param	Int				$code			Response code
 * @param	String			$description	Response description
 * @param	Int				$HTTPStatus		Response HTTP status code
 * @param	Array|Object	$data			Response data (optional)
 * @param	Bool|Mixed		$hashData		To hash the data/Data to hash
 * @return	Void
 *
 */
function stop(Int $code = 0, String $description = "", Int $status = 200, $data = Array(), $hashData = false) {
	global $runtime;
	$hash = is_bool($hashData) ? ($hashData ? md5(serialize($data)) : null) : md5(serialize($hashData));

	$debug = null;
	$caller = "hidden";

	if (!CONFIG::$PRODUCTION) {
		$traces = debug_backtrace();
		array_shift($traces);
	
		$from = Array();
	
		if (isset($traces[0])) {
			$from = $traces[0];
			$caller = isset($from["class"])
				? $from["class"] . ($from["type"] === "::" ? "::" : " {$from['type']} ") . $from["function"]
				: $from["function"];
		}

		$debug = Array(
			"caller" => $caller,
			"file" => isset($from["file"]) ? $from["file"] : null,
			"line" => isset($from["line"]) ? $from["line"] : null,
			"stacktrace" => $traces
		);
	}

	$output = Array(
		"code" => $code,
		"status" => $status,
		"description" => $description,
		"caller" => "{$caller}()",
		"user" => \Session::$username,
		"data" => $data,
		"hash" => $hash,
		"runtime" => $runtime -> stop(),
		"debug" => $debug
	);

	// Set the HTTP status code
	http_response_code($status);

	if (!defined("PAGE_TYPE"))
		define("PAGE_TYPE", "NORMAL");

	switch (strtoupper(PAGE_TYPE)) {
		case "NORMAL":
			if (!headers_sent()) {
				header("Output: [$code] $description");
				header("Output-Json: ". json_encode($output));
			}

			if ($status >= 300 || $code !== 0)
				printErrorPage($output, headers_sent());

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
			print "<h1>Error $status</h1><p>$description</p>";

			break;
	}

	die();
}

/**
 * Return information about disk space of specified path.
 * 
 * @param	String	$path
 * @return	Array
 */
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

function unserializeSessionData($sessionData) {
	$method = ini_get("session.serialize_handler");

	switch ($method) {
		case "php": {
			$returnData = array();
			$offset = 0;

			while ($offset < strlen($sessionData)) {
				if (!strstr(substr($sessionData, $offset), "|"))
					throw new GeneralException(51, "unserializeSessionData(): Invalid Data, remaining: ". substr($sessionData, $offset), 500);
				
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
			throw new GeneralException(-1, "Unsupported session.serialize_handler: {$method} Supported: php, php_binary", 500);
	}
}

//* ========================== Error handling ==========================

function printErrorPage(Array $data, Bool $redirect = false) {
	$_SESSION["lastError"] = $data;

	// print "<!-- OUTPUT STOPPED HERE -->\n";
	// print "<!-- ERROR DETAILS: ". json_encode($data, JSON_PRETTY_PRINT) ." -->\n";
	// print "<!-- BEGIN ERROR PAGE -->\n";
	
	if ($redirect && !defined("ERROR_NO_REDIRECT")) {
		if (headers_sent()) {
			// Use javascript to redirect instead.
			echo "<script>location.href = `/error?redirect=true`;</script>";
		} else {
			header("Location: /error?redirect=true");
		}
	} else {
		if (isset($data["status"]))
			$_SERVER["REDIRECT_STATUS"] = $data["status"];
		
		require BASE_PATH . "/error.php";
	}
}

if (!isset($runtime))
	$runtime = new StopClock();

//! Error Handler
function errorHandler(Int $code, String $text, String $file, Int $line) {
	// Diacard all output buffer to avoid garbage html.
	while (ob_get_level())
		ob_end_clean();
	
	$errorData = Array(
		"code" => $code,
		"description" => $text,
		"file" => getRelativePath($file),
		"line" => $line,
	);

	stop(-1, "Error Occurred: ". $text, 500, $errorData);
}

//! Exception Handler
function exceptionHandler($e) {
	// Discard all output buffer to avoid garbage html.
	while (ob_get_level())
		ob_end_clean();

	if ($e instanceof GeneralException)
		stop($e -> code, $e, $e -> status, $e -> data);
	else
		stop(-1, get_class($e) ." [{$e -> getCode()}]: {$e -> getMessage()} tại {$e -> getFile()}:{$e -> getLine()}", 500);
}

set_exception_handler("exceptionHandler");
set_error_handler("errorHandler", E_ALL);

// Include optional files and classes definition
// in the includes / classes directory.
foreach (CONFIG::$INCLUDES as $include) {
	if (!is_dir($include))
		continue;

	foreach (glob("$include/*.php") as $filename)
		require_once $filename;
}

//? Post init
if (class_exists("Session"))
	Session::start();