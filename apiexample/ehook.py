from log import log
from colorama import Fore, Back, Style
from ntpath import basename
import sys

def myexcepthook(exctype, value, tb):
    log("EXCP", "File Traceback:")
    while tb:
        filename = tb.tb_frame.f_code.co_filename
        name = tb.tb_frame.f_code.co_name
        lineno = tb.tb_lineno
        log("DEBG", " File {:>30}, line {:>4}, in {}".format(basename(filename), lineno, name))
        tb = tb.tb_next
    log("EXCP", exctype.__name__ + ": " + str(value))

sys.excepthook = myexcepthook