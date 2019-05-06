#? |-----------------------------------------------------------------------------------------------|
#? |  /tests/.lib/testFramework.py                                                                 |
#? |                                                                                               |
#? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
#? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
#? |-----------------------------------------------------------------------------------------------|

from colorama import init, Fore, Style
from sys import exit
import atexit
import lib.ehook
import time
init(autoreset=True, strip=False)

class testFramework:
    def __init__(self, name):
        self.doneHandled = False
        self.testNth = 0
        self.testPassed = 0
        self.testFailed = 0
        self.allSuccess = True
        self.totalTime = 0
        self.testName = name
        atexit.register(self.doneHandler)

        print("")
        print("Test {}\"{}\"{}:".format(Fore.LIGHTBLUE_EX, self.testName, Style.RESET_ALL))

    def case(self, description: str, func):
        global time

        self.testNth += 1
        self.timeStart = time.time()
        result = func()
        self.timeEnd = time.time()
        runTime = self.timeEnd - self.timeStart
        self.totalTime += runTime

        if (result == True):
            self.testPassed += 1
        else:
            self.testFailed += 1

        print(" ● Case {}#{:<2} {}[{:>1}] {}{} {}({}s)".format(
            Fore.LIGHTCYAN_EX,
            self.testNth,
            Fore.LIGHTGREEN_EX if (result == True) else Fore.LIGHTRED_EX,
            "✓" if (result == True) else "✗",
            Fore.LIGHTBLACK_EX,
            description,
            Fore.LIGHTMAGENTA_EX,
            round(runTime, 2)
        ))

        if (result != True):
            print("   → Reason: {}".format(Fore.LIGHTBLACK_EX + result))

    def doneHandler(self):
        if (self.doneHandled == True):
            return

        self.doneHandled = True
        print("")
        print("Test {}\"{}\"{} completed:".format(Fore.LIGHTBLUE_EX, self.testName, Style.RESET_ALL))
        print("  Ran {:>2} tests in {}s".format(Fore.LIGHTCYAN_EX + str(self.testNth) + Style.RESET_ALL, Fore.LIGHTYELLOW_EX + str(round(self.totalTime))))
        print("   {} {:>2} tests passed".format(Fore.LIGHTGREEN_EX + "✓", str(self.testPassed)))
        print("   {} {:>2} tests failed".format(Fore.LIGHTRED_EX + "✗", str(self.testFailed)))
        print("")

        if (self.testFailed > 0):
            exit(1)