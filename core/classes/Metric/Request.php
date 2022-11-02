<?php

namespace Metric;

class Request {
	public String $url;
	public String $method;
	public int $status;
	public float $time;
	private float $start;

	public function __construct(String $url, String $method) {
		$this -> url = $url;
		$this -> method = $method;
		$this -> time = -1;
		$this -> status = -1;
		$this -> start = microtime(true);
		\Metric::$requests[] = $this;
	}

	public function time(int $status) {
		$this -> status = $status;
		$this -> time = microtime(true);
	}

	public function getTime() {
		return ($this -> time > 0)
			? $this -> time - $this -> start
			: -1;
	}

	public function __toString() {
		return sprintf("%01.2fs %6s  %3d %s",
			$this -> getTime(),
			$this -> method,
			$this -> status,
			$this -> url);
	}
}