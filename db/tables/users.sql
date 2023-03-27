/**
 * users
 * 
 * Users table definition
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2023 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

CREATE TABLE users (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL,
	name TEXT NOT NULL,
	password TEXT NOT NULL,
	avatar TEXT NOT NULL,
	isAdmin INTEGER DEFAULT 0 NOT NULL
);
