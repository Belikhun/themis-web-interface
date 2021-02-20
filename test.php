<?php
	print("go");

	error_reporting(0);
	$result = json_decode("{ 'sample': vbla }");
	error_reporting(1);

	if ($result == null) {
		print("catch");
		var_dump(json_last_error_msg());
	}