<?php
	// |====================================================|
    // |                    problem.php                     |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    
    $problem_dir = $_SERVER["DOCUMENT_ROOT"]."/data/problems";
    $problem_list = Array();

    foreach(glob($problem_dir."/*", GLOB_ONLYDIR) as $i => $path) {
        $data = json_decode((new fip($path."/data.json")) -> read(), true);
        $problem_list[basename($path)] = $data;
    }

    define("PROBLEM_OKAY", 0);
    define("PROBLEM_ERROR", 1);
    define("PROBLEM_ERROR_IDREJECT", 2);
    define("PROBLEM_ERROR_FILETOOLARGE", 3);
    define("PROBLEM_ERROR_FILEREJECT", 4);
    
    function problem_list() {
        global $problem_list;
        $list = Array();
        
        foreach($problem_list as $i => $item) {
            array_push($list, Array(
                "id" => $i,
                "name" => $item["name"],
                "accept" => $item["accept"]
            ));
        }
        
        return $list;
    }

    function problem_get(String $id) {
        global $problem_list;
        if (!isset($problem_list[$id]))
            return PROBLEM_ERROR_IDREJECT;

        $data = $problem_list[$id];
        $data["image"] = "/api/test/problems/image?id=".$id;
        return $data;
    }

    function problem_edit(String $id, Array $set, Array $files = null) {
        global $problem_list;
        global $problem_dir;
        if (!isset($problem_list[$id]))
            return PROBLEM_ERROR_IDREJECT;

        $data = $problem_list[$id];
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

            unlink($problem_dir."/".$id."/".$problem_list[$id]["image"]);
            move_uploaded_file($files["tmp_name"], $problem_dir."/".$id."/".$file);
            $new["image"] = $file;
        }

        $key = array_intersect_key($data, $set);
        foreach ($key as $i => $value)
            $new[$i] = isset($set[$i]) ? $set[$i] : $new[$i];

        $problem_list[$id] = $new;
        (new fip($problem_dir."/".$id."/data.json")) -> write(json_encode($new, JSON_PRETTY_PRINT));

        return PROBLEM_OKAY;
    }

    function problem_add(String $id, Array $add, Array $files = null) {
        global $problem_list;
        global $problem_dir;
        $movefile = false;
        if (isset($problem_list[$id]))
            return PROBLEM_ERROR_IDREJECT;

        $problem_list[$id] = $add;

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

            $movefile = true;
            $problem_list[$id]["image"] = $file;
        }

        mkdir($problem_dir."/".$id);
        (new fip($problem_dir."/".$id."/data.json")) -> write(json_encode($problem_list[$id], JSON_PRETTY_PRINT));
        if ($movefile)
            move_uploaded_file($files["tmp_name"], $problem_dir."/".$id."/".$file);
        return PROBLEM_OKAY;
    }

    function problem_getimage(String $id) {
        global $problem_list;
        global $problem_dir;
        if (!isset($problem_list[$id]))
            return PROBLEM_ERROR_IDREJECT;

        $i = $problem_list[$id]["image"];
        $f = $problem_dir."/".$id."/".$i;

        if (file_exists($f)) {
            contenttype(pathinfo($i, PATHINFO_EXTENSION));
            header("Content-Length: ", filesize($f));
            readfile($f);
            return PROBLEM_OKAY;
        } else
            return PROBLEM_ERROR;
    }

    function problem_remove(String $id) {
        global $problem_list;
        global $problem_dir;
        if (!isset($problem_list[$id]))
            return PROBLEM_ERROR_IDREJECT;

        $dir = $problem_dir."/".$id;

        if (!file_exists($problem_dir."/".$id))
            return PROBLEM_ERROR;

        rmrf($problem_dir."/".$id);
        unset($problem_list[$id]);
        return PROBLEM_OKAY;
    }

    function problem_exist(String $id) {
        global $problem_list;
        return isset($problem_list[$id]);
    }

    function problem_checkext(String $id, String $ext) {
        global $problem_list;
        if (!isset($problem_list[$id]))
            return PROBLEM_ERROR_IDREJECT;

        return isset($problem_list[$id]["accept"]) ? in_array($ext, $problem_list[$id]["accept"]) : false;
    }