#!/bin/bash

pwd
cd tests
sudo ./config.sh --copy
python3 apiTest.py
python3 logParserTest.py
sudo ./config.sh --restore
