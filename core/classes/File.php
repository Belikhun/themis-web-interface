<?php
/**
 * File.php
 * 
 * File store interface.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class File {
	public static String $ROOT;

	public ?int $id;
	public String $hash;
	public String $filename;
	public String $extension;
	public String $mimetype;
	public int $size;
	public \User $author;
	public int $created;

	public function __construct(
		?int $id = null,
		String $hash = null,
		String $filename = null,
		String $extension = null,
		String $mimetype = null,
		int $size = null,
		\User $author = null,
		int $created = 0
	) {
		$this -> id = $id;
		$this -> hash = $hash;
		$this -> filename = $filename;
		$this -> extension = $extension;
		$this -> mimetype = $mimetype;
		$this -> size = $size;
		$this -> author = $author;
		$this -> created = $created;
	}

	public function isValidID() {
		return (!empty($this -> id) && $this -> id > 0);
	}

	public function save() {
		global $DB;

		$record = Array(
			"hash" => $this -> hash,
			"filename" => $this -> filename,
			"extension" => $this -> extension,
			"mimetype" => $this -> mimetype,
			"size" => $this -> size,
			"author" => $this -> author -> id,
			"created" => $this -> created
		);

		if ($this -> isValidID()) {
			$record["id"] = $this -> id;
			$DB -> update("files", $record);
		} else {
			$this -> id = $DB -> insert("files", $record);
		}
	}
	
	public function getStorePath() {
		return self::$ROOT . "/{$this -> hash}";
	}

	/**
	 * Serve file with content range support.
	 * @param	bool	$download		Send file download information header
	 * @return	void
	 */
	public function serve(bool $download = false) {
		// Close all stream to guarantee we echoed directly to
		// output stream.
		while (ob_get_length())
			ob_end_clean();

		$fs = @fopen($this -> getStorePath(), "rb");

		$size   = filesize($this -> getStorePath());
		$length = $size;           // Content length
		$start  = 0;               // Start byte
		$end    = $size - 1;       // End byte
		$buffer = 1024 * 8;

		header("Content-Type: {$this -> mimetype}");
		header("Accept-Ranges: 0-$length");


		if ($download)
			header("Content-Disposition: attachment; filename=\"{$this -> filename}\"");

		if (isset($_SERVER["HTTP_RANGE"])) {
			$c_start = $start;
			$c_end   = $end;

			list(, $range) = explode("=", $_SERVER["HTTP_RANGE"], 2);

			if (strpos($range, ",") !== false) {
				header("HTTP/1.1 416 Requested Range Not Satisfiable");
				header("Content-Range: bytes $start-$end/$size");
				exit();
			}

			if ($range == "-") {
				$c_start = $size - substr($range, 1);
			} else {
				$range  = explode("-", $range);
				$c_start = $range[0];
				$c_end   = (isset($range[1]) && is_numeric($range[1])) ? $range[1] : $size;
			}

			$c_end = ($c_end > $end) ? $end : $c_end;

			if ($c_start > $c_end || $c_start > $size - 1 || $c_end >= $size) {
				header("HTTP/1.1 416 Requested Range Not Satisfiable");
				header("Content-Range: bytes $start-$end/$size");
				exit();
			}

			$start  = $c_start;
			$end    = $c_end;
			$length = $end - $start + 1;
			fseek($fs, $start);
			header("HTTP/1.1 206 Partial Content");
		}

		header("Content-Range: bytes $start-$end/$size");
		header("Content-Length: ".$length);

		set_time_limit(0);
		while(!feof($fs) && ($p = ftell($fs)) <= $end) {
			if ($p + $buffer > $end)
				$buffer = $end - $p + 1;

			echo fread($fs, $buffer);
			flush();
		}

		fclose($fs);
		exit();
	}


	public static function getByHash(String $hash) {
		global $DB;
		$record = $DB -> record("files", Array("hash" => $hash));

		if (empty($record))
			throw new FileInstanceNotFound($hash);

		return self::processRecord($record);
	}

	public static function getByID(int $id) {
		global $DB;
		$record = $DB -> record("files", Array("id" => $id));

		if (empty($record))
			throw new FileInstanceNotFound($id);

		return self::processRecord($record);
	}

	/**
	 * Process uploaded file then save it into FS and DB.
	 * @param	Array	$file	File object from `$_FILES`
	 * @return	\File
	 */
	public static function processFile($file) {
		global $DB;
		
		switch ($file["error"]) {
			case UPLOAD_ERR_OK:
				break;
			case UPLOAD_ERR_NO_FILE:
				throw new GeneralException(41, "No file sent!", 400);
			case UPLOAD_ERR_INI_SIZE:
			case UPLOAD_ERR_FORM_SIZE:
				throw new GeneralException(42, "File limit exceeded!", 400);
			default:
				throw new GeneralException(-1, "Unknown error while handing file upload!", 500);
		}

		$hash = hash_file("md5", $file["tmp_name"]);

		// Check if file is already exist. If so
		// we don"t need to create new record for it.
		$record = $DB -> record("files", Array("hash" => $hash));
		if (!empty($record))
			return self::processRecord($record);

		$instance = new self(
			null,
			$hash,
			$file["name"],
			pathinfo($file["name"],PATHINFO_EXTENSION),
			mime_content_type($file["tmp_name"]),
			$file["size"],
			\Session::$user,
			time()
		);

		$instance -> save();
		move_uploaded_file($file["tmp_name"], self::$ROOT . "/{$hash}");
		return $instance;
	}

	/**
	 * Process a file record from the DB
	 *
	 * @param	Object	$record
	 * @return	\File
	 */
	public static function processRecord($record) {
		return new self(
			$record -> id,
			$record -> hash,
			$record -> filename,
			$record -> extension,
			$record -> mimetype,
			$record -> size,
			\User::getByID($record -> author),
			$record -> created
		);
	}

	/**
	 * Process a bunch of records object returned by DB
	 *
	 * @param	Object[]	$records
	 * @return	File[]
	 */
	public static function processRecords($records) {
		$files = Array();

		foreach ($records as $record)
			$files[] = self::processRecord($record);

		return $files;
	}
}

\File::$ROOT = &CONFIG::$FILES_ROOT;