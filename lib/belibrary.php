<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /lib/belibrary.php                                                                           |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    setlocale(LC_TIME, "vi_VN.UTF-8");

    if (session_status() === PHP_SESSION_NONE) {
        if (isset($_POST["sessid"]))
            session_id($_POST["sessid"]);
        elseif (isset($_GET["sessid"]))
            session_id($_GET["sessid"]);

        // keep session data for 1 day
        $sessionLifeTime = 86400;
        ini_set("session.gc_maxlifetime", $sessionLifeTime);
        session_set_cookie_params($sessionLifeTime);

        session_start();
    }

    if (!isset($_SESSION["username"]))
        $_SESSION["username"] = null;

    function isLogedIn() {
        if (session_status() !== PHP_SESSION_NONE && (isset($_SESSION["username"]) || $_SESSION["username"] !== null))
            return true;
        else
            return false;
    }

    /**
     * Kiểm tra token trong session với token được gửi trong form
     */
    function checkToken() {
        if (!isset($_POST["token"]))
            stop(4, "Token please!", 400);
        if ($_POST["token"] !== $_SESSION["api_token"])
            stop(5, "Wrong token!", 403);
    }

    function getStringBetween($str, $from, $to) {
        $sub = substr($str, strpos($str, $from) + strlen($from), strlen($str));
        return substr($sub, 0, strpos($sub, $to));
    }

    function reqform(string $key) {
        if (!isset($_POST[$key]))
            stop(1, "Undefined form: ". $key, 400);
        else
            return trim($_POST[$key]);
    }

    function reqquery(string $key) {
        if (!isset($_GET[$key]))
            stop(1, "Undefined query: ". $key, 400);
        else
            return trim($_GET[$key]);
    }

    function getform(string $key, $isnul = null) {
        return isset($_POST[$key]) ? trim($_POST[$key]) : $isnul;
    }

    function getquery(string $key, $isnul = null) {
        return isset($_GET[$key]) ? trim($_GET[$key]) : $isnul;
    }

    /**
     * Remove the directory and its content (all files and subdirectories).
     * @param string path to directory
     */
    function rmrf($dir) {
        foreach (glob($dir) as $file)
            if (is_dir($file)) {
                rmrf("$file/*");
                rmdir($file);
            } else
                unlink($file);
    }

    /**
     * Thay đổi header Content-Type tương ứng với đuôi tệp
     * 
     * @param string Đuôi tên tệp
     * @return bool true nếu thành công.
     * 
     */
    function contentType(String $ext, String $charset = "utf-8") {
        $mimet = Array(
            "txt" => "text/plain",
            "htm" => "text/html",
            "html" => "text/html",
            "php" => "text/html",
            "css" => "text/css",
            "js" => "application/javascript",
            "json" => "application/json",
            "xml" => "application/xml",
            "swf" => "application/x-shockwave-flash",
            "flv" => "video/x-flv",
    
            // images
            "png" => "image/png",
            "jpe" => "image/jpeg",
            "jpeg" => "image/jpeg",
            "jpg" => "image/jpeg",
            "gif" => "image/gif",
            "bmp" => "image/bmp",
            "ico" => "image/vnd.microsoft.icon",
            "tiff" => "image/tiff",
            "tif" => "image/tiff",
            "svg" => "image/svg+xml",
            "svgz" => "image/svg+xml",
            "webp" => "image/webp",
    
            // archives
            "zip" => "application/zip",
            "rar" => "application/x-rar-compressed",
            "exe" => "application/x-msdownload",
            "msi" => "application/x-msdownload",
            "cab" => "application/vnd.ms-cab-compressed",
    
            // audio/video
            "mp3" => "audio/mpeg",
            "qt" => "video/quicktime",
            "mov" => "video/quicktime",
            "flv" => "video/x-flv",
            "mp4" => "video/mp4",
            "3gp" => "video/3gpp",
            "avi" => "video/x-msvideo",
            "wmv" => "video/x-ms-wmv",

            // adobe
            "pdf" => "application/pdf",
            "psd" => "image/vnd.adobe.photoshop",
            "ai" => "application/postscript",
            "eps" => "application/postscript",
            "ps" => "application/postscript",
    
            // ms office
            "doc" => "application/msword",
            "rtf" => "application/rtf",
            "xls" => "application/vnd.ms-excel",
            "ppt" => "application/vnd.ms-powerpoint",
            "docx" => "application/msword",
            "xlsx" => "application/vnd.ms-excel",
            "pptx" => "application/vnd.ms-powerpoint",
    
    
            // open office
            "odt" => "application/vnd.oasis.opendocument.text",
            "ods" => "application/vnd.oasis.opendocument.spreadsheet",
        );

        if (isset($mimet[$ext])) {
            header("Content-Type: ". $mimet[$ext] ."; charset=". $charset);
            return $mimet[$ext];
        } else
            return null;
    }

    function stop($c = 0, String $d = "", $sc = 200, $b = Array()) {
        global $runtime;

        $out = Array(
            "code" => $c,
            "status" => $sc,
            "description" => $d,
            "user" => $_SESSION["username"],
            "data" => $b,
            "runtime" => $runtime -> stop()
        );

        http_response_code($sc);

        if (!defined("STOP_OUTPUT"))
            define("STOP_OUTPUT", "print");

        switch (STOP_OUTPUT) {
            case "errorpage":
                if ($sc >= 300 || $c !== 0)
                    if (function_exists("printErrorPage"))
                        printErrorPage($out, headers_sent());
                    else print "<h1>Error $sc</h1><p>$d</p>";
                break;
            
            default:
                header("Content-Type: application/json", true);
                print(json_encode($out, JSON_PRETTY_PRINT));
                break;
        }

        die();
    }

    function convertSize($bytes) {
        $sizes = array("B", "KB", "MB", "GB", "TB");
        for ($i = 0; $bytes >= 1024 && $i < (count($sizes) -1); $bytes /= 1024, $i++);
        
        return (round($bytes, 2 ) . " " . $sizes[$i]);
    }

    function folderSize($dir) {
        $size = 0;
        foreach (glob($dir ."/*", GLOB_NOSORT) as $i => $file) {
            //$size += is_file($file) ? filesize($file) : folderSize($file);
            $size += filesize($file);
        }
        return $size;
    }

    function arrayRemDub($inp) {
        $out = Array();
        $i = 0;
        sort($inp, SORT_NATURAL);
        foreach($inp as $k => $v)
            if (!isset($out[$i-1]) || $out[$i-1] !== $v) {
                $out[$i] = $v;
                $i++;
            }
        return $out;
    }

    function arrayremBlk($inp) {
        $out = Array();
        foreach($inp as $i => $v)
            if (isset($v))
                array_push($out, $v);
        return $out;
    }

    function diskSpace($path) {
        $free = disk_free_space($path);
        $total = disk_total_space($path);
        $used = $total - $free;
        $used_p = sprintf("%.2f",($used / $total) * 100);
        return Array(
            "path" => $path,
            "total" => $total,
            "total_f" => convertSize($total),
            "used" => $used,
            "used_f" => convertSize($used),
            "used_p" => $used_p,
            "free" => $free,
            "free_f" => convertSize($free)
        );
    }

    class fip {
        public $stream;
        public $path;

        public function __construct(string $path, string $defaultData = "") {
            $this -> path = $path;

            if (!file_exists($path)) {
                $this -> fos($path, "x");
                $this -> write($defaultData);
            }
        }

        public function fos(string $path, string $mode) {
            try {
                $this -> stream = fopen($path, $mode);
                if (!$this -> stream) {
                    $e = error_get_last();
                    stop(8, "Lỗi[". $e["type"] ."]: ". $e["message"] ." tại ". $e["file"] ." dòng ". $e["line"], 500, $e);
                }
            } catch (Exception $e) {
                stop(8, $e -> getMessage() ." tại ". $e -> getFile() ." dòng ". $e -> getLine(), 500, $e);
            }
        }

        public function fcs() {
            fclose($this -> stream);
        }

        public function read() {
            $this -> fos($this -> path, "r");

            if (filesize($this -> path) > 0)
                $data = fread($this -> stream, filesize($this -> path));
            else
                $data = null;

            $this -> fcs();
            return $data;
        }

        public function write(string $data = "") {
            $this -> fos($this -> path, "w");
            fwrite($this -> stream, $data);
            $this -> fcs();
            return true;
        }
    }

    class stopClock {
        private $start;

        public function __construct() {
            $this -> start = microtime(true);
        }

        public function stop() {
            return (microtime(true) - $this -> start);
        }
    }

    if (!isset($runtime))
        $runtime = new stopClock();

?>