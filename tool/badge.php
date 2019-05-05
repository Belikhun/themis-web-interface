<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /tool/badge.php                                                                              |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/badge.php";

    $style = getquery("s", "for-the-badge");
    $subject = getquery("su", "badge generator by");
    $status = getquery("st", "Belikhun");
    $color = getquery("c", "brightgreen");
    
    print createBadge(Array(
        "style" => $style,
        "color" => $color,
        "subject" => $subject,
        "status" => $status
    ));