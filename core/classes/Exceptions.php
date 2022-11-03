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
		parent::__construct(FILE_INSTANCE_NOT_FOUND, "Không tồn tại tệp với mã $hash trong cơ sở dữ liệu!", 404);
	}
}

class SQLDriverNotFound extends GeneralException {
	public function __construct(String $name) {
		parent::__construct(SQL_DRIVER_NOT_FOUND, "Không tồn tại driver SQL với tên \"$name\"!", 500);
	}
}

class InvalidSQLDriver extends GeneralException {
	public function __construct(String $name) {
		parent::__construct(INVALID_SQL_DRIVER, "Driver SQL \"$name\" không hợp lệ! Có thể driver này chưa được định nghĩa hoặc chưa kế thừa từ \"\\DB\"!", 500);
	}
}

class DatabaseNotUpgraded extends GeneralException {
	public function __construct(int $version, int $target) {
		parent::__construct(DATABASE_NOT_UPGRADED, "Cơ sở dữ liệu chưa được cập nhật! Phiên bản hiện tại là $version nhưng phiên bản của cấu trúc bảng là $target. Vui lòng cập nhật lại đoạn mã nâng cấp của bạn!", 500);
	}
}
