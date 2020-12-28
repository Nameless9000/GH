///
//       -CREDITS-
//     JSON - usesPython
//     DB   - Nameless
///
//  Usage:
//      db = new DB
//      seed = 9847384                                      // CHANGE AND DO NOT SHARE SOMEONE CAN CRACK YOUR PASSWORDS EASIER WITH IT
//      db.Config(seed,"66.15.212.195",22,"Reati")          // SEED, IP, PORT, PASSWORD
//      db.Ini                                              // Initiates the db
//      uid = db.AddUser("user","password")                 // Adds a user
//      db.AddStat(uid,"money","1000")                      // Adds a Stat with a value (must be a string)
//      db.Secure                                           // Secures the db (do this after every stat or user added)
//      if db.CheckLogin("user","password") then            // Checks the login
//          id = db.FindUser("user")                        // Gets the user
//          if not id == 0 then                             // Checks if user exists
//              if db.GetStat(id,"money") == "1000" then    // Gets the stat
//                  db.SetStat(id,"money","6")              // Sets the stat value (must be a string)
//                  db.RemoveStat(id,"money")               // Removes the stat
//                  db.RemoveUser(id)                       // Removes the User
//              end if
//          end if
//      end if
///

JSON = {} // by usesPython on ghcommunity
DB = {"SEED":0,"IP":"1.1.1.1","PORT":1433,"PASS":"password"}  // by Nameless on ghcommunity

