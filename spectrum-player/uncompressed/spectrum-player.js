/***
 *   Spectrum-Player by Haeri 2018
 ***/

class SpectrumPlayer {
    constructor(element, customTemplate) {
        this.version = "1.0.7";

        this.player = element;
        this._createPlayerHTML(customTemplate);

        // Audio player
        this.audio = element.querySelector('audio#spectrum-audio');
        this.source = element.querySelector('source#spectrum-source');

        // UI elements
        this.ui_timelineBar = element.querySelector('#spectrum-timeline');
        this.ui_timelineHead = element.querySelector('#spectrum-timeline .spectrum-value');
        this.ui_body = element.querySelector('#spectrum-body');
        
        this.ui_timelineBuffer = element.querySelector('#spectrum-timeline .spectrum-buffer');
        this.ui_volumeBar = element.querySelector('#spectrum-volume[data-control="volume"]');
        this.ui_volumeKnob = element.querySelector('#spectrum-volume[data-control="volume"] .spectrum-value')
        this.ui_time = element.querySelector('#spectrum-time');
        this.ui_duration = element.querySelector('#spectrum-duration');
        this.ui_spinner = element.querySelector('#spectrum-buffering');
        this.ui_art = element.querySelector('#spectrum-art');
        this.ui_playPauseBtn = element.querySelector('#spectrum-playpause[data-control="playpause"]');
        this.ui_prevBtn = element.querySelector('#spectrum-prev[data-control="prev"]');
        this.ui_nextBtn = element.querySelector('#spectrum-next[data-control="next"]');
        this.ui_muteUnmuteBtn = element.querySelector('#spectrum-muteunmute[data-control="muteunmute"]');

        this.ui_currentSong;

        // Player variables
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isMuted = false;
        this.playList = [];

        // Player Settings
        this.volume;
        this.shouldLoopSet;
        this.shouldPlayNext;
        this.connectedPlayer;

        // Custom events
        this._eventMap = {};
        this._isScrubbing = false;
        this._isBuffering = false;

        // Constants
        this.ERROR_TITLE = "Spectrum Player Error: ";


        // Initialize
        this._adoptSettings();
        this._initPlaylist();
        this._createSongTitles();
        this._registerAllListeners();

        // Ready first song
        this.playSong(0, true);
    }




    /* ---------------- Public Methods ---------------- */

    // Play the current player
    play() {
        this.isPlaying = true;
        if (this.connectedPlayer) {
            var self = this;
            spectrumPlayers.forEach(function(item, index) {
                if (item.connectedPlayer && item.isPlaying && item != self) {
                    item.pause();
                }
            });
        }

        try{
            this.audio.play();
            this.ui_playPauseBtn.querySelector('.spectrum-icon').classList.add('fa-pause');
            this.ui_playPauseBtn.querySelector('.spectrum-icon').classList.remove('fa-play');
            this.ui_body.scrollTop = this.playList[this.currentIndex].element.offsetTop;
            document.title = "\u266B" + "  " + this._getSongTitle(this.currentIndex);

            this._dispatchEvent("onplay", this.playList[this.currentIndex]);
        }catch(e){ 
            this.audio.pause();
        }
    }

    // Play a selected song with by index from the playlist,
    // and specify if song should start playing or just queue up
    playSong(index, first = false) {
        this.audio.pause();     // This prevents firefox from spasing out

        if (index < 0 || index >= this.playList.length) {
            console.error(this.ERROR_TITLE, "Index " + index +  " out of bounds!");
            return;
        }

        this.currentIndex = index;
        this.source.src = this.playList[index].src;
        this.audio.currentTime = 0;
        this.audio.volume = this.volume;
        this.audio.muted = this.isMuted;
        this.ui_timelineBuffer.style.width = "0%";
        this.ui_timelineHead.style.width = "0%";
        if(this.playList[index].img !== undefined)
            this.ui_art.style.backgroundImage = "url('" +  this.playList[index].img +"')";
        else
            this.ui_art.style.backgroundImage = "none";

        this._highlightSong(index);
        try{
            this.audio.load();
            this._dispatchEvent("onsongchange", this.playList[this.currentIndex]);

            if (!first) this.play(); 
        }catch(e){}
    }

    // Play next song
    playNext() {
        this.playSong((this.currentIndex + 1) % (this.playList.length));
    }

    // Play previous song
    playPrev() {
        this.playSong(((this.currentIndex - 1) + this.playList.length) % (this.playList.length));
    }

