#!/bin/bash

echo "Uninstalling BruteFir plugin."

echo "1 - Stop & disable BruteFir system service."
sudo systemctl stop brutefir.service 
sudo systemctl disable brutefir.service

echo "2 - Remove aloop alsa configuration."
sudo rmmod snd_aloop

echo "3 - Remove configuration."
if [ ! -d "/data/configuration/audio_interface/brutefir" ];
	then
		echo " - Folder doesn't exist, nothing to do -"
	else
		echo " - Folder exists removing it -"
		sudo rm -Rf /data/configuration/audio_interface/brutefir
fi

echo "4 - Remove system dependencies."
sudo apt-get -y remove --purge brutefir drc

echo "5 - Remove BruteFir service."
sudo rm /etc/systemd/system/brutefir.service

echo "6 - Remove filters folders."
rm -rf /data/INTERNAL/brutefirfilters

echo "Done."
# Required to end the plugin install
echo "pluginuninstallend"