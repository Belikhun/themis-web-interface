<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /data/xmldb/account.php                                                                      |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";

    $accountDOM = new DOMDocument();
    $accountDOM -> formatOutput = true;
    $accountDOM -> preserveWhiteSpace = false;

    $accountDOM -> load($_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.xml");
    $accountDocument = $accountDOM -> documentElement;
    $accountTable = $accountDocument -> getElementsByTagName("Table")[0];
    $accountRow = $accountTable -> getElementsByTagName("Row");

    define("ACCOUNT_PARSE_KEYPOS", 1);
    $accountHeader = Array();
    $accountData = Array();

    foreach ($accountRow as $i => $row) {
        $cell = $row -> getElementsByTagName("Data");
        $rowData = Array();
        
        foreach ($cell as $j => $cellData) {
            $tmp = $cellData -> textContent;

            if ($i === 0) {
                $accountHeader[$j] = $tmp;
                continue;
            }

            if ($j === ACCOUNT_PARSE_KEYPOS && empty($tmp)) {
                $rowData = Array();
                break;
            }

            $key = $accountHeader[$j];
            $tmp = ($key === "repass") ? (int) $tmp : $tmp;
            $rowData[$key] = $tmp;
        }

        if (!empty($rowData))
            $accountData[$rowData[$accountHeader[ACCOUNT_PARSE_KEYPOS]]] = $rowData;
    }

    define("LOGIN_SUCCESS", 0);
    define("LOGIN_USERNAMENOTFOUND", 1);
    define("LOGIN_WRONGPASSWORD", 2);

    function simpleLogin(String $username, String $password) {
        global $accountData;

        if (!isset($accountData[$username]))
            return LOGIN_USERNAMENOTFOUND;

        if ($accountData[$username]["password"] === $password || password_verify($password, $accountData[$username]["password"]))
            return LOGIN_SUCCESS;
        else
            return LOGIN_WRONGPASSWORD;
    }

    function getUserData($username) {
        global $accountData;
        return isset($accountData[$username]) ? $accountData[$username] : null;
    }

    define("USER_EDIT_SUCCESS", 0);
    define("USER_EDIT_WRONGUSERNAME", 1);
    define("USER_EDIT_ERROR", 2);

    function editUser(String $username, Array $replace = Array()) {
        global $accountDOM;
        global $accountRow;
        global $accountHeader;
        global $accountData;

        foreach ($accountRow as $i => $row) {
            if ($i === 0)
                continue;
                
            $cell = $row -> getElementsByTagName("Data");

            foreach ($cell as $j => $cellData)
                if ($j === array_search("username", $accountHeader) && $cellData -> textContent === $username) {
                    // Update new value
                    foreach ($replace as $key => $value)
                        if ((($cellIndex = array_search($key, $accountHeader)) !== false) && !empty($value))
                            $cell -> item($cellIndex) -> textContent = $value;

                    // Update change to parsed data
                    $accountData = array_merge($accountData, $replace);

                    if ($accountDOM -> save($_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/acctmp.xml") === false)
                        return USER_EDIT_ERROR;
                        
                    rename($_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/acctmp.xml", $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.xml");
                    return USER_EDIT_SUCCESS;
                }
        }

        return USER_EDIT_WRONGUSERNAME;
    }

    define("USER_ADD_SUCCESS", 0);
    define("USER_ADD_USEREXIST", 1);
    define("USER_ADD_ERROR", 2);

    function addUser(String $id, String $username, String $password, String $name) {
        global $accountDOM;
        global $accountTable;
        global $accountHeader;
        global $accountRow;
        global $accountData;

        if (isset($accountData[$username]))
            return USER_ADD_USEREXIST;

        // perform a row cleanup
        $c = $accountRow -> length;
        for ($i = $c - 1; $i > 0; $i--) {     
            $row = $accountRow[$i];
            $cell = $row -> getElementsByTagName("Data");

            // Clear row if username is empty
            foreach ($cell as $j => $cellData)
                if ($j === ACCOUNT_PARSE_KEYPOS && empty($cellData -> textContent))
                    $row -> parentNode -> removeChild($row);
        }

        // add user
        $newRowData = Array(
            "id" => $id,
            "username" => $username,
            "password" => $password,
            "name" => $name,
            "repass" => 0
        );

        $newRow = $accountDOM -> createElement("Row");
        $newRow -> setAttribute("ss:AutoFitHeight", "0");

        foreach ($newRowData as $key => $value) {
            $cell = $accountDOM -> createElement("Cell");
            $cell -> setAttribute("ss:StyleID", "s64");

            $data = $accountDOM -> createElement("Data", $value);
            $data -> setAttribute("ss:Type", in_array(gettype($value), ["integer", "double"]) ? "Number" : "String");

            $cell -> appendChild($data);
            $newRow -> appendChild($cell);
        }

        $accountTable -> appendChild($newRow);

        // Update change to parsed data
        $accountData[$username] = $newRowData;

        if ($accountDOM -> save($_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/acctmp.xml") === false)
            return USER_ADD_ERROR;
        
        rename($_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/acctmp.xml", $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.xml");
        return USER_ADD_SUCCESS;
    }

    function deleteUser(String $username) {
        global $accountDOM;
        global $accountRow;
        global $accountHeader;
        global $accountData;

        foreach ($accountRow as $i => $row) {
            if ($i === 0)
                continue;
                
            $cell = $row -> getElementsByTagName("Data");

            foreach ($cell as $j => $cellData)
                if ($j === array_search("username", $accountHeader) && $cellData -> textContent === $username) {
                    // Delete the row contain all user data
                    $row -> parentNode -> removeChild($row);

                    // Update change to parsed data
                    unset($accountData[$username]);

                    if ($accountDOM -> save($_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/acctmp.xml") === false)
                        return USER_EDIT_ERROR;
                        
                    rename($_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/acctmp.xml", $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.xml");
                    return USER_EDIT_SUCCESS;
                }
        }

        return USER_EDIT_WRONGUSERNAME;
    }