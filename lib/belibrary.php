<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /lib/belibrary.php                                                                           |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    include_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";

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

    if (!isset($_SESSION["id"]))
        $_SESSION["id"] = "guest";

    if (!function_exists("getallheaders")) {
        function getallheaders() {
            $headers = [];

            foreach ($_SERVER as $name => $value)
                if (substr($name, 0, 5) == "HTTP_")
                    $headers[str_replace(" ", "-", ucwords(strtolower(str_replace("_", " ", substr($name, 5)))))] = $value;

            return $headers;
        }
    }

    function isLogedIn() {
        if (session_status() !== PHP_SESSION_NONE && (isset($_SESSION["username"]) || $_SESSION["username"] !== null))
            return true;
        else
            return false;
    }

    /**
     * Kiểm tra token trong session với token được gửi trong form
     */
    function checkToken(string $token = null) {
        $sauce = $token ?: getHeader("token") ?: (isset($_POST["token"]) ? $_POST["token"] : null);

        if (empty($sauce))
            stop(4, "Token please!", 400);

        if ($sauce !== $_SESSION["apiToken"])
            stop(5, "Wrong token!", 403, Array( "token" => $sauce ));
    }

    function getStringBetween($str, $left, $right) {
        $sub = substr($str, strpos($str, $left) + strlen($left), strlen($str));
        return substr($sub, 0, strpos($sub, $right));
    }

    function reqForm(string $key) {
        if (!isset($_POST[$key]))
            stop(1, "Undefined form: ". $key, 400);
        else
            return trim($_POST[$key]);
    }

    function reqQuery(string $key) {
        if (!isset($_GET[$key]))
            stop(1, "Undefined query: ". $key, 400);
        else
            return trim($_GET[$key]);
    }

    function reqHeader(string $key) {
        $headers = getallheaders();

        if (!isset($headers[$key]))
            stop(1, "Undefined header: ". $key, 400);
        else
            return trim($headers[$key]);
    }

    function getForm(string $key, $isnul = null) {
        return isset($_POST[$key]) ? trim($_POST[$key]) : $isnul;
    }

    function getQuery(string $key, $isnul = null) {
        return isset($_GET[$key]) ? trim($_GET[$key]) : $isnul;
    }

    function getHeader(string $key, $isnul = null) {
        $headers = getallheaders();
        return isset($headers[$key]) ? trim($headers[$key]) : $isnul;
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

    /**
     *
     * Print out response data, set some header
     * and stop script execution!
     * 
     * @param    code           Response code
     * @param    description    Response description
     * @param    HTTPStatus     Response HTTP status code
     * @param    data           Response data (additional)
     * @param    hashData       Hash the data
     * @return   null
     *
     */
    function stop(Int $code = 0, String $description = "", Int $HTTPStatus = 200, Array $data = Array(), Bool $hashData = false) {
        global $runtime;

        $output = Array(
            "code" => $code,
            "status" => $HTTPStatus,
            "description" => $description,
            "user" => $_SESSION["username"],
            "data" => $data,
            "hash" => $hashData ? md5(serialize($data)) : null,
            "runtime" => $runtime -> stop()
        );

        // Set the HTTP status code
        http_response_code($HTTPStatus);

        if (!defined("PAGE_TYPE"))
            define("PAGE_TYPE", "NORMAL");

        switch (strtoupper(PAGE_TYPE)) {
            case "NORMAL":
                if (!headers_sent())
                    header("Output: [$code] $description");

                if ($HTTPStatus >= 300 || $code !== 0)
                    printErrorPage($output, headers_sent());

                break;
            
            case "API":
                if (!headers_sent())
                    header("Content-Type: application/json", true);
                    
                print(json_encode($output, JSON_PRETTY_PRINT));
                
                break;

            default:
                print "<h1>Error $HTTPStatus</h1><p>$description</p>";

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

    function printErrorPage(Array $data, Bool $useIframe = false) {
        $_SESSION["lastError"] = $data;
        print (($useIframe) ? "\" />" : "") . "<!-- Output Stopped here. Begin Error Page Element -->";
        
        if ($useIframe)
            print "<iframe src=\"/lib/error.php\" style=\"position: fixed; top: 0; left: 0; width: 100%; height: 100%; border: unset; overflow: auto;\"></iframe>";
        else
            require $_SERVER["DOCUMENT_ROOT"]. "/lib/error.php";
    }

    //! Error Handler
    function errorHandler(Int $code, String $text, String $file, Int $line) {
        $errorData = Array(
            "code" => $code,
            "description" => $text,
            "file" => basename($file),
            "line" => $line,
        );
        
        if (function_exists("writeLog"))
            writeLog("ERRR", "[$code] $text tại ". basename($file) .":". $line);

        stop(-1, "Error Occurred: ". $text, 500, $errorData);
    }

    set_error_handler("errorHandler", E_ALL);

    //? set start time
    if (!isset($runtime))
        $runtime = new stopClock();

?>