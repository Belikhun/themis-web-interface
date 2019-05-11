<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  login.php                                                                                    |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";
    header("Cache-Control: max-age=0, must-revalidate", true);

?>

<!DOCTYPE html>
<html lang="vi-VN">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Đăng nhập</title>

        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/default.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/button.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/input.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/scrollbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/login.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/calibri.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/material-font.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/fontawesome.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="https://fonts.googleapis.com/css?family=Open+Sans" />

    </head>

    <body onload="login.init();">

        <div class="left-panel">
            <div class="wallpaper"></div>
            <ul class="footer">
                <li class="title text-overflow">Chương trình chấm điểm <a href="https://dsapblog.wordpress.com/" target="_blank" rel="noopener">Themis</a></li>
                <li class="sub text-overflow">Copyright © Lê Minh Hoàng & Đỗ Đức Đông</li>
                <li class="sub2 text-overflow">background image by Belikhun.</li>
            </ul>
        </div>

        <div class="right-panel">
            <div class="header">
                <img class="icon" src="/data/img/icon.webp">
                <ul class="info">
                    <li class="name text-overflow">
                        <?php print $config["contest"]["name"]; ?>
                    </li>
                    <li class="description text-overflow">
                        <?php print $config["contest"]["description"]; ?>
                    </li>
                </ul>
            </div>
            <div class="center">
                <t class="title">Đăng nhập</t>
                <t id="form_message"></t>

                <form id="form_container" action="javascript:void(0);">
                    <div id="form_username">
                        <div class="formgroup blue">
                            <input id="form_username_input" type="text" class="formfield" autocomplete="off" placeholder="Tên tài khoản" required disabled>
                            <label for="form_username_input" class="formlabel">Tên tài khoản</label>
                        </div>

                        <button id="form_username_submit" type="button" class="sq-btn" disabled>Tiếp</button>
                    </div>

                    <div id="form_password">
                        <div id="form_profile">
                            <img alt="avt" src="" id="form_avatar" />
                            <t id="form_user"></t>
                        </div>

                        <div class="formgroup blue">
                            <input id="form_password_input" type="password" class="formfield" autocomplete="off" placeholder="Mật khẩu" required disabled>
                            <label for="form_password_input" class="formlabel">Mật khẩu</label>
                        </div>

                        <button id="form_password_submit" type="submit" class="sq-btn pink" disabled>Đăng nhập</button>
                    </div>
                </form>
            </div>
            <div class="footer">
                Copyright © 2018-2019 <a href="https://www.facebook.com/belivipro9x99" target="_blank" rel="noopener">Belikhun</a>. This project is licensed under the MIT License. See <a href="/LICENSE" target="_blank" rel="noopener">LICENSE</a> for more information.
            </div>
        </div>

        <script src="/data/js/belibrary.js" type="text/javascript"></script>
        <script src="/data/js/login.js" type="text/javascript"></script>

        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-124598427-1"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'UA-124598427-1');
        </script>

    </body>
</html>