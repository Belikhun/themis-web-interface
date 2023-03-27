/**
 * problems.sql
 * 
 * Problems table definition
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2023 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

CREATE TABLE problems (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	filename TEXT NOT NULL,
	name TEXT NOT NULL,
	author TEXT NOT NULL,
	point REAL NOT NULL,
	time INTEGER NOT NULL,
	memory INTEGER NOT NULL,
	attempt INTEGER DEFAULT 0 NOT NULL,
	"input" TEXT NOT NULL,
	"output" TEXT NOT NULL,
	accept TEXT,
	loved TEXT,
	tags TEXT,
	description TEXT,
	tests TEXT,
	image TEXT,
	attachment TEXT,
	disabled NUMERIC DEFAULT 0 NOT NULL,
	canSubmit INTEGER DEFAULT 1 NOT NULL
);