    // Pause the current player
    pause() {
        this.isPlaying = false;
        this.audio.pause();
        this.ui_playPauseBtn.querySelector('.spectrum-icon').classList.add('fa-play');
        this.ui_playPauseBtn.querySelector('.spectrum-icon').classList.remove('fa-pause');
        document.title = originalPageTitle;

        this._dispatchEvent("onpause", this.playList[this.currentIndex]);
    }

    // Mute the player
    mute() {
        this.audio.muted = true;
        this.isMuted = true;
        this.ui_muteUnmuteBtn.querySelector('.spectrum-icon').classList.add('fa-volume-mute');
        this.ui_muteUnmuteBtn.querySelector('.spectrum-icon').classList.remove('fa-volume-up');
    }

    // Unmute the player
    unmute() {
        this.audio.muted = false;
        this.isMuted = false;
        this.ui_muteUnmuteBtn.querySelector('.spectrum-icon').classList.add('fa-volume-up');
        this.ui_muteUnmuteBtn.querySelector('.spectrum-icon').classList.remove('fa-volume-mute');
    }

    // Set desired volume for the player
    setVolume(percent) {
        percent = this._clamp(percent, 0, 1);

        this.unmute();
        this.audio.volume = percent;
        this.volume = percent;

        this.ui_volumeKnob.style.width = percent * 100 + "%";
    }

    // Add cunstom functions to certain events
    addEventListener(name, func) {
        if (!(name in this._eventMap)) {
            this._eventMap[name] = new Array();
        }
        this._eventMap[name].push(func);
    }

    // Remove cunstom functions to certain events
    removeEventListener(name, func) {
        if (name in this._eventMap) {
            var arr = this._eventMap[name];
            if (arr === undefined) return;

            var index = arr.indexOf(func);
            if (index !== -1) arr.splice(index, 1);
            this._eventMap[name] = arr;
        }
    }


    /* ---------------- Private Methods ---------------- */

    // Execute custom function for the appropriate event
    _dispatchEvent(name, data) {
        var arr = this._eventMap[name];
        if (arr === undefined) return;

        for (var i = 0; i < arr.length; i++) {
            arr[i](data);
        }
    }

    // Get settings from html and set them
    _adoptSettings() {
        this.connectedPlayer = this._getData(this.player, "connected", true);
        this.volume = this._getData(this.player, "volume", 0.75);
        this.shouldLoopSet = this._getData(this.player, "loopSet", false);
        this.shouldPlayNext = this._getData(this.player, "playNext", true);

        this.setVolume(this.volume);
    }

    // Activate/Deactivate buffering notification
    _buffer(shouldBuffer){
        if(shouldBuffer)
            this.ui_spinner.classList.add("show");
        else
            this.ui_spinner.classList.remove("show");
    }

