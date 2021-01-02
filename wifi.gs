// Program: wifi
// Usage: wifi <(opt) essid>
// Function: hack into the best wifi or hacks into specific wifi

w = ""
if params.len >= 1 then 
	if params[0] == "-h" then exit("Usage: wifi <(opt) essid>")
	w = params[0]
end if

crypto = include_lib("/lib/crypto.so")
if not crypto then
	crypto = include_lib(get_shell.host_computer.current_path+"/crypto.so")
	if not crypto then exit("Crypto.so not found!")
end if

c = get_shell.host_computer

if c.wifi_networks("wlan0")[0] != null then interface="wlan0"
if c.wifi_networks("eth0")[0] != null then interface="eth0"

la = 999999
laa = 999999
networks = c.wifi_networks(interface)
bssid = ""
essid = ""
tack = ""
xx = false
for net in networks
	ack = ceil(300000/net.split(" ")[1].remove("%").val)
	if w == net.split(" ")[2] then
		essid = net.split(" ")[2]
	else if ack < laa then
		if xx == false then
			essid = net.split(" ")[2]
			laa = ack
		end if
	end if
end for

for net in networks
	ack = ceil(300000/net.split(" ")[1].remove("%").val)
	if w == net.split(" ")[2] then
		bssid = net.split(" ")[0]
		la = ack
		xx = true
	else if ack < la then
		if xx == false then
			bssid = net.split(" ")[0]
			la = ack
		end if
	end if
	if essid == net.split(" ")[2] then
		print(net+" ["+ack+"] (SELECTED)")
		tack = ack
	else
		print(net+" ["+ack+"]")
	end if
	if ack != tack then
		ack = tack
	end if
end for
f = c.File(c.current_path+"/file.cap")
if f then f.delete

crypto.airmon("start", interface)

r1 = crypto.aireplay(bssid,essid,ack)
if typeof(r1) == "string" then exit(r1)

pass = crypto.aircrack(c.current_path+"/file.cap")
if pass == "" then exit("Terminated!")
c.connect_wifi(interface,bssid,essid,pass)
exit("Connected, Creds: "+essid+":"+pass)
