<?php

/**
 * Interface for interacting with the DB, using mysqli driver.
 * 
 * @copyright	2022 Belikhun
 * @author		Belikhun <belivipro9x99@gmail.com>
 * @license		https://tldrlegal.com/license/mit-license MIT
 */
class DB {
	/** @var mysqli */
	public static $mysqli;

	/**
	 * DB connection state
	 * @var bool
	 */
	public static $connected = false;

	protected static $types = Array(
		"string" => "s",
		"double" => "d",
		"integer" => "i",
		"array" => "b",
		"boolean" => "i",
		"NULL" => "i",
	);

	public static function connect($host, $username, $password, $database) {
		if (self::$connected)
			return;

		mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
		self::$mysqli = new mysqli(
			$host,
			$username,
			$password,
			$database
		);

		self::$connected = true;
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
		if (empty(self::$mysqli))
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
			
			$sql .= " LIMIT $from, $limit";
		}

		// Generate types string.
		$types = "";
		if (!empty($params)) {
			foreach ($params as $value)
				$types = $types . self::$types[gettype($value)] ?: "s";
		}

		try {
			$stmt = self::$mysqli -> prepare($sql);
		} catch(mysqli_sql_exception $e) {
			throw new SQLError(
				$e -> getCode(),
				$e -> getMessage(),
				$sql
			);
		}

