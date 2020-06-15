#!/bin/bash
#? |-----------------------------------------------------------------------------------------------|
#? |  /tests/config.sh                                                                             |
#? |                                                                                               |
#? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
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

		mkdir -p ".backup"

		# Backup
		mv -f ../data/xmldb/account.xml .backup/account.xml
		mv -f ../data/config.json .backup/config.json
		[ -f ../data/logs.json ] && mv -f ../data/logs.json .backup/logs.json
		cp -rf ../data/avatar/ .backup/avt/

		# Copy
		cp -f .config/account.xml ../data/xmldb/account.xml
		cp -f .config/config.json ../data/config.json

		;;
	"--restore")
		echo ""
		echo -e "\033[1;34mCleaning..."
		# Copy Backup
		mv -f .backup/account.xml ../data/xmldb/account.xml
		mv -f .backup/config.json ../data/config.json
		[ -f .backup/logs.json ] && mv -f .backup/logs.json ../data/logs.json
		rm -rf ../data/avatar/
		mv -f .backup/avt/ ../data/avatar/

		# Clean Backup
		rm -rf .backup/*

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