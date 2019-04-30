/* DRC-FIR plugin for volumio2. By balbuze 2019 */
// ----------------------------------------------------------------------------

'use strict';

// index.js dependencies
var config = new(require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require('fs-extra');
var libFsExtra = require('fs-extra');
var libQ = require('kew');
var net = require('net');

// ----------------------------------------------------------------------------
// Main Controler declaration
// ----------------------------------------------------------------------------

module.exports = ControllerBrutefir;

function ControllerBrutefir(context) {
    var self = this;

    self.context = context;
    self.commandRouter = self.context.coreCommand;
    self.logger = self.commandRouter.logger;
    self.config = config;

    this.context = context;
    this.commandRouter = this.context.coreCommand;
    this.logger = this.context.logger;
    this.configManager = this.context.configManager;
    this.config = config;
};

// ----------------------------------------------------------------------------
// Controler functions overloading
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// Plugin Installation
ControllerBrutefir.prototype.onInstall = function() {
    var self = this;  
};

ControllerBrutefir.prototype.onUninstall = function() {
    var self = this;
};

// ----------------------------------------------------------------------------
// Volumio start
ControllerBrutefir.prototype.onVolumioStart = function() {
    var self = this;

    var configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context, 'config.json');
    this.config.loadFile(configFile);

    this.commandRouter.sharedVars.registerCallback('alsa.outputdevice', this.outputDeviceCallback.bind(this));

    self.autoconfig

    return libQ.resolve();
};

// ----------------------------------------------------------------------------
// Plugin configurations
ControllerBrutefir.prototype.getConfigurationFiles = function() {
    return ['config.json'];
};

ControllerBrutefir.prototype.getAdditionalConf = function(type, controller, data) {
    var self = this;

    return self.commandRouter.executeOnPlugin(type, controller, 'getConfigParam', data);
}

ControllerBrutefir.prototype.getConf = function(varName) {
    var self = this;
};

ControllerBrutefir.prototype.setConf = function(varName, varValue) {
    var self = this;
};

// ----------------------------------------------------------------------------
// Plugin lifecycles
ControllerBrutefir.prototype.onStart = function() {
    var self = this;
    var defer = libQ.defer();

    self.autoconfig()
    .then(function(e) {
        setTimeout(function() {
            self.logger.info("Starting brutefir");
            self.startBrutefirDaemon(defer);
        }, 1000);
        defer.resolve();
    })
    .fail(function(e) {
        defer.reject(new Error());
    });

    return defer.promise;
};

ControllerBrutefir.prototype.onStop = function() {
    var self = this;
    var defer = libQ.defer();

    self.logger.info("Stopping Brutefir service");
    exec("/usr/bin/sudo /bin/systemctl stop brutefir.service", {
        uid: 1000,
        gid: 1000
    }, function(error, stdout, stderr) {})

    self.restoresettingwhendisabling()
    defer.resolve();

    return libQ.resolve();
};

ControllerBrutefir.prototype.onRestart = function() {
    var self = this;
};

// ----------------------------------------------------------------------------
// Plugin UI description
ControllerBrutefir.prototype.setUIConfig = function(data) {
    var self = this;
};

