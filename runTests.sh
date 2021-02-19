#!/bin/bash
#? |-----------------------------------------------------------------------------------------------|
#? |  /runTests.sh                                                                                 |
#? |                                                                                               |
#? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
#? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
#? |-----------------------------------------------------------------------------------------------|

cd tests
pwd
sudo ./config.sh --copy
python3 apiTest.py
python3 logParserTest.py
sudo ./config.sh --restore
