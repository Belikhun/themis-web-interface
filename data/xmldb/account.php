<?php
    // |====================================================|
    // |                    account.php                     |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    include_once($_SERVER["DOCUMENT_ROOT"] ."/lib/api_ecatch.php");

    $dom = new DOMDocument();
    $dom -> load($_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.xml");
    $root = $dom -> documentElement;

    $row = $root -> getElementsByTagName("Row");

    $acchead = Array();
    $accdata = Array();

    foreach($row as $i => $cell) {
        $cell = $cell -> getElementsByTagName("Data");
        foreach ($cell as $j => $celldata) {
            $d[$j] = $celldata -> textContent;
            if ($i == 0) {
                $acchead[$j] = $d[$j];
                continue;
            }
            $accdata[$i][$acchead[$j]] = $d[$j];
        }
    }

    define("LOGIN_SUCCESS", 0);
    define("LOGIN_USERNAMENOTFOUND", 1);
    define("LOGIN_WRONGPASSWORD", 2);

    function simplelogin($username, $password) {
        global $accdata;
        foreach ($accdata as $col)
            if ($col["username"] == $username)
                if ($col["password"] == $password || $col["password"] == md5($password))
                    return LOGIN_SUCCESS;
                else
                    return LOGIN_WRONGPASSWORD;
        return LOGIN_USERNAMENOTFOUND;
    }

    function getuserdata($username) {
        global $accdata;
        foreach ($accdata as $col)
            if ($col["username"] == $username)
                return $col;
        return false;
    }

    define("USER_EDIT_SUCCESS", 0);
    define("USER_EDIT_WRONGUSERNAME", 1);
    define("USER_EDIT_ERROR", 2);

    function edituser($username, $replace = Array()) {
        global $dom;
        global $row;
        global $acchead;

        foreach($row as $i => $cell) {
            if ($i == 0)
                continue;
            $cell = $cell -> getElementsByTagName("Data");
            foreach ($cell as $j => $celldata)
                if ($j == array_search("username", $acchead) && $celldata -> textContent == $username) {
                    foreach ($replace as $k => $val)
                        if ($cellindex = array_search($k, $acchead))
                            $cell -> item($cellindex) -> textContent = $val;

                    if($dom -> save($_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/acctmp.xml") == false)
                        return USER_EDIT_ERROR;
                    //copy($_SERVER["DOCUMENT_ROOT"] ."/api/xmldb/acctmp.xml", $_SERVER["DOCUMENT_ROOT"] ."/api/xmldb/account.xml");
                    //unlink($_SERVER["DOCUMENT_ROOT"] ."/api/xmldb/acctmp.xml");
                    rename($_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/acctmp.xml", $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.xml");
                    return USER_EDIT_SUCCESS;
                }
        }
        return USER_EDIT_WRONGUSERNAME;
    }