ControllerBrutefir.prototype.getUIConfig = function() {
    var self = this;
    var defer = libQ.defer();

    var output_device;
    var lang_code = this.commandRouter.sharedVars.get('language_code');
    
    output_device = self.config.get('output_device');

    self.commandRouter.i18nJson(__dirname + '/i18n/strings_' + lang_code + '.json',
        __dirname + '/i18n/strings_en.json',
        __dirname + '/UIConfig.json')

    .then(function(uiconf) {
        var value;
        var valuestoredl;
        var valuestoredr;
        var valuestoredf;
        var filterfolder = "/data/INTERNAL/brutefirfilters";
        var filtersources = "/data/INTERNAL/brutefirfilters/filter-sources";
        var items;
        var allfilter;
        var oformat;
        var filetoconvertl;
        var bkpath = "/data/INTERNAL/brutefirfilters/target-curves";
        var bkl
    
        uiconf.sections[1].content[0].value = self.config.get('ldistance');
        uiconf.sections[1].content[1].value = self.config.get('rdistance');
        uiconf.sections[2].content[3].value = self.config.get('outputfilename');

        //-----------------------------------
        // here we list the content of the folder to populate filter scrolling list
        valuestoredl = self.config.get('leftfilter');
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[1].value.value', valuestoredl);
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[1].value.label', valuestoredl);

        valuestoredr = self.config.get('rightfilter');
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[2].value.value', valuestoredr);
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[2].value.label', valuestoredr);

        filetoconvertl = self.config.get('filetoconvert');
        self.configManager.setUIConfigParam(uiconf, 'sections[2].content[0].value.value', filetoconvertl);
        self.configManager.setUIConfigParam(uiconf, 'sections[2].content[0].value.label', filetoconvertl);


        fs.readdir(filtersources, function(err, fitem) {
            var fitems;
            var filetoconvert = '' + fitem;

            fitems = filetoconvert.split(',');
            self.logger.info('list of available files to convert :' + fitems);
            console.log(fitems)
            for (var i in fitems) {
                self.configManager.pushUIConfigParam(uiconf, 'sections[2].content[0].options', {
                    value: fitems[i],
                    label: fitems[i]
                });
            }
        });

        bkl = self.config.get('bk');
        self.configManager.setUIConfigParam(uiconf, 'sections[2].content[1].value.value', bkl);
        self.configManager.setUIConfigParam(uiconf, 'sections[2].content[1].value.label', bkl);


        fs.readdir(bkpath, function(err, bitem) {
            var bitems;
            var filetoconvert = '' + bitem;

            bitems = filetoconvert.split(',');
            self.logger.info('list of available curves :' + bitems);
            console.log(bitems)
            for (var i in bitems) {
                self.configManager.pushUIConfigParam(uiconf, 'sections[2].content[1].options', {
                    value: bitems[i],
                    label: bitems[i]
                });
            }
        });

        value = self.config.get('drcconfig');
        self.configManager.setUIConfigParam(uiconf, 'sections[2].content[2].value.value', value);
        self.configManager.setUIConfigParam(uiconf, 'sections[2].content[2].value.label', self.getLabelForSelect(self.configManager.getValue(uiconf, 'sections[2].content[2].options'), value));

        fs.readdir(filterfolder, function(err, item) {
            allfilter = 'Dirac pulse,' + item
            var allfilters = allfilter.replace('filter-sources', '');
            var allfilter2 = allfilters.replace('target-curves', '');
            items = allfilter2.split(',');

            for (var i in items) {
                self.configManager.pushUIConfigParam(uiconf, 'sections[0].content[1].options', {
                    value: items[i],
                    label: items[i]
                });
                self.configManager.pushUIConfigParam(uiconf, 'sections[0].content[2].options', {
                    value: items[i],
                    label: items[i]
                });
                self.logger.info('list of available filters UI :' + items[i]);
            }
        });

        var value

        //-------------------------------------------------
        //here we read the content of the file sortsamplec.txt (it will be generated by a script to detect hw capabilities).
        valuestoredf = self.config.get('output_format');
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[6].value.value', valuestoredf);
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[6].value.label', valuestoredf);

        var filetoread = "/data/configuration/audio_interface/brutefir/sortsample.txt";
        try {
            var sampleformat = fs.readFileSync(filetoread, 'utf8').toString().split('\n');
            var sampleformatf = ('Factory_S16_LE, Factory_S24_LE, Factory_S24_3LE, Factory_S24_4LE, Factory_S32_LE, ')
            var sampleformato
            var sitems
            var js

            if (sampleformat == "") {
                sampleformato = sampleformatf;
            } else {
                var str22 = sampleformat.toString().replace(/S/g, "HW-Detected-S");
                var str2 = str22.toString().replace(/\s/g, '');
                var str21 = str2.substring(0, str2.length - 1);
                js = str21
            }

            if (str2 == null) {
                str2 = "Detection fails, reboot to retry "
            }

            var result = str2 + sampleformatf

            self.logger.info('result formats ' + result);

            var str1 = result.replace(/\s/g, '');
            var str = str1.substring(0, str1.length - 1);

            sitems = str.split(',');

            for (var i in sitems) {
                self.logger.info('list of available output formatUI :' + sitems[i]);
                self.configManager.pushUIConfigParam(uiconf, 'sections[0].content[6].options', {
                    value: sitems[i],
                    label: sitems[i]
                });
            }
        } catch (e) {
            self.logger.error('Could not read file: ' + e)
            console.log(sampleformat)
        }

        value = self.config.get('attenuation');
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[0].value.value', value);
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[0].value.label', self.getLabelForSelect(self.configManager.getValue(uiconf, 'sections[0].content[0].options'), value));

        value = self.config.get('filter_format');
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[3].value.value', value);
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[3].value.label', self.getLabelForSelect(self.configManager.getValue(uiconf, 'sections[0].content[3].options'), value));

        value = self.config.get('filter_size');
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[4].value.value', value);
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[4].value.label', self.getLabelForSelect(self.configManager.getValue(uiconf, 'sections[0].content[4].options'), value));

        value = self.config.get('smpl_rate');
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[5].value.value', value);
        self.configManager.setUIConfigParam(uiconf, 'sections[0].content[5].value.label', self.getLabelForSelect(self.configManager.getValue(uiconf, 'sections[0].content[5].options'), value));

        var value;
        defer.resolve(uiconf);
    })
    .fail(function() {
        defer.reject(new Error());
    })

    return defer.promise
};

