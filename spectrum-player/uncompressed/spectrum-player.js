/***
 *   Spectrum-Player by Haeri 2018
 ***/

class SpectrumPlayer {
    constructor(element) {
        this.version = "1.0.3";

        this.player = element;
        this._createPlayerHTML();

        // Audio player
        this.audio = element.querySelector('audio#player-audio');
        this.source = element.querySelector('source#player-source');

        // UI elements
        this.ui_timelineBar = element.querySelector('.player-timeline');
        this.ui_timelineHead = element.querySelector('.player-timeline .playhead');
        this.ui_timelineBuffer = element.querySelector('.player-timeline .buffer');
        this.ui_volumeBar = element.querySelector('[data-control="volume"]');
        this.ui_volumeKnob = element.querySelector('[data-control="volume"] .volume-knob')
        this.ui_Timer = element.querySelector('.player-timer');
        this.ui_spinner = element.querySelector('.player-controlls .spinner');
        this.ui_playPauseBtn = element.querySelector('[data-control="playpause"]');
        this.ui_nextBtn = element.querySelector('[data-control="next"]');
        this.ui_muteUnmuteBtn = element.querySelector('[data-control="muteunmute"]');
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


        // Initialize
        this._adoptSettings();
        this._initPlaylist();
        this._createSongTitles();
        this._registerAllListeners();

        // Ready first song
        this.playSong(0, false);
    }




    /* ---------------- Public Methods ---------------- */

    // Play the current player
    play() {
        this.audio.play();
        this.isPlaying = true;
        this.ui_playPauseBtn.querySelector('.symbol').classList.add('fa-pause');
        this.ui_playPauseBtn.querySelector('.symbol').classList.remove('fa-play');
        document.title = "\u266B" + "  " + this.playList[this.currentIndex].artist + " - " + this.playList[this.currentIndex].title;

        this._dispatchEvent("onplay", this.playList[this.currentIndex]);
    }

    // Play a selected song with by index from the playlist,
    // and specify if song should start playing or just queue up
    playSong(index, shouldPlay = true) {
        if (index < 0 || index >= this.playList.length) {
            console.log("Index out of bounds!");
            return;
        }

        if (this.connectedPlayer) {
            spectrumPlayers.forEach(function(item, index) {
                if (item.connectedPlayer && item.isPlaying && item != this) {
                    item.pause();
                }
            });
        }

        this.currentIndex = index;
        this.source.src = this.playList[index].src;
        this.audio.currentTime = 0;
        this.audio.volume = this.volume;
        this.audio.muted = this.isMuted;
        this.ui_timelineBuffer.style.width = "0%";

        this.audio.load();
        this._highlightSong(index);
        this._dispatchEvent("onsongchange", this.playList[this.currentIndex]);


        if (shouldPlay) this.play();
    }

    // Play next song
    playNext() {
        this.playSong((this.currentIndex + 1) % (this.playList.length));
    }

    // Play previous song
    playPrev() {
        this.playSong((this.currentIndex - 1) % (this.playList.length));
    }

    // Pause the current player
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.ui_playPauseBtn.querySelector('.symbol').classList.add('fa-play');
        this.ui_playPauseBtn.querySelector('.symbol').classList.remove('fa-pause');
        document.title = originalPageTitle;

        this._dispatchEvent("onpause", this.playList[this.currentIndex]);
    }

    // Mute the player
    mute() {
        this.audio.muted = true;
        this.isMuted = true;
        this.ui_muteUnmuteBtn.querySelector('.symbol').classList.add('fa-volume-mute');
        this.ui_muteUnmuteBtn.querySelector('.symbol').classList.remove('fa-volume-up');
    }

    // Unmute the player
    unmute() {
        this.audio.muted = false;
        this.isMuted = false;
        this.ui_muteUnmuteBtn.querySelector('.symbol').classList.add('fa-volume-up');
        this.ui_muteUnmuteBtn.querySelector('.symbol').classList.remove('fa-volume-mute');
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

    buffer(shouldBuffer){
        if(shouldBuffer)
            this.ui_spinner.classList.add("show");
        else
            this.ui_spinner.classList.remove("show");
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
                    }else if(self.audio.paused){
                        self.audio.play();
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

        // Register player head to follow the song progress
        this.audio.addEventListener('timeupdate', function() {
            if(self._isBuffering){
                self._isBuffering = false;
                self.buffer(false);
            }

            
            var length = self.audio.duration;

            if (isNaN(length)) return false;

            var current_time = self.audio.currentTime;
            var totalLength = self._calculateTotalValue(length);
            var currentTime = self._calculateCurrentValue(current_time);

            self.ui_Timer.innerHTML = currentTime + " / " + totalLength;
            self.ui_timelineHead.style.width = (current_time / length) * 100 + "%";
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

        this.audio.addEventListener('waiting', function bufferUpdate() {
            self._isBuffering = true;
            self.buffer(true);
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
    _createPlayerHTML() {
        this.player.insertAdjacentHTML('afterbegin',
            '<div class="player-header">' +
            '<audio id="player-audio" class="hidden-audio" preload="none">' +
            '<source id="player-source"></source>' +
            '</audio>' +
            '<div class="player-controlls">' +
            '<a href="#" class="player-control" data-control="playpause">' +
            '<i class="symbol fas fa-play"></i>' +
            '</a>' +
            '<a href="#" class="player-control" data-control="next">' +
            '<i class="fas fa-step-forward"></i>' +
            '</a>' +
            '<span class="player-timer player-control">00:00 / 00:00</span>' +
            '<a href="#" class="player-control" data-control="muteunmute">' +
            '<i class="symbol fas fa-volume-up"></i>' +
            '</a>' +
            '<div class="player-control player-volume" data-control="volume">' +
            '<div class="bar-back"></div>' +
            '<div class="volume-knob"></div>' +
            '</div>' +
            '<i class="spinner fas fa-circle-notch fa-spin"></i>' +
            '</div>' +
            '</div>' +
            '<div class="player-timeline">' +
            '<div class="bar-back"></div>' +
            '<div class="buffer"></div>' +
            '<div class="playhead"></div>' +
            '</div>'
        );
    }

    // Fill ancker tags with song infos
    _createSongTitles() {
        for (var i = 0; i < this.playList.length; i++) {
            this.playList[i].element.innerHTML = this.playList[i].artist + " - " + this.playList[i].title;
        }
    }

    // Create the playlist object from the elements in DOM
    _initPlaylist() {
        var arr = this.player.querySelectorAll('.player-body ol li a');
        for (var i = 0; i < arr.length; i++) {
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

    _calculateTotalValue(length) {
        var minutes = Math.floor(length / 60),
            seconds_int = length - minutes * 60,
            seconds_str = seconds_int.toString(),
            seconds = seconds_str.substr(0, 2),
            time = minutes + ':' + seconds

        return time;
    }

    _calculateCurrentValue(currentTime) {
        var current_hour = parseInt(currentTime / 3600) % 24,
            current_minute = parseInt(currentTime / 60) % 60,
            current_seconds_long = currentTime % 60,
            current_seconds = current_seconds_long.toFixed(),
            current_time = (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);

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