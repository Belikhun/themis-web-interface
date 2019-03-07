<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /lib/logs.php                                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";

    define("LOG_FILE", $_SERVER["DOCUMENT_ROOT"] ."/data/logs.json");

    function readLog(string $format) {
        $logs = new fip(LOG_FILE, "[]");
        $logsdata = json_decode($logs -> read(), true) ?: [];

        switch($format) {
            case "text":
                $output = "";
                foreach ($logsdata as $key => $value) {
                    $s = join("| ", Array(
                        date("d/m/Y H:i:s"),
                        sprintf("%'. 16s", $value["module"]),
                        sprintf("%'. 5s", $value["level"]),
                        sprintf("%'. 32s", $value["client"]["username"] ."@". $value["client"]["ip"]),
                        $value["text"]
                    ));
                    $output = $output.$s."\n";
                }
                break;

            case "json":
                $output = $logsdata;
                break;

            case "formattedjson":
                $output = Array();
                foreach ($logsdata as $key => $value) {
                    $s = join("| ", Array(
                        date("d/m/Y H:i:s"),
                        sprintf("%'. 16s", $value["module"]),
                        sprintf("%'. 5s", $value["level"]),
                        sprintf("%'. 32s", $value["client"]["username"] ."@". $value["client"]["ip"]),
                        $value["text"]
                    ));
                    $output = $output.$s."\n";
                }
                array_push($output, $s);
                break;

            default:
                return false;
                break;
        }

        return $output;
    }

    function writeLog(string $level, string $text, bool $includeClientData = true) {
        $level = strtoupper($level);
        $l = Array("OKAY", "INFO", "WARN", "ERRR", "VERB");
        if (!in_array($level, $l))
            return false;

        $t = time();
        $bt = debug_backtrace();
        $bt = isset($bt[1]) ? $bt[1] : $bt[0];

        // Get client data
        $username = $includeClientData ? $_SESSION["username"] : null;
        $ip = $includeClientData ? $_SERVER["REMOTE_ADDR"] : null;

        $n = Array(
            "level" => $level,
            "time" => $t,
            "text" => $text,
            "module" => pathinfo($bt["file"], PATHINFO_BASENAME) .":". $bt["line"],
            "client" => Array(
                "username" => $username,
                "ip" => $ip
            )
        );

        // Write to logs file
        $logs = new fip(LOG_FILE, "[]");
        $logsdata = json_decode($logs -> read(), true) ?: [];
        array_push($logsdata, $n);
        $logs -> write(json_encode($logsdata, JSON_PRETTY_PRINT));

        return true;
    }