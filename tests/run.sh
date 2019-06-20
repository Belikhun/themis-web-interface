#!/bin/bash
#? |-----------------------------------------------------------------------------------------------|
#? |  /tests/run.sh                                                                                |
#? |                                                                                               |
#? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
#? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
#? |-----------------------------------------------------------------------------------------------|
set +e

SUITE=$1
COMMAND=false
ARGS=false

printHelp() {
    echo -e "\033[0mUsage: \033[1;35mrun.sh <suite> <args>"
}

case "$SUITE" in
    API)
        COMMAND="python3"
        ARGS="apiTest.py"
    ;;

    logParser)
        COMMAND="python3"
        ARGS="logParserTest.py"
    ;;

    --help)
        printHelp
        exit 0
    ;;

    *)
        echo -e "\033[1;31m✗\033[0m Unknown test suite passed in arg 1: \"$SUITE\""
        printHelp
        exit 1
    ;;
esac

#? Start the test

echo ""
echo -e "\033[1;34mStarting test suite \"$1\" with args:"

for i in "${@:2}"
    do
        echo -e "    \033[1;30m+ \033[1;36m$i"
    done

echo -e "\033[0m"

$COMMAND ${@:2} $ARGS
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]
    then echo -e "\033[1;32m✓\033[0m Test completed with exitcode \033[1;33m$EXIT_CODE\033[0m!"
    else echo -e "\033[1;31m✗\033[0m Test failed with exitcode \033[1;33m$EXIT_CODE\033[0m!"
fi

exit $EXIT_CODE