<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /data/problems/problem.php                                                                                  |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    
    define("PROBLEM_DIR", $_SERVER["DOCUMENT_ROOT"]."/data/problems");
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
                "image" => "/api/test/problems/image?id=". $i
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
                    "url" => "/api/test/problems/attachment?id=". $i
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

    function problemEdit(String $id, Array $set, Array $files = null, Array $attachments = null) {
        global $problemList;

        if (!isset($problemList[$id]))
            return PROBLEM_ERROR_IDREJECT;

        $data = $problemList[$id];
        $new = $data;

        if (isset($files)) {
            $maxfilesize = 2097153;
            $file = strtolower($files["name"]);
            $acceptext = array("jpg", "png", "gif", "webp");
            $extension = pathinfo($file, PATHINFO_EXTENSION);

            if (!in_array($extension, $acceptext))
                return PROBLEM_ERROR_FILEREJECT;

            if ($files["size"] > $maxfilesize)
                return PROBLEM_ERROR_FILETOOLARGE;

            if ($files["error"] > 0)
                return PROBLEM_ERROR;

            if (isset($problemList[$id]["image"]) && file_exists(PROBLEM_DIR ."/". $id ."/". $problemList[$id]["image"]))
                unlink(PROBLEM_DIR ."/". $id ."/". $problemList[$id]["image"]);

            move_uploaded_file($files["tmp_name"], PROBLEM_DIR ."/". $id ."/". $file);

            $new["image"] = $file;
        }

        if (isset($attachments)) {
            $maxfilesize = 268435456;
            $attachment = strtolower($attachments["name"]);
            $extension = pathinfo($attachment, PATHINFO_EXTENSION);

            if ($attachments["size"] > $maxfilesize)
                return PROBLEM_ERROR_FILETOOLARGE;

            if ($attachments["error"] > 0)
                return PROBLEM_ERROR;

            if (isset($problemList[$id]["attachment"]) && file_exists(PROBLEM_DIR ."/". $id ."/". $problemList[$id]["attachment"]))
                unlink(PROBLEM_DIR ."/". $id ."/". $problemList[$id]["attachment"]);

            move_uploaded_file($attachments["tmp_name"], PROBLEM_DIR ."/". $id ."/". $attachment);

            $new["attachment"] = $attachment;
        }

        $key = array_intersect_key($data, $set);
        foreach ($key as $i => $value)
            $new[$i] = isset($set[$i]) ? $set[$i] : $new[$i];

        $problemList[$id] = $new;
        (new fip(PROBLEM_DIR ."/". $id."/data.json")) -> write(json_encode($new, JSON_PRETTY_PRINT));

        return PROBLEM_OKAY;
    }

    function problemAdd(String $id, Array $add, Array $files = null, Array $attachments = null) {
        global $problemList;

        $moveFile = false;
        $moveAttachment = false;
        if (isset($problemList[$id]))
            return PROBLEM_ERROR_IDREJECT;

        $problemList[$id] = $add;

        if (isset($files)) {
            $maxFileSize = 2097153;
            $file = strtolower($files["name"]);
            $acceptext = array("jpg", "png", "gif", "webp");
            $extension = pathinfo($file, PATHINFO_EXTENSION);

            if (!in_array($extension, $acceptext))
                return PROBLEM_ERROR_FILEREJECT;

            if ($files["size"] > $maxFileSize)
                return PROBLEM_ERROR_FILETOOLARGE;

            if ($files["error"] > 0)
                return PROBLEM_ERROR;

            $moveFile = true;
            $problemList[$id]["image"] = $file;
        }

        if (isset($attachments)) {
            $maxfilesize = 268435456;
            $attachment = strtolower($attachments["name"]);
            $extension = pathinfo($attachment, PATHINFO_EXTENSION);

            if ($attachments["size"] > $maxfilesize)
                return PROBLEM_ERROR_FILETOOLARGE;

            if ($attachments["error"] > 0)
                return PROBLEM_ERROR;

            $moveAttachment = true;
            $problemList[$id]["attachment"] = $attachment;
        }

        mkdir(PROBLEM_DIR. "/" .$id);
        (new fip(PROBLEM_DIR. "/" .$id. "/data.json")) -> write(json_encode($problemList[$id], JSON_PRETTY_PRINT));

        if ($moveFile)
            move_uploaded_file($files["tmp_name"], PROBLEM_DIR ."/". $id ."/". $file);

        if ($moveAttachment)
            move_uploaded_file($attachments["tmp_name"], PROBLEM_DIR ."/". $id ."/". $attachment);

        return PROBLEM_OKAY;
    }

    function problemGetAttachment(String $id) {
        global $problemList;

        if (!isset($problemList[$id]))
            return PROBLEM_ERROR_IDREJECT;

        if (!isset($problemList[$id]["attachment"]))
            return PROBLEM_ERROR;
        
        $i = $problemList[$id]["attachment"];
        $f = PROBLEM_DIR."/".$id."/".$i;

        contenttype(pathinfo($i, PATHINFO_EXTENSION));
        header("Content-Length: ".filesize($f));
        header("Content-disposition: attachment; filename=". pathinfo($i, PATHINFO_BASENAME)); 
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