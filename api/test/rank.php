<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/test/rank.php                                                                           |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if ($config["publish"] !== true)
        stop(0, "Thành công!", 200, Array(
            "list" => Array(),
            "rank" => Array()
        ));

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";

	function parsename(string $path) {
		$path = basename($path);
		$path = str_replace("[", " ", str_replace(".", " ", str_replace("]", "", $path)));
		list($id, $username, $filename, $ext) = sscanf($path, "%s %s %s %s");
		return Array(
			"id" => $id,
			"username" => $username,
			"filename" => $filename,
			"ext" => $ext,
			"name" => $filename.".".$ext
		);
	}

    $logdir = glob($config["logdir"] ."/*.log");
    $res = Array();
    $namelist = Array();

    foreach ($logdir as $i => $log) {
        $data = parsename($log);
        $user = $data["username"];
        $flog = fopen($log, "r");
        $line = str_replace(PHP_EOL, "", fgets($flog));
        fclose($flog);
        $out = substr($line, strlen($user) + strlen(pathinfo($data["filename"], PATHINFO_FILENAME)) + 8);

        $point = 0;
        preg_match("/[0-9]{1,},[0-9]{1,}/", $out, $t);
        if (count($t) !== 0 && isset($t[count($t) - 1]))
            $point = (float)str_replace(",", ".", $t[count($t) - 1]);

        $namelist[$i] = $data["filename"];
        $res[$user]["list"][$data["filename"]] = $point;

        $res[$user]["log"][$data["filename"]] = ($config["viewlog"] === true) ? "/api/test/viewlog?f=" . basename($log) : null;

        $res[$user]["username"] = $user;
        $res[$user]["name"] = getUserData($user)["name"] ?: "u:" . $user;

        if (!isset($res[$user]["total"]))
            $res[$user]["total"] = 0;
        $res[$user]["total"] += $point;
    }

    if ($config["publish"] === true) {
        $nlr = arrayRemDub($namelist);
        $namelist = ((count($nlr) > 0) ? $nlr : Array());
    }

    usort($res, function($a, $b) {
        $a = $a["total"];
        $b = $b["total"];
    
        if ($a === $b)
            return 0;

        return ($a > $b) ? -1 : 1;
    });
    
    stop(0, "Thành công!", 200, Array(
        "list" => $namelist,
        "rank" => $res
    ));