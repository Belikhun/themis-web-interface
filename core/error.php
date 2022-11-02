<?php

function renderSourceCode($file, $line, $count = 10) {
	$content = (new FileIO($file)) -> read();
	$lines = explode("\n", $content);

	$from = $line - floor($count / 2);
	$to = $line + ceil($count / 2);
	$max = count($lines) - 1;

	if ($from < 0) {
		$to -= $from;
		$from = 0;

		if ($to > $max)
			$to = $max;
	} else if ($to > $max) {
		$from -= $to - $max;
		$to = $max;

		if ($from < 0)
			$from = 0;
	}

	echo HTMLBuilder::startDIV(Array( "class" => "sourceCode" ));
	echo HTMLBuilder::div(Array( "class" => "file" ), getRelativePath($file) . ":$line");

	for ($i = $from; $i <= $to; $i++) {
		$code = trim($lines[$i], "\n\r");
		$classes = Array( "line" );

		if ($i == $line - 1)
			$classes[] = "current";

		echo HTMLBuilder::startDIV(Array( "class" => $classes ));
		?>
		<span class="num"><?php echo $i; ?></span>
		<code><?php echo htmlspecialchars($code); ?></code>
		<?php
		echo HTMLBuilder::endDIV();
	}

	echo HTMLBuilder::endDIV();
}

$styles = (new FileIO(CORE_ROOT . "/error.css")) -> read();

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>An Critical Error Occured!!!</title>

		<style><?php echo $styles; ?></style>
	</head>

	<body>
		<div class="note">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
				<path d="M459.1 52.4L442.6 6.5C440.7 2.6 436.5 0 432.1 0s-8.5 2.6-10.4 6.5L405.2 52.4l-46 16.8c-4.3 1.6-7.3 5.9-7.2 10.4c0 4.5 3 8.7 7.2 10.2l45.7 16.8 16.8 45.8c1.5 4.4 5.8 7.5 10.4 7.5s8.9-3.1 10.4-7.5l16.5-45.8 45.7-16.8c4.2-1.5 7.2-5.7 7.2-10.2c0-4.6-3-8.9-7.2-10.4L459.1 52.4zm-132.4 53c-12.5-12.5-32.8-12.5-45.3 0l-2.9 2.9C256.5 100.3 232.7 96 208 96C93.1 96 0 189.1 0 304S93.1 512 208 512s208-93.1 208-208c0-24.7-4.3-48.5-12.2-70.5l2.9-2.9c12.5-12.5 12.5-32.8 0-45.3l-80-80zM200 192c-57.4 0-104 46.6-104 104v8c0 8.8-7.2 16-16 16s-16-7.2-16-16v-8c0-75.1 60.9-136 136-136h8c8.8 0 16 7.2 16 16s-7.2 16-16 16h-8z"/>
			</svg>

			<div class="inner">
				<h2>Một lỗi nghiêm trọng đã xảy ra!</h2>

				<?php if (!empty($_SESSION["lastError"])) {
					$error = $_SESSION["lastError"];
					$data = $error["data"];

					$detail = "<b>Lỗi [". $error["code"] ."]:</b> <sr>". $error["description"] ."</sr>";
					?>

					<div class="error"><?php echo $detail; ?></div>

					<?php if (isset($data["file"]) && isset($data["line"])) {
						renderSourceCode(BASE_PATH . $data["file"], $data["line"]);
					} ?>

					<?php if (isset($data["trace"])) {
						foreach ($data["trace"] as $trace)
							renderSourceCode($trace["file"], $trace["line"]);
					} ?>

					<details>
						<summary><b>FULL ERROR DATA</b></summary>
						<pre><?php echo json_encode($error, JSON_PRETTY_PRINT); ?></pre>
					</details>
				<?php } else { ?>
					<div>Sorry! But that's all we know.</div>
				<?php } ?>
			</div>
		</div>
	</body>
</html>
