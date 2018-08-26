<?php
    // |====================================================|
    // |                      rank.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belipack.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/api/xmldb/account.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/config.php";

    $llog = glob($logsDir ."/*.log");
    $res = Array();
    $namelist = Array();

    foreach ($llog as $i => $lf) {
        $user = getStringBetween(basename($lf), "[", "]");
		$log = fopen($lf, "r");
		$out = substr(str_replace(PHP_EOL, "", fgets($log)), strlen($user) + 6);
        $name = str_replace(PHP_EOL, "", fgets($log));
        fclose($log);
        
		preg_match("/[0-9]{1,},[0-9]{1,}/", $out, $t);
        if (isset($t[0]))
            $point = (float)str_replace(",", ".", $t[0]);
        else
            $point = 0;

        if ($publish == false) {
            $namelist[$i] = $name;
            $res[$user]["list"][$name] = $point;
        }
        $res[$user]["username"] = $user;
        $res[$user]["name"] = getuserdata($user)["name"];
        if (!isset($res[$user]["total"]))
            $res[$user]["total"] = 0;
        $res[$user]["total"] += $point;
    }

    if ($publish == false)
        $namelist = remdubarr($namelist);

    usort($res, function($a, $b){
        $a = $a["total"];
        $b = $b["total"];
    
        if ($a == $b) {
            return 0;
        }
        return ($a > $b) ? -1 : 1;
    });
    
    stop(0, "Success!", 200, Array(
        "list" => $namelist,
        "rank" => $res
    ));