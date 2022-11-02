<?php
/**
 * Config Store Definition
 * 
 * @copyright	2022 Hanoi Open University
 * @author		Belikhun <domanhha@hou.edu.vn>
 * @license		https://tldrlegal.com/license/mit-license MIT
 */

use Config\StoreGroup;

$group = new StoreGroup("General");

$group -> define("ASSETS_EXPIRE", "Thời Hạn Tài Nguyên", "bla");