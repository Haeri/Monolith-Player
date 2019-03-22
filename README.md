# Spectrum-Player 
#### Version 1.0.7

Spectrum is a simple HTML5 audio player. It is written in HTML and vanilla JavaScript and therefore fully customizable. Spectrum comes with no default style-sheet, which means that you can either completely style the player as you want or use a pre-made style.

![screenshot_1](https://user-images.githubusercontent.com/7956606/54828167-e23cc080-4cb3-11e9-9b0f-a25f8011ea05.png)




## Demo

[Demo Page](https://haeri.github.io/Spectrum-Player/docs)



## Usage

1. Include the `spectrum-player.js` or `spectrum-player.min.js` into the html body to make the player functional.  
`<script src="spectrum-player.js"></script>`

2. Include the style-sheet of your choice. For example the *Chrome* style: `spectrum-chrome.css` or `spectrum-chrome.min.css` into the html header document to style the player.  
`<link href="spectrum-chrome.css" rel="stylesheet">`

3. Currently [Font-Awesome](https://fontawesome.com/how-to-use/on-the-web/setup/getting-started?using=web-fonts-with-css) is required to display the icons (will be removed later on). 

4. Create the html structure for the player
```html
<div class="spectrum-player">
  <div id="spectrum-body">
    <ol>
      <li>
        <a class="song-item" 
	   data-src="[AUDIO_SOURCE*]" 
	   data-artist="[ARTIST_NAME]" 
	   data-title="[SONG_TITLE*]" 
	   data-img="[ALBUM_ARTWORK]">
        </a>
      </li>
    </ol>
  </div>
</div>
```
###### * marked are mandatory
Make sure to include the `data-src` in the anchor tag of the song so the audio can be loaded. You can add as many `<li>` tags with songs as you wish.


## Settings

A few behavior settings can be set using the data attributes. The data attributes should be attached to the `spectrum-player` class.  
Example `<div class="spectrum-player" data-connected="true" ></div>`

Following are the possible attributes:

| Attribute | Default | Description |
| --- | :---: | --- |
| `connected` | true | As it is allowed to have many players loaded on the same page, it is sometimes desired to only allow one player at the time to be playing. If set to true, the player makes sure to first pause all other non connected playing players and then plays the selected song. |
| `volume` | 0.75 | The volume specifies what percentage the volume should be initially set to. |
| `loop-set` | false | Loop set specifies weather the entire play list should be replayed after the last song ends. |
| `play-next` | true | Play next specifies if the player should automatically play the next song when the previous one has ended. |


## Advanced Usage

### AJAX
If a spectrum player needs to be initialized after the window has already loaded, the function `initSpectrumPlayers()` can be invoked to initialized all remaining uninitialized players. This can be especially handy, if the spectrum player was loaded asynchronously via AJAX.

### Events
Spectrum player offers integration for custom JavaScript events:

| Event | Description |
| --- | --- |
| `onplay` | This event is dispatched whenever the player starts playing an audio track |
| `onpause` | This event is dispatched whenever the player pauses playing an audio track |
| `onsongchange` | This event is dispatched whenever the player changes the audio track |

Custom functions can be registered by calling for example  
`spectrum.addEventListener('onplay', function(e) { console.log(e); });`



## TODO

- Random playlist
- Use own SVG for icons to eliminate font-awesome
- Audio spectrum
- Allow to add custom player-header html
