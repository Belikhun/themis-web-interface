#? |-----------------------------------------------------------------------------------------------|
#? |  /tests/lib/testFramework.py                                                                  |
#? |                                                                                               |
#? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
#? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
#? |-----------------------------------------------------------------------------------------------|

from colorama import init, Fore, Style
from sys import exit
import atexit
import lib.ehook
import time
init(autoreset=True)

class testFramework:
    def __init__(self, name):
        self.completed = False
        self.testNth = 0
        self.testPassed = 0
        self.testFailed = 0
        self.allSuccess = True
        self.totalTime = 0
        self.testName = name
        atexit.register(self.complete)

        print("")
        print("Test {}\"{}\"{}:".format(Fore.BLUE, self.testName, Style.RESET_ALL))

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
            Fore.CYAN,
            self.testNth,
            Fore.GREEN if (result == True) else Fore.RED,
            "✓" if (result == True) else "✗",
            Fore.LIGHTBLACK_EX,
            description,
            Fore.MAGENTA,
            round(runTime, 2)
        ))

        if (result != True):
            print("   → Reason: {}".format(Fore.LIGHTBLACK_EX + result))

    def complete(self):
        if (self.completed == True):
            return

        self.completed = True
        skipped = self.testNth - (self.testPassed + self.testFailed)

        print("")
        print("Test {}\"{}\"{} completed:".format(Fore.BLUE, self.testName, Style.RESET_ALL))
        print("  Ran {:>2} cases in {}s".format(Fore.CYAN + str(self.testNth) + Style.RESET_ALL, Fore.YELLOW + str(round(self.totalTime, 4))))
        print("   {} {:>2} cases passed".format(Fore.GREEN + "✓", str(self.testPassed)))
        print("   {} {:>2} cases failed".format(Fore.RED + "✗", str(self.testFailed)))
        print("   {} {:>2} cases skipped".format(Fore.LIGHTBLACK_EX + "¿", str(skipped)))
        print("")

        if (self.testFailed > 0):
            exit(1)