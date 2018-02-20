"""
Created on May 17, 2013

@author: tanel
"""
import gi
gi.require_version('Gst', '1.0')
from gi.repository import GObject, Gst

GObject.threads_init()
Gst.init(None)
import logging
import thread
import os
from coroutines import *

logger = logging.getLogger(__name__)

import pdb

class DecoderPipelineReco(object):
    def __init__(self, word_handler, eos_handler):
        logger.info("Creating decoder")
        self.word_handler = word_handler
        self.eos_handler = eos_handler
        self.ringbuffer = None
        self.create_pipeline()

    def create_pipeline(self):
        self.sink = sink_reco(self.word_handler)
        self.ringbuffer = ring_buffer(self.sink, 32000, 0)


    def process_data(self, data):
        logger.debug('%s: Pushing buffer of size %d to pipeline' % ("No ID", len(data)))
        self.ringbuffer.send(data)


    def end_request(self):
        logger.info("Pushing EOS to pipeline")
        self.ringbuffer.close()
        self.eos_handler()

    def finish_request(self):
        logger.info("finish_request called")
        self.end_request()

    def cancel(self):
        logger.info("cancel called")
        self.end_request()
