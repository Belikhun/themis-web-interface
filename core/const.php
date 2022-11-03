<?php
/**
 * const.php
 * 
 * Constants definition.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

/**
 * Host name, based on user's request.
 * @var	String
 */
define("HOST", $_SERVER["HTTP_HOST"]);

// Constant Definition
define("TYPE_INT", "integer");
define("TYPE_FLOAT", "float");
define("TYPE_DOUBLE", "double");
define("TYPE_TEXT", "text");
define("TYPE_STRING", "string");
define("TYPE_RAW", "raw");
define("TYPE_JSON", "json");
define("TYPE_JSON_ASSOC", "jsonassoc");
define("TYPE_BOOL", "boolean");
define("TYPE_EMAIL", "email");
define("TYPE_USERNAME", "username");
define("TYPE_PHONE", "phone");
define("TYPE_SERIALIZED", "serialized");

define("SQL_SELECT", "SELECT");
define("SQL_INSERT", "INSERT");
define("SQL_UPDATE", "UPDATE");
define("SQL_DELETE", "DELETE");
define("SQL_TRUNCATE", "TRUNCATE");

define("UNKNOWN_ERROR", -1);
define("OK", 0);

define("ROUTE_NOT_FOUND", 100);
define("ROUTE_CALLBACK_ARGUMENTCOUNT_ERROR", 101);
define("ROUTE_CALLBACK_INVALID", 102);
define("NOT_IMPLEMENTED", 103);
define("API_NOT_FOUND", 104);
define("MISSING_PARAM", 105);
define("FILE_MISSING", 106);
define("USER_NOT_FOUND", 107);

define("DATA_TYPE_MISMATCH", 201);
define("INVALID_JSON", 202);
define("CODING_ERROR", 203);
define("DB_NOT_INITIALIZED", 204);
define("INVALID_VALUE", 205);
define("INVALID_FILE", 206);
define("INVALID_HASH", 207);
define("MAX_LENGTH_EXCEEDED", 208);
define("INVALID_URL", 209);
define("FILE_INSTANCE_NOT_FOUND", 209);

define("ACCESS_DENIED", 300);
define("LOGGED_IN", 301);
define("INVALID_USERNAME", 302);
define("INVALID_PASSWORD", 303);
define("NOT_LOGGED_IN", 304);
define("USER_EXIST", 305);

define("SQL_ERROR", 400);
define("SQL_DRIVER_NOT_FOUND", 401);
define("INVALID_SQL_DRIVER", 402);
define("DATABASE_NOT_UPGRADED", 403);

define("INVALID_TOKEN", 500);
define("INVALID_SECRET", 501);
define("TOKEN_EXPIRED", 502);