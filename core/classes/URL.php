<?php

/**
 * URL.php
 * 
 * URL Object that wrap the php's `parse_url()` function
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */
class URL {
	/**
     * The current URL.
     * @var String
     */
	public String $url = "";

    /**
     * Scheme, ex.: http, https
     * @var String
     */
    protected String $scheme = "";

    /**
     * Hostname.
     * @var String
     */
    protected String $host = "";

    /**
     * Port number, empty means default 80 or 443 in case of http.
     * @var int
     */
    protected int $port = 0;

    /**
     * Username for http auth.
     * @var String
     */
    protected String $user = "";

    /**
     * Password for http auth.
     * @var String
     */
    protected $pass = "";

    /**
     * Script path.
     * @var String
     */
    protected $path = "";

    /**
     * Url parameters as associative array.
     * @var String[]
     */
    public $params = Array();

	/**
	 * Construct a new url with params.
	 *
	 * @param	String|\URL			$url
	 * @param	String[]|Object		$params
	 */
	public function __construct($url, $params = []) {
		if ($url instanceof \URL) {
            $this -> scheme = $url -> scheme;
            $this -> host = $url -> host;
            $this -> port = $url -> port;
            $this -> user = $url -> user;
            $this -> pass = $url -> pass;
            $this -> path = $url -> path;
            $this -> params = $url -> params;
			return;
        }

		$parts = parse_url($url);

		if ($parts === false)
			throw new InvalidURL($url);

		// Parse the query first.
		if (isset($parts["query"])) {
			parse_str(str_replace("&amp;", "&", $parts["query"]), $this -> params);
			unset($parts["query"]);
		}

		foreach ($parts as $key => $value)
			$this -> $key = $value;

		$this -> url = $url;
		$this -> params($params);
	}

    /**
     * Add an array of params to the params for this url.
     *
     * @param	Array	$params		Defaults to null. If null then returns all params.
     * @return	Array	Array of params for this url.
     * @throws	CodingError
     */
    public function params(Array $params = null) {
        $params = (Array) $params;

        foreach ($params as $key => $value) {
            if (is_int($key))
                throw new CodingError("Url parameters can not have numeric keys!");

            if (!is_string($value)) {
                if (is_array($value))
                    throw new CodingError("Url parameters values can not be arrays!");
				
                if (is_object($value) and !method_exists($value, "__toString"))
                    throw new CodingError("Url parameters values can not be objects, unless __toString() is defined!");
            }

            $this -> params[$key] = (String) $value;
        }

        return $this -> params;
    }

    /**
     * Remove all params if no arguments passed.
     * Remove selected params if arguments are passed.
     *
     * Can be called as either `remove_params("param1", "param2")`
     * or `remove_params(array("param1", "param2"))`.
     *
     * @param	String[]|String $params
     * @return	Array			New url parameters.
     */
    public function removeParams($params = null) {
        if (!is_array($params))
            $params = func_get_args();
        
        foreach ($params as $param)
            unset($this->params[$param]);
		
        return $this->params;
    }

    /**
     * Get the params as as a query string.
     *
     * This method should not be used outside of this method.
     *
     * @param bool $escaped Use &amp; as params separator instead of plain &
     * @return string query string that can be added to a url.
     */
    public function getQuery($escaped = true) {
        $array = Array();
        $params = $this -> params;

        foreach ($params as $key => $val) {
            if (is_array($val)) {
                foreach ($val as $index => $value)
                    $array[] = rawurlencode($key . "[".$index."]") . "=" . rawurlencode($value);
            } else {
                if (isset($val) && $val !== "")
                    $array[] = rawurlencode($key) . "=" . rawurlencode($val);
                else
                    $array[] = rawurlencode($key);
            }
        }

        return ($escaped)
			? implode("&amp;", $array)
			: implode("&", $array);
    }

    public function __toString() {
        return $this -> out(true);
    }

    /**
     * Output url.
     *
     * If you use the returned URL in HTML code, you want the escaped ampersands. If you use
     * the returned URL in HTTP headers, you want $escaped=false.
     *
     * @param bool $escaped Use &amp; as params separator instead of plain &
     * @param array $overrideparams params to add to the output url, these override existing ones with the same name.
     * @return string Resulting URL
     */
    public function out($escaped = true) {
        $uri = $this -> uri();

        $query = $this -> getQuery($escaped);
        if ($query !== "")
            $uri .= "?$query";

        return $uri;
    }

    /**
     * Returns url without parameters, everything before "?".
     * @return	String
     */
    public function uri() {
        $uri = $this -> scheme
			? "{$this -> scheme}:" . ((strtolower($this -> scheme) === "mailto") ? "" : "//")
			: "";

        $uri .= $this -> user
			? $this -> user . ($this->pass ? ":{$this->pass}" : "") . "@"
			: "";

        $uri .= $this -> host ? $this -> host : "";
        $uri .= $this -> port ? ":{$this->port}" : "";
        $uri .= $this -> path ? $this -> path : "";

        return $uri;
    }

    /**
     * Sets the scheme for the URI (the bit before ://)
     * @param	String	$scheme
     */
    public function setScheme(String $scheme) {
        // See http://www.ietf.org/rfc/rfc3986.txt part 3.1.
        if (preg_match("/^[a-zA-Z][a-zA-Z0-9+.-]*$/", $scheme)) {
            $this -> scheme = $scheme;
        } else {
            throw new CodingError("Bad URL scheme: \"$scheme\"");
        }
    }
}