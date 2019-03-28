<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/config.php                                                                              |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/logs.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if ($_SERVER["REQUEST_METHOD"] === "GET")
        stop(0, "Thành công!", 200, $config);

    if (!isLogedIn())
        stop(11, "Bạn chưa đăng nhập.", 403);
        
    checkToken();

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
    if (getuserdata($_SESSION["username"])["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    $TYPE_ARRAY = Array(
        "string" => "Array",
        "check" => function($d) {
            json_decode($d);
            return (json_last_error() === JSON_ERROR_NONE);
        },
        "handler" => function($d) {
            return json_decode($d, true);
        }
    );

    $TYPE_NUMBER = Array(
        "string" => "Number",
        "check" => function($d) {
            return is_numeric($d);
        },
        "handler" => function($d) {
            return (int)($d);
        }
    );

    $TYPE_STRING = Array(
        "string" => "String",
        "check" => function($d) {
            return is_string($d);
        },
        "handler" => function($d) {
            return $d;
        }
    );

    $TYPE_BOOL = Array(
        "string" => "Boolean",
        "check" => function($d) {
            $d = strtolower($d);
            return ($d === "true" || $d === "false" || $d === "0" || $d === "1");
        },
        "handler" => function($d) {
            $d = strtolower($d);
            return ($d === "true" || $d === "1");
        }
    );

    $changed = false;

    function setting(String $key, &$target, $type) {
        global $changed;
        if (isset($_POST[$key]))
            if ($type["check"]($_POST[$key])) {
                $changed = true;
                return $target = $type["handler"]($_POST[$key]);
            } else
                stop(3, "Loại biến không khớp! Yêu cầu form ". $key ." là ". $type["string"], 400);
    }

    setting("contest_name", $config["contest"]["name"], $TYPE_STRING);
    setting("contest_description", $config["contest"]["description"], $TYPE_STRING);
    setting("uploaddir", $config["uploaddir"], $TYPE_STRING);
    setting("time_zone", $config["time"]["zone"], $TYPE_STRING);
    setting("time_begin_seconds", $config["time"]["begin"]["seconds"], $TYPE_NUMBER);
    setting("time_begin_minutes", $config["time"]["begin"]["minutes"], $TYPE_NUMBER);
    setting("time_begin_hours", $config["time"]["begin"]["hours"], $TYPE_NUMBER);
    setting("time_begin_days", $config["time"]["begin"]["days"], $TYPE_NUMBER);
    setting("time_begin_months", $config["time"]["begin"]["months"], $TYPE_NUMBER);
    setting("time_begin_years", $config["time"]["begin"]["years"], $TYPE_NUMBER);
    setting("time_during", $config["time"]["during"], $TYPE_NUMBER);
    setting("time_offset", $config["time"]["offset"], $TYPE_NUMBER);
    setting("publish", $config["publish"], $TYPE_BOOL);
    setting("submit", $config["submit"], $TYPE_BOOL);
    setting("submitinproblems", $config["submitinproblems"], $TYPE_BOOL);
    setting("editinfo", $config["editinfo"], $TYPE_BOOL);
    setting("viewlog", $config["viewlog"], $TYPE_BOOL);
    setting("viewlogother", $config["viewlogother"], $TYPE_BOOL);
    setting("ratelimit_maxrequest", $config["ratelimit"]["maxrequest"], $TYPE_NUMBER);
    setting("ratelimit_time", $config["ratelimit"]["time"], $TYPE_NUMBER);
    setting("ratelimit_bantime", $config["ratelimit"]["bantime"], $TYPE_NUMBER);

    if ($config["publish"] === false)
        $config["viewlog"] = false;

    if ($changed === false)
        stop(102, "Woah nothing happened.", 200);

    save_config($config);
    writeLog("OKAY", "Đã thay đổi cài đặt.");
    stop(0, "Thay đổi cài đặt thành công!", 200);