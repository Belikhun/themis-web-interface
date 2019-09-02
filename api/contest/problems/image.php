<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/problems/image.php                                                              |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    
    function showImage(string $path) {
        contentType(pathinfo($path, PATHINFO_EXTENSION))
            ?: contentType("jpg");
        
        header("Content-length: ". filesize($path));
        readfile($path);
        stop(0, "Success", 200);
    }
    
    $requestMethod = $_SERVER["REQUEST_METHOD"];

    switch ($requestMethod) {
        case "GET":
            // SET PAGE TYPE
            define("PAGE_TYPE", "NORMAL");

            $id = preg_replace("/[.\/\\\\]/m", "", reqQuery("id"));

            require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";
            contest_timeRequire([CONTEST_STARTED], false, false);
        
            require_once $_SERVER["DOCUMENT_ROOT"] ."/data/problems/problem.php";
        
            if (!isset($problemList[$id]))
                showImage(PROBLEM_DIR ."/image.default");
        
            if (isset($problemList[$id]["image"])) {
                $i = $problemList[$id]["image"];
                $f = PROBLEM_DIR ."/". $id ."/". $i;
                showImage($f);
            }
        
            showImage(PROBLEM_DIR ."/image.default");
            break;

        case "POST":
            // SET PAGE TYPE
            define("PAGE_TYPE", "API");
        
            break;
        
        default:
            // SET PAGE TYPE
            define("PAGE_TYPE", "NORMAL");
            
            stop(7, "Unknown request method: ". $requestMethod, 400, Array( "method" => $requestMethod ));
            break;
    }