#!/bin/bash
#? |-----------------------------------------------------------------------------------------------|
#? |  /tests/config.sh                                                                             |
#? |                                                                                               |
#? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
#? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
#? |-----------------------------------------------------------------------------------------------|
set -e

printHelp() {
	echo -e "Usage: config.sh <switch>"
	echo -e ""
	echo -e "  \033[1;33m--init\033[0m       Copy all test files to determined location and make a backup of original"
	echo -e "  \033[1;33m--restore\033[0m    Clean all test files and restore backed up files"
}

case $1 in
	"--init")
		echo ""
		echo -e "\033[1;34mCopying Files..."

		# Copy
		cp -f -ar .config/accounts ../data/accounts
		cp -f .config/config.json ../data/config.json
		chmod 777 ../data/config.json

		;;
	"--restore")
		echo ""
		echo -e "\033[1;34mCleaning..."

		# Clean Data
		rm -rf ../data/avatar
		rm -rf ../data/accounts
		rm -f ../data/config.json
		rm -f ../data/logs.json

		;;
	"--help")
		printHelp
		;;

	*)
		echo -e "\033[1;31m✗\033[0m Unknown switch passed in arg 1: \"$1\""
		printHelp
		exit 1
		;;
esac

echo -e "\033[1;32m✓\033[0m Done!"
exit 0