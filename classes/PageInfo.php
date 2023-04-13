<?php
/**
 * PageInfo.php
 * 
 * Paging information.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2023 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class PageInfo {
	public int $from;
	public int $limit;
	public int $total;
	public int $page;
	public int $maxPage;

	public function __construct(int $from, int $limit, int $total) {
		$this -> from = $from;
		$this -> limit = $limit;
		$this -> total = $total;
		$this -> page = ceil(($from + 1) / $limit);
		$this -> maxPage = max(ceil($total / $limit), 1);
	}
}