#? |-----------------------------------------------------------------------------------------------|
#? |  /api_example/ajax.py                                                                         |
#? |                                                                                               |
#? |  Copyright (c) 2018 Belikhun. All right reserved                                              |
#? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
#? |-----------------------------------------------------------------------------------------------|

import requests
from urllib.parse import urlparse
from log import log

sess = requests.Session()

def ajax(url: str, method: str, type: str, query = {}, form = {}):
	method = method.upper()

	if (len(query) > 0):
		log("DEBG", "Creating " + method + " request with query:")
		for item in query:
			log("DEBG", " {:<12}: {}".format(str(item), str(query[item])))

	if (len(form) > 0):
		log("DEBG", "Creating " + method + " request with form:")
		for item in form:
			log("DEBG", " {:<12}: {}".format(str(item), str(form[item])))

	log("INFO", "Starting request: " + url)
	if method == "GET":
		r = sess.get(url, params = query)
	elif method == "POST":
		r = sess.post(url, data = form)
	else:
		log("ERRR", "Unknown method: " + method)
		exit

	if (r.status_code == 200):
		s = "OKAY"
	else:
		s = "ERRR"

	log(s, method + " " + url + " " + str(r.status_code))

	if (type == "json"):
		json = r.json()
		json["status"] = r.status_code
		return json
	return r.text