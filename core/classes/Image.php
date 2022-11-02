<?php
/**
 * Image.php
 * 
 * Image interface for storing and managing images.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class Image {
	public static String $ROOT;

	public String $hash;

	public function __construct(String $hash) {
		$this -> hash = $hash;
	}

	protected function validate() {
		$path = realpath($this -> path());

		// File does not exist.
		if (!$path)
			throw new FileNotFound($this -> hash);

		$path = str_replace("\\", "/", $path);

		// Included file is outside of web root. This indicate
		// an LFI attack attempt.
		if (strpos($path, BASE_PATH) !== 0)
			throw new IllegalAccess();
	}

	protected function path() {
		return self::$ROOT . "/" . $this -> hash;
	}

	public function get() {
		$this -> validate();

		header("Content-Type: ". mime_content_type($this -> path()));
		readfile($this -> path());
	}

	public function getLink() {
		return "/api/image/" . $this -> hash;
	}

	public function save(Array $file) {
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

		$extension = pathinfo($file["name"], PATHINFO_EXTENSION);
		if (!in_array($extension, CONFIG::$IMAGE_ALLOW)) {
			throw new GeneralException(
				INVALID_FILE,
				"Không chấp nhận loại tệp!",
				400,
				Array( "allow" => CONFIG::$IMAGE_ALLOW )
			);
		}

		if ($file["size"] > CONFIG::$IMAGE_SIZE) {
			throw new GeneralException(42, "Tệp quá lớn!", 400, Array(
				"size" => $file["size"],
				"max" => CONFIG::$IMAGE_SIZE
			));
		}

		$path = $this -> path();

		// Remove old file if exist
		if (file_exists($path))
			unlink($path);

		move_uploaded_file($file["tmp_name"], $path);
	}

	public function delete() {
		unlink($this -> path());
	}

	public static function create(Array $file) {
		$id = bin2hex(random_bytes(22));
		$image = new self($id);
		$image -> save($file);
		return $image;
	}
}

Image::$ROOT = &CONFIG::$IMAGES_ROOT;