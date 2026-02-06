#!/usr/bin/liquidsoap

set("log.file",true)
set("log.stdout",true)
set("log.level",3)

music = playlist("/home/container/playlist.m3u")
radio = fallback(track_sensitive=false,[music,single("/usr/share/icecast2/web/status.xsl")])

output.icecast(%mp3,host="localhost",port=8000,password="autodjpassword",mount="autodj.mp3",radio)

