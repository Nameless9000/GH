// Program: wifi-cracker.gs

// Original Creator: One Eye Willie#9278 (524044675892379649)
// Fixed and Finished by: Nameless#9000 (655861269030502453)

//defining abd checking crypto library
crypto = include_lib("/lib/crypto.so")

print("Starting wireless signal analysis.")
print("---------------------")

nets = []

c = get_shell.host_computer

if c.wifi_networks("wlan0")[0] != null then interface="wlan0"
if c.wifi_networks("eth0")[0] != null then interface="eth0"

networks = c.wifi_networks(interface)
networks.sort

crypto.airmon("start", interface)

for network in networks
	split = network.split(" ")

    bssidx = split[0]
    essidx = split[2]
    pwr = split[1]
    ack = ceil(300000/pwr.remove("%").val)+10

    print("<b>Waiting for "+ack+" ACKS["+pwr+"] (Press CTRL+C to Skip)</b>")

	cpf = c.File(current_path+"/file.cap")
    if cpf then cpf.delete

	r1 = crypto.aireplay(bssidx, essidx, ack) 
    if typeof(r1) == "string" then print("<b>"+r1)

	pass = crypto.aircrack(current_path+"/file.cap")
	if not pass then pass = "Unknown"

	cpf = c.File(current_path+"/file.cap")
    if cpf then cpf.delete

	nets.push({"essid":essidx,"bssid":bssidx,"pwr":pwr,"key":pass})
end for

crypto.airmon("stop", interface)

print("\nMonitoring stopped")
print("--------------------")

wifi = "#: BSSID ESSID PWR KEY"
i=1
for net in nets
    wifi=wifi+"\n"+str(i)+": "+net.bssid+" "+net.essid+" "+net.pwr+" "+net.key
    i=i+1
end for

print("Saving keys to: "+current_path+"/Wifikeys.txt")
wifikeys = c.touch(current_path,"Wifikeys.txt")
wifikeys = c.File(current_path+"/Wifikeys.txt")
wifikeys.set_content(format_columns(wifi))
print("")
print(format_columns(wifi))
print("")
netprompt = "Select the network you want to join: "

act = true

while act == true
	target = user_input(netprompt)
    if target.to_int then
		i=1
		for net in nets
			if target.to_int == i then
				status = c.connect_wifi(interface, net.bssid, net.essid, net.key)
				if status == 1 then
					print("Connected successfully. Have fun!\n")
					act = false
				else 
					print("Connection failed.")
				end if
			end if
			i=i+1
		end for
    end if
end while 
