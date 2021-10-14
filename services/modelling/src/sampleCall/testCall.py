import urllib.request, json

def BuildModel(hostAndPort, fnInJson, fnInData, sendDataAsInternal, fnOutJson):
    f = open(fnInJson, "rt")
    jsonIn = json.load(f)
    f.close()
    #
    if fnInData:
        jsonIn["dataSource"]["fileName"] = None
        jsonIn["dataSource"]["data"] = None
        if sendDataAsInternal:
            # Read the contents of 'fnInData' and provided them as
            # the 'data' member of the request object.
            jsonIn["dataSource"]["type"] = "internal"
            if fnInData.lower().endswith(".csv"):
                f = open(fnInData, "rt")
                inData = f.read()
                f.close()
                jsonIn["dataSource"]["data"] = inData
                jsonIn["dataSource"]["format"] = "csv"
            elif fnInData.lower().endswith(".json"):
                f = open(fnInData, "rt")
                inData = json.load(f)
                f.close()
                jsonIn["dataSource"]["data"] = inData
                jsonIn["dataSource"]["format"] = "json"
            else: assert False    
        else:
            # Provide the filename of 'fnInData' as a string in the
            # request object and let the server read the file directly.
            if fnInData.lower().endswith(".csv"): jsonIn["dataSource"]["format"] = "csv"
            elif fnInData.lower().endswith(".csv"): jsonIn["dataSource"]["format"] = "json"
            else: assert False
            jsonIn["dataSource"]["type"] = "file"
            jsonIn["dataSource"]["fileName"] = fnInData
    # Prepare a HTTP request.    
    reqData = json.dumps(jsonIn).encode("ascii")
    print("Sending request (%d bytes)..." % len(reqData))
    req = urllib.request.Request("http://" + hostAndPort + "/buildModel",
        data = reqData,
        headers = {"Content-Type": "application/json"},
        method = "POST")
    # Read the response.
    response = urllib.request.urlopen(req)
    print("Response: %s" % response.getcode())
    print("- Info: %s" % response.info())
    respBody = response.read()
    print("- Body: %s bytes long" % len(respBody))
    # Save the response to a file.
    jsonOut = json.loads(respBody)
    f = open(fnOutJson, "wt")
    #f.write(respBody)
    json.dump(jsonOut, f, indent = 4)  # prettyprint the JSON response object
    f.close()

BuildModel("capybara.ijs.si:8096", "call.json", "d:\\users\\janez\\data\\StreamStory\\B100_hour_SS_input.csv", True, "callResult.json")