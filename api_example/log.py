#? |-----------------------------------------------------------------------------------------------|
#? |  /api_example/log.py                                                                          |
#? |                                                                                               |
#? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
#? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
#? |-----------------------------------------------------------------------------------------------|

from colorama import init
from colorama import Fore, Back, Style
from inspect import currentframe
import atexit
import time
import re

#init
init(autoreset=True)
sticks = time.time()

def escape_ansi(line):
    ansi_escape = re.compile(r"(\x9B|\x1B\[)[0-?]*[ -/]*[@-~]")
    return ansi_escape.sub("", line)

def log(level, *args):
	level = level.upper()
	ticks = time.time()
	ltime = time.localtime(ticks)

	# thay đổi màu level
	lvcolor = {
		"DEBG": Fore.LIGHTWHITE_EX,
		"OKAY": Fore.LIGHTGREEN_EX,
		"INFO": Fore.LIGHTMAGENTA_EX,
		"WARN": Fore.LIGHTYELLOW_EX,
		"ERRR": Fore.LIGHTRED_EX,
		"EXCP": Fore.CYAN,
	}.get(level, Fore.WHITE)

	# khởi tạo output với format hh:mm:ss| ticks| module| level
	out = "{}{:>8}| {}{:>10}| {}{:>8}| {}{:>6}".format(
		Fore.LIGHTCYAN_EX,
		"{0:>2}:{1:>2}:{2:>2}".format(ltime[3], ltime[4], ltime[5]),
		Fore.LIGHTBLUE_EX,
		"{:10.4f}".format(ticks - sticks),
		Fore.GREEN,
		currentframe().f_back.f_globals["__name__"].replace("_", "").upper(),
		lvcolor,
		level
	)

	# lặp từng item trong args
	for item in args:
		text = ""
		color = Fore.WHITE + Style.DIM

		# nếu item là string thì giữ nguyên color, thay đổi text và tiếp tục
		if (isinstance(item, str)):
			text = item
		# nếu item là integer hoặc float thì giữ nguyên color, đổi int thành string và thay đổi text
		elif (isinstance(item, int)):
			text = str(item)
		#nếu item là dictionary thì đặt text thành item.text và color thành item.color
		elif (isinstance(item, dict)):
			# kiểm tra item.text tồn tại, nếu item.text không tồn tại thì tiếp tục vòng lặp tới item tiếp
			if "text" in item:
				text = item["text"]
			else:
				continue
			# kiểm tra item.color tồn tại, nếu item.color không tồn tại thì color giữ nguyên
			if "color" in item:
				color = item["color"]
		# nếu item không trùng với các loại trên, tiếp tục vòng lặp
		else:
			continue

		# thêm text vào output
		out += "| {}{}".format(color, text)

	print(out)
	with open("log.txt", "a", encoding="utf-8") as f:
		print(escape_ansi(out), file=f)

def exit_handler():
	log("INFO", "Log ended.")

open("log.txt", "w").close()
log("INFO", "Log started at " + time.asctime(time.localtime()))
atexit.register(exit_handler)