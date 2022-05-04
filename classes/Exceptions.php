<?php

class CourseNotFound extends GeneralException {
	public function __construct(int $id) {
		parent::__construct(COURSE_NOT_FOUND, "Khóa học \"$id\" không tồn tại trên hệ thống!", 404);
	}
}

class InstructorNotFound extends GeneralException {
	public function __construct(int $id) {
		parent::__construct(INSTRUCTOR_NOT_FOUND, "Giảng viên \"$id\" không tồn tại trên hệ thống!", 404);
	}
}

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