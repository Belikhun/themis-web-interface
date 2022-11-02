<?php
/**
 * \LDB.php
 * 
 * Interface for interacting with the DB, using SQLite driver.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

class LDB extends DB {
	/**
	 * Database instance
	 * @var SQLite3
	 */
	public static $INST;
	
	/**
	 * Database base path
	 * @var	String
	 */
	public static $PATH;
	
	/**
	 * Database file name
	 * @var	String
	 */
	public static $FILE = "database.db";

	/**
	 * DB connection state
	 * @var bool
	 */
	public static $CONNECTED = false;

	protected static $TYPES = Array(
		"double" => SQLITE3_FLOAT,
		"string" => SQLITE3_TEXT,
		"integer" => SQLITE3_INTEGER,
		"array" => SQLITE3_BLOB,
		"boolean" => SQLITE3_INTEGER,
		"NULL" => SQLITE3_NULL
	);

	protected static function filePath() {
		return static::$PATH . "/" . static::$FILE;
	}

	public static function connect($host = null, $username = null, $password = null, $database = null) {
		static::setup();
	}

	public static function setup() {
		if (static::$CONNECTED)
			return;

		if (!file_exists(static::filePath())) {
			static::init();
			return;
		}

		static::$INST = new SQLite3(static::filePath());
		static::$CONNECTED = true;
	}

	/**
	 * Initialize Database
	 */
	public static function init() {
		static::$INST = new SQLite3(static::filePath());

		$tables = glob(static::$PATH . "/tables/*.sql");
		foreach ($tables as $table) {
			$content = (new FileIO($table)) -> read();

			if (empty($content))
				continue;

			if (!static::$INST -> exec($content)) {
				throw new SQLError(
					static::$INST -> lastErrorCode(),
					static::$INST -> lastErrorMsg(),
					$content
				);
			}
		}
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
	public static function execute(
		String $sql,
		Array $params = null,
		int $from = 0,
		int $limit = 0
	) {
		if (empty(static::$INST))
			stop(DB_NOT_INITIALIZED, "DB haven't been initialized yet! Please initialize it first by using DB::connect()", 500);

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
			throw new CodingError("DB::execute(): cannot detect sql execute mode");

		$from = max($from, 0);
		$limit = max($limit, 0);

		if ($from || $limit) {
			if ($mode !== SQL_SELECT)
				throw new CodingError("DB::execute(): \$from and \$limit can only be used in SELECT mode!");

			if ($limit < 1)
				$limit = "18446744073709551615";
			
			$sql .= " LIMIT $limit OFFSET $from";
		}

		$stmt = static::$INST -> prepare($sql);

		if ($stmt === false) {
			throw new SQLError(
				static::$INST -> lastErrorCode(),
				static::$INST -> lastErrorMsg(),
				$sql
			);
		}

		foreach ($params as $key => $value) {
			$type = static::$TYPES[gettype($value)] ?: SQLITE3_TEXT;
			$stmt -> bindValue($key, $value, $type);
		}

		$res = $stmt -> execute();

		// Check for error
		if ($res === false) {
			throw new SQLError(
				static::$INST -> lastErrorCode(),
				static::$INST -> lastErrorMsg(),
				$sql
			);
		}

		if (!is_bool($res)) {
			$rows = Array();

			while ($row = $res -> fetchArray(SQLITE3_ASSOC)) {
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
				$id = @static::$INST -> lastInsertRowID();
				break;

			case SQL_UPDATE:
			case SQL_DELETE:
			case SQL_TRUNCATE:
				$affected = @static::$INST -> changes();
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
				throw new GeneralException(UNKNOWN_ERROR, "DB::execute(): Something went really wrong!", 500);
		}
	}
}
