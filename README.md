# video_stream


## Webcamera used:

* **a4tech pk-635**: could only output MJPEG format hence the convertion first in the gstreamer pipleline. Using a different web camera may need a different pipeline especially if it could output h264 already.

* **multiple camera**: could tell which camera to use by specifying the device key word.
Example: `gst-launch-1.0 v4l2src device=/dev/dev0 ! <rest of the pipeline>`

### Run docker container and visit device url /playlist.m3u8

## Testing gstreamer:

### MJPEG RTP stream

1. On Windows:
`gst-launch-1.0.exe -e -v udpsrc port=5001 ! application/x-rtp, encoding-name=JPEG, payload=26 ! rtpjpegdepay ! jpegdec ! autovideosink`

2. On Pi:
`gst-launch-1.0 v4l2src device=/dev/video0 ! jpegenc ! rtpjpegpay ! udpsink host=<WINDOWS_IP> port=5001`

### H264 RTP stream

1. On Windows:
`gst-launch-1.0 -v udpsrc port=5001 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" ! rtph264depay ! decodebin ! videoconvert ! autovideosink`

2. On Pi:
`gst-launch-1.0 -v v4l2src device=/dev/video0 do-timestamp=true ! videoconvert ! videoscale ! videorate ! video/x-raw,framerate=10/1,width=480,height=360 ! x264enc ! rtph264pay ! udpsink host=<WINDOWS_IP> port=5001`


### Using Pi Camera H264 stream

1. On PI:
`gst-launch-1.0 -e v4l2src do-timestamp=true ! video/x-h264,width=640,height=480,framerate=30/1 ! h264parse ! queue ! rtph264pay config-interval=1 pt=96 ! gdppay!  udpsink host=192.168.100.8 port=5001`

2. On Windows:
`gst-launch-1.0 -v udpsrc port=5001 ! gdpdepay ! rtph264depay ! avdec_h264 ! autovideosink sync=false text-overlay=false`

### Creating an HLS sink from A4tech pk-635
We could also specify where the playlist is supposed to be stored. TODO

`gst-launch-1.0 -v v4l2src  device=/dev/video0 do-timestamp=true ! videoconvert ! videoscale ! videorate ! video/x-raw,framerate=10/1,width=480,height=360 ! x264enc ! h264parse ! hlssink2 max-files=10`

`gst-launch-1.0 -v v4l2src  device=/dev/video0 !  videoconvert ! videoscale ! videorate ! video/x-raw,framerate=10/1,width=480,height=360 ! x264enc !  mpegtsmux ! hlssink max-files=10 `



**TODO: expose RTP stream for realtime streaming**
