<?php

/**
 * db.abstract.php
 * 
 * Abstract class for DB.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
abstract class DB {
	/**
	 * DB connection state
	 * @var bool
	 */
	public $connected = false;

	/**
	 * Return variable type from `gettype()` to
	 * current sql driver.
	 */
	abstract public function getType(String $type): String|int;

	/**
	 * Create a new connection to database.
	 * This function might need some additional arguments
	 * based on type of drivers used.
	 * 
	 * @param	Array	$options	Arguments to pass into connect
	 * 								function. This will vary based on
	 * 								each sql drivers.
	 */
	abstract public function connect(Array $options);

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
	abstract public function execute(
		String $sql,
		Array $params = null,
		int $from = 0,
		int $limit = 0
	): Object|Array|int;

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
					throw new CodingError("\$DB -> whereClause(): value of array \"$key\" is empty!");

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
	public function records(
		String $table,
		Array $conditions = Array(),
		String $sort = "",
		String $fields = "*",
		int $from = 0,
		int $limit = 0
	) {
		if (is_array($fields))
			$fields = implode(", ", $fields);

		list($select, $params) = static::whereClause($conditions);

		if (!empty($select))
			$select = "WHERE $select";

		if (!empty($sort))
			$sort = "ORDER BY $sort";

		// Record Metric
		$metric = new \Metric\Query("SELECT", $table);

		$sql = "SELECT $fields FROM `$table` $select $sort";
		$results = $this -> execute($sql, $params, $from, $limit);

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
	public function record(
		String $table,
		Array $conditions = Array(),
		String $fields = "*",
		String $sort = ""
	) {
		$records = $this -> records($table, $conditions, $sort, $fields, 0, 1);

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
	public function insert(String $table, Array|Object $object) {
		$object = (Array) $object;
		$fields = Array();
		$values = Array();

		if (isset($object["id"]))
			unset($object["id"]);

		if (empty($object))
			throw new CodingError("\$DB -> insert(): no fields found");

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

		$results = $this -> execute($sql, $values);
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
	public function update(String $table, Array|Object $object) {
		$object = (Array) $object;

		if (empty($object["id"]))
			throw new \CodingError("\$DB -> update(): id field must be specified");

		$id = $object["id"];
		unset($object["id"]);

		if (empty($object))
			throw new CodingError("\$DB -> update(): no fields found");

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
		
		$affected = $this -> execute($sql, $values);
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
	public function exist(String $table, Array $conditions = Array()) {
		// Select 'X' to find if a row exist!
		// https://stackoverflow.com/questions/7624376/what-is-select-x
		$record = $this -> record($table, $conditions, "'x'");
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
	public function count(String $table, Array $conditions = Array()) {
		$count = $this -> record($table, $conditions, "COUNT('x')");
		$count = (int) $count -> {"COUNT('x')"};

		if ($count < 0)
            throw new CodingError("\$DB -> count() expects the first field to contain non-negative number from COUNT(), \"$count\" found instead.");

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
	public function delete(String $table, Array $conditions = Array()) {
		if (empty($conditions)) {
			// Record Metric
			$metric = new \Metric\Query("TRUNCATE", $table);
			
			$affected = $this -> execute("TRUNCATE TABLE {" . $table . "}");
			$metric -> time($affected);
			return $affected;
		}
		
		list($select, $params) = static::whereClause($conditions);

		if (!empty($select))
			$select = "WHERE $select";

		$sql = "DELETE FROM `$table` $select";

		// Record Metric
		$metric = new \Metric\Query("TRUNCATE", $table);

		$affected = $this -> execute($sql, $params);
		$metric -> time($affected);
			return $affected;
	}
}

/**
 * Function to initialize the global `$DB`
 * variable.
 */
function initializeDB() {
	/**
	 * Global Database Instance. Initialized based on type of
	 * SQL driver specified in config.
	 * 
	 * @var \DB
	 */
	global $DB;

	// $DB is initialized, we don't need to do anything.
	if (!empty($DB))
		return;

	$DB_DRIVER_PATH = CORE_ROOT . "/db/DB." . CONFIG::$DB_DRIVER . ".php";

	if (file_exists($DB_DRIVER_PATH)) {
		require_once $DB_DRIVER_PATH;
		$className = "\\DB\\" . CONFIG::$DB_DRIVER;

		if (!class_exists($className) || !in_array("DB", class_parents($className)))
			throw new InvalidSQLDriver(CONFIG::$DB_DRIVER);

		$DB = new $className();

		switch (CONFIG::$DB_DRIVER) {
			case "SQLite3":
				$DB -> connect(Array(
					"path" => CONFIG::$DB_PATH
				));
				break;
		
			default:
				// We default the config arguments to standard info
				// like mysqli.
				$DB -> connect(Array(
					"host" => CONFIG::$DB_HOST,
					"username" => CONFIG::$DB_USER,
					"password" => CONFIG::$DB_PASS,
					"database" => CONFIG::$DB_NAME
				));
		}
	} else
		throw new SQLDriverNotFound(CONFIG::$DB_DRIVER);
}