		if ($stmt === false) {
			throw new SQLError(
				self::$mysqli -> errno,
				self::$mysqli -> error,
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
			throw new SQLError(
				self::$mysqli -> errno,
				self::$mysqli -> error,
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
				$id = @self::$mysqli -> insert_id;
				break;

			case SQL_UPDATE:
			case SQL_DELETE:
			case SQL_TRUNCATE:
				$affected = @self::$mysqli -> affected_rows;
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

	/**
     * Returns the SQL WHERE conditions.
	 * 
     * @param	Array	$conditions		The conditions to build the where clause.
     * @return	Array	An array list containing sql 'where' part and 'params'.
     */
	public static function whereClause(Array $conditions) {
		$conditions = is_null($conditions)
			? Array()
			: $conditions;

		if (empty($conditions))
			return Array("", []);

		$where = Array();
		$params = Array();

		foreach ($conditions as $key => $value) {
			$key = trim($key);

			if (is_null($value) || $value == "null") {
				$where[] = "$key IS NULL";
				continue;
			}

			// Process for matching multiple value
			if (is_array($value)) {
				// Don't accept empty array.
				if (empty($value))
					throw new CodingError("DB::whereClause(): value of array \"$key\" is empty!");

				$cond = Array();

				foreach ($value as $v) {
					if (is_numeric($v))
						$v = (float) $v;

					$cond[] = "$key = ?";
					$params[] = $v;
				}

				$where[] = "(" . implode(" OR ", $cond) . ")";
				continue;
			}

			if (is_numeric($value))
				$value = (float) $value;
			else if (is_int($value) || is_bool($value))
				$value = (int) $value;

			// Check key contain comparing operator.
			// Will need to find a better way to implement this, this
			// may open a door to an exploit if user have control of
			// $key field!
			if (str_ends_with($key, "<") || str_ends_with($key, ">") || str_ends_with($key, "=")) {
				$where[] = "$key ?";
			} else if (str_contains($value, "%")) {
				$where[] = "$key LIKE ?";
			} else {
				$where[] = "$key = ?";
			}

			$params[] = $value;
		}

		return Array(implode(" AND ", $where), $params);
	}

	/**
	 * Get a number of records as an array of objects where
	 * all the given conditions met.
	 * 
	 * @param	String		$table		The table to select from.
	 * @param	Array		$conditions	"field" => "value" with AND in between,
	 * 									default is equal comparision. You can use
	 * 									different comparision by adding logic after
	 * 									field name (ex "abc >=" => 123).
	 * @param	String		$sort		A valid ORDER BY value.
	 * @param	String		$fields		A valid SELECT value.
	 * @return	Object[]
	 */
	public static function records(
		String $table,
		Array $conditions = Array(),
		String $sort = "",
		String $fields = "*",
		int $from = 0,
		int $limit = 0
	) {
		if (is_array($fields))
			$fields = implode(", ", $fields);

		list($select, $params) = self::whereClause($conditions);

		if (!empty($select))
			$select = "WHERE $select";

		if (!empty($sort))
			$sort = "ORDER BY $sort";

		// Record Metric
		$metric = new \Metric\Query("SELECT", $table);

		$sql = "SELECT $fields FROM `$table` $select $sort";
		$results = self::execute($sql, $params, $from, $limit);

		$metric -> time(count($results));
		return $results;
	}

	/**
	 * Get a single database record as an object where all
	 * the given conditions met.
	 * 
	 * @param	String		$table		The table to select from.
	 * @param	Array		$conditions	"field" => "value" with AND in between,
	 * 									default is equal comparision. You can use
	 * 									different comparision by adding logic after
	 * 									field name (ex "abc >=" => 123).
	 * @param	String		$fields		A valid SELECT value.
	 * @param	String		$sort		A valid ORDER BY value.
	 * @return	Object|null
	 */
	public static function record(
		String $table,
		Array $conditions = Array(),
		String $fields = "*",
		String $sort = ""
	) {
		$records = self::records($table, $conditions, $sort, $fields, 0, 1);

		if (empty($records) || empty($records[0]))
			return null;

		return $records[0];
	}

	/**
     * Insert a record into a table and return the "id" field if required.
     *
     * Some conversions and safety checks are carried out. Lobs are supported.
     * If the return ID isn't required, then this just reports success as true/false.
     * $data is an object containing needed data
	 * 
     * @param	String			$table		The database table to be inserted into
     * @param	Object|Array	$object		A data object with values for one or more fields in the record
     * @return	int				new id
     */
	public static function insert(String $table, Array|Object $object) {
		$object = (Array) $object;
		$fields = Array();
		$values = Array();

		if (isset($object["id"]))
			unset($object["id"]);

		if (empty($object))
			throw new CodingError("DB::insert(): no fields found");

		foreach ($object as $key => $value) {
			if (is_null($value) || $value == "null")
				continue;

			$fields[] = trim($key, " *\t\n\r\0\x0B");
			$values[] = $value;
		}

		$questions = array_fill(0, count($fields), "?");
		$questions = implode(", ", $questions);
		$fields = implode(", ", $fields);
		$sql = "INSERT INTO `$table` ($fields) VALUES ($questions)";

		// Record Metric
		$metric = new \Metric\Query("INSERT", $table);

		$results = self::execute($sql, $values);
		$metric -> time(1);
		return $results;
	}

	/**
	 * Update an record from database.
	 * 
	 * @param	String			$table		The database table to be inserted into
     * @param	Object|Array	$object		A data object with values for one or more fields in the record
     * @return	bool
	 */
	public static function update(String $table, Array|Object $object) {
		$object = (Array) $object;

		if (empty($object["id"]))
			throw new \CodingError("DB::update(): id field must be specified");

		$id = $object["id"];
		unset($object["id"]);

		if (empty($object))
			throw new CodingError("DB::update(): no fields found");

		$sets = Array();
		$values = Array();

		foreach ($object as $field => $value) {
			// if (is_null($value))
			// 	$value = "NULL";

			$field = trim($field, " *\t\n\r\0\x0B");
			$sets[] = "$field = ?";
			$values[] = $value;
		}

		// Last ? in query.
		$values[] = $id;

		$sets = implode(", ", $sets);
		$sql = "UPDATE $table SET $sets WHERE id = ?";

		// Record Metric
		$metric = new \Metric\Query("INSERT", $table);
		
		$affected = self::execute($sql, $values);
		$metric -> time($affected);
		return ($affected > 0);
	}

	/**
	 * Test whether a record exists in a table where all
	 * the given conditions met.
	 * 
	 * @param	String		$table		The table to select from.
	 * @param	Array		$conditions	"field" => "value" with AND in between,
	 * 									default is equal comparision. You can use
	 * 									different comparision by adding logic after
	 * 									field name (ex "abc >=" => 123).
	 * 
	 * @return	bool
	 */
	public static function exist(String $table, Array $conditions = Array()) {
		// Select 'X' to find if a row exist!
		// https://stackoverflow.com/questions/7624376/what-is-select-x
		$record = self::record($table, $conditions, "'x'");
		return !empty($record);
	}

	/**
	 * Count the records in a table which match a particular WHERE clause.
	 * 
	 * @param	String		$table		The table to select from.
	 * @param	Array		$conditions	"field" => "value" with AND in between,
	 * 									default is equal comparision. You can use
	 * 									different comparision by adding logic after
	 * 									field name (ex "abc >=" => 123).
	 * 
	 * @return	int
	 */
	public static function count(String $table, Array $conditions = Array()) {
		$count = self::record($table, $conditions, "COUNT('x')");
		$count = (int) $count -> {"COUNT('x')"};

		if ($count < 0)
            throw new CodingError("DB::count() expects the first field to contain non-negative number from COUNT(), \"$count\" found instead.");

		return (int) $count;
	}

	/**
	 * Delete the records from a table where all the given conditions met.
     * If conditions not specified, table is truncated.
	 * 
	 * @param	String		$table		The table to select from.
	 * @param	Array		$conditions	"field" => "value" with AND in between,
	 * 									default is equal comparision. You can use
	 * 									different comparision by adding logic after
	 * 									field name (ex "abc >=" => 123).
	 * 
	 * @return	int			Affected rows
	 */
	public static function delete(String $table, Array $conditions = Array()) {
		if (empty($conditions)) {
			// Record Metric
			$metric = new \Metric\Query("TRUNCATE", $table);
			
			$affected = self::execute("TRUNCATE TABLE {" . $table . "}");
			$metric -> time($affected);
			return $affected;
		}
		
		list($select, $params) = self::whereClause($conditions);

		if (!empty($select))
			$select = "WHERE $select";

		$sql = "DELETE FROM `$table` $select";

		// Record Metric
		$metric = new \Metric\Query("TRUNCATE", $table);

		$affected = self::execute($sql, $params);
		$metric -> time($affected);
			return $affected;
	}
}
