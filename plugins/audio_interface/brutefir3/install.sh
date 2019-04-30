#!/bin/bash

echo "Installing BruteFir plugin."

echo "1 - Unload Loopback module if exists."
sudo rmmod snd_aloop

echo "2 - Remove previous configuration."
if [ ! -d "/data/configuration/audio_interface/brutefir" ];
	then
		echo " - Folder doesn't exist, nothing to do -"
	else
		echo " - Folder exists removing it -"
		sudo rm -Rf /data/configuration/audio_interface/brutefir
fi

echo "3 - Update system repository and install system dependencies."
sudo apt-get update
sudo apt-get -y install --no-install-recommends brutefir drc

echo "4 - Install BruteFir service."
sudo cp /data/plugins/audio_interface/brutefir/brutefir.service /etc/systemd/system/

echo "5 - Creating filters folder and copying demo filters."
mkdir -m 777 /data/INTERNAL/brutefirfilters
mkdir -m 777 /data/INTERNAL/brutefirfilters/filter-sources
mkdir -m 777 /data/INTERNAL/brutefirfilters/target-curves

cp /data/plugins/audio_interface/brutefir/filters/* /data/INTERNAL/brutefirfilters/
cp /data/plugins/audio_interface/brutefir/target-curves/* /data/INTERNAL/brutefirfilters/target-curves/
cp /data/plugins/audio_interface/brutefir/filter-sources/* /data/INTERNAL/brutefirfilters/filter-sources/

echo "Done."
# Required to end the plugin install
echo "plugininstallend"
