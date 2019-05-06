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
from lib.testFramework import testFramework
log("OKAY", "Imported: lib.testFramework.testFramework")

# Start a new session
sess = requests.Session()
token = ""
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

# Login API Test
def __testLoginAPI():
    global sess
    global token

    try:
        data = sess.post("http://localhost/api/login", data={
            "u": "admin",
            "p": "admin"
        })

        json = data.json()
    except Exception as excp:
        return excp.__class__.__name__

    finally:
        if (json["code"] != 0):
            return "[{}] {}".format(json["code"], json["description"])
        
        if (json["status"] >= 300):
            return "[{}] {}".format(json["status"], json["description"])

    token = json["data"]["token"]
    return True

apiTest.case("Should be logged in successful with account admin:admin", __testLoginAPI)

# Logout API Test
def __testLogoutAPI():
    global sess
    global token

    try:
        data = sess.post("http://localhost/api/logout", data={
            "token": token
        })

        json = data.json()
    except Exception as excp:
        return excp.__class__.__name__

    finally:
        if (json["code"] != 0):
            return "[{}] {}".format(json["code"], json["description"])
        
        if (json["status"] >= 300):
            return "[{}] {}".format(json["status"], json["description"])

    return True

apiTest.case("Should be logged out successfully", __testLogoutAPI)