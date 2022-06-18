# MxVideo
Matrix widget for watching YouTube videos with others.  

The widget uses the YouTube iframe API to display the video. When a user pauses/resumes or seeks the video, a state event is sent to the room, users with the widget open will replicate the player state. If a user opens the widget and the video isn't paused, they will fetch the latest state event and apply the difference between event timestamp and current time to the video position, allowing for the video to keep "playing" without having anyone with the widget open.  

It's recommended to use this widget in a room with as few federated homeservers as possible to reduce latency, unless your server can propagate events in a timely manner.

## Ussage
Serve the root of the repo as static files and add the widget to your room with `/addwidget {server url}/index.html?widgetId=$matrix_widget_id`

## Known issues
* Cannot change videos yet
* YouTube iframe has no seek event
	* Seeking less than 3 seconds will not change the player state.
	* Current time update updates every 0-5 seconds, which can result in random jumps in the video position if it's above 3 seconds.  
* When another user seeks the video, it might buffer until it's paused or unpaused.