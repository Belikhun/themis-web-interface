<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/account/edit.php                                                                        |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "API");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";

    if (!isLogedIn())
        stop(11, "Bạn chưa đăng nhập.", 403);
        
    checkToken();

    $username = reqForm("u");
    $id = getForm("id");
    $password = getForm("p");
    $name = getForm("n");

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
    if (getUserData($_SESSION["username"])["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    // Avatar file process
    if (isset($_FILES["avatar"]) && isset($accountData[$username])) {
        $file = strtolower($_FILES["avatar"]["name"]);
        $extension = pathinfo($file, PATHINFO_EXTENSION);

        if (!in_array($extension, IMAGE_ALLOW))
            stop(43, "Không chấp nhận loại ảnh!", 400, Array( "allow" => IMAGE_ALLOW ));

        if ($_FILES["avatar"]["size"] > MAX_IMAGE_SIZE)
            stop(42, "Ảnh quá lớn!", 400, Array(
                "size" => $_FILES["avatar"]["size"],
                "max" => MAX_IMAGE_SIZE
            ));

        if ($_FILES["avatar"]["error"] > 0)
            stop(-1, "Lỗi không rõ!", 500);

        $imagePath = AVATAR_DIR ."/". $username;
        $oldFiles = glob($imagePath .".{jpg,png,gif,webp}", GLOB_BRACE);

        // Find old avatar files and remove them
        if (count($oldFiles) > 0)
            foreach ($oldFiles as $oldFile) {
                $ext = pathinfo($oldFile, PATHINFO_EXTENSION);
                unlink($imagePath .".". $ext);
            }

        // Move new avatar
        move_uploaded_file($_FILES["avatar"]["tmp_name"], $imagePath .".". $extension);
    }

    $data = Array();
    $id ? $data["id"] = htmlspecialchars(strip_tags($id)) : null;
    $password ? $data["password"] = password_hash($password, PASSWORD_DEFAULT) : null;
    $name ? $data["name"] = htmlspecialchars(strip_tags($name)) : null;
    $res = editUser($username, $data);

    switch ($res) {
        case USER_EDIT_SUCCESS:
            writeLog("OKAY", "Đã chỉnh sửa tài khoản [$id] \"$username\"");
            stop(0, "Chỉnh sửa tài khoản thành công!", 200, $data);
            break;
        case USER_EDIT_WRONGUSERNAME:
            stop(13, "Không tìm thấy tài khoản \"$username\"!", 400, Array( "username" => $username ));
            break;
        case USER_EDIT_ERROR:
            writeLog("ERRR", "Lỗi khi lưu thông tin tài khoản [$id] \"$username\"");
            stop(-1, "Lỗi không rõ.", 500);
            break;
    }