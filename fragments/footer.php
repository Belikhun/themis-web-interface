<?php
global $PAGE;

$jsLibs = globFilesPriorityCached("/assets/js/*.js");

?>

</div>

<script type="text/javascript">
	const APP_NAME = `<?php echo CONFIG::$APP_NAME; ?>`;
	const LOGGED_IN = <?php echo \Session::loggedIn() ? "true" : "false"; ?>;
	const LOGOUT_TOKEN = `<?php echo \Session::$logoutToken; ?>`;

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
	<script type="text/javascript" src="<?php echo getRelativePath($js -> path); ?>"></script>
<?php } ?>

<?php \Lazyload::render(); ?>

<?php
// DEBUG CODE FOR PREPARING THE DEBUG
// PANEL
if (!\CONFIG::$PRODUCTION) {
	$dbgTexts = Array();
	
	// PRINT METRICS
	$dbgTexts[] = "> QUERIES";
	$dbgTexts[] = " TIME     MODE              TBL  AFF";
	foreach (\Metric::$queries as $query)
		$dbgTexts[] = (String) $query;

	$dbgTexts[] = "";
	$dbgTexts[] = "> REQUESTS";
	$dbgTexts[] = " TIME    MTH CODE PATH";
	foreach (\Metric::$requests as $request)
		$dbgTexts[] = (String) $request;

	$dbgTexts[] = "";
	$dbgTexts[] = "> FILES";
	$dbgTexts[] = " TIME MODE       TYPE     SIZE PATH";
	foreach (\Metric::$files as $file)
		$dbgTexts[] = (String) $file;
	

	// PRINT AVAILABLE ROUTES
	$dbgTexts[] = "";
	$dbgTexts[] = "> ROUTES";
	$dbgTexts[] = " P      V  URI";
	foreach (\Router::getRoutes() as $route)
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

</body></html>