// ----------------------------------------------------------------------------
// Plugins dedicated functions
// ----------------------------------------------------------------------------

/* 
/  Auto configuration of plugin. Launched at volumio start & plugin start.
*/
ControllerBrutefir.prototype.autoconfig = function() {
    var self = this;
    var defer = libQ.defer();

    self.saveVolumioconfig()
    .then(self.sampleformat())
    .then(self.modprobeLoopBackDevice())
    .then(self.saveHardwareAudioParameters())
    .then(self.setLoopbackoutput())
    .catch(function(err) {
        console.log(err);
    });
    defer.resolve()

    return defer.promise;
};

/*
/   Current Volumio's configuration backup. Called during autoconfiguration step.
*/
ControllerBrutefir.prototype.saveVolumioconfig = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
        var cp = execSync('/bin/cp /data/configuration/audio_interface/alsa_controller/config.json /tmp/vconfig.json');
        var cp2 = execSync('/bin/cp /data/configuration/system_controller/i2s_dacs/config.json /tmp/i2sconfig.json');

        try {
            var cp3 = execSync('/bin/cp /boot/config.txt /tmp/config.txt');

        } catch (err) {
            self.logger.info('config.txt does not exist');
        }
        resolve();
    });
};

/*
/   Previous Volumio's configuration restoring. Called on alsa configuration change through Volumio's IHM.
*/
ControllerBrutefir.prototype.restoreVolumioconfig = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            var cp = execSync('/bin/cp /tmp/vconfig.json /data/configuration/audio_interface/alsa_controller/config.json');
            var cp2 = execSync('/bin/cp /tmp/i2sconfig.json /data/configuration/system_controller/i2s_dacs/config.json');

            try {
                var cp3 = execSync('/bin/cp /tmp/config.txt /boot/config.txt');
            } catch (err) {
                self.logger.info('config.txt does not exist');
            }
        }, 6000)
        resolve();
    });
};

/*
/   generate the file containing samples format available on the used hw
*/
ControllerBrutefir.prototype.sampleformat = function() {
    var self = this;

    var output_device;

    output_device = self.config.get('alsa_device')

    exec('/bin/bash /data/plugins/audio_interface/brutefir/alsa-capabilities -a hw:' + output_device + ',0 2>&1 | /usr/bin/tee /data/configuration/audio_interface/brutefir/sampleformat.txt ', {
        uid: 1000,
        gid: 1000
    }, function(error, stdout, stderr) {    
        if (error) {
            self.logger.info('failed ' + error);
        } else {
            self.commandRouter.pushConsoleMessage('list sample format done');
            try {
                exec("/bin/bash data/plugins/audio_interface/brutefir/sortsample.sh", {
                    uid: 1000,
                    gid: 1000
                })
            } catch (err) {
                self.logger.info('sampleformat.txt does not exist');
            }
        }
    }
 });

/*
*   load snd_aloop module to provide a Loopback device
*/
ControllerBrutefir.prototype.modprobeLoopBackDevice = function() {
    var self = this;
    var defer = libQ.defer();

    exec("/usr/bin/sudo /sbin/modprobe snd_aloop index=7 pcm_substreams=2", {
        uid: 1000,
        gid: 1000
    }, function(error, stdout, stderr) {
        if (error) {
            self.logger.info('failed to load snd_aloop' + error);
        } else {
            self.commandRouter.pushConsoleMessage('snd_aloop loaded');
            defer.resolve();
        }
    });

    setTimeout(function() {
        return defer.promise;
    }, 500)
};

/*
/   Register all current hardware configuration
*/
ControllerBrutefir.prototype.saveHardwareAudioParameters = function() {
    var self = this;
    var defer = libQ.defer();

    var conf;
    
    // we save the alsa configuration for future needs here, note we prepend alsa_ to avoid confusion with other brutefir settings
    //volumestart
    conf = self.getAdditionalConf('audio_interface', 'alsa_controller', 'volumestart');
    self.config.set('alsa_volumestart', conf);
    //maxvolume
    conf = self.getAdditionalConf('audio_interface', 'alsa_controller', 'volumemax');
    self.config.set('alsa_volumemax', conf);
    //volumecurve
    conf = self.getAdditionalConf('audio_interface', 'alsa_controller', 'volumecurvemode');
    self.config.set('alsa_volumecurvemode', conf);
    //device
    conf = self.getAdditionalConf('audio_interface', 'alsa_controller', 'outputdevice');
    self.config.set('alsa_device', conf);
    //mixer_type
    conf = self.getAdditionalConf('audio_interface', 'alsa_controller', 'mixer_type');
    self.config.set('alsa_mixer_type', conf);
    //mixer
    conf = self.getAdditionalConf('audio_interface', 'alsa_controller', 'mixer');
    self.config.set('alsa_mixer', conf);
    //volumesteps
    conf = self.getAdditionalConf('audio_interface', 'alsa_controller', 'volumesteps');
    self.config.set('alsa_volumesteps', conf);
    //name
    conf = self.getAdditionalConf('audio_interface', 'alsa_controller', 'outputdevicename');
    self.config.set('alsa_outputdevicename', conf);

    return defer.promise;
};

