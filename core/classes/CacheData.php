<?php
/**
 * Cache Data object.
 * 
 * @copyright	2022 Belikhun
 * @author		Belikhun <belivipro9x99@gmail.com>
 * @license		https://tldrlegal.com/license/mit-license MIT
 */

namespace Cache;

define("CACHE_AGE_INF", -1);

class Data {
	public String $id;

	public int $age = CACHE_AGE_INF;

	public int $time = 0;

	public mixed $content = null;

	public function __serialize() {
		return Array(
			"id" => $this -> id,
			"age" => $this -> age,
			"time" => $this -> time,
			"content" => $this -> content
		);
	}

	public function __unserialize(Array $data) {
		$this -> id = $data["id"];
		$this -> age = $data["age"];
		$this -> time = $data["time"];
		$this -> content = $data["content"];
	}
}