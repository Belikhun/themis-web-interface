#? |-----------------------------------------------------------------------------------------------|
#? |  /api_example/main.py                                                                         |
#? |                                                                                               |
#? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
#? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
#? |-----------------------------------------------------------------------------------------------|


from log import log
import ehook
log("OKAY", "Initialised: ehook")
from ajax import ajax
log("OKAY", "Initialised: ajax.ajax")
import json
log("OKAY", "Initialised: json")

# Lấy địa chỉ của máy chủ
host = input("Enter host address: ")
# Lấy tên người dùng và mật khẩu
username = input("Username: ")
password = input("Password: ")

logindata = ajax("http://" + host + "/api/login", "POST", "json", form = {
	"u": username,
	"p": password
})

# Kiểm tra xem đăng nhập thành công không
if (logindata["code"] != 0 or logindata["status"] != 200):
	log("ERRR", "Lỗi [{}]: {}".format(logindata["code"], logindata["description"]))
	exit(logindata["code"])

log("OKAY", "Logged in as " + logindata["user"])
# Lưu sessid và token
sessid = logindata["data"]["sessid"]
token = logindata["data"]["token"]

# Lấy nhật ký nộp bài
testlogs = ajax("http://" + host + "/api/test/logs", "GET", "json")
log("DEBG", "\n" + json.dumps(testlogs, indent=2))

# Trong trường hợp request không có cookie PHPSESSID khi
# request sẽ bị lỗi chưa đăng nhập. Để khắc phục ta tiếp tục
# session bằng cách gửi sessid nhận được lúc đăng nhập:
testlogs = ajax("http://" + host + "/api/test/logs", "GET", "json", query = {
	"sessid": sessid
})
log("DEBG", "\n" + json.dumps(testlogs, indent=2))
