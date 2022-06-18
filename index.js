function parseFragment() {
	const fragmentString = (window.location.hash || "?");
	const search = new URLSearchParams(fragmentString.substring(Math.max(fragmentString.indexOf('?'), 0)));
	const object = {};
	for (const key of search.keys()) {
		object[key] = search.get(key);
	}
	return object;
}

const params = parseFragment();

const evtype = "link.ryhn.mxvideo";
const playback_key = "playback";

var player;
var playing = true;
var progress = 0.0;
var speed = 1;

var disablestateupdate = true;

function updatePlayer() {
	disablestateupdate = true;

	if (progress != NaN) player.seekTo(progress);

	if (playing) player.playVideo();
	else player.pauseVideo();

	player.setPlaybackRate(speed);
	disablestateupdate = false;
}

// Start widget API
const widgetApi = new mxwidgets.WidgetApi(params['widgetId']);
// Request permissions
widgetApi.requestCapabilityToReceiveState(evtype);
widgetApi.requestCapabilityToSendState(evtype);
widgetApi.on("ready", () => {
	// Permissions accepted
	widgetApi.readStateEvents(evtype, 1, playback_key).then((events) => {

		if (events.length > 0) {
			var ts = events[0].origin_server_ts;
			var now = Date.now();
			var diff = now - ts;

			var playback = events[0].content;

			playing = playback.playing;
			if (playing) progress = parseFloat(playback.progress) + (diff / 1000);
			else progress = parseFloat(playback.progress);
			speed = playback.speed;
		}

		if (player != undefined)
			updatePlayer();
	});
});

var ignoreevbody;
widgetApi.on(`action:${mxwidgets.WidgetApiToWidgetAction.SendEvent}`, (ev) => {
	var event = ev.detail.data;

	if (event.type == evtype) {
		// TODO: find a better way to compare contents
		if (JSON.stringify(event.content) == JSON.stringify(ignoreevbody)) return;

		var ts = event.origin_server_ts;
		var now = Date.now();
		var diff = now - ts;

		playing = event.content.playing;
		if (playing) progress = parseFloat(event.content.progress) + (diff / 1000);
		else progress = parseFloat(event.content.progress);
		speed = event.content.speed;

		updatePlayer();
	}

	// ack
	ev.preventDefault();
	widgetApi.transport.reply(ev.detail, {});
});
widgetApi.start();

function ytReady() {


	updatePlayer();
}

function updateState() {
	var dat = {};
	dat.playing = playing;
	dat.progress = progress.toString();
	dat.speed = speed;

	widgetApi.sendStateEvent(evtype, playback_key, dat);
	ignoreevbody = dat;
}

function ytStateChanged(event) {
	// After seeking, it might buffer and won't play even if it was playing before
	if (event.data == YT.PlayerState.CUED)
		player.playVideo();

	if (disablestateupdate) return;

	progress = player.getCurrentTime();

	if (event.data == YT.PlayerState.PLAYING && !playing) {
		playing = true;
		progress = player.getCurrentTime();
		updateState();
	}

	if (event.data == YT.PlayerState.PAUSED && playing) {
		playing = false;
		progress = player.getCurrentTime();
		updateState();
	}
}

function ytSpeedChanged(event) {
	speed = event.data;
}

function onYouTubeIframeAPIReady() {
	player = new YT.Player('video-placeholder', {
		width: "100%",
		height: "100%",
		videoId: 'Xa0Q0J5tOP0',
		playerVars: {
			playlist: 'Xa0Q0J5tOP0,taJ60kskkns,FG0fTKAqZ5g'
		},
		events: {
			onReady: ytReady,
			onStateChange: ytStateChanged,
			onPlaybackRateChange: ytSpeedChanged
		}
	});
}