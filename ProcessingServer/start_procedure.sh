#!/bin/bash
#start the server
python kaldigstserver/master_server.py --port=8888 & ; bg

#gst plugin for transcription
export GST_PLUGIN_PATH=~/Bureau/RichMeeting/gits/kaldi/src/gst-plugin
#starting worker
python kaldigstserver/worker.py -u ws://localhost:8888/worker/ws/speech -c sample_worker.yaml & ; bg

#transcript audio
#python kaldigstserver/client.py -r 32000 test/data/english_test.raw
