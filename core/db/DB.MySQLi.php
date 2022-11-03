<?php

namespace DB;

/**
 * DB.MySQLi.php
 * 
 * MySQLi database driver.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class MySQLi extends \DB {
	/** @var mysqli */
	public $mysqli;

	public function getType(String $type): String {
		return Array(
			"string" => "s",
			"double" => "d",
			"integer" => "i",
			"array" => "b",
			"boolean" => "i",
			"NULL" => "i"
		)[$type] ?: "s";
	}

	public function connect(Array $options) {
		if ($this -> connected)
			return;

		mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
		$this -> mysqli = new \mysqli(
			$options["host"],
			$options["username"],
			$options["password"],
			$options["database"]
		);

		$this -> connected = true;
	}

	/**
	 * Execute a SQL query.
	 * 
	 * @param	String		$sql	The query
	 * @param	Array		$params
	 * @param	int			$from
	 * @param	int			$limit
	 * @return	Object|Array|int	Array of rows object in select mode, inserted record
	 * 								id in insert mode, and number of affected row
	 * 								in update mode.
	 */
	public function execute(
		String $sql,
		Array $params = null,
		int $from = 0,
		int $limit = 0
	): Object|Array|int {
		$sql = trim($sql);

		// Detect current mode
		if (str_starts_with($sql, SQL_SELECT))
			$mode = SQL_SELECT;
		else if (str_starts_with($sql, SQL_INSERT))
			$mode = SQL_INSERT;
		else if (str_starts_with($sql, SQL_UPDATE))
			$mode = SQL_UPDATE;
		else if (str_starts_with($sql, SQL_DELETE))
			$mode = SQL_DELETE;
		else if (str_starts_with($sql, SQL_TRUNCATE))
			$mode = SQL_TRUNCATE;
		else
			throw new \CodingError("\$DB -> execute(): cannot detect sql execute mode");

		$from = max($from, 0);
		$limit = max($limit, 0);

		if ($from || $limit) {
			if ($mode !== SQL_SELECT)
				throw new \CodingError("\$DB -> execute(): \$from and \$limit can only be used in SELECT mode!");

			if ($limit < 1)
				$limit = "18446744073709551615";
			
			$sql .= " LIMIT $from, $limit";
		}

		// Generate types string.
		$types = "";
		if (!empty($params)) {
			foreach ($params as $value)
				$types = $types . $this -> getType(gettype($value));
		}

		try {
			$stmt = $this -> mysqli -> prepare($sql);
		} catch(\mysqli_sql_exception $e) {
			throw new \SQLError(
				$e -> getCode(),
				$e -> getMessage(),
				$sql
			);
		}

		if ($stmt === false) {
			throw new \SQLError(
				$this -> mysqli -> errno,
				$this -> mysqli -> error,
				$sql
			);
		}

		if (!empty($params)) {
			$vals = array_values($params);
			$stmt -> bind_param($types, ...$vals);
		}

		$stmt -> execute();

		// Check for error
		if ($stmt -> errno) {
			throw new \SQLError(
				$this -> mysqli -> errno,
				$this -> mysqli -> error,
				$sql
			);
		}

		$res = $stmt -> get_result();
		if (!is_bool($res)) {
			$rows = Array();

			while ($row = $res -> fetch_array(MYSQLI_ASSOC)) {
				$row = (Object) $row;
	
				if (isset($row -> id))
					$row -> id = (int) $row -> id;
	
				$rows[] = $row;
			}

			return $rows;
		}

		$id = null;
		$affected = 0;

		// Return the inserted record id when in insert mode and
		// number of affected rows on update mode.
		switch ($mode) {
			case SQL_INSERT:
				$id = @$this -> mysqli -> insert_id;
				break;

			case SQL_UPDATE:
			case SQL_DELETE:
			case SQL_TRUNCATE:
				$affected = @$this -> mysqli -> affected_rows;
				break;
		}

		$stmt -> close();

		switch ($mode) {
			case SQL_INSERT:
				return $id;

			case SQL_UPDATE:
			case SQL_DELETE:
			case SQL_TRUNCATE:
				return $affected;
			
			default:
				throw new \GeneralException(UNKNOWN_ERROR, "\$DB -> execute(): Something went really wrong!", 500);
		}
	}
}