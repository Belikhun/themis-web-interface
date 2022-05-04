<?php

namespace Metric;

class File {
	public String $mode;
	public String $type;
	public String $file;
	public int $size;
	public float $time;
	private float $start;

	public function __construct(String $mode, String $type, String $file) {
		// Cache file is treated differently.
		if (str_ends_with($file, ".cache")) {
			$name = pathinfo($file, PATHINFO_FILENAME);
			$file = "[cache] " . substr($name, 0, 8);
		}

		$this -> mode = $mode;
		$this -> type = $type;
		$this -> file = $file;
		$this -> time = -1;
		$this -> size = -1;
		$this -> start = microtime(true);
		\Metric::$files[] = $this;
	}

	public function time(int $size) {
		$this -> size = $size;
		$this -> time = microtime(true);
	}

	public function getTime() {
		return $this -> time - $this -> start;
	}

	public function __toString() {
		return sprintf("%01.2fs %4s %10s %8s %s",
			$this -> getTime(),
			$this -> mode,
			$this -> type,
			convertSize($this -> size),
			getRelativePath($this -> file));
	}
}