/*
*   Set the Loopback output 
*/
ControllerBrutefir.prototype.setLoopbackoutput = function() {
    var self = this;
    var defer = libQ.defer();

    var outputp
    outputp = self.config.get('alsa_outputdevicename')
    var stri = {
        "output_device": {
            "value": "Loopback",
            "label": (outputp + " through brutefir")
        }
    }

    setTimeout(function() {
        self.commandRouter.executeOnPlugin('system_controller', 'i2s_dacs', 'disableI2SDAC', '');
        return self.commandRouter.executeOnPlugin('audio_interface', 'alsa_controller', 'saveAlsaOptions', stri);
    }, 500);

    var volumeval = self.config.get('alsa_volumestart')

    if (volumeval != 'disabled') {
        setTimeout(function() {
            exec('/volumio/app/plugins/system_controller/volumio_command_line_client/volumio.sh volume ' + volumeval, {
                uid: 1000,
                gid: 1000,
                encoding: 'utf8'
            }, function(error, stdout, stderr) {
                if (error) {
                    self.logger.error('Cannot set startup volume: ' + error);
                } else {
                    self.logger.info("Setting volume on startup at " + volumeval);
                }
            });
        }, 4500);
    }

    return defer.promise;
};

/*
/   Start the BruteFir service. Called during start plugin lifecycle.
*/
ControllerBrutefir.prototype.startBrutefirDaemon = function() {
    var self = this;
    var defer = libQ.defer();

    exec("/usr/bin/sudo /bin/systemctl start brutefir.service", {
        uid: 1000,
        gid: 1000
    }, function(error, stdout, stderr) {
        if (error) {
            self.logger.info('brutefir failed to start. Check your configuration ' + error);
        } else {
            self.commandRouter.pushConsoleMessage('Brutefir Daemon Started');
            defer.resolve();
        }
    });

    return defer.promise;
};

/*
/   callback function when Volumio's alsa output selection change.
*/
ControllerBrutefir.prototype.outputDeviceCallback = function() {
    var self = this;
    var defer = libQ.defer();

    setTimeout(function() {
        self.setVolumeParameters()
    }, 500);
    self.restoreVolumioconfig()

    defer.resolve()

    return defer.promise;
};

/*
/   UI - Get labels
*/
ControllerBrutefir.prototype.getLabelForSelect = function(options, key) {
    var n = options.length;
    for (var i = 0; i < n; i++) {
        if (options[i].value == key)
            return options[i].label;
    }

    return 'VALUE NOT FOUND BETWEEN SELECT OPTIONS!';
};

// ----------------------------------------------------------------------------
// Sweeps generation
// ----------------------------------------------------------------------------

