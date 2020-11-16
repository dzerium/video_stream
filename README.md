# video_stream

## Webcamera used:

- **a4tech pk-635**: could only output MJPEG format hence the convertion first in the gstreamer pipleline. Using a different web camera may need a different pipeline especially if it could output h264 already.

- **multiple camera**: could tell which camera to use by specifying the device key word.
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
   `gst-launch-1.0 -v v4l2src device=/dev/video0 do-timestamp=true ! videoconvert ! videoscale ! videorate ! video/x-raw,framerate=10/1,width=480,height=360 ! x264enc ! rtph264pay ! udpsink host=192.168.100.4 port=3000`

### Using Pi Camera H264 stream

1. On PI:
   `gst-launch-1.0 -e v4l2src do-timestamp=true ! video/x-h264,width=640,height=480,framerate=30/1 ! h264parse ! queue ! rtph264pay config-interval=1 pt=96 ! gdppay! udpsink host=192.168.100.8 port=5001`

2. On Windows:
   `gst-launch-1.0 -v udpsrc port=5001 ! gdpdepay ! rtph264depay ! avdec_h264 ! autovideosink sync=false text-overlay=false`

### Creating an HLS sink from A4tech pk-635

We could also specify where the playlist is supposed to be stored. TODO

1. using hlssink2
   `gst-launch-1.0 -v v4l2src device=/dev/video0 do-timestamp=true ! videoconvert ! videoscale ! videorate ! video/x-raw,framerate=10/1,width=480,height=360 ! x264enc ! h264parse ! hlssink2 max-files=10`

2. using hlssink
   `gst-launch-1.0 -v v4l2src device=/dev/video0 ! videoconvert ! videoscale ! videorate ! video/x-raw,framerate=10/1,width=480,height=360 ! x264enc tune=zerolatency bitrate=500 speed-preset=superfast ! mpegtsmux ! hlssink max-files=10 `

### UDP multicast

## tested to be working (will try with vlc)

1. On Windows:
   `gst-launch-1.0.exe -e -v udpsrc multicast-group=224.1.1.1 auto-multicast=true port=3000 ! application/x-rtp, encoding-name=JPEG, payload=26 ! rtpjpegdepay ! jpegdec ! autovideosink`

2. On Pi:
   `gst-launch-1.0 v4l2src device=/dev/video0 ! jpegenc ! rtpjpegpay ! udpsink host=224.1.1.1 auto-multicast=true port=3000`

**TODO: expose RTP stream for realtime streaming**

### TEESTS

1. Pi Camera

## pi: raspivid -t 0 -n -l -o tcp://192.168.100.18:1234

## vlc: tcp/h264://192.168.100.18:1234

## pi: `gst-launch-1.0 -v v4l2src device=/dev/video0 do-timestamp=true ! videoconvert ! videoscale ! videorate ! video/x-raw,framerate=10/1,width=480,height=360 ! x264enc key-int-max=12 byte-stream=true ! tcpserversink host=192.168.100.18 port=3000`

## vlc: tcp/h264://192.168.100.18:3000

## pi: raspivid -t 0 -w 1280 -h 720 -fps 25 -b 5000000 -o udp://224.1.1.1:3000

## pi: v4l2rtspserver /dev/video0 &

## vlc: rtsp://{IPAddressOfYourPI}:8554/unicast

## raspivid -o - -t 0 -hf -w 800 -h 400 -fps 24 |cvlc -vvv stream:///dev/stdin --sout '#standard{access=http,mux=ts,dst=:8160}' :demux=h264

## I do not know why port has to be 8160. I tried binding it to 3000 but it failed

1.  `gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! videoscale ! videorate ! video/x-raw,width=480,height=360,framerate=25/1 ! jpegenc ! rtpjpegpay ! gdppay ! udpsink host=224.1.1.1 auto-multicast=true port=5000`

2.  `gst-launch-1.0 -v v4l2src device=/dev/video0 do-timestamp=true ! videoconvert ! videoscale ! videorate ! video/x-raw,framerate=25/1,width=480,height=360 ! x264enc ! rtph264pay config-interval=10 pt=96 ! udpsink host=127.0.0.1 port=5000`

3.  `gst-launch-1.0 videotestsrc ! jpegenc ! rtpjpegpay ! udpsink host=127.0.0.1 port=5001`

4.  `gst-launch-1.0 -v v4l2src device=/dev/video0 do-timestamp=true ! videoconvert ! videoscale ! videorate ! video/x-raw,framerate=10/1,width=480,height=360 ! queue ! x264enc ! h264parse ! mpegtsmux ! rtpmp2tpay ! udpsink host=224.1.1.1 port=5001 auto-multicast=true`

