<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /data/problems/problem.php                                                                                  |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    
    define("PROBLEM_DIR", $_SERVER["DOCUMENT_ROOT"] ."/data/problems");
    $problemList = Array();

    foreach(glob(PROBLEM_DIR ."/*", GLOB_ONLYDIR) as $i => $path) {
        $data = json_decode((new fip($path."/data.json")) -> read(), true);
        $problemList[basename($path)] = $data;
    }

    define("PROBLEM_OKAY", 0);
    define("PROBLEM_ERROR", 1);
    define("PROBLEM_ERROR_IDREJECT", 2);
    define("PROBLEM_ERROR_FILETOOLARGE", 3);
    define("PROBLEM_ERROR_FILEREJECT", 4);
    
    function problemList() {
        global $problemList;
        $list = Array();
        
        foreach($problemList as $i => $item) {
            array_push($list, Array(
                "id" => $i,
                "name" => $item["name"],
                "point" => $item["point"],
                "image" => "/api/contest/problems/image?id=". $i
            ));
        }
        
        return $list;
    }

    function problemListAttachment() {
        global $problemList;
        $list = Array();
        
        foreach($problemList as $i => $item)
            if (isset($item["attachment"])) {
                $f = PROBLEM_DIR ."/". $i ."/". $item["attachment"];

                array_push($list, Array(
                    "id" => $i,
                    "name" => $item["name"],
                    "size" => filesize($f),
                    "attachment" => $item["attachment"],
                    "lastmodify" => filemtime($f),
                    "url" => "/api/contest/problems/attachment?id=". $i
                ));
            }
        
        return $list;
    }

    function problemGet(String $id) {
        global $problemList;
        if (!isset($problemList[$id]))
            return PROBLEM_ERROR_IDREJECT;

        $data = $problemList[$id];
        $data["id"] = $id;

        return $data;
    }

    function problemEdit(String $id, Array $set, Array $image = null, Array $attachment = null) {
        global $problemList;

        if (!isset($problemList[$id]))
            return PROBLEM_ERROR_IDREJECT;

        $data = $problemList[$id];
        $new = $data;

        if (isset($image)) {
            $maxImageSize = 2097153;
            $imageFile = utf8_encode(strtolower($image["name"]));
            $acceptExt = array("jpg", "png", "gif", "webp");
            $extension = pathinfo($imageFile, PATHINFO_EXTENSION);

            if (!in_array($extension, $acceptExt))
                return PROBLEM_ERROR_FILEREJECT;

            if ($image["size"] > $maxImageSize)
                return PROBLEM_ERROR_FILETOOLARGE;

            if ($image["error"] > 0)
                return PROBLEM_ERROR;

            if (isset($problemList[$id]["image"]) && file_exists(PROBLEM_DIR ."/". $id ."/". $problemList[$id]["image"]))
                unlink(PROBLEM_DIR ."/". $id ."/". $problemList[$id]["image"]);

            move_uploaded_file($image["tmp_name"], PROBLEM_DIR ."/". $id ."/". $imageFile);

            $new["image"] = $imageFile;
        }

        if (isset($attachment)) {
            $maxAttachmentSize = 268435456;
            $attachmentFile = utf8_encode(strtolower($attachment["name"]));
            $extension = pathinfo($attachmentFile, PATHINFO_EXTENSION);

            if ($attachment["size"] > $maxAttachmentSize)
                return PROBLEM_ERROR_FILETOOLARGE;

            if ($attachment["error"] > 0)
                return PROBLEM_ERROR;

            if (isset($problemList[$id]["attachment"]) && file_exists(PROBLEM_DIR ."/". $id ."/". $problemList[$id]["attachment"]))
                unlink(PROBLEM_DIR ."/". $id ."/". $problemList[$id]["attachment"]);

            move_uploaded_file($attachment["tmp_name"], PROBLEM_DIR ."/". $id ."/". $attachmentFile);

            $new["attachment"] = $attachmentFile;
        }

        $key = array_intersect_key($data, $set);
        foreach ($key as $i => $value)
            $new[$i] = isset($set[$i]) ? $set[$i] : $new[$i];

        $problemList[$id] = $new;
        (new fip(PROBLEM_DIR ."/". $id."/data.json")) -> write(json_encode($new, JSON_PRETTY_PRINT));

        return PROBLEM_OKAY;
    }

    function problemAdd(String $id, Array $add, Array $image = null, Array $attachment = null) {
        global $problemList;

        $moveImage = false;
        $moveAttachment = false;
        if (isset($problemList[$id]))
            return PROBLEM_ERROR_IDREJECT;

        $problemList[$id] = $add;

        if (isset($image)) {
            $maxImageSize = 2097153;
            $imageFile = utf8_encode(strtolower($image["name"]));
            $acceptExt = array("jpg", "png", "gif", "webp");
            $extension = pathinfo($imageFile, PATHINFO_EXTENSION);

            if (!in_array($extension, $acceptExt))
                return PROBLEM_ERROR_FILEREJECT;

            if ($image["size"] > $maxImageSize)
                return PROBLEM_ERROR_FILETOOLARGE;

            if ($image["error"] > 0)
                return PROBLEM_ERROR;

            $moveImage = true;
            $problemList[$id]["image"] = $imageFile;
        }

        if (isset($attachment)) {
            $maxAttachmentSize = 268435456;
            $attachmentFile = utf8_encode(strtolower($attachment["name"]));

            if ($attachment["size"] > $maxAttachmentSize)
                return PROBLEM_ERROR_FILETOOLARGE;

            if ($attachment["error"] > 0)
                return PROBLEM_ERROR;

            $moveAttachment = true;
            $problemList[$id]["attachment"] = $attachmentFile;
        }

        mkdir(PROBLEM_DIR. "/" .$id);
        (new fip(PROBLEM_DIR. "/" .$id. "/data.json")) -> write(json_encode($problemList[$id], JSON_PRETTY_PRINT));

        if ($moveImage)
            move_uploaded_file($image["tmp_name"], PROBLEM_DIR ."/". $id ."/". $imageFile);

        if ($moveAttachment)
            move_uploaded_file($attachment["tmp_name"], PROBLEM_DIR ."/". $id ."/". $attachmentFile);

        return PROBLEM_OKAY;
    }

    function problemGetAttachment(String $id) {
        global $problemList;

        if (!isset($problemList[$id]))
            return PROBLEM_ERROR_IDREJECT;

        if (!isset($problemList[$id]["attachment"]))
            return PROBLEM_ERROR;
        
        $i = $problemList[$id]["attachment"];
        $f = PROBLEM_DIR ."/". $id ."/". $i;

        contenttype(pathinfo($i, PATHINFO_EXTENSION));
        header("Content-Length: ".filesize($f));
        header("Content-disposition: attachment; filename=". utf8_decode(pathinfo($i, PATHINFO_BASENAME))); 
        readfile($f);
        return PROBLEM_OKAY;
    }

    function problemRemove(String $id) {
        global $problemList;

        if (!isset($problemList[$id]))
            return PROBLEM_ERROR_IDREJECT;

        $dir = PROBLEM_DIR ."/". $id;

        if (!file_exists(PROBLEM_DIR ."/". $id))
            return PROBLEM_ERROR;

        rmrf(PROBLEM_DIR ."/". $id);
        unset($problemList[$id]);
        return PROBLEM_OKAY;
    }

    function problemExist(String $id) {
        global $problemList;
        return isset($problemList[$id]);
    }

    function problemCheckExtension(String $id, String $ext) {
        global $problemList;
        if (!isset($problemList[$id]))
            return PROBLEM_ERROR_IDREJECT;

        return isset($problemList[$id]["accept"]) ? in_array($ext, $problemList[$id]["accept"]) : false;
    }