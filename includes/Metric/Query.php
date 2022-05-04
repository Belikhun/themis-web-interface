<?php

namespace Metric;

class Query {
	public String $mode;
	public String $table;
	public int $rows;
	public float $time;
	private float $start;

	public function __construct(String $mode, String $table) {
		$this -> mode = $mode;
		$this -> table = $table;
		$this -> time = -1;
		$this -> rows = -1;
		$this -> start = microtime(true);
		\Metric::$queries[] = $this;
	}

	public function time(int $rows) {
		$this -> rows = $rows;
		$this -> time = microtime(true);
	}

	public function getTime() {
		return $this -> time - $this -> start;
	}

	public function __toString() {
		return sprintf("%01.2fs %8s %16s %2d",
			$this -> getTime(),
			$this -> mode,
			$this -> table,
			$this -> rows);
	}
}