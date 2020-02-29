<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /public/index.php                                                                            |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|
    
    // SET PAGE TYPE
    define("PAGE_TYPE", "NORMAL");

    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/problems/problem.php";

    $root = str_replace("\\", "/", $_SERVER["DOCUMENT_ROOT"]);
    $path = str_replace("\\", "/", getcwd());
    $clientPath = str_replace($_SERVER["DOCUMENT_ROOT"], "", $path);
    $size = convertSize(folderSize($path));

    $contestStarted = contest_timeRequire([CONTEST_STARTED]);
    $attachment = ($contestStarted === true) ? problemListAttachment() : Array();

    $filesList = glob($path ."/*.*");
    $list = Array();

    foreach ($filesList as $key => $file) {
        if (strpos($file, ".htaccess") !== false || strpos($file, "index.php") !== false)
            continue;

        array_push($list, Array(
            "file" => basename($file),
            "size" => convertSize(filesize($file)),
            "url" => $clientPath ."/". basename($file),
            "lastmodify" => date("d/m/Y H:i:s", filemtime($file))
        ));
    }
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title><?php print "Index of ". $clientPath ?> | <?php print APPNAME ." v". VERSION; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/scrollBar.css?v=<?php print VERSION; ?>" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/button.css?v=<?php print VERSION; ?>" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/menu.css?v=<?php print VERSION; ?>" />
    <!-- Fonts -->
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/calibri.css?v=<?php print VERSION; ?>" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/exo.css?v=<?php print VERSION; ?>" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/opensans.css?v=<?php print VERSION; ?>" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/material-font.css?v=<?php print VERSION; ?>" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/consolas.css?v=<?php print VERSION; ?>" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/fontawesome.css?v=<?php print VERSION; ?>" />

    <style>
        body {
            position: relative;
            display: block;
            margin: unset;
            width: 100%;
            height: 100vh;
            overflow-x: hidden;
            overflow-y: auto;
        }

        body:not(.embeded) {
            background-color: gray;
        }

        span.dot {
            position: relative;
            display: inline-block;
            width: 4px;
            height: 4px;
            background-color: rgb(102, 102, 102);
            border-radius: 50%;
            margin: 2px 4px;
        }

        .menu .group .item .left .file-origin,
        .menu .group .item .left .file-name,
        .menu .group .item .left .file-info {
            display: block;
        }

        .menu .group .item .left .file-origin {
            font-weight: bold;
            font-size: 12px;
        }

        .menu .group .item .left .file-name {
            font-size: 16px;
            color: #16a085;
        }
    </style>

</head>

<body>

    <div class="menu">
        <div class="group home">
            <t class="title big">Các tệp công khai</t>
            <t class="title small">Danh sách các tệp công khai có thể tải về</t>
            <div class="space"></div>
        </div>

        <div class="group file">
            <t class="title">Tệp đính kèm trong các đề bài</t>

            <?php if ($contestStarted !== true) { ?>

                <div class="item lr warning">
                    <t class="left">Danh sách tệp đã bị ẩn vì khì thi chưa bắt đầu.</t>
                    <div class="right"></div>
                </div>

            <?php } elseif (sizeof($attachment) === 0) { ?>

                <div class="item lr info">
                    <t class="left">Không tìm thấy tệp đính kèm nào.</t>
                    <div class="right"></div>
                </div>

            <?php } else foreach ($attachment as $key => $value) { ?>
                    
                <div class="item lr">
                    <div class="left">
                        <t class="file-origin"><?php print $value["name"]; ?> [<?php print $value["id"]; ?>]</t>
                        <t class="file-name"><?php print $value["attachment"]; ?></t>
                        <t class="file-info">
                            Ngày sửa đổi: <?php print date("d/m/Y H:i:s", $value["lastmodify"]); ?>
                            <span class="dot"></span>
                            Kích cỡ: <?php print convertSize($value["size"]); ?>
                        </t>
                    </div>

                    <div class="right">
                        <a href="<?php print $value["url"]; ?>" download="<?php print $value["attachment"]; ?>">
                            <button class="sq-btn green">Tải về</button>
                        </a>
                    </div>
                </div>

            <?php } ?>

        </div>

        <div class="group file">
            <t class="title"><?php print "Index of ". $clientPath ?></t>
            <t class="title small">Total size: <?php print $size ?></t>

            <?php if (sizeof($list) === 0) { ?>

                <div class="item lr info">
                    <t class="left">Không tìm thấy tệp nào.</t>
                    <div class="right"></div>
                </div>

            <?php } else foreach ($list as $key => $value) { ?>
                
                <div class="item lr">
                    <div class="left">
                        <t class="file-name"><?php print $value["file"]; ?></t>
                        <t class="file-info">
                            Ngày sửa đổi: <?php print $value["lastmodify"]; ?>
                            <span class="dot"></span>
                            Kích cỡ: <?php print $value["size"]; ?>
                        </t>
                    </div>

                    <div class="right">
                        <a href="<?php print $value["url"]; ?>" download="<?php print $value["file"]; ?>">
                            <button class="sq-btn">Tải về</button>
                        </a>
                    </div>
                </div>

            <?php } ?>
        </div>

    </div>

    <!-- Library -->
    <script type="text/javascript" src="/assets/js/belibrary.js?v=<?php print VERSION; ?>"></script>
    <script type="text/javascript">
        if (cookie.get("__darkMode") === "true")
            document.body.classList.add("dark");

        if (window.frameElement)
            document.body.classList.add("embeded");
    </script>

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php print TRACK_ID; ?>"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments) }
        gtag("js", new Date());

        gtag("config", `<?php print TRACK_ID; ?>`);
    </script>
</body>

</html>