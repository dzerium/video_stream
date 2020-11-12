const express = require('express')
const path = require('path')
const cors = require('cors')
const { spawn } = require('child_process')

const streamPath = path.join(__dirname, 'stream')
const app = express()

console.log(streamPath)

// * usb web camera outputs MJPEG format, hence the need for converting first
// * TODO: investigate why hlssink2 is not available in container
const streamer = spawn('gst-launch-1.0', [
  'v4l2src', 'device=/dev/video0',
  '!', 'videoconvert',
  '!', 'videoscale',
  '!', 'videorate',
  '!', 'video/x-raw,framerate=10/1,width=480,height=360',
  '!', 'x264enc',
  '!', 'mpegtsmux',
  '!', 'hlssink', 'max-files=10'],
{ cwd: streamPath })

streamer.on('error', (err) => {
  console.error('Failed to start streamer.')
  console.log(err)
})

app.use(cors())
app.use(express.static(streamPath))

app.listen(80)

console.log('Listening on Port 80')
