<?php
    //|====================================================|
    //|                     login.php                      |
    //|            Copyright (c) 2018 Belikhun.            |
    //|      This file is licensed under MIT license.      |
    //|====================================================|

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
            <t class="footer text-overflow">
                Chương trình chấm điểm <a href="https://dsapblog.wordpress.com/">Themis</a> được thiết kế bởi Lê Minh Hoàng và Đỗ Đức Đông.
                <br>Ảnh nền bởi Belikhun.
            </t>
        </div>

        <div class="right-panel">
            <div class="header">
                <img class="icon" src="/data/img/icon.png">
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

                <form id="form_container" action="javascript:void(0);">
                    <div id="form_username">
                        <div class="formgroup dark">
                            <input id="form_username_input" type="text" name="username" class="formfield" autocomplete="off" placeholder="Tên tài khoản" required>
                            <label for="username" class="formlabel">Tên tài khoản</label>
                        </div>

                        <button id="form_username_submit" type="button" class="btn gray">Tiếp</button>
                        <t id="form_message"></t>
                    </div>

                    <div id="form_password">
                        <div class="profile">
                            <img alt="avt" src="" id="form_avatar" />
                            <t id="form_user"></t>
                        </div>

                        <div class="formgroup dark">
                            <input id="form_password_input" type="password" name="password" class="formfield" autocomplete="off" placeholder="Mật khẩu" required disabled>
                            <label for="password" class="formlabel">Mật khẩu</label>
                        </div>

                        <button id="form_password_submit" type="submit" class="btn" disabled>Đăng nhập</button>
                    </div>
                </form>
            </div>
            <div class="footer">
                Copyright © 2018 Belikhun. This project is copyrighted under MIT License
            </div>
        </div>

        <script src="/data/js/belibrary.js" type="text/javascript"></script>
        <script src="/data/js/login.js" type="text/javascript"></script>

    </body>

    </html>