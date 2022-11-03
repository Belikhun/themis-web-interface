<?php
/**
 * upgrade.php
 * 
 * Script for upgrading database.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

global $DB;

// Make sure we are on the right DB.
if ($DB instanceof \DB\SQLite3) {
	global $SQLiDB;
	
	if ($SQLiDB -> version < 2022110302) {
		// Upgrade code here.

		$SQLiDB -> upgrade(2022110302);
	}
}