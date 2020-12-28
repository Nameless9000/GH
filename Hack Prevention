// Creator: Nameless#1219 (655861269030502453)
// Origin: https://discord.gg/B2zhWHBjGG
// CONFIG
globals.wl = ["whitelistedapp1","whitelistedapp2"]  // whitelisted procs
globals.useDefaults = false  //if this is false then only whitelisted apps will run
globals.updateProcs = true  // kills unwanted procs
globals.secure = true   // makes the fs hard to hack

// CODE
globals.shell = get_shell()
globals.usr = active_user
f = globals.shell.host_computer.File(program_path)
c = globals.shell.host_computer
globals.cprocs = {}

closeProc = function(id,name)
    o = globals.shell.host_computer.close_program(id.to_int)
    if o == true then
        return print(name + " closed")
    else
        return print(o)
    end if
end function

checkProc = function(procs,id)
    proc = procs[id]
    if proc.user == "guest" then
        print("guest program detected")
        closeProc(id,proc.name)
    end if

    ssec = globals.useDefaults

    dban = ["LogViewer","passwd","ps","kill","rm","cat","ls","rm","plasma","RedFox.py","nmap","scanlan","ScanLan","Map","Notepad","CodeEditor","FileExplorer"]

    wl = globals.wl
    for n in wl
        if proc.name == n then return null
    end for

    if ssec == true then 
        closeProc(id,proc.name)
    else
        for n in dban
            if proc.name == n then
                if globals.usr != "root" then
                    closeProc(id,proc.name)
                end if
            end if
        end for
    end if
end function

updateProcs = function()
    fproc = globals.shell.host_computer.show_procs
    fproc = fproc.split("\n")

    tproxs = {}

    for xx in fproc
        val = xx.split(" ")
        if val[0] == "USER" then continue

        user = val[0]
        id = val[1]
        cpu = val[2]
        mem = val[3]
        name = val[4]
        
        if name == f.name then continue
        if name == "sudo" then continue
        if name == "Xorg" then continue
        if name == "kernel_task" then continue

        if globals.cprocs.indexes.indexOf(id) != null then
            checkProc(globals.cprocs,id)
        else
            tproxs.push(id)
            tproxs[id] = {"user":user,"name":name,"mem":mem,"cpu":cpu}
            print(name+" ran")
            checkProc(tproxs,id)
        end if
    end for

    for xx in globals.cprocs
        ff = false
        for x in tproxs
            if xx.key == x.key then
                ff = true
            end if
        end for

        if ff == false then
            print(xx.value.name+" exited")
            globals.cprocs.remove(xx.key)
        end if
    end for

    globals.cprocs = tproxs
end function

chs = function(objp,r,t)
    fs = c.File(objp)
    if fs then
        fs.set_group("root",r)
        fs.set_owner("root",r)
        fs.chmod("g+wrx",r)
        fs.chmod("o+wrx",r)
        fs.chmod("u+wrx",r)
        if t == 1 then
            fs.chmod("g-wrx",r)
            fs.chmod("o-wrx",r)
            fs.chmod("u-wrx",r)
        else if t == 2 then
            fs.chmod("g-wr",r)
            fs.chmod("o-wr",r)
            fs.chmod("u-wr",r)
        else if t == 3 then
            fs.chmod("g-wrx",r)
            fs.chmod("o-wrx",r)
        else if t == 4 then
            fs.chmod("g-wr",r)
            fs.chmod("o-wr",r)
        end if
    end if
end function

exe = 0

secure = function()
    fs = c.File("/")
    flds = fs.get_folders
    fls = fs.get_files
    chs(fs.path,1,1)
    if flds then
        for fld in flds
            print(fld.path)
            chs(fld.path,1,1)
            if fld.path == "/bin" then
                chs(fld.path,1,2)
            else if fld.path == "/usr" then
                chs(fld.path,1,2)
            else if fld.path == "/etc" then
                p = c.File("/etc/passwd")
                if p then p.delete
            else if fld.path == "/var" then
                l = c.File("/var/system.log")
                tmp = l
                if l then
                    c.touch("/var","system.bak")
                    l.delete
                    lbak = c.File("/var/system.bak")
                    lbak.set_content("Cleared.")
                    lbak.move("/var", "system.log")
                    tmp = lbak
                end if
                chs(tmp.path,0,1)
            else if fld.path == "/home" then
                chs(fld.path,1,3)
            else if fld.path == "/root" then
                chs(fld.path,1,3)
            end if
        end for
    end if
    if fls then
        for fl in fls
            chs(fl.path,0,1)
        end for
    end if
end function

main = function()
    if globals.updateProcs == true then updateProcs()

    exe=exe+1
    if exe == 11 then
        exe = 0
        if globals.secure == true then secure()
    end if

    main
end function
main
