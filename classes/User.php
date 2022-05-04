<?php
/**
 * \User.php
 * 
 * User Object/Interface
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

class User {
	/** @var int */
	public $id;

	/** @var String */
	public $username;

	/** @var String */
	public $name;

	/** @var String */
	protected $email;

	/** @var String */
	protected $phone;

	/**
	 * Hashed password.
	 * @var String
	 */
	protected $password;

	/** @var String */
	public $avatar;

	/** @var bool */
	protected $emailVerified;

	/** @var bool */
	protected $isAdmin;

	public function __construct(
		int $id = null,
		String $username,
		String $name,
		String $email,
		String $phone,
		String $password = null,
		String $avatar = null,
		bool $emailVerified = false,
		bool $isAdmin = false,
	) {
		$this -> id = $id;
		$this -> username = $username;
		$this -> name = $name;
		$this -> email = $email;
		$this -> phone = $phone;
		$this -> password = $password;
		$this -> avatar = $avatar;
		$this -> emailVerified = $emailVerified;
		$this -> isAdmin = $isAdmin;
	}

	public function getEmail() {
		return $this -> email;
	}

	public function setEmail(String $email) {
		$this -> email = $email;
	}

	public function getPhone() {
		return $this -> phone;
	}

	public function setPhone(String $phone) {
		$this -> phone = $phone;
	}

	public function isAdmin() {
		return $this -> isAdmin;
	}

	public function setAdmin(bool $admin) {
		$this -> isAdmin = $admin;
	}

	public function isEmailVerified() {
		return $this -> emailVerified;
	}

	public function setEmailVerified(bool $verified) {
		$this -> emailVerified = $verified;
	}

	/**
	 * Validate password with hash stored in the
	 * database.
	 * 
	 * @param	String	$password	Password to validate.
	 * @return	Bool
	 */
	public function validate(String $password) {
		return password_verify($password, $this -> password);
	}

	public function avatarURI() {
		return "/api/avatar?u={$this -> username}";
	}

	public function render(bool $avatar = true) {
		?>
		<div class="userinfo" username="<?php echo $this -> username; ?>">
			<?php if ($avatar)
				\Lazyload::add($this -> avatarURI(), [ "avatar" ]); ?>
			
			<a class="name" href="/u/<?php echo $this -> username; ?>"><?php echo $this -> name; ?></a>
		</div>
		<?php
	}

	public function renderProfile() {
		
		?>
		<div class="userProfile">
			<?php \Lazyload::add($this -> avatarURI(), [ "avatar" ]); ?>
			<div class="name"><?php echo $this -> name; ?></div>
		</div>
		<?php
	}

	public function getPassword() {
		return $this -> password;
	}

	/**
	 * Set a new password for this user, and then save changes to DB.
	 * This can be used to register a new account with specified password.
	 * @param	String	$password
	 * @return	int		User ID
	 */
	public function setPassword($password) {
		$options = Array();

		if (defined("PASSWORD_ARGON2I")) {
			$algo = PASSWORD_ARGON2I;
			$options["time_cost"] = 8;
		} else {
			$algo = PASSWORD_DEFAULT;
			$options["cost"] = 12;
		}

		$this -> password = password_hash($password, $algo, $options);

		if (empty($this -> password))
			throw new GeneralException(UNKNOWN_ERROR, "An error occured while hashing your password!", 500);

		if (empty($this -> id))
			$this -> id = DB::insert("users", $this);
		else
			self::save();

		return $this -> id;
	}

	/**
	 * Set user's avatar
	 *
	 * @param	Array	$avatar		Avatar file from `$_FILES` variable
	 * @return	bool
	 */
	public function setAvatar($avatar) {
		switch ($avatar["error"]) {
			case UPLOAD_ERR_OK:
				break;
			case UPLOAD_ERR_NO_FILE:
				throw new GeneralException(41, "No file sent!", 400, $avatar["error"]);
			case UPLOAD_ERR_INI_SIZE:
			case UPLOAD_ERR_FORM_SIZE:
				throw new GeneralException(42, "File limit exceeded!", 400, $avatar["error"]);
			default:
				throw new GeneralException(-1, "Unknown error while handing file upload!", 500, $avatar["error"]);
		}
		
		$extension = pathinfo($avatar["name"], PATHINFO_EXTENSION);
		if (!in_array($extension, CONFIG::$IMAGE_ALLOW)) {
			throw new GeneralException(
				INVALID_FILE,
				"Không chấp nhận loại tệp!",
				400,
				Array( "allow" => CONFIG::$IMAGE_ALLOW )
			);
		}
		
		if ($avatar["size"] > CONFIG::$IMAGE_SIZE) {
			throw new GeneralException(42, "Tệp quá lớn!", 400, Array(
				"size" => $avatar["size"],
				"max" => CONFIG::$IMAGE_SIZE
			));
		}
		
		$filename = md5(\Session::$username . bin2hex(random_bytes(5)));
		$path = CONFIG::$AVATAR_ROOT . "/$filename";
		
		// Remove old avatar if exist
		if (!empty($this -> avatar)) {
			$old = CONFIG::$AVATAR_ROOT . "/{$this -> avatar}";
		
			if (file_exists($old))
				unlink($old);
		}
		
		$this -> avatar = $filename;
		move_uploaded_file($avatar["tmp_name"], $path);
		$this -> save();
		return true;
	}

	/**
	 * Save changes made to this Object to DB.
	 * @return	bool
	 */
	public function save() {
		DB::update("users", $this);
	}

	/**
	 * Delete this user from DB.
	 * @return bool
	 */
	public function delete() {
		return DB::delete("users", Array( "id" => $this -> id )) > 0;
	}

	/**
	 * Get all fields including protected fields.
	 * Except password 👀
	 * 
	 * @return	Object
	 */
	public function getFields() {
		$fields = new stdClass();

		foreach ($this as $key => $value) {
			if ($key === "password")
				continue;

			$fields -> {$key} = $value;
		}
		
		return $fields;
	}

	public static function getByID(int $id) {
		$record = DB::record("users", Array( "id" => $id ));
		
		if (empty($record))
			throw new UserNotFound(Array( "id" => $id ));

		return self::processRecord($record);
	}

	public static function getByUsername(String $username) {
		$record = DB::record("users", Array( "username" => $username ));
		
		if (empty($record))
			throw new UserNotFound(Array( "username" => $username ));

		return self::processRecord($record);
	}

	public static function fromLMS(\LMS\User $user) {
		return self::getByUsername($user -> username);
	}

	/**
	 * Process record from database.
	 * @param	\Object		$record
	 * @return	\User
	 */
	public static function processRecord(Object $record) {
		return new self(
			$record -> id,
			$record -> username,
			$record -> name,
			$record -> email,
			$record -> phone,
			$record -> password,
			$record -> avatar,
			(bool) $record -> emailVerified,
			(bool) $record -> isAdmin
		);
	}
}