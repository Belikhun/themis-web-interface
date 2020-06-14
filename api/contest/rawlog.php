<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/rawlog.php                                                                      |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "NORMAL");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/module/submissions.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/module/contest.php";

    if (getConfig("contest.log.enabled") === false && $_SESSION["id"] !== "admin")
        stop(23, "Xem nhật ký đã bị tắt!", 403);

    $username = reqQuery("u");
    $id = reqQuery("id");

    if (!submissionExist($username))
        stop(13, "Không tìm thấy tên người dùng \"$username\"!", 404, Array( "username" => $username ));

    if ($username !== $_SESSION["username"] && getConfig("contest.log.viewOther") === false && $_SESSION["id"] !== "admin")
        stop(31, "Không cho phép xem tệp nhật kí của người khác!", 403);

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
    
    $logData = (new submissions($username)) -> getLog($id);

    if (!$logData)
        stop(44, "Không tìm thấy dữ liệu", 404, Array( "username" => $username, "id" => $id ));
    
    contentType("txt");
    header("Content-Length: ". strlen($logData));
    header("Content-Disposition: filename=$username.$id.log");
    print $logData;

    stop(0, "Thành công!", 200);