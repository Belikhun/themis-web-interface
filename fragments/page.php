<?php
/**
 * header.php
 * 
 * Header fragment
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2023 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

use Blink\Metric;
use Blink\Router;
global $PAGE;

// Set default font
if (!isset($_SESSION["font"]) || !isset(CONFIG::$FONTS[$_SESSION["font"]]))
	$_SESSION["font"] = "Albula";

if (CONFIG::$DEBUG) {
	$font = getParam("font");
	if (isset(CONFIG::$FONTS[$font]))
		$_SESSION["font"] = $font;
}

$fontPath = "/assets/fonts" . str_repeat("/" . $_SESSION["font"], 2) . ".css";
$fontName = CONFIG::$FONTS[$_SESSION["font"]];

$jsLibs = globFilesPriorityCached("/assets/js/*.js");
$jsObjs = globFilesPriorityCached("/assets/js/Objects/*.js");

if (CONFIG::$DEBUG) {
	$PAGE -> css("/static/debug/debug.css");
}

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		<!-- ASSETS: Include css files -->
		<?php foreach (glob(BASE_PATH . "/assets/css/*.css") as $css) { ?>
			<link rel="stylesheet" href="<?php echo getRelativePath($css) . "?v=" . \CONFIG::$VERSION; ?>">
		<?php } ?>

		<!-- $PAGE: Include css files -->
		<?php foreach ($PAGE -> cssFiles as $css) { ?>
			<link rel="stylesheet" href="/assets?path=<?php echo getRelativePath($css) . "&v=" . \CONFIG::$VERSION; ?>">
		<?php } ?>

		<!-- ASSETS: Include font files -->
		<link rel="stylesheet" href="<?php echo $fontPath; ?>">
		<link rel="stylesheet" href="/assets/fonts/FontAwesome/FontAwesome.css">
		<title><?php echo $PAGE -> title; ?></title>
	</head>

	<body style="--global-font: '<?php echo $fontName; ?>'">
		<!-- BEGIN PAGE CONTENT -->
		<?php echo $PAGE -> content; ?>
		<!-- END PAGE CONTENT -->

		<script type="text/javascript">
			const APP_NAME = `<?php echo CONFIG::$APP_NAME; ?>`;
			const LOGGED_IN = <?php echo \Session::loggedIn() ? "true" : "false"; ?>;
			const LOGOUT_TOKEN = `<?php echo \Session::$logoutToken; ?>`;
			const DDEBUG = <?php echo \CONFIG::$DEBUG ? "true" : "false"; ?>;

			window.modules = {}

			function registerModule(module) {
				if (typeof module !== "object")
					return;

				window.modules = {
					...window.modules,
					...module
				};
			}

			window.addEventListener("DOMContentLoaded", () => initGroup(window.modules, "modules"));
		</script>

		<!-- ASSETS: Include libraries -->
		<?php foreach ($jsLibs as $js) { ?>
			<script type="text/javascript" src="<?php echo getRelativePath($js -> path) . "?v=" . \CONFIG::$VERSION; ?>"></script>
		<?php } ?>

		<!-- ASSETS: Include Objects -->
		<?php foreach ($jsObjs as $js) { ?>
			<script type="text/javascript" src="<?php echo getRelativePath($js -> path) . "?v=" . \CONFIG::$VERSION; ?>"></script>
		<?php } ?>

		<?php \Lazyload::render(); ?>

		<?php
		// DEBUG CODE FOR PREPARING THE DEBUG
		// PANEL
		if (\CONFIG::$DEBUG) {
			$dbgTexts = Array();
			
			// PRINT METRICS
			$dbgTexts[] = "> QUERIES";
			$dbgTexts[] = " TIME     MODE              TBL  AFF";
			foreach (Metric::$queries as $query)
				$dbgTexts[] = (String) $query;

			$dbgTexts[] = "";
			$dbgTexts[] = "> REQUESTS";
			$dbgTexts[] = " TIME    MTH CODE PATH";
			foreach (Metric::$requests as $request)
				$dbgTexts[] = (String) $request;

			$dbgTexts[] = "";
			$dbgTexts[] = "> FILES";
			$dbgTexts[] = " TIME MODE       TYPE     SIZE PATH";
			foreach (Metric::$files as $file)
				$dbgTexts[] = (String) $file;
			

			// PRINT AVAILABLE ROUTES
			$dbgTexts[] = "";
			$dbgTexts[] = "> ROUTES";
			$dbgTexts[] = " P      V  URI";
			foreach (Router::getRoutes() as $route)
				$dbgTexts[] = (String) $route;
			
			$PAGE -> js("/static/debug/debug.js", "debug", Array(
				"text" => implode("\n", $dbgTexts),
				"fonts" => CONFIG::$FONTS,
				"active" => $_SESSION["font"]
			), 100);
		}
		?>

		<!-- $PAGE: Include js files -->
		<?php $PAGE -> renderIncludeJS(); ?>
	</body>
</html>