<?php
    // |====================================================|
    // |                     config.php                     |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if (!islogedin())
        stop(9, "Bạn chưa đăng nhập.", 403);

    require_once $_SERVER["DOCUMENT_ROOT"]."/api/xmldb/account.php";
    if (getuserdata($_SESSION["username"])["id"] != "admin")
        stop(29, "Access Denied!", 403);

    if ($_SERVER["REQUEST_METHOD"] == "GET")
        stop(0, "Thành công!", 200, $config);
    else {
        if (!isset($_POST["t"]))
            stop(14, "Yêu cầu token.", 400);
        if ($_POST["t"] !== $_SESSION["api_token"])
            stop(27, "Sai token!", 403);

        $TYPE_ARRAY = Array(
            "string" => "Array",
            "check" => function($d) {
                json_decode($d);
                return (json_last_error() == JSON_ERROR_NONE);
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
                return ($d == "true" || $d == "false" || $d == "0" || $d == "1");
            },
            "handler" => function($d) {
                $d = strtolower($d);
                return ($d == "true" || $d == "1");
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
                    stop(28, "Loại giá trị không khớp! Yêu cầu ". $key ." là ". $type["string"], 400);
        }

        setting("cn", $config["contest"]["name"], $TYPE_STRING);
        setting("cd", $config["contest"]["description"], $TYPE_STRING);
        setting("ud", $config["uploaddir"], $TYPE_STRING);
        setting("tz", $config["time"]["zone"], $TYPE_STRING);
        setting("tbsec", $config["time"]["begin"]["seconds"], $TYPE_NUMBER);
        setting("tbmin", $config["time"]["begin"]["minutes"], $TYPE_NUMBER);
        setting("tbhrs", $config["time"]["begin"]["hours"], $TYPE_NUMBER);
        setting("tbday", $config["time"]["begin"]["days"], $TYPE_NUMBER);
        setting("tbmth", $config["time"]["begin"]["months"], $TYPE_NUMBER);
        setting("tbyrs", $config["time"]["begin"]["years"], $TYPE_NUMBER);
        setting("td", $config["time"]["during"], $TYPE_NUMBER);
        setting("to", $config["time"]["offset"], $TYPE_NUMBER);
        setting("pu", $config["publish"], $TYPE_BOOL);
        setting("su", $config["submit"], $TYPE_BOOL);
        setting("ed", $config["editinfo"], $TYPE_BOOL);
        setting("vi", $config["viewlog"], $TYPE_BOOL);

        if ($changed == false)
            stop(30, "Không hành động nào được thực hiện.", 200);

        save_config($config);
        stop(0, "Thành công!", 200);
    }