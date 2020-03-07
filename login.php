<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  login.php                                                                                    |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "NORMAL");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";
    header("Cache-Control: max-age=0, must-revalidate", true);

?>

<!DOCTYPE html>
<html lang="vi-VN">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Đăng nhập</title>

        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/default.css?v=<?php print VERSION; ?>" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/button.css?v=<?php print VERSION; ?>" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/input.css?v=<?php print VERSION; ?>" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/progressBar.css?v=<?php print VERSION; ?>" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/scrollBar.css?v=<?php print VERSION; ?>" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/spinner.css?v=<?php print VERSION; ?>" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/loginPage.css?v=<?php print VERSION; ?>" />
        <!-- Fonts -->
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/calibri/calibri.css?v=<?php print VERSION; ?>" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/nunito/nunito.css?v=<?php print VERSION; ?>" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/opensans/opensans.css?v=<?php print VERSION; ?>" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/material-font.css?v=<?php print VERSION; ?>" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/consolas/consolas.css?v=<?php print VERSION; ?>" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/fontawesome/fontawesome.css?v=<?php print VERSION; ?>" />
    </head>

    <body>
        <div class="leftPanel">
            <div class="lazyload wallpaper">
                <img onload="this.parentNode.dataset.loaded = 1" src="/api/images/landing"/>
                <div class="simple-spinner"></div>
            </div>
            <ul class="footer">
                <li class="title text-overflow">Chương trình chấm điểm <a href="https://dsapblog.wordpress.com/" target="_blank" rel="noopener">Themis</a></li>
                <li class="sub text-overflow">Được viết bởi Lê Minh Hoàng & Đỗ Đức Đông</li>
                <li class="sub2 text-overflow">background image by Belikhun.</li>
            </ul>
        </div>

        <div class="rightPanel">
            <div class="header">
                <div class="lazyload icon">
                    <img onload="this.parentNode.dataset.loaded = 1" src="/api/images/icon"/>
                    <div class="simple-spinner"></div>
                </div>
                <ul class="info">
                    <li class="name text-overflow">
                        <?php print $config["app"]["title"]; ?>
                    </li>
                    <li class="description text-overflow">
                        <?php print $config["app"]["description"]; ?>
                    </li>
                </ul>
            </div>

            <div id="formContainer" class="center">
                <t id="formTitle" class="title">Đang tải...</t>
                <t id="formMessage" class="message"></t>

                <div class="formBox">
                    <form class="inputForm" id="loginFormContainer" action="javascript:void(0);">
                        <div class="progress">
                            <div class="progressBar"><div class="bar" data-color="blue" data-blink="grow"></div></div>
                            <div class="indicator">
                                <span class="item">Tên Tài Khoản</span>
                                <span class="item">Mật Khẩu</span>
                                <span class="item">Hoàn Thành</span>
                            </div>
                        </div>

                        <div class="username" id="loginUsername">
                            <div class="formGroup sound" data-color="blue" data-soundselectsoft>
                                <input id="loginUsernameInput" type="text" autocomplete="username" class="formField" autocomplete="off" placeholder="Tên tài khoản" required disabled>
                                <label for="loginUsernameInput">Tên tài khoản</label>
                            </div>
    
                            <div class="button">
                                <button id="loginUsernameSubmit" type="button" class="sq-btn sound" data-soundhover data-soundselect disabled>Tiếp</button>
                                <button id="registerToggler" type="button" class="text-btn register" disabled>Đăng Kí</button>
                            </div>
                        </div>
    
                        <div class="password" id="loginPassword">
                            <div id="loginFormProfile">
                                <div class="lazyload avatar">
                                    <img id="loginFormAvatar" src=""/>
                                    <div class="simple-spinner"></div>
                                </div>
                                <t id="loginFormUser"></t>
                            </div>
    
                            <div class="formGroup sound" data-color="blue" data-soundselectsoft>
                                <input id="loginPasswordInput" type="password" autocomplete="current-password" class="formField" autocomplete="off" placeholder="Mật khẩu" required disabled>
                                <label for="loginPasswordInput">Mật khẩu</label>
                            </div>
    
                            <div class="button">
                                <button id="loginPasswordSubmit" type="submit" class="sq-btn pink sound" data-soundhover data-soundselect disabled>Đăng Nhập</button>
                            </div>
                        </div>

                        <div class="complete">
                            <div class="icon"></div>
                            <t class="title">Đăng nhập thành công</t>
                            <t id="loginCompleteMessage" class="message"></t>
                        </div>
                    </form>
    
                    <form class="inputForm" id="registerFormContainer" action="javascript:void(0);">
                        <div class="progress">
                            <div class="progressBar"><div class="bar" data-color="blue" data-blink="grow"></div></div>
                            <div class="indicator">
                                <span class="item">Tên Tài Khoản</span>
                                <span class="item">Mật Khẩu</span>
                                <span class="item">Hoàn Thành</span>
                            </div>
                        </div>

                        <div class="username" id="registerUsername">
                            <div class="formGroup sound" data-color="blue" data-soundselectsoft>
                                <input id="registerUsernameInput" type="text" autocomplete="username" class="formField" autocomplete="off" placeholder="Tên tài khoản" required disabled>
                                <label for="registerUsernameInput">Tên tài khoản</label>
                            </div>
    
                            <div class="button">
                                <button id="registerUsernameSubmit" type="button" class="sq-btn green sound" data-soundhover data-soundselect disabled>Tiếp</button>
                                <button id="loginToggler" type="button" class="text-btn register" disabled>< Quay Lại</button>
                            </div>
                        </div>
    
                        <div class="password" id="registerPassword">
                            <div class="formGroup sound" data-color="blue" data-soundselectsoft>
                                <input id="registerPasswordInput" type="password" autocomplete="new-password" class="formField" autocomplete="off" placeholder="Mật khẩu" required disabled>
                                <label for="registerPasswordInput">Mật khẩu</label>
                            </div>

                            <div class="formGroup sound" data-color="blue" data-soundselectsoft>
                                <input id="registerPasswordInputRetype" type="password" autocomplete="new-password" class="formField" autocomplete="off" placeholder="Nhập Lại Mật khẩu" required disabled>
                                <label for="registerPasswordInputRetype">Nhập Lại Mật khẩu</label>
                            </div>

                            <div class="captchaContainer">
                                <t class="info">Vui lòng điền captcha bên dưới</t>
                                
                                <div class="row">
                                    <div class="lazyload captcha">
                                        <img id="registerCaptcha" src=""/>
                                        <div class="simple-spinner"></div>
                                    </div>

                                    <span id="registerCaptchaRenew" class="renew sound" data-soundhoversoft data-soundselectsoft></span>
                                </div>

                                <div class="formGroup sound" data-color="blue" data-soundselectsoft>
                                    <input id="registerCaptchaInput" type="password" autocomplete="off" class="formField" autocomplete="off" placeholder="Captcha" required disabled>
                                    <label for="registerCaptchaInput">Captcha</label>
                                </div>
                            </div>
    
                            <div class="button">
                                <button id="registerPasswordSubmit" type="submit" class="sq-btn pink sound" data-soundhover data-soundselect disabled>Đăng Kí</button>
                            </div>
                        </div>

                        <div class="complete">
                            <div class="icon"></div>
                            <t class="title">Đăng kí thành công</t>
                            <t class="message">Tài khoản của bạn đã được tạo thành công!</t>

                            <div class="userEdit">
                                <input type="file" class="avatarInput" id="userAvatarInput" accept="image/*">
                                <label for="userAvatarInput" class="lazyload avatar sound" data-soundhover data-soundselect>
                                    <img id="userAvatar" src=""/>
                                    <div class="simple-spinner"></div>
                                </label>

                                <div class="formGroup sound nameInput" data-color="purple" data-soundhover data-soundselectsoft>
                                    <input id="userNameInput" type="text" autocomplete="nickname" class="formField" autocomplete="off" placeholder="Tên">
                                    <label for="userNameInput">Tên</label>
                                </div>
                            </div>

                            <button id="editUserConfirm" type="button" class="sq-btn rainbow sound" data-soundhover data-soundselect>HOÀN THÀNH!</button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="footer">
                Copyright © 2018-2020 <a href="https://github.com/belivipro9x99" target="_blank" rel="noopener">Belikhun</a>. This project is licensed under the MIT License. See <a href="/LICENSE" target="_blank" rel="noopener">LICENSE</a> for more information.
            </div>
        </div>

        <script src="/assets/js/belibrary.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
        <script src="/assets/js/sounds.js?v=<?php print VERSION; ?>" type="text/javascript"></script>
        <script src="/assets/js/login.js?v=<?php print VERSION; ?>" type="text/javascript"></script>

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