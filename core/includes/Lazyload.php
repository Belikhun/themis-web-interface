<?php

/**
 * Lazyload.php
 * 
 * Interface for lazyloading images.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class Lazyload {
	public static $images = Array();

	public static function add(
		String $url,
		Array $classes = Array(),
		Array $attributes = Array(),
		String $tag = "div",
		String $spinner = "simpleSpinner"
	) {
		array_unshift($classes, "lazyload");
		$id = "lazyload_" . substr(md5($url), 0, 6) . bin2hex(random_bytes(4));

		echo "<$tag id=\"$id\" class=\"" . implode(" ", $classes) . "\"></$tag>";
		self::$images[] = Array(
			"id" => $id,
			"url" => $url,
			"classes" => $classes,
			"attributes" => $attributes,
			"spinner" => $spinner
		);
	}

	public static function render() {
		if (count(self::$images) === 0)
			return;

		$json = json_encode(self::$images);

		?>
		<!-- Lazyload Module Generated Code -->
		<script type="text/javascript">
			// Isolate scope
			(function() {
				const images = JSON.parse(`<?php echo $json; ?>`);

				for (let image of images) {
					let container = document.getElementById(image.id);

					for (let key of Object.keys(image.attributes))
						container[key] = image.attributes[key];

					if (typeof lazyload !== "function") {
						let imageNode = document.createElement("img");
						imageNode.src = image.url;
						imageNode.classList.add(...image.classes);
						container.parentElement.replaceChild(imageNode, container);
					} else {
						new lazyload({
							container,
							source: image.url,
							classes: image.classes,
							spinner: image.spinner
						});
					}

				}
			})();
		</script>
		<?php
	}
}