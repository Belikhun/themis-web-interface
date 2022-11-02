<?php

/**
 * HTMLBuilder.php
 * 
 * Simple HTML builder for rendering html code in
 * dev-friendly way.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class HTMLBuilder {
	/**
	 * Build da HTML
	 *
	 * @param String	$tag
	 * @param Array		$attributes
	 * @param String	$content
	 * @param bool		$end			Append end tag
	 * @return String
	 * 
	 * @version 1.0
	 * @author Belikhun <belivipro9x99@gmail.com>
	 */
	public static function build(String $tag, Array $attributes = Array(), String $content = "", bool $end = true) {
		$html = "<$tag";
		$attrs = Array();

		foreach ($attributes as $attribute => $value) {
			// Special treatment for class attribute
			if ($attribute === "class" && is_array($value))
				$value = implode(" ", array_filter($value));

			if (!is_scalar($value))
				continue;

			$value = htmlspecialchars($value);
			$attrs[] = $attribute . "=\"$value\"";
		}

		if (!empty($attrs))
			$html .= " " . implode(" ", $attrs);

		$html .= ">$content";

		if ($end)
			$html .= self::end($tag);

		return $html;
	}

	public static function end(String $tag) {
		return "</$tag>";
	}

	public static function div(Array $attributes = Array(), String $content = "") {
		return self::build("div", $attributes, $content);
	}

	public static function startDIV(Array $attributes = Array(), String $content = "") {
		return self::build("div", $attributes, $content, false);
	}

	public static function endDIV() {
		return "</div>";
	}

	public static function span(Array $attributes = Array(), String $content = "") {
		return self::build("span", $attributes, $content);
	}

	public static function startSPAN(Array $attributes = Array(), String $content = "") {
		return self::build("span", $attributes, $content, false);
	}

	public static function endSPAN() {
		return "</span>";
	}

	public static function p(String $content = "", Array $attributes = Array()) {
		return self::build("p", $attributes, $content);
	}

	public static function a(String $href, String $title, Array $attributes = Array()) {
		if (!isset($attributes["title"]))
			$attributes["title"] = $title;

		$attributes["href"] = $href;
		return self::build("a", $attributes, $title);
	}

	public static function img(String $src, Array $attributes = Array()) {
		$attributes["src"] = $src;
		return self::build("img", $attributes);
	}
}