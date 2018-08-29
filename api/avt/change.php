<?php
    // |====================================================|
    // |                     change.php                     |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belipack.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/config.php";

    $maxfilesize = 2097152;

    if (!islogedin())
        stop(10, "You Are Not Logged In!", 403);

    if (!isset($_GET["t"]))
        stop(14, "Undefined GET parameter t.");
    if ($_GET["t"] !== $_SESSION["api_token"])
        stop(27, "Wrong token!");

    if ($allowEditInfo == false)
        stop(25, "Editing info is not allowed!", 403);
    
    if (!isset($_FILES["file"]))
        stop(13, "No File", 403);

    $file = $_FILES["file"]["name"];
    $acceptext = array("jpg", "png", "gif", "webp");
    $extension = pathinfo($file, PATHINFO_EXTENSION);
    if (in_array($extension, $acceptext) && ($_FILES["file"]["size"] <= 2097153)) {
        if ($_FILES["file"]["error"] > 0) {
            stop(8, "Unknown Error!", 500);
        } else {
            $imagepath = $_SERVER["DOCUMENT_ROOT"] ."/api/avt/". $_SESSION["username"];
            $oldfiles = glob($imagepath.".*");
            if (count($oldfiles) > 0) foreach ($oldfiles as $oldfile) {
                $ext = pathinfo($oldfile, PATHINFO_EXTENSION);
                unlink($imagepath.".".$ext);
            }
            move_uploaded_file($_FILES["file"]["tmp_name"], $imagepath .".". $extension);
            stop(0, "Avatar Changed Successfully.", 200, Array(
                "src" => "/api/avt/get?u=". $_SESSION["username"] ."&t=". time()
            ));
        }
    } else {
        if (!$_FILES["file"]["name"]) {
            stop(13, "No File Choosen.", 400);
        } else if (($_FILES["file"]["size"] > $maxfilesize))  {
            stop(14, "File Too Large!", 400, Array(
                "this" => $_FILES["file"]["size"],
                "max" => $maxfilesize
            ));
        } else {
            stop(15, "Only Accept png, jpg, webp and gif image!", 400);
        }
    }

?>