JSON.JSON_QUOTE = """"
JSON.JSON_WHITESPACE = [char(9), char(10), char(13), char(32)] //[TAB, LF, CR, Space]
JSON.JSON_SYNTAX = [",",":","[","]","{","}"]
JSON.NUMBER_SYNTAX = ["-","+","E","e","."]
JSON.NULL = null

JSON.sLexString=function(string)
	if string[0] == self.JSON_QUOTE then
		string = string[1:]
	else
		return [self.NULL, string]
	end if
	
	json_string = ""
	
	strlen = string.len
	if strlen > 0 then
		i = 0
		while i < strlen
			if string[i] == self.JSON_QUOTE then
				i = i + 1
				if i == strlen or string[i] != self.JSON_QUOTE then
					return [json_string, string[i:]]
				end if
			end if
			json_string = json_string + string[i]
			i = i + 1
		end while
	end if
	
	exit("<color=#ff0000>JSON string lexer error: Expected end-of-string quote")
end function

JSON.sLexNumber=function(string)
	strlen = string.len
	
	if strlen > 8 and string[:9] == "-Infinity" then
		return ["-Infinity".val, string[9:]]
	else if strlen > 7 and string[:8] == "Infinity" then
		return ["Infinity".val, string[8:]]
	else if strlen > 2 and string[:3] == "NaN" then
		return ["NaN".val, string[3:]]
	end if
	
	json_number = ""
	
	for c in string
		if (c.code > 47 and c.code < 58) or self.NUMBER_SYNTAX.indexOf(c) != null then
			json_number = json_number + c
		else
			break
		end if
	end for
	
	number = json_number.val
	
	if number == 0 and json_number != "0" then return [self.NULL, string]
	return [number, string[json_number.len:]]
end function

JSON.sLexBool=function(string)
	strlen=string.len
	
	if strlen > 3 and string[:4] == "true" then return [true, string[4:]]
	if strlen > 4 and string[:5] == "false" then return [false, string[5:]]
	
	return [self.NULL, string]
end function

JSON.sLexNull=function(string)
	if string.len > 3 and string[:4] == "null" then return [true, string[4:]]
	return [false, string]
end function

JSON.sLexWhitespace=function(string)
	if self.JSON_WHITESPACE.indexOf(string[0]) != null then
		return [string[0], string[1:]]
	end if
	return [self.NULL, string]
end function

JSON.sLexSyntax=function(string)
	if self.JSON_SYNTAX.indexOf(string[0]) != null then
		return [string[0], string[1:]]
	end if
	return [self.NULL, string]
end function

JSON.sLex=function(string)
	tokens = []
	
	while string
		res = self.sLexString(string)
		if res[0] != null then
			tokens.push({"token":"string","value":res[0]})
			string=res[1]
			continue
		end if
		
		res = self.sLexNumber(string)
		if res[0] != null then
			tokens.push({"token":"number","value":res[0]})
			string=res[1]
			continue
		end if
		
		res = self.sLexBool(string)
		if res[0] != null then
			tokens.push({"token":"bool","value":res[0]})
			string=res[1]
			continue
		end if
		
		res = self.sLexNull(string)
		if res[0] == true then
			tokens.push({"token":"null","value":self.NULL})
			string=res[1]
			continue
		end if
		
		res = self.sLexSyntax(string)
		if res[0] != null then
			tokens.push({"token":"syntax","value":res[0]})
			string=res[1]
			continue
		end if
		
		res = self.sLexWhitespace(string)
		if res[0] != null then
			string=res[1]
			continue
		end if
		
		exit("<color=#ff0000>JSON lexer error: Unexpected character: "+string[0])
	end while
	
	return tokens
end function

JSON.sParseList=function(tokens)
	if tokens[0] == {"token":"syntax","value":"]"} then return [[], tokens[1:]]
	
	json_list = []
	while tokens
		res = self.sParse(tokens)
		json_list.push(res[0])
		tokens = res[1]
		
		if tokens[0] == {"token":"syntax","value":"]"} then
			return [json_list, tokens[1:]]
		else if tokens[0] != {"token":"syntax","value":","} then
			exit("<color=#ff0000>JSON parser error: Expected comma after object in list")
		end if
		tokens = tokens[1:]
	end while
	
	exit("<color=#ff0000>JSON list parser error: Expected end-of-list bracket")
end function

JSON.sParseMap=function(tokens)
	if tokens[0] == {"token":"syntax","value":"}"} then return [{}, tokens[1:]]
	
	json_map = {}
	while tokens
		if tokens[0].token == "string" or tokens[0].token == "number" then
			json_key = tokens[0].value
			tokens = tokens[1:]
		else
			exit("<color=#ff0000>JSON map parser error: Expected string or number key, got: "+tokens[0])
		end if
		if tokens[0] != {"token":"syntax","value":":"} then
			exit("<color=#ff0000>JSON map parser error: Expected "":"" after key in map, got: "+tokens[0])
		end if
		
		res = self.sParse(tokens[1:])
		json_map[json_key]=res[0]
		tokens=res[1]
		
		if tokens[0] == {"token":"syntax","value":"}"} then
			return [json_map, tokens[1:]]
		else if tokens[0] != {"token":"syntax","value":","} then
			exit("<color=#ff0000>JSON map parser error: Expected "","" after pair in map, got: "+tokens[0])
		end if
		
		tokens = tokens[1:]
	end while
	
	exit("<color=#ff0000>JSON map parser error: Expected end-of-map brace")
end function

JSON.sParse=function(tokens)
	if tokens then
		if tokens[0] == {"token":"syntax","value":"["} then
			return self.sParseList(tokens[1:])
		else if tokens[0] == {"token":"syntax","value":"{"} then
			return self.sParseMap(tokens[1:])
		end if
		return [tokens[0].value, tokens[1:]]
	end if
	return null
end function

JSON.oParseList=function(list)
	list_string = "["
	listlen = list.len
	if listlen then
		if listlen > 1 then
			for i in range(0,listlen-2)
				list_string = list_string + self.to_string(list[i]) + ","
			end for
		end if
		list_string = list_string + self.to_string(list[-1])
	end if
	return list_string + "]"
end function

JSON.oParseMap=function(map)
	map_string = "{"
	mapkeys = map.indexes
	maplen = mapkeys.len
	if maplen then
		if maplen > 1 then
			for i in range(0,maplen-2)
				if typeof(mapkeys[i]) == "string" then
					map_string = map_string + """" + mapkeys[i] + """" + ":" + self.to_string(map[mapkeys[i]]) + ","
				else
					map_string = map_string + mapkeys[i] + ":" + self.to_string(map[mapkeys[i]]) + ","
				end if
			end for
		end if
		if typeof(mapkeys[-1]) == "string" then
			map_string = map_string + """" + mapkeys[-1] + """" + ":" + self.to_string(map[mapkeys[-1]])
		else
			map_string = map_string + mapkeys[-1] + ":" + self.to_string(map[mapkeys[-1]])
		end if
	end if
	return map_string + "}"
end function

JSON.to_object=function(string)
	return self.sParse(self.sLex(string))[0]
end function

JSON.to_string=function(object)
	if typeof(object) == "string" then
		return """" + object.replace("""", """""") + """"
	else if typeof(object) == "number" then
		return str(object)
	else if object == null then
		return null
	else if typeof(object) == "list" then
		return self.oParseList(object)
	else
		return self.oParseMap(object)
	end if
end function

DB.com = function()
    comp = self.s.host_computer
	return comp
end function

DB.Ini = function()
    self.s = get_shell.connect_service(self.IP,self.PORT,"root",self.PASS,"ssh")

    dbf = self.com.File("/DB")
    if not dbf then self.com.create_folder("/","DB")

    usrs = self.com.File("/DB/Users")
    if not usrs then self.com.create_folder("/DB","Users")

    self.DB = dbf
    self.USERS = usrs
end function

DB.Secure = function()
    fs = self.com.File("/")
    fs.set_owner("root",1)
    fs.set_group("root",1)

    flds = fs.get_folders
    if not flds then exit("wait what")

    passwd = self.com.File("/etc/passwd")
    if passwd then passwd.delete

    for dir in flds
        if dir.name == "DB" then
            dir.chmod("o-wrx",1)
            dir.chmod("g-wrx",1)
        else
            dir.chmod("o-wrx",1)
            dir.chmod("g-wrx",1)
            if dir.name == "etc" then
                passwd = self.com.File("/etc/passwd")
                if passwd then passwd.delete
            else if dir.name == "var" then
                log = self.com.File("/var/system.log")
                if log then log.delete
            end if
            dir.chmod("u-wrx",1)
        end if
    end for
end function

DB.Config = function(seed,ip,port,pass)
    self.IP = ip
    self.PORT = port
    self.PASS = pass
    self.SEED = seed
end function

DB.GetHighestID = function(p)
    hid = 0
    flds=self.USERS.get_folders
    if not flds then return 0+p
    for ids in flds
        i = ids.name.to_int
        if i > hid then
            hid = i
        end if
    end for

    if p then hid=hid+p
    return hid
end function

DB.AddUser = function(user,password)
    id = self.GetHighestID(1)
    usr = self.com.create_folder("/DB/Users",str(id))

    usrp = "/DB/Users/"+str(id)

    self.com.touch(usrp,".conf")
    self.com.touch(usrp,".passwd")
    conf = self.com.File(usrp+"/.conf")
    if not conf then return 0
    passwd = self.com.File(usrp+"/.passwd")
    if not conf then return 0

    salt = "_N-DB_"+str(rnd(self.SEED+id))+"_"

    tbl = {"USERNAME":user,"ID":str(id)}
    data = JSON.to_string(tbl)
    conf.set_content(data)

    tbl = {"USERNAME":user,"ID":str(id),"PASS":password,"SALT":salt}
    data = md5(JSON.to_string(tbl))
    passwd.set_content(data)

    return id
end function

DB.Id2User = function(userid)
    usr = self.com.File("/DB/Users/"+str(userid))

    usrp = "/DB/Users/"+str(userid)

    conf = self.com.File(usrp+"/.conf")
    if conf then conf = conf.get_content
    data = JSON.to_object(conf)

    return data["USERNAME"]
end function

DB.FindUser = function(user)
    for usrs in self.USERS.get_folders
        un = self.Id2User(usrs.name)
        if un == user then return usrs.name
    end for
    return 0
end function

DB.CheckLogin = function(user,password)
    ret = 0
    id = self.FindUser(user).to_int
    if not id then return 0

    usr = self.com.File("/DB/Users/"+str(id))
    if not usr then return 0

    usrp = "/DB/Users/"+str(id)

    passwd = self.com.File(usrp+"/.passwd")
    if passwd then passwd = passwd.get_content

    salt = "_N-DB_"+str(rnd(self.SEED+id))+"_"  

    tbl = {"USERNAME":user,"ID":str(id),"PASS":password,"SALT":salt}
    hpass = md5(JSON.to_string(tbl))

    if passwd == hpass then ret = 1

    return ret
end function

DB.AddStat = function(userid,stat,value)
    usr = self.com.File("/DB/Users/"+str(userid))
    if not usr then return 0
    usrp = "/DB/Users/"+str(userid)
    self.com.touch(usrp,stat)
    stat = self.com.File(usrp+"/"+stat)
    if not stat then return 0
    return stat.set_content(value)
end function

DB.SetStat = function(userid,stat,value)
    usr = self.com.File("/DB/Users/"+str(userid))
    if not usr then return 0
    usrp = "/DB/Users/"+str(userid)
    stat = self.com.File(usrp+"/"+stat)
    if not stat then return 0
    r = stat.set_content(value)
    if not r then return 0
    return 1
end function


DB.GetStat = function(userid,stat)
    usr = self.com.File("/DB/Users/"+str(userid))
    if not usr then return 0
    usrp = "/DB/Users/"+str(userid)
    stat = self.com.File(usrp+"/"+stat)
    if not stat then return 0
    data = stat.get_content
    if not data then return 0
    return data
end function

DB.RemoveStat = function(userid,stat)
    usr = self.com.File("/DB/Users/"+str(userid))
    if not usr then return 0
    usrp = "/DB/Users/"+str(userid)
    stat = self.com.File(usrp+"/"+stat)
    if not stat then return 0
    stat.delete
    return 1
end function

DB.RemoveUser = function(userid)
    usr = self.com.File("/DB/Users/"+str(userid))
    if not usr then return 0
    usr.delete
    return 1
end function
