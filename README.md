# Spectrum-Player

Spectrum is a simple HTML5 audio player. It is written in HTML and vanilla JavaScript and therefore fully customizable. 

![screenshot_3](https://user-images.githubusercontent.com/7956606/47041765-fd962380-d189-11e8-9077-438473d71f85.png)




## Demo

[Demo Page](https://haeri.github.io/Spectrum-Player/)



## Usage

1. Include the `style.css` or `style.min.css`into the html header document to style the player.  
`<link href="style.css" rel="stylesheet">`

2. Include the `spectrum-player.js` or `spectrum-player.min.js`into the html body to make the player functional.  
`<script src="spectrum-player.js"></script>`

3. Currently [Font-Awesome](https://fontawesome.com/how-to-use/on-the-web/setup/getting-started?using=web-fonts-with-css) is required to display the icons (will be removed later on). 

4. Create the html structure for the player
```html
<div class="spectrum-player">
  <div class="player-body">
    <ol>
      <li>
        <a class="song-item" data-src="[AUDIO_SOURCE]" data-artist="[ARTIST_NAME]" data-title="[SONG_TITLE]">
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



## TODO

- Use own SVG for icons to eliminate font-awesome
- Give a possibility to set accent color through data-attribute
- Auto fill a tag content with song info from data attributes
- Visualize when audio is buffering
- Maybe some callbacks so that cool animations can be created