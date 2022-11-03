<?php
	/** @var \Page $PAGE */
	$PAGE;

	$title = PAGE_TITLE . " - " . CONFIG::$APP_NAME;

	// Set default font
	if (!isset($_SESSION["font"]))
		$_SESSION["font"] = "Arial";

	if (!CONFIG::$PRODUCTION) {
		$font = getParam("font");
		$PAGE -> css("/static/debug/debug.css");

		if (isset(CONFIG::$FONTS[$font]))
			$_SESSION["font"] = $font;
	}

	$fontPath = "/assets/fonts" . str_repeat("/" . $_SESSION["font"], 2) . ".css";
	$fontName = CONFIG::$FONTS[$_SESSION["font"]];
?>

<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<!-- ASSETS: Include css files -->
	<?php foreach (glob(BASE_PATH . "/assets/css/*.css") as $css) { ?>
		<link rel="stylesheet" href="<?php echo getRelativePath($css); ?>">
	<?php } ?>

	<!-- STATIC: Include css files -->
	<?php foreach (glob(BASE_PATH . "/static/css/*.css") as $css) { ?>
		<link rel="stylesheet" href="<?php echo getRelativePath($css); ?>">
	<?php } ?>

	<!-- $PAGE: Include css files -->
	<?php foreach ($PAGE -> cssFiles as $css) { ?>
		<link rel="stylesheet" href="/assets?path=<?php echo getRelativePath($css); ?>">
	<?php } ?>

	<!-- ASSETS: Include font files -->
	<link rel="stylesheet" href="<?php echo $fontPath; ?>">
	<link rel="stylesheet" href="/assets/fonts/FontAwesome/FontAwesome.css">

	<title><?php echo $title; ?></title>
</head>

<body style="--global-font: '<?php echo $fontName; ?>'">

<div id="app">