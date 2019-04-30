April 27th 2019


#	DRC- Digital Room Correction for Volumio (previously Brutefir3)

This plugin is designed to use [brutefir](https://www.ludd.ltu.se/~torger/brutefir.html) with volumio2

It provides :

- A automated installation

- A automatic configuration - Just install and enable the plugin. It's ready for use !

- Hardware capabilities detection for output format using [Alsa-capabilities](https://lacocina.nl/permalink-https-lacocina-nl-detect-alsa-output-capabilities)

- The use of custom filters - for DRC digital room correction created with RePhase

- Filters (left and right) can be selected in webUI.

- A room settings : add a delay on speakers if distance from listener is not equal left/right to keep a good stereo image.

## NEW!

The plugin is able to auto generate filter in few clicks, just using a impluse from REW. To do that, it uses [DRC](http://drc-fir.sourceforge.net/). It will be documented soon!


To have a idea of what it is, have look here [brutefir plugin wiki](https://volumio.github.io/docs/Plugins_User_Manuals/brutefir/Drc_with_Volumio.html)




Base scheme

[volumio]--->[Loopback]--->[Brutefir]--->[output /DAC]


## INSTALLATION WARNING

First, you must have a working configuration with volumio, the dac you want to use and the mixer properly set.

## To install

Before intalling the dev version, REMOVE, if exists, the plugin from your system using the webUI plugins page.

Due to a [Volumio decision](https://volumio.org/forum/require-plugins-uploaded-plugins-repo-t8116-10.html), now third party or dev plugin can only be install through SSH. Here is how:

### 1. Enable SSH and connect to Volumio

To do that, have a look here : [ssh in volumio](https://volumio.github.io/docs/User_Manual/SSH.html)


### 2. Download and install the plugin

Type the following commands to download and install plugin:

```
wget https://github.com/balbuze/volumio-plugins/raw/master/plugins/audio_interface/brutefir3/brutefir.zip
mkdir ./brutefir
miniunzip brutefir.zip -d ./brutefir
cd ./brutefir
volumio plugin install
cd ..
rm -Rf brutefir*
```

### 3. Using the plugin

In webUI, enable the plugin and wait about 20seconds.

## What is working :

nearly everythings


## What is not working :

- ?
- mixer is not properly displayed in Volumio's playback option



### 4. Last changes

April 27th 2019

- code cleaning + comments
- text in UI
- new demo filter + impulse


April 26th 2019

- more warnings in UI
- new work on timers...

April 22th 2019

- warning if sample rate >96kHz for DRC-fir generation
- startup promise
- code cleaning
- update doc

April 19th 2019

- add targeet curve HK5 TY Krunok!
- small cosmetics

April 11th 2019

- remove target-curves and filters-sources from selectable scrolling list
- sweep files in 44.1Khz 16b for better compatibility

April 10th 2019

- add drcconfig

April 7th 2019

- Improvement for file name of generated filter. If field empty, use the name of file to convert.

April 6th 2019

- correction in file name generated for filter

April 5th 2019

- fix no sound at boot time
- Improve UI
- Readme

April 4th 2019

- Tools fix

April 2nd 2019

- new work on filter generation

April 1st 2019

- first version with filter generation using drc

March 29th 2019

- add FLOAT_LE – 32bit floating point (.pcm)

March 25th 2019

- reverse some timer...

March 24th 2019

- better plugin startup promise

March 03rd 2019

- add Factory values for output format sample

Febuary, 28th  2019

- correct default Dirac pulse
- small improvement
- code cleaning

Febuary, 27th  2019

- fix for ouput format selector. Should be ok with ver 0.8.1...

Febuary, 25th  2019

- filter format selector
- first work for output sample format from hw

Febuary, 8th 2019

- internal default input is now s32_le
- default output is now s32_le

Febuary, 5th 2019

- sweep files with timing reft on right channel. (thanks merlin2222 ;-))

Febuary, 2nd 2019

- merge left and right attenuation
- timer adjustement (no idea if it could solve some startup prob...)

December, 27 th 2018

- small timer adjustement

December, 15th 2018

- fix for impossible to enable plugin

December, 14th 2018

- add room settings

December, 11th 2018

- support version in plugin manager

December, 2nd 2018

- add 176.4kHz sample rate

November, 17th 2018

- ooops in default sample rate

November, 16th 2018

- correction in UI for sample rate

November, 14th 2018

- sample rate are now dislayed in the form XXkHz
- add 88.2kHz samle rate

November, 13th 2018

- add modal message when installing tools

November, 12th 2018

- installable/removable tools

November, 11th 2018

- correct link to wiki

November, 10th 2018

- add a stop button for sweep files
- hidden menu for sweep
- first work for pink noise

November, 9th 2018

- filters selector

November, 5th 2018

- correction for unsaved parameters
- 96000 is the default sample rate now

November, 4th 2018

- add 3 play buttons to play sweep files
- french translation


November, 2nd 2018

- cosmetic in UI
- info  toast message when clicking "download sweep files"
- link to the doc

November, 1st 2018

- add button to wiki
- better translation support
- node_modules cleaning

31 th October

- Add a button to download sweep files in /data/INTERNAL/brutefirfilters/sweep

30 th October

- better translation support
- default parameters in config.json

28 th October

- remove useless parameters
- filter name with no ext

27th October 18

- rewrite from brutefir2
		remove equalizer
		only txt filter is usable
		...
