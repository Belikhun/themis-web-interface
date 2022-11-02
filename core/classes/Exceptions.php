<?php
/**
 * Exceptions.php
 * 
 * Web core built in exceptions.
 * 
 * @author    Belikhun
 * @since     2.0.0
 * @license   https://tldrlegal.com/license/mit-license MIT
 * 
 * Copyright (C) 2018-2022 Belikhun. All right reserved
 * See LICENSE in the project root for license information.
 */

class InvalidValue extends GeneralException {
	public function __construct(String $value, String $type) {
		parent::__construct(INVALID_VALUE, "Giá trị \"$value\" không phải là một \"$type\" hợp lệ!", 400);
	}
}

class MaxLengthExceeded extends GeneralException {
	public function __construct(String $field, int $max) {
		parent::__construct(MAX_LENGTH_EXCEEDED, "$field không được vượt quá $max kí tự!", 400);
	}
}

class FileInstanceNotFound extends GeneralException {
	public function __construct(String $hash) {
		parent::__construct(MAX_LENGTH_EXCEEDED, "Không tồn tại tệp với mã $hash trong cơ sở dữ liệu!", 404);
	}
}