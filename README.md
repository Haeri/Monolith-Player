# Spectrum-Player

Spectrum is a simple HTML5 audio player. It is written in HTML and therefore fully customizable. 

![screenshot_1](https://user-images.githubusercontent.com/7956606/47038618-37fbc280-d182-11e8-86d4-42c974c76a77.png)


## Usage

1. Include the `style.css` or `style.min.css`into the html header document to style the player.  
`<link href="style.css" rel="stylesheet">`

2. Include the `spectrum-player.js` or `spectrum-player.min.js`into the html body to make the player functional.  
`<script src="spectrum-player.js"></script>`

3. Create the html structure for the player
```html
<div class="spectrum-player">
  <div class="player-body">
    <ol>
      <li>
        <a href="#" class="song-item" data-src="[AUDIO_SOURCE]" data-artist="[ARTIST_NAME]" data-title="[SONG_TITLE]">
          [SONG_TITLE]
        </a>
      </li>
    </ol>
  </div>
</div>
```
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
