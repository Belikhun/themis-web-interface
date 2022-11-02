<?php
/**
 * User.php
 * 
 * Default User class. Only included if page haven't
 * defined its own User class.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

abstract class User {
	public ?int $id;

	public ?String $username;

	abstract public function __construct(int $id, String $username);

	abstract public static function getByID(int $id): static;
	abstract public static function getByUsername(String $username): static;
}