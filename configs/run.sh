#!/bin/bash

find /home/container/music/ -name *mp3 | sort > /home/container/playlist.m3u

/usr/bin/icecast2 -b -c  "/home/container/icecast.xml"
sleep 5
/usr/bin/ezstream -c "/home/container/ezstream.xml"