5.  `gst-launch-1.0 -v v4l2src device=/dev/video0 do-timestamp=true ! videoconvert ! videoscale ! videorate ! video/x-raw,framerate=10/1,width=480,height=360 ! queue ! x264enc ! h264parse ! mpegtsmux ! rtpmp2tpay ! udpsink host=192.168.0.123 port=5555`

6.  `gst-launch-1.0 -v v4l2src device=/dev/video1 do-timestamp=true ! videoconvert ! videoscale ! videorate ! video/x-raw,width=1280, height=800,framerate='(fraction)'20/1 ! autovideoconvert ! x264enc ! queue ! h264parse config-interval=1 ! rtph264pay pt=96 ! udpsink host=224.1.1.1 port=5000 sync=false auto-multicast=true`

gst-launch-1.0 -v v4l2src device=/dev/video0 do-timestamp=true ! videoconvert ! videoscale ! videorate ! video/x-raw,framerate=10/1,width=480,height=360 ! x264enc ! rtph264pay !

gst-launch-1.0 -v udpsrc multicast-group=224.1.1.1 auto-multicast=true port=5000 ! gdpdepay ! rtph264depay ! avdec_h264 ! autovideosink

1. On PI:
   `gst-launch-1.0 -e v4l2src do-timestamp=true ! video/x-h264,width=640,height=480,framerate=30/1 ! h264parse ! queue ! rtph264pay config-interval=1 pt=96 ! gdppay! udpsink host=224.1.1.1 auto-multicast=true port=3000`

2. On Windows:
   `gst-launch-1.0 -v udpsrc multicast-group=224.1.1.1 auto-multicast=true port=3000 caps="video/x-h264, width=(int)640, height=(int)480, framerate=(fraction)30/1, stream-format=(string)byte-stream, alignment=(string)au, colorimetry=(string)bt601, interlace-mode=(string)progressive" ! gdpdepay ! rtph264depay ! avdec_h264 ! autovideosink sync=false text-overlay=false`

USB camera:

## RTP multicast :

`cvlc -vvv v4l2:///dev/video1 --sout '#transcode{vcodec=mp2v,vb=800,acodec=none}:rtp{dst=224.1.1.1,port=5001,mux=ts}'`

## vlc:

` rtp://224.1.1.1:5001`

WORKING **\*\***

pi (gstreamer 2-3secs ): `gst-launch-1.0 -v v4l2src device=/dev/video1 ! autovideoconvert ! x264enc tune=zerolatency ! h264parse ! mpegtsmux ! rtpmp2tpay ! udpsink host=224.1.1.1 port=3000`

pi(vlc) (~2-3 secs): `cvlc -vvv v4l2:///dev/video1 --sout '#transcode{vcodec=mp2v,vb=800,acodec=none}:rtp{dst=224.1.1.1,port=3000,mux=ts}'`

vlc: rtp://@224.1.1.1:3000

### GSTREAMER - GSTREAMER (less than half a second)

1. On Windows:
   `gst-launch-1.0.exe -e -v udpsrc multicast-group=224.1.1.1 auto-multicast=true port=3000 ! application/x-rtp, encoding-name=JPEG, payload=26 ! rtpjpegdepay ! jpegdec ! autovideosink`

2. On Pi:
   `gst-launch-1.0 v4l2src device=/dev/video1 ! jpegenc ! rtpjpegpay ! udpsink host=224.1.1.1 auto-multicast=true port=3000`

3. On Windows:
   `gst-launch-1.0.exe -v udpsrc multicast-group=224.1.1.1 auto-multicast=true port=3000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" ! rtph264depay ! decodebin ! videoconvert ! autovideosink`

4. On Pi:
   `gst-launch-1.0 -v v4l2src device=/dev/video0 do-timestamp=true ! videoconvert ! x264enc tune=zerolatency ! rtph264pay ! udpsink host=224.1.1.1 port=3000 auto-multicast=true`

### GSTREAMER - GSTREAMER with h26 encoding (slow 3-4 secs)

1. On Windows:
   `gst-launch-1.0.exe -v udpsrc multicast-group=224.1.1.1 auto-multicast=true port=3000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" ! rtph264depay ! decodebin ! videoconvert ! autovideosink`

2. On Pi:
   `gst-launch-1.0 -v v4l2src device=/dev/video0 do-timestamp=true ! videoconvert ! videoscale ! videorate ! video/x-raw,framerate=25/1,width=480,height=360 ! x264enc ! rtph264pay ! udpsink host=224.1.1.1 port=3000 auto-multicast=true`

#### test: 3. `gst-launch-1.0 -v v4l2src device=/dev/video0 ! videoconvert ! rtpvrawpay ! udpsink host=224.1.1.1 port=3000 auto-multicast=true`

4. `gst-launch-1.0 -v v4l2src device=/dev/video1 ! videoconvert ! mpegtsmux ! rtpmp2tpay ! udpsink host=224.1.1.1 port=3000 auto-multicast=true `
