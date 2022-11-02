<?php
/**
 * SvgAvatar.php
 * 
 * Function for rendering SVG avatar based on user's name.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
function SvgAvatar(String $name, Int $size = 200, Bool $stop = true) {
	$color = Array(
		"A" => "#5A876F", "B" => "#B2B7BB", "C" => "#6FA9AB", "D" => "#F5AF29", "E" => "#0088B9", "F" => "#F18536",
		"G" => "#D93A37", "H" => "#B3BC50", "I" => "#5B9BBD", "J" => "#F5878C", "K" => "#9B89B5", "L" => "#407887",
		"M" => "#9B89B5", "N" => "#5A876F", "O" => "#D33F33", "P" => "#D33F33", "Q" => "#F1B126", "R" => "#0087BF",
		"S" => "#F18536", "T" => "#0087BF", "U" => "#B2B7BB", "V" => "#72ACAE", "W" => "#9B89B5", "X" => "#5A876F",
		"Y" => "#EEB424", "Z" => "#407887"
	);

	$letter = strtoupper($name[0]);

	ob_start(); ?>
	<svg width="<?php print $size; ?>" height="<?php print $size; ?>" xmlns="http://www.w3.org/2000/svg">
		<rect
			fill="<?php print $color[$letter] ?? "#846B32"; ?>"
			height="<?php print $size; ?>"
			width="<?php print $size; ?>"
		/>

		<text
			xml:space="preserve"
			text-anchor="middle"
			dominant-baseline="central"
			font-family="Nunito, Arial, sans-serif"
			font-size="<?php print ($size / 2) + 20; ?>"
			font-weight="bold"
			y="50%"
			x="50%"
			fill="#FFF"
		><?php print $letter; ?></text>
	</svg>
	<?php
	
	$svg = ob_get_clean();
	return $svg;
}