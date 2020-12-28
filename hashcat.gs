//command: hashcat
loadLibrary = function(libFileName, search)
	paths = [""]
	if search then paths = [get_shell.host_computer.current_path, "/lib", "/bin", "/usr/bin"]
	for p in paths
		lib = include_lib(p+"/"+libFileName)
		if lib then return lib
	end for
	error("Could not find requested library: "+libFileName)
	return false
end function
isParam = function(pt)
    for param in params
        if param.lower == pt.lower then return true
    end for
    return false
end function
rpar = {}
rpari = 0
for param in params
    rpar.push(rpari)
    rpar[rpari] = param
    rpari = rpari+1
end for
getParam = function(p)
    ret = null
    if isParam(p) then
        ret = ""
        x = 1
        for i in rpar
            param = i.value
            if param.lower == p.lower then x = i.key
        end for
        ret = params[x+1]
    end if

    return ret
end function
Usage = function()
    x = "Usage: hashcat\n\n[-h] hashcat -h 5f4dcc3b5aa765d61d8327deb882cf99 <color=red># raw hash\n[-f] hashcat -f /etc/passwd -u root <color=red># file\n[-u] hashcat -u 12345 -f /root/Config/Bank.txt <color=red># user"
    return x
end function

crypto = loadLibrary("crypto.so",true)
if not crypto then exit("Error: Missing crypto library")

h=getParam("-h")
f=getParam("-f")
u=getParam("-u")

Ret = "Cracking Successful!"

if h then
    if h.split(":") then
        u = h.split(":")[0]
        h = h.split(":")[1]
        p = crypto.decipher(u,h)
        Ret=Ret+"\nResult: "u+"@"+p
    else
        p = crypto.decipher(h)
        Ret=Ret+"\nResult: ??????@"+p
    end if
end if

if f then
    c = get_shell.host_computer

    f = c.File(f)
    if not f then exit("Error: File not found!")
    if not f.has_permission("r") then exit("Error: You do not have permission to read this file.")
    if not u then Ret=Ret+"\nResult:"
    U = f.get_content

    for l in U.split("\n")
        if u then
            if l.lower.split(u.lower) then
                h = l.split(":")[1]
                p = crypto.decipher(u,h)
                Ret=Ret+"\nResult: "u+"@"+p
            end if
        else
            u = l.split(":")[0]
            h = l.split(":")[1]
            p = crypto.decipher(u,h)
            Ret=Ret+"\n "u+"@"+p
        end if
    end for
end if

exit(Ret)
