April 30th 2019
#	VOLUMIO SPOTIFY CONNECT 2 PLUGIN

This new version is based  on [`vollibrespot`](https://github.com/ashthespy) based on [`librespot`](https://github.com/librespot-org/librespot)


It is still in dev and some features are missing.

![Alt text](volspotconnect2.jpg?raw=true "Spotify/volumio playing through volspotconnect2")

Tested on :
- RPI 0
- RPI B
- RPI B+
- RPI2
- SPARKY
- PINE64
- x86 laptop


## IMPORTANT

- Requires a Premium or Family account

## To install
Before intalling the dev version, REMOVE, if exists, the plugin from your system using the webUI plugins page.


### 1. Enable SSH and connect to Volumio

To do that, have a look here :

https://volumio.github.io/docs/User_Manual/SSH.html

### 2. Download and install the plugin

Type the following commands to download and install plugin:

```
wget https://github.com/balbuze/volumio-plugins/raw/master/plugins/music_service/volspotconnect2/volspotconnect2.zip
mkdir ./volspotconnect2
miniunzip volspotconnect2.zip -d ./volspotconnect2
cd ./volspotconnect2
volumio plugin install
cd ..
rm -Rf volspotconnect*
```

### 3.Enable the plugin

In volumio webUI, go in plugin section, installed plugin.You should see volspotconnect2 now ! Enable it and play ! You can go in the plugin settings to tweak some details.
Enjoy !


## Issues

Time is reset when changing volume in UI
UI may hangs sometimes when pressing buttons to fast.
A delay, somtimes up to 10sec after play is pressed, before the sound comes...


## Last changes

April 30th 2019

- new vollibrespot ['@ash'](https://github.com/ashthespy) 
		[0.1.6]
	-deconnection issue

March 27th 2019

- new vollibrespot ['@ash'](https://github.com/ashthespy) 
		[0.1.4] - 2019-03-26
	-Added support for Dailymixes
	-Faster track changes
	-Multiple small fixes

March 26th 2019

- add debug toggle ['@ash'](https://github.com/ashthespy) 

March 12th 2019

- configurable bitrate. Thank you ['zewelor'](https://github.com/zewelor)

March 10th 2019

- fix for softvol in Volumio

March 09th 2019

- initial volume case :

none mixer = slider to set it and vollibrespt internal mixer
hw or sw mixer in volumio = last volume st in volumio or if startup volume set in volumio, this value.

March 08th 2019

- initial volume with mixer 'none' only

March 01st 2019

- possible fix for mixer "none"

Febuary 26th 2019

- fix for mixer set to "none" from @ashthespy

Febuary 25th 2019

- fix from ['@ash'](https://github.com/ashthespy) for the problem of next track due to Spotify change

2nd Febuary 2019

- merged PR from @ashthespy

11th december 2018

- remove bitrate info...
- support for version info in plugin manager

03rd December 2018

- support alsa hardware mixer! Thanks to ['@ash'](https://github.com/ashthespy)
- vollibrespot as lib Thanks to ['@ash'](https://github.com/ashthespy)
- miscellanea fixes

01st August 2018

- correction in install.sh for curl

28th June 2018

- use of curl instead of wget in install.sh (@gkkpch)

21th June 2018

- better complex username handling

09th june 2018

- Expand credentials command parameters (@ash)
- Update readme

23th may 2018

- autoconfig enabled when plugin is activated

18th may 2018

- fix from @ash :Fix #169 -- Add `kUnknown` enum 

14th may 2018

- comment   //disableUiControls: true

27th march

- better compatibility with audio_intrface plugins ( volstereo2mono, volsimpleequalizer, volbauerfilter, volparametriceq )

18 th march
- new librespot (@ashthespy)
- better UI handling (@ashthespy)
- miscellaneaous changes

09th march
- add dutch translation. Thank you @LeonCB
- re enable volumio stop when spotify starts playing.

06th march
- miscellanea spelling fix

04th march
- update readme for installation (thanks to kayue)
- re enable onstart1.sh
- add version in plugin configuration

02nd march
- seek function
- password management for complex password


01st march
- new librespot for x86
- now working play/pause next previous buttons ! thank you @ashthespy !

28th Febuary
- new librespot for arm
- use of spotifyweb api.

27th Febuary
- change port of socket to avoid conflict with airplay (port 5030 now)

16th Febuary
- remove // for   service: self.servicename

11th Febuary

- PR for volumio plugins
- correction for webUI hanging problem

10th Febuary 18

- metadata in volumioUI
- on stop adjustment

25th January 18

- correct `install.sh`

16th January 18

merge of volspotconnect-futurdev:
- add volume normalization
- add initial Spotify volume
- add metadata (not yet in webUI)
- add shuffle and repeat
- `onstart.sh` uses curl instead of wget
- no x86 yet....

September 28th

- new version of librespot for x86. Now stops playing at the end of a playlist.

September 27th

- new version of librespot for arm. Now stops playing at the end of a playlist. Will follow for x86 in next days...

September 26th

- correct a wrong volspotconnect2.zip file !

September 25 th

- fix x mode on onstart1.sh

September 21th

- on stop function to stop volumio playing when volspotconnect2 starts to play

August 10 th

- new librespot (correct alsa backend support for x86)

July 14th

- disable cache - remove related service
- common librespot for armv6 and armv7
- new librespot for armv6, armv7 and x86

July 10th

- new librespot for armv6 and armv7 - x86 please wait, fails to compile....

June 19th

- update librespot for armv6

June 11th

- new librespot x86 and armhf - fix for 'a song cannot be played in librespot but in official app'

June 5th

- new librespot for armv7 and x86 (armv6 later)

May 26th

- new librespot for arm. Not home compiled but from https://github.com/herrernst/librespot/releases : sound volume is max...

May 18th

- new librespot for armhf and x86. Please wait for and arm....

May 1st

add return libQ.resolve(); in index.js onVolumiostart

April 15th

- change error message when download requires package failed
- new librespot for armv6

April 14th

- new librespot with correction in protocol
- default volume is now about 30% instead of 100%

April 2nd

- Add auto restart service if hang

Mars 2nd

- generated proper startconnect.sh when enabling plugin

Mars 1st

- new librespot for armv6l

Febuary 28th

- update readme
- update remove.sh - chache size is now 64Mo

Febuary 27th

- option to share or no the device
- remove stream rate selector - default is now 320kbps

Febuary 26th
- correct librespot x86
- correction to install on i686

Febuary 25th

-new librespot library with native multi-users
-support x86 arch
-cache written in /tmp

Febuary 19th

-cache is now written in /dev/shm to preserve sd card
-better global responsivness
-better handling multi users

Febuary 17th
correction when switching users

Febuary 16th

correction in remove.sh
correction volspotconnectpurgecache.service
correction onstart

Febuary 15th

New librespot libirary
Cache is now set to 64Mo with auto purge

Febuary 11th

New librespot version

January 25th

volumio is set on pause when start playing
add volspotconnect22.service

January 24th

fix drop when stop playing
allow multiple accounts

January 22th

crendetials autoremove when stop playing : discovery mode ok


January 21th

fix output device
try to autoremove credentials at stop
new work - first almost working plugin
remove x bit on service

January 20th

- First commit