    // Register all listeners to the necessary elements
    _registerAllListeners() {
        var self = this;

        // Register play/pause controll
        this.ui_playPauseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (self.isPlaying) {
                self.pause();
            } else {
                self.play();
            }
            return false;
        });

        // Register playhead controll
        this.ui_timelineBar.addEventListener('mousedown', function(e) {
            // Only react to left clicks
            if (e.which == 1) {
                document.addEventListener('mousemove', scrubb);
                document.addEventListener('mouseup', function onUp(e) {
                    playheadChange(e);

                    document.removeEventListener('mouseup', onUp);
                    document.removeEventListener('mousemove', scrubb);
                });

                function scrubb(e){
                    pauseEvent(e);
                    self._isScrubbing = true;
                    var elLeft = e.clientX - self.ui_timelineBar.getBoundingClientRect().left;
                    var percent = self._clamp(elLeft / self.ui_timelineBar.offsetWidth, 0, 1);
                    self.audio.currentTime = percent * self.audio.duration;
                    self.ui_timelineHead.style.width = percent * 100 + "%";
                    return percent;
                }

                function playheadChange(e) {
                    var percent = scrubb(e);
                    self._isScrubbing = false;

                    if(percent >= 0.99){
                        self.audio.dispatchEvent(new Event('ended'));
                    }
                }
            }
        });

        // Register mouse scroll volume controll
        this.ui_volumeBar.addEventListener('mouseenter', function(e) {
            window.onwheel = function(e) {
                e.preventDefault();
                var percent = (self.volume + (0.02 * Math.sign(e.deltaY)));
                self.setVolume(percent);
            }
        });
        this.ui_volumeBar.addEventListener('mouseleave', function(e) {
            window.onwheel = null;
        });

        // Register mouse click and drag volume controll
        this.ui_volumeBar.addEventListener('mousedown', function(e) {
            // Only react to left clicks
            if (e.which == 1) {
                document.addEventListener('mousemove', volumeChange);
                document.addEventListener('mouseup', function onUp(e) {
                    volumeChange(e);
                    document.removeEventListener('mouseup', onUp);
                    document.removeEventListener('mousemove', volumeChange);
                });

                function volumeChange(e) {
                    pauseEvent(e);
                    var elLeft = e.clientX - self.ui_volumeBar.getBoundingClientRect().left;
                    var percent = elLeft / self.ui_volumeBar.offsetWidth;
                    self.setVolume(percent);
                }
            }
        });

        // Register mute/unmute controll
        this.ui_muteUnmuteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (self.isMuted) {
                self.unmute();
            } else {
                self.mute();
            }
            return false;
        });

        // Register to play song on click on the playlist item
        this.playList.forEach(function(song, index) {
            song.element.addEventListener('click', function(e) {
                e.preventDefault();
                self.playSong(index);
                return false;
            });
        });

        // Register to play next        
        this.ui_nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            self.playNext();
            return false;
        });

        // Register to play previous        
        this.ui_prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            self.playPrev();
            return false;
        });

        // Bind Mute event
        this.audio.addEventListener('volumechange', function(e) {
            if(self.audio.muted)
                self.mute()
            else 
                self.unmute()
        });

        // Bind play/pause events
        this.audio.addEventListener('play', function() { 
            if (!self.isPlaying) {
                self.play(); 
            }
        });        
        this.audio.addEventListener('pause', function() { 
            if (self.isPlaying) {
                self.pause(); 
            }
        });        

        // Register player head to follow the song progress
        this.audio.addEventListener('timeupdate', function() {
            if(self._isBuffering){
                self._isBuffering = false;
                self._buffer(false);
            }

            var length = self.audio.duration;
            var currentTime = self.audio.currentTime;

            if (isNaN(length)) return;

            var length_ui = self._calculateCurrentValue(length);
            var currentTime_ui = self._calculateCurrentValue(currentTime);

            self.ui_time.innerHTML = currentTime_ui;
            self.ui_duration.innerHTML = length_ui;
            self.ui_timelineHead.style.width = (currentTime / length) * 100 + "%";
        });

        // Register to play next song when current one is finished
        this.audio.addEventListener('ended', function() {
            // Abbort if is spuling
            if(self._isScrubbing) return; 

            if (!self.shouldPlayNext) {
                self.pause();
                return;
            }
            if (self.currentIndex == self.playList.length - 1) {
                if (self.shouldLoopSet) {
                    self.playSong(0);
                } else {
                    self.pause();
                }
            } else {
                self.playSong(self.currentIndex + 1);
            }
        });

        // Register buffer to update
        this.audio.addEventListener('progress', function bufferUpdate() {
            var duration =  self.audio.duration;
            if (duration > 0) {
              for (var i = 0; i < self.audio.buffered.length; i++) {
                    if (self.audio.buffered.start(self.audio.buffered.length - 1 - i) <= self.audio.currentTime) {
                        self.ui_timelineBuffer.style.width = (self.audio.buffered.end(self.audio.buffered.length - 1 - i) / duration) * 100 + "%";
                        break;
                    }
                }
            }            
        });

        // Register buffer animation
        this.audio.addEventListener('waiting', function bufferUpdate() {
            self._isBuffering = true;
            self._buffer(true);
         });

        function pauseEvent(e){
            if(e.stopPropagation) e.stopPropagation();
            if(e.preventDefault) e.preventDefault();
            e.cancelBubble=true;
            e.returnValue=false;
            return false;
        }
    }

    // Highlight the currently playing song
    _highlightSong(index) {
        if (this.ui_currentSong !== undefined)
            this.ui_currentSong.classList.remove('active');
        this.ui_currentSong = this.playList[index].element;
        this.ui_currentSong.classList.add('active');
    }

    // Generate the player html
    _createPlayerHTML(custom) {
        var htmltree =  '<div id="spectrum-art"></div>' +
                        '<div id="spectrum-header">' +
                            '<audio id="spectrum-audio" preload="none">' +
                                '<source id="spectrum-source"></source>' +
                            '</audio>' +
                            '<div id="spectrum-controlls">' +
                                '<a class="spectrum-control" id="spectrum-prev" data-control="prev">' +
                                    '<i class="spectrum-icon fas fa-step-backward"></i>' +
                                '</a>' +
                                '<a class="spectrum-control" id="spectrum-playpause" data-control="playpause">' +
                                    '<i class="spectrum-icon fas fa-play"></i>' +
                                '</a>' +
                                '<a class="spectrum-control" id="spectrum-next" data-control="next">' +
                                    '<i class="spectrum-icon fas fa-step-forward"></i>' +
                                '</a>' +
                                '<span class="spectrum-info" id="spectrum-time">00:00</span>' +
                                '<span class="spectrum-info" id="spectrum-time-separator"> / </span>' +
                                '<span class="spectrum-info" id="spectrum-duration">00:00</span>' +
                                '<a class="spectrum-control" id="spectrum-muteunmute" data-control="muteunmute">' +
                                    '<i class="spectrum-icon fas fa-volume-up"></i>' +
                                '</a>' +
                                '<div class="spectrum-control" id="spectrum-volume" data-control="volume">' +
                                    '<div class="spectrum-bar-back"></div>' +
                                    '<div class="spectrum-value"></div>' +
                                '</div>' +
                                '<span class="spectrum-info" id="spectrum-buffering">' +
                                    '<i class="spectrum-icon fas fa-circle-notch fa-spin"></i>' +
                                '</span>' +
                            '</div>' +
                            '<div class="spectrum-control" id="spectrum-timeline" data-control="timeline">' +
                                '<div class="spectrum-bar-back"></div>' +
                                '<div class="spectrum-buffer"></div>' +
                                '<div class="spectrum-value"></div>' +
                            '</div>'
                        '</div>';
                            

        if(custom !== undefined)
            htmltree = custom;

        this.player.insertAdjacentHTML('afterbegin', htmltree);
    }

    // Fill ancker tags with song infos
    _createSongTitles() {
        for (var i = 0; i < this.playList.length; i++) {
            this.playList[i].element.innerHTML = this._getSongTitle(i);
        }
    }

    // Create the playlist object from the elements in DOM
    _initPlaylist() {
        var arr = this.player.querySelectorAll('#spectrum-body ol li a');
        for (var i = 0; i < arr.length; i++) {
            if(arr[i].dataset.title === undefined || arr[i].dataset.src === undefined){
                console.error(this.ERROR_TITLE, "Item at index " + i +  " has missing data attributes (data-title or data-src)\n", arr[i]);
                arr[i].innerHTML = "-";
                continue;
            }

            this.playList.push({
                index: i,
                element: arr[i],
                title: arr[i].dataset.title,
                artist: arr[i].dataset.artist,
                src: arr[i].dataset.src,
                img: arr[i].dataset.img,
            });
        };
    }

    // Get song title. Artist + title if artist is set
    _getSongTitle(index) {
        if(this.playList[index].artist !== undefined)
            return this.playList[index].artist + " - " + this.playList[index].title;
        else
            return this.playList[index].title;
    }

    // Get parsed data attribute from element
    _getData(element, name, def) {
        var tmp = element.dataset[name];
        if (tmp === undefined) return def; // return default if not set
        if (tmp === "") return true; // return true if only attibute is set
        return JSON.parse(tmp); // Parse to type
    }

    // Clamp a value from min to max
    _clamp(num, min, max) {
        return num <= min ? min : num >= max ? max : num;
    }

    // Seconds to two digit display
    _calculateCurrentValue(currentTime) {
        var current_hour = parseInt(currentTime / 3600) % 24;
        var current_minute = parseInt(currentTime / 60) % 60;
        var current_seconds_long = currentTime % 60;
        var current_seconds = current_seconds_long.toFixed();
        var current_time = (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);

        return current_time;
    }
}

function initSpectrumPlayers() {
    var players = document.querySelectorAll('.spectrum-player');
    for (var i = 0; i < players.length; i++) {
        if (players[i].initialized === undefined) {
            spectrumPlayers.push(new SpectrumPlayer(players[i]));
            players[i].initialized = true;
        }
    }
}

var spectrumPlayers = [];
var originalPageTitle;

window.addEventListener('load', function() {
    originalPageTitle = document.title;
    initSpectrumPlayers();
});