/*
/   Play left sweep when button is pressed
*/
ControllerBrutefir.prototype.playleftsweepfile = function(track) {
    var self = this;

    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerBrutefir::clearAddPlayTrack');
    var track = '/data/plugins/audio_interface/brutefir/tools/512kMeasSweep_20_to_20000_44k_PCM16_L_refR.wav';
    var safeUri = track.replace(/"/g, '\\"');

    try {
        exec('/usr/bin/killall aplay');
        exec('/usr/bin/aplay --device=plughw:Loopback ' + track);
    } catch (e) {
        console.log('/usr/bin/aplay --device=plughw:Loopback ' + track)
    };
};


/*
/   Play right sweep when button is pressed
*/
ControllerBrutefir.prototype.playrightsweepfile = function(track) {
    var self = this;

    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerBrutefir::clearAddPlayTrack');
    var track = '/data/plugins/audio_interface/brutefir/tools/512kMeasSweep_20_to_20000_44k_PCM16_R_refR.wav';
    var safeUri = track.replace(/"/g, '\\"');

    try {
        exec('/usr/bin/killall aplay');
        exec('/usr/bin/aplay --device=plughw:Loopback ' + track);
    } catch (e) {
        console.log('/usr/bin/aplay --device=plughw:Loopback ' + track)
    };
};

/*
/   Play both channel when button is pressed
*/
ControllerBrutefir.prototype.playbothsweepfile = function(track) {
    var self = this;
    
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerBrutefir::clearAddPlayTrack');
    var track = '/data/plugins/audio_interface/brutefir/tools/512kMeasSweep_20_to_20000_44k_PCM16_LR_refR.wav';
    var safeUri = track.replace(/"/g, '\\"');

    try {
        exec('/usr/bin/killall aplay');
        exec('/usr/bin/aplay --device=plughw:Loopback ' + track);
    } catch (e) {
        console.log('/usr/bin/aplay --device=plughw:Loopback ' + track)
    };
};

// ----------------------------------------------------------------------------
// PinkNoise generation
// ----------------------------------------------------------------------------

/*
/   Play left pink noise channel when button is pressed
*/
ControllerBrutefir.prototype.playleftpinkfile = function(track) {
    var self = this;
    
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerBrutefir::clearAddPlayTrack');
    var track = '/data/plugins/audio_interface/brutefir/tools/PinkNoise_48k_16-bit_L.WAV';
    var safeUri = track.replace(/"/g, '\\"');

    try {
    usr/bin/killall aplay');
    exec('/usr/bin/aplay --device=plughw:Loopback ' + track);
    } catch (e) {
        console.log('/usr/bin/aplay --device=plughw:Loopback ' + track)
    };
};

/*
/   Play right pink noise channel when button is pressed
*/
ControllerBrutefir.prototype.playrightpinkfile = function(track) {
    var self = this;
    
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerBrutefir::clearAddPlayTrack');
    var track = '/data/plugins/audio_interface/brutefir/tools/PinkNoise_48k_16-bit_R.WAV';
    var safeUri = track.replace(/"/g, '\\"');

    try {
        exec('/usr/bin/killall aplay');
        exec('/usr/bin/aplay --device=plughw:Loopback ' + track);
    } catch (e) {
        console.log('/usr/bin/aplay --device=plughw:Loopback ' + track)
    };
};

/*
/   Play both pink noise channels when button is pressed
*/
ControllerBrutefir.prototype.playbothpinkfile = function(track) {
    var self = this;

    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerBrutefir::clearAddPlayTrack');
    var track = '/data/plugins/audio_interface/brutefir/tools/PinkNoise_48k_16-bit_BOTH.WAV';
    var safeUri = track.replace(/"/g, '\\"');

    try {
        exec('/usr/bin/killall aplay');
        exec('/usr/bin/aplay --device=plughw:Loopback ' + track);
    } catch (e) {
        console.log('/usr/bin/aplay --device=plughw:Loopback ' + track)
    };
};

// ----------------------------------------------------------------------------
// BruteFir configuration generation
// ----------------------------------------------------------------------------

/* 
/   Save the brutefir config.json
*/
ControllerBrutefir.prototype.saveBrutefirconfigAccount2 = function(data) {
    var self = this;
    var defer = libQ.defer();

    var output_device
    var input_device = "Loopback,1";
    output_device = self.config.get('alsa_device');

    self.config.set('attenuation', data['attenuation'].value);
    self.config.set('leftfilter', data['leftfilter'].value);
    self.config.set('rightfilter', data['rightfilter'].value);
    self.config.set('filter_format', data['filter_format'].value);
    self.config.set('filter_size', data['filter_size'].value);
    self.config.set('smpl_rate', data['smpl_rate'].value);
    self.config.set('input_device', data['input_device']);
    self.config.set('output_device', data['output_device']);
    self.config.set('output_format', data['output_format'].value);

    self.rebuildBRUTEFIRAndRestartDaemon()
    .then(function(e) {
        self.commandRouter.pushToastMessage('success', "Configuration update", 'The configuration has been successfully updated');
        defer.resolve({});
    })
    .fail(function(e) {
        defer.reject(new Error('Brutefir failed to start. Check your config !'));
        self.commandRouter.pushToastMessage('error', 'Brutefir failed to start. Check your config !');
    })

    return defer.promise;
};

/*
/   Save the brutefir delay calculation
*/
ControllerBrutefir.prototype.saveBrutefirconfigroom = function(data) {
    var self = this;
    var defer = libQ.defer();

    self.config.set('ldistance', data['ldistance']);
    self.config.set('rdistance', data['rdistance']);

    self.rebuildBRUTEFIRAndRestartDaemon()
    .then(function(e) {
        self.commandRouter.pushToastMessage('success', "Configuration update", 'The configuration has been successfully updated');
        defer.resolve({});
    })
    .fail(function(e) {
        defer.reject(new Error('Brutefir failed to start. Check your config !'));
        self.commandRouter.pushToastMessage('error', 'Brutefir failed to start. Check your config !');
    })

    return defer.promise;
};

/*
/   Rebuild BruteFir Configuration
*/
ControllerBrutefir.prototype.rebuildBRUTEFIRAndRestartDaemon = function() {
    var self = this;
    var defer = libQ.defer();

    self.createBRUTEFIRFile()
    .then(function(e) {
        var edefer = libQ.defer();

        exec("/usr/bin/sudo /bin/systemctl restart brutefir.service", {
            uid: 1000,
            gid: 1000
        }, function(error, stdout, stderr) {
            if (error) {
                self.commandRouter.pushToastMessage('error', 'Brutefir failed to start. Check your config !');
            } else {
                self.commandRouter.pushToastMessage('success', 'Attempt to start Brutefir...');
            }
            edefer.resolve();
        });

        return edefer.promise;
    })
    .then(self.startBrutefirDaemon.bind(self))
    .then(function(e) {
        setTimeout(function() {
            self.logger.info("Connecting to daemon");
            }, 2000)
            .fail(function(e) {
                self.commandRouter.pushToastMessage('error', "Brutefir failed to start. Check your config !");
                self.logger.info("Brutefir failed to start. Check your config !");
            });
    });

    return defer.promise;
};

/*
/   Create a bruteFir configuration file from template.
*/
ControllerBrutefir.prototype.createBRUTEFIRFile = function() {
    var self = this;
    var defer = libQ.defer();

    try {
        fs.readFile(__dirname + "/brutefir.conf.tmpl", 'utf8', function(err, data) {
            if (err) {
                defer.reject(new Error(err));
                return console.log(err);
            }

            var value;
            var devicevalue;
            var sbauer;
            var input_device = 'Loopback,1';
            var filter_path = "/data/INTERNAL/brutefirfilters/";
            var leftfilter;
            var rightfilter;
            var composeleftfilter = filter_path + self.config.get('leftfilter');
            var composerightfilter = filter_path + self.config.get('rightfilter');
            var lattenuation;
            var rattenuation;

            // delay calculation section for both channels
            var delay
            var sldistance = self.config.get('ldistance');
            var srdistance = self.config.get('rdistance');
            var diff
            var cdelay
            var sample_rate = self.config.get('smpl_rate');
            var sv = 34000 // sound velocity cm/s

            if (sldistance > srdistance) {
                diff = sldistance - srdistance
                cdelay = (diff / sv * sample_rate)
                delay = ('0,' + Math.round(cdelay))
                self.logger.info('l>r ' + delay)
            }
            if (sldistance < srdistance) {
                diff = srdistance - sldistance
                cdelay = (diff / sv * sample_rate)
                delay = (Math.round(cdelay) + ',0')
                self.logger.info('l<r ' + delay)
            }
            if (sldistance == srdistance) {
                self.logger.info('no delay needed');
                delay = ('0,0')
            }

            var n_part = self.config.get('numb_part');
            var num_part = parseInt(n_part);
            var f_size = self.config.get('filter_size');
            var filter_size = parseInt(f_size);
            var filtersizedivided = filter_size / num_part;
            var output_device

            var skipf
            if ((self.config.get('filter_format') == "S32_LE") || (self.config.get('filter_format') == "S24_LE") || (self.config.get('filter_format') == "S16_LE")) 
                skipf = "skip:44;";
            else 
                skipf = "";

            output_device = 'hw:' + self.config.get('alsa_device');

            console.log(self.config.get('output_format'));

            var output_formatx
            output_formatx = self.config.get('output_format').replace(/HW-Detected-/g, "").replace(/Factory_/g, "");

            if (self.config.get('leftfilter') == "Dirac pulse") 
                composeleftfilter = "dirac pulse";
            else 
                leftfilter = filter_path + self.config.get('leftfilter');

            if (self.config.get('rightfilter') == "Dirac pulse") 
                composerightfilter = "dirac pulse";
            else 
                rightfilter = filter_path + self.config.get('rightfilter');

            var conf1 = data.replace("${smpl_rate}", self.config.get('smpl_rate'));
            var conf2 = conf1.replace("${filter_size}", filtersizedivided);
            var conf3 = conf2.replace("${numb_part}", num_part);
            var conf4 = conf3.replace("${input_device}", input_device);
            var conf5 = conf4.replace("${delay}", delay);
            var conf6 = conf5.replace("${leftfilter}", composeleftfilter);
            var conf7 = conf6.replace("${filter_format1}", self.config.get('filter_format'));
            var conf8 = conf7.replace("${skip_1}", skipf);
            var conf9 = conf8.replace("${lattenuation}", self.config.get('attenuation'));
            var conf10 = conf9.replace("${rightfilter}", composerightfilter);
            var conf11 = conf10.replace("${filter_format2}", self.config.get('filter_format'));
            var conf12 = conf11.replace("${skip_2}", skipf);
            var conf13 = conf12.replace("${rattenuation}", self.config.get('attenuation'));
            var conf14 = conf13.replace("${output_device}", output_device);
            var conf15 = conf14.replace("${output_format}", output_formatx);

            fs.writeFile("/data/configuration/audio_interface/brutefir/volumio-brutefir-config", conf15, 'utf8', function(err) {
                if (err) 
                    defer.reject(new Error(err));
                else 
                    defer.resolve();
            });
        });
    } catch (err) {
    }

    return defer.promise;
};

// ----------------------------------------------------------------------------
// DRC plugins tools management
// ----------------------------------------------------------------------------

/*
/   Download and install tools
*/
ControllerBrutefir.prototype.installtools = function(data) {
    var self = this;

    var modalData = {
        title: 'Tools installation',
        message: 'Your are going to download about 17Mo. Please WAIT until this page is refreshed (about 15 sec).',
        size: 'lg'
    };

    self.commandRouter.broadcastMessage("openModal", modalData);
    return new Promise(function(resolve, reject) {
        try {
            var cp3 = execSync('/usr/bin/wget -P /tmp https://github.com/balbuze/volumio-plugins/raw/master/plugins/audio_interface/brutefir3/tools/tools.tar.xz');
            var cp4 = execSync('/bin/mkdir /data/plugins/audio_interface/brutefir/tools');
            var cp5 = execSync('tar -xvf /tmp/tools.tar.xz -C /data/plugins/audio_interface/brutefir/tools');
            var cp6 = execSync('/bin/rm /tmp/tools.tar.xz*');
            var cp7 = execSync('/bin/rm /data/plugins/audio_interface/brutefir/UIConfig.json');

            var cp8 = execSync('/bin/cp /data/plugins/audio_interface/brutefir/UIConfig.json.tools /data/plugins/audio_interface/brutefir/UIConfig.json');
        } catch (err) {
            self.logger.info('An error occurs while downloading or installing tools');
            self.commandRouter.pushToastMessage('error', 'An error occurs while downloading or installing tools');
        }
        resolve();
        self.commandRouter.pushToastMessage('success', 'Files succesfully Installed !', 'Refresh the page to see them');
        return self.commandRouter.reloadUi();
    });
};

/*
/   Remove tools
*/
ControllerBrutefir.prototype.removetools = function(data) {
    var self = this;

    self.commandRouter.pushToastMessage('info', 'Remove progress, please wait!');
    return new Promise(function(resolve, reject) {
        try {
            var cp6 = execSync('/bin/rm -Rf /data/plugins/audio_interface/brutefir/tools');
            var cp7 = execSync('/bin/rm /data/plugins/audio_interface/brutefir/UIConfig.json');
            var cp8 = execSync('/bin/cp /data/plugins/audio_interface/brutefir/UIConfig.json.base /data/plugins/audio_interface/brutefir/UIConfig.json')
        } catch (err) {
            self.logger.info('An error occurs while removing tools');
            self.commandRouter.pushToastMessage('error', 'An error occurs while removing tools');
        }
        resolve();
        self.commandRouter.pushToastMessage('success', 'Tools succesfully Removed !', 'Refresh the page to see them');

        return self.commandRouter.reloadUi();
    });
};

// ----------------------------------------------------------------------------
// ....
// ----------------------------------------------------------------------------
 setTimeout(function() {
    }, 25)
};

// ----------------------------------------------------------------------------
// ....
// ----------------------------------------------------------------------------
/*
/   Stop aplay
*/
ControllerBrutefir.prototype.stopaplay = function(track) {
    var self = this;

    try {
        exec('/usr/bin/killall aplay');
    } catch (e) {
        self.data.logger('Stopping aplay')
    };
};

// ----------------------------------------------------------------------------
// ....
// ----------------------------------------------------------------------------

/*
/   Save value to convert file
*/
ControllerBrutefir.prototype.fileconvert = function(data) {
    var self = this;
    var defer = libQ.defer();

    self.config.set('filetoconvert', data['filetoconvert'].value);
    self.config.set('bk', data['bk'].value);
    self.config.set('drcconfig', data['drcconfig'].value);
    self.config.set('outputfilename', data['outputfilename']);
    self.convert()

    return defer.promise;
};

/*
/   Convert file using sox and generate filter with DRC-FIR
*/
ControllerBrutefir.prototype.convert = function(data) {
    var self = this;

    var inpath = "/data/INTERNAL/brutefirfilters/filter-sources/";
    var drcconfig = self.config.get('drcconfig');
    var outpath = "/data/INTERNAL/brutefirfilters/";
    var infile = self.config.get('filetoconvert');

    if (infile != 'choose a file') {

        var outfile = self.config.get('outputfilename')
        if ((outfile == '') || (outfile == 'Empty=name of file to convert')) {
            outfile = infile.replace('.wav', '')
        };

        var targetcurve = ' /usr/share/drc/config/'
        var outsample = self.config.get('smpl_rate');
        var BK = self.config.get('bk');

        if (BK != 'choose a file') {
            var BKsimplified = BK.replace('.txt', '');
            var ftargetcurve
            var curve

            if ((outsample == 44100) || (outsample == 48000) || (outsample == 88200) || (outsample == 96000)) {
                if (outsample == 44100) {
                    ftargetcurve = '44.1\\ kHz/';
                    curve = '44.1';
                } else if (outsample == 48000) {
                    ftargetcurve = '48.0\\ kHz/';
                    curve = '48.0';
                } else if (outsample == 88200) {
                    ftargetcurve = '88.2\\ kHz/';
                    curve = '88.2';
                } else if (outsample == 96000) {
                    ftargetcurve = '96.0\\ kHz/';
                    curve = '96.0';
                };

                var destfile = (outpath + outfile + "-" + drcconfig + "-" + curve + "kHz-" + BKsimplified + ".pcm");
                var BKpath = "/data/INTERNAL/brutefirfilters/target-curves/"

                try {
                    execSync("/usr/bin/sox " + inpath + infile + " -t f32 /tmp/tempofilter.pcm rate -v -s " + outsample);
                    self.logger.info("/usr/bin/sox " + inpath + infile + " -t f32 /tmp/tempofilter.pcm rate -v -s " + outsample);
                } catch (e) {
                    self.logger.info('input file does not exist ' + e);
                    self.commandRouter.pushToastMessage('error', 'Sox fails to convert file' + e);
                };
                try {
                    var modalData = {
                        title: (destfile + ' filter generation in progress!'),
                        message: ' Please WAIT until this page is refreshed (about 1 minute).',
                        size: 'lg'
                    };
                    self.commandRouter.broadcastMessage("openModal", modalData);
                    execSync("/usr/bin/drc --BCInFile=/tmp/tempofilter.pcm --PSPointsFile=" + BKpath + BK + " --PSOutFile=" + destfile + targetcurve + ftargetcurve + drcconfig + "-" + curve + ".drc");
                    self.logger.info("/usr/bin/drc --BCInFile=/tmp/tempofilter.pcm --PSPointsFile=" + BKpath + BK + " --PSOutFile=" + destfile + targetcurve + ftargetcurve + drcconfig + "-" + curve + ".drc");
                    self.commandRouter.pushToastMessage('success', 'Filter ' + destfile + ' generated, Refresh the page to see it');
                    return self.commandRouter.reloadUi();
                } catch (e) {
                    self.logger.info('drc fails to create filter ' + e);
                    self.commandRouter.pushToastMessage('error', 'Fails to generate filter, retry with other parameters' + e);
                };
            } else {
                self.commandRouter.pushToastMessage('error', 'fail  !', 'Sample rate must be set to 96Khz maximum', 'for automatic filter generation');
            };
        } else {
        self.commandRouter.pushToastMessage('error', 'fail  !', 'You must choose a target curve!');
        };
    } else {
    self.commandRouter.pushToastMessage('error', 'fail  !', 'You must choose a file to convert!');
    };
};

// ----------------------------------------------------------------------------
// ....
// ----------------------------------------------------------------------------

/*
/
*/
ControllerBrutefir.prototype.setVolumeParameters = function() {
    var self = this;

    // here we set the volume controller in /volumio/app/volumecontrol.js
    // we need to do it since it will be automatically set to the loopback device by alsa controller
    // to retrieve those values we need to save the configuration of the system, found in /data/configuration/audio_interface/alsa_controller/config.json
    // before enabling the loopback device. We do this in saveHardwareAudioParameters(), which needs to be invoked just before brutefir is enabled
    setTimeout(function() {
        const settings = {
            // need to set the device that brutefir wants to control volume to
            device: self.config.get('alsa_device'),
            // need to set the device name of the original device brutefir is controlling
            name: self.config.get('alsa_outputdevicename'),
            // Mixer name
            mixer: self.config.get('alsa_mixer'),
            // hardware, software, none
            mixertype: self.config.get('alsa_mixer_type'),
            // max volume setting
            maxvolume: self.config.get('alsa_volumemax'),
            // log or linear
            volumecurve: self.config.get('alsa_volumecurvemode'),
            //
            volumestart: self.config.get('alsa_volumestart'),
            //
            volumesteps: self.config.get('alsa_volumesteps')
        }
        console.log(settings)
        // once completed, uncomment

        return self.commandRouter.volumioUpdateVolumeSettings(settings)
    }, 20);
};

/*
/
*/
ControllerBrutefir.prototype.setAdditionalConf = function(type, controller, data) {
    var self = this;

    return self.commandRouter.executeOnPlugin(type, controller, 'setConfigParam', data);
};

/*
/   Restore config of volumio when the plugin is disabled
*/
ControllerBrutefir.prototype.restoresettingwhendisabling = function() {
    var self = this;

    var output_restored = self.config.get('alsa_device')
    var output_label = self.config.get('alsa_outputdevicename')
    var mixert = self.config.get('alsa_mixer')
    var mixerty = self.config.get('mixer_type')
    var str = {
        "output_device": {
            "value": output_restored,
            "label": output_label
        },
        "mixer": {
            "value": mixert,
            "value": mixerty
        }
    }
    self.commandRouter.executeOnPlugin('system_controller', 'i2s_dacs', 'enableI2SDAC', '');

    return self.commandRouter.executeOnPlugin('audio_interface', 'alsa_controller', 'saveAlsaOptions', str);
};