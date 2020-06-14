<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/server.php                                                                              |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "API");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";

    stop(0, "Success", 200, Array(
        "version" => VERSION,
        "versionTag" => VERSION_TAG,
        "author" => AUTHOR,
        "contestName" => getConfig("contest.name"),
        "contestDescription" => getConfig("contest.description"),
        "username" => $_SESSION["username"] ?: null,
        "CONTACT" => CONTACT_LINK,
        "API_TOKEN" => isset($_SESSION["apiToken"]) ? $_SESSION["apiToken"] : null,
        "REPO_ADDRESS" => REPO_ADDRESS,
        "REPORT_ERROR" => REPORT_ERROR,
        "SERVER_LOAD" => function_exists("sys_getloadavg") ? sys_getloadavg()[0] : null,
        "SERVER_SOFTWARE" => $_SERVER["SERVER_SOFTWARE"],
        "SERVER_ADDR" => $_SERVER["SERVER_ADDR"],
        "SERVER_PROTOCOL" => $_SERVER["SERVER_PROTOCOL"],
        "HTTP_USER_AGENT" => $_SERVER["HTTP_USER_AGENT"],
        "REMOTE_ADDR" => $_SERVER["REMOTE_ADDR"],
        "TIME" => microtime(true),

        "config" => Array(
            "allowRegister" => getConfig("system.allowRegister")
        ),
        "clientConfig" => getConfig("clientSettings"),
    ));

?>