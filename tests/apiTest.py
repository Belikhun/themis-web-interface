#? |-----------------------------------------------------------------------------------------------|
#? |  /tests/api/test.py                                                                           |
#? |                                                                                               |
#? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
#? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
#? |-----------------------------------------------------------------------------------------------|

from lib.log import log
log("OKAY", "Imported: lib.log.log")
import lib.ehook
log("OKAY", "Imported: lib.ehook")
import requests
log("OKAY", "Imported: requests")
import filecmp
log("OKAY", "Imported: filecmp")
from lib.testFramework import testFramework
log("OKAY", "Imported: lib.testFramework.testFramework")

# Start a new session
sess = requests.Session()
sauce = ""
apiTest = testFramework("API")

# Server Online Test
def __testServerOnline():
    global sess

    try:
        sess.get("http://localhost")
    except Exception as excp:
        return excp.__class__.__name__

    return True

apiTest.case("Server should be up and running", __testServerOnline)

def testAPI(url = "", method = "GET", json = True, data = {}, files = {}):
    global sess
    global sauce

    try:
        if (method == "GET"):
            data = sess.get("http://localhost/" + url)
        else:
            data = sess.post("http://localhost/" + url, data = data, files = files)

    except Exception as excp:
        return str(excp)
    else:
        if (not json):
            return True

        try:
            json = data.json()
        except Exception as excp:
            return str(excp)
        else:
            if (json["code"] != 0):
                return "[{}] {}".format(json["code"], json["description"])
            
            if (json["status"] >= 300):
                return "[{}] {}".format(json["status"], json["description"])

            if (json["runtime"] > 1):
                return "RunTimeOverflow: {}s".format(str(round(json["runtime"], 4)))

            try:
                json["data"]["token"]
            except (KeyError, TypeError):
                pass
            else:
                sauce = json["data"]["token"]

            return True

    return "Unknown"

# Login API Test
apiTest.case (
    "Should be logged in successful with account admin:admin",
    lambda: testAPI("api/login", "POST", data = { "u": "admin", "p": "admin" })
)

# All GET api test
GETApiList = ["api/config", "api/info?u=admin", "api/status", "api/test/logs", "api/test/rank", "api/test/timer", "api/test/problems/list"]
for item in GETApiList:
    apiTest.case (
        "API \"{}\" should return a good status code".format(item),
        lambda: testAPI(item, "GET")
    )

# All GET api with token required test
GETApiWithTokenList = ["api/logs", "api/test/logs"]
for item in GETApiWithTokenList:
    apiTest.case (
        "API t\"{}\" should return a good status code".format(item),
        lambda: testAPI(item, "POST", data = { "token": sauce })
    )

# Avatar change API Test
def __avatarAPITest():
    global sauce

    result = testAPI("api/avt/change", "POST", data = { "token": sauce }, files = { "file": open("api/admin.jpg", "rb") })
    if (result is not True):
        return result

    if (filecmp.cmp("../api/avt/admin.jpg", "api/admin.jpg") is True):
        return True
    else:
        return "FileNotMatch"
        
apiTest.case (
    "Avatar should be uploaded successfully with \"api/avt/change\" API and have no corruption",
    __avatarAPITest
)

# Logout API Test
apiTest.case (
    "Should be logged out successfully",
    lambda: testAPI("api/logout", "POST", data = { "token": sauce })
)

# Complete Test
apiTest.complete()
