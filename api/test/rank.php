<?php
    // |====================================================|
    // |                      rank.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/api/xmldb/account.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    $logdir = glob($config["logdir"] ."/*.log");
    $res = Array();
    $namelist = Array();

    foreach ($logdir as $i => $log) {
        $user = getStringBetween(basename($log), "[", "]");
		$flog = fopen($log, "r");
		$l1 = str_replace(PHP_EOL, "", fgets($flog));
		$name = str_replace(PHP_EOL, "", fgets($flog));
		$out = substr($l1, strlen($user) + strlen(pathinfo($name, PATHINFO_FILENAME)) + 8);
        fclose($flog);

        $point = 0;
		preg_match("/[0-9]{1,},[0-9]{1,}/", $out, $t);
        if (count($t) != 0 && isset($t[count($t) - 1]))
            $point = (float)str_replace(",", ".", $t[count($t) - 1]);

        if ($config["publish"] == true) {
            $namelist[$i] = $name;
            $res[$user]["list"][$name] = $point;
        }

        $res[$user]["username"] = $user;
        $res[$user]["name"] = getuserdata($user)["name"];
        if (!isset($res[$user]["total"]))
            $res[$user]["total"] = 0;
        $res[$user]["total"] += $point;
    }

    if ($config["publish"] == true) {
        $nlr = arrayremdub($namelist);
        $namelist = ((count($nlr) > 0) ? $nlr : Array());
    }

    usort($res, function($a, $b){
        $a = $a["total"];
        $b = $b["total"];
    
        if ($a == $b)
            return 0;

        return ($a > $b) ? -1 : 1;
    });
    
    stop(0, "Thành công!", 200, Array(
        "list" => $namelist,
        "rank" => $res
    ));