<?php

/**
 * Page.php
 * 
 * Page interface to change page's behaviour and provide
 * request information for current page.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class Page {
	/**
	 * Arguments passed into this page by router.
	 * @var Array
	 */
	public $args;

	/**
	 * Page folder location.
	 * @var String
	 */
	public $location;

	/**
	 * List of js file to include.
	 * @var Array
	 */
	public $jsFiles;

	/**
	 * List of css file to include.
	 * @var Array
	 */
	public $cssFiles;

	public function __construct(Array $args, String $location) {
		$this -> args = $args;
		$this -> location = $location;

		$this -> jsFiles = Array();
		$this -> cssFiles = Array();
	}

	public function getArgument($name, $type = TYPE_TEXT, $default = null) {
		if (isset($this -> args[$name]))
			$param = $this -> args[$name];
		else
			return $default;

		return cleanParam($param, $type);
	}

	public function requiredArgument($name, $type = TYPE_TEXT) {
		$param = $this -> getArgument($name, $type);

		if ($param === null)
			throw new MissingParam($name);

		return $param;
	}

	/**
	 * Validate path for included file.
	 * @param	String	$path
	 * @return	Bool
	 */
	private function validatePath(&$path) {
		$real = realpath($path);

		// File does not exist.
		if (!$real)
			throw new FileNotFound($path);

		$path = str_replace("\\", "/", $real);

		// Included file is outside of web root. This indicate
		// an LFI attack attempt.
		if (strpos($path, BASE_PATH) !== 0)
			return false;
		
		return true;
	}

	/**
	 * Include js file provided by path. Return false when
	 * target path is invalid or file does not exist.
	 * 
	 * @param	String		$path		Path of js file to include.
	 * Directory base at folder containing current page.php
	 * 
	 * @param	String		$object		Object name to call init() function.
	 * @param	String[]	$params		Params will be set to $object.params
	 * @param	int			$priority	Init priority
	 * 
	 * @return	Bool
	 */
	public function js($path, String $object = null, Array $params = [], int $priority = 0) {
		if ($path[0] === "/") {
			$path = BASE_PATH . $path;
		} else {
			$path = "{$this -> location}/$path";
		}

		// Validate path
		if (!$this -> validatePath($path))
			return false;

		$this -> jsFiles[] = Array(
			"path" => $path,
			"object" => $object,
			"params" => $params,
			"priority" => $priority
		);
		
		return true;
	}

	public function renderIncludeJS() {
		// Sort files by priority
		usort($this -> jsFiles, function ($a, $b) {
			return $b["priority"] <=> $a["priority"];
		});

		?> <script type="text/javascript">
			const registerModuleWithParams = (object, params = []) => {
				// Try to get object in current scope
				let target;

				try {
					target = eval(`(() => ${object})()`);
				} catch(e) {
					clog("WARN", `$PAGE -> js(${object}): cannot initialize: object not found!`);
					return;
				}

				target.params = params;
				registerModule({ [object]: target });
			}
		</script> <?php

		foreach ($this -> jsFiles as $js) {
			$path = "/assets?path=" . getRelativePath($js["path"]);

			?>
			<!-- <?php echo "Priority:" . $js["priority"] . " | Module: " . $js["object"]; ?> -->
			<script type="text/javascript" src="<?php echo $path ?>"></script>
			<?php

			// Register object if object name is specified, will also set params
			// if provided.
			if (!empty($js["object"])) {
				$jsonString = json_encode($js["params"]);

				// Pre-process line break.
				// https://stackoverflow.com/questions/11591784/parsing-json-containing-new-line-characters
				$jsonString = str_replace("\\r", "\\\\r", $jsonString);
				$jsonString = str_replace("\\n", "\\\\n", $jsonString);

				?>
				<script type="text/javascript">
					registerModuleWithParams(
						`<?php echo $js["object"]; ?>`,
						JSON.parse(`<?php echo $jsonString; ?>`));
				</script>
				<?php
			}
		}
	}

	/**
	 * Include css file provided by path. Return false when
	 * target path is invalid or file does not exist.
	 * 
	 * @param	String	$path	Path of css file to include.
	 * Directory base at folder containing current page.php
	 * 
	 * @return	Bool
	 */
	public function css($path) {
		if ($path[0] === "/") {
			$path = BASE_PATH . $path;
		} else {
			$path = "{$this -> location}/$path";
		}

		// Validate path
		if (!$this -> validatePath($path))
			return false;

		$this -> cssFiles[] = $path;
		return true;
	}
}