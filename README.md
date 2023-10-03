# spotify-datavis

## Spotify API
We have used Spotify's api to get the genre of each track and augmented the dataset with this info.

The genre is foremost chosen by the album of the track. If no genre is assigned to the album, then the genre is decided by a union of the genres from all artists associated with the track.

### Usage
To replicate, make sure to add a .env file. This file needs the following information:

- CLIENT\_ID='YourSpotifyApiClientId'
- CLIENT\_SECRET='YourSpotifyApiClientSecret'

If this is added correctly, then during the first run of the program, two additional fields will be added containing the Bearer token and an expiral timestamp.
