__author__ = 'tanel'

import logging
import logging.config
import time
import thread
import argparse
from subprocess import Popen, PIPE
from gi.repository import GObject
import yaml
import json
import sys
import locale
import codecs
import zlib
import base64
import time


from ws4py.client.threadedclient import WebSocketClient
import ws4py.messaging

from decoder_reco import DecoderPipelineReco
import common

logger = logging.getLogger(__name__)

CONNECT_TIMEOUT = 5
SILENCE_TIMEOUT = 5
USE_NNET2 = False

class ServerWebsocket(WebSocketClient):
    STATE_CREATED = 0
    STATE_CONNECTED = 1
    STATE_INITIALIZED = 2
    STATE_PROCESSING = 3
    STATE_EOS_RECEIVED = 7
    STATE_CANCELLING = 8
    STATE_FINISHED = 100

    def __init__(self, uri):
        self.uri = uri
        self.decoder_pipeline = DecoderPipelineReco(self._on_word, self._on_eos)

        with open("last_data_received.txt", "w") as data_file:
            data_file.write("###--This file contains the data received by the worker\n")
            data_file.write("###--The first line contains the ID list\n")
            data_file.write("###--DATA START HERE\n")

        WebSocketClient.__init__(self, url=uri, heartbeat_freq=10)
        self.pipeline_initialized = False

        self.state = self.STATE_CREATED
        self.last_decoder_message = time.time()
        self.request_id = "<undefined>"
        self.timeout_decoder = 5
        self.num_segments = 0
        self.last_partial_result = ""
        self.partial_transcript = ""

    def opened(self):
        logger.info("Opened websocket connection to server")
        self.state = self.STATE_CONNECTED
        self.last_partial_result = ""

    def guard_timeout(self):
        global SILENCE_TIMEOUT
        while self.state in [self.STATE_EOS_RECEIVED, self.STATE_CONNECTED, self.STATE_INITIALIZED, self.STATE_PROCESSING]:
            if time.time() - self.last_decoder_message > SILENCE_TIMEOUT:
                logger.warning("%s: More than %d seconds from last decoder hypothesis update, cancelling" % (self.request_id, SILENCE_TIMEOUT))
                self.finish_request()
                event = dict(status=common.STATUS_NO_SPEECH)
                try:
                    self.send(json.dumps(event))
                except:
                    logger.warning("%s: Failed to send error event to master" % (self.request_id))
                self.close()
                return
            logger.debug("%s: Checking that decoder hasn't been silent for more than %d seconds" % (self.request_id, SILENCE_TIMEOUT))
            time.sleep(1)


    def received_message(self, m): #reviewing

        #print "Received Message {}".format(m)
        print "Received Message"

        logger.debug("%s: Got message from server of type %s" % (self.request_id, str(type(m))))
        if self.state == self.__class__.STATE_CONNECTED:
            props = json.loads(str(m))
            content_type = props['content_type']
            self.request_id = props['id']
            self.num_segments = 0
            #self.decoder_pipeline.init_request(self.request_id, content_type)
            self.last_decoder_message = time.time()
            #thread.start_new_thread(self.guard_timeout, ())
            logger.info("%s: Started timeout guard" % self.request_id)
            logger.info("%s: Initialized request" % self.request_id)
            self.state = self.STATE_INITIALIZED
        elif m.data == "EOS":  #end of file indication
            if self.state != self.STATE_CANCELLING and self.state != self.STATE_EOS_RECEIVED and self.state != self.STATE_FINISHED:
                self.decoder_pipeline.end_request()
                self.state = self.STATE_EOS_RECEIVED
            else:
                logger.info("%s: Ignoring EOS, worker already in state %d" % (self.request_id, self.state))
        else:
            if self.state != self.STATE_CANCELLING and self.state != self.STATE_EOS_RECEIVED and self.state != self.STATE_FINISHED:
                if isinstance(m, ws4py.messaging.BinaryMessage):
                    #the first data received is the list of people ID.
                    print "Process_data called, size: {}, type: {}".format(len(m.data), type(m.data))
                    with open("last_data_received.txt", "a") as data_file:
                        data_file.write(str(m.data))

                    self.decoder_pipeline.process_data(m.data)
                    self.state = self.STATE_PROCESSING
                elif isinstance(m, ws4py.messaging.TextMessage):
                    print "ID list : %s" % str(m.data)
            else:
                logger.info("%s: Ignoring data, worker already in state %d" % (self.request_id, self.state))


    def finish_request(self):
        if self.state == self.STATE_CONNECTED:
            # connection closed when we are not doing anything
            self.decoder_pipeline.finish_request()
            self.state = self.STATE_FINISHED
            return
        if self.state == self.STATE_INITIALIZED:
            # connection closed when request initialized but with no data sent
            self.decoder_pipeline.finish_request()
            self.state = self.STATE_FINISHED
            return
        if self.state != self.STATE_FINISHED:
            logger.info("%s: Master disconnected before decoder reached EOS?" % self.request_id)
            self.state = self.STATE_CANCELLING
            self.decoder_pipeline.cancel()
            counter = 0
            while self.state == self.STATE_CANCELLING:
                counter += 1
                if counter > 30:
                    # lost hope that the decoder will ever finish, likely it has hung
                    # FIXME: this might introduce new bugs
                    logger.info("%s: Giving up waiting after %d tries" % (self.request_id, counter))
                    self.state = self.STATE_FINISHED
                else:
                    logger.info("%s: Waiting for EOS from decoder" % self.request_id)
                    time.sleep(1)
            self.decoder_pipeline.finish_request()
            logger.info("%s: Finished waiting for EOS" % self.request_id)


    def closed(self, code, reason=None): #done
        logger.debug("%s: Websocket closed() called" % self.request_id)
        self.finish_request()
        logger.debug("%s: Websocket closed() finished" % self.request_id)


    def _on_word(self, word): #done
        self.last_decoder_message = time.time()
        event = dict(status=common.STATUS_SUCCESS,
                     result=word)
        self.send(json.dumps(event))

    def _on_eos(self, data=None): #done (called when stream is over)
        self.last_decoder_message = time.time()
        self.state = self.STATE_FINISHED
        self.close()


def main():
    logging.basicConfig(level=logging.DEBUG, format="%(levelname)8s %(asctime)s %(message)s ")
    logging.debug('Starting up worker')
    parser = argparse.ArgumentParser(description='Worker for kaldigstserver')
    parser.add_argument('-u', '--uri', default="ws://localhost:8888/worker/ws/speech", dest="uri", help="Server<-->worker websocket URI")
    parser.add_argument('-f', '--fork', default=1, dest="fork", type=int)
    parser.add_argument('-c', '--conf', dest="conf", help="YAML file with decoder configuration")

    args = parser.parse_args()

    if args.fork > 1:
        import tornado.process

        logging.info("Forking into %d processes" % args.fork)
        tornado.process.fork_processes(args.fork)




    #loop = GObject.MainLoop()
    #thread.start_new_thread(loop.run, ())
    while True:
        ws = ServerWebsocket(args.uri)
        try:
            logger.info("Opening websocket connection to master server")
            ws.connect()
            ws.run_forever()
        except Exception:
            logger.error("Couldn't connect to server, waiting for %d seconds", CONNECT_TIMEOUT)
            time.sleep(CONNECT_TIMEOUT)
        # fixes a race condition
        time.sleep(1)

if __name__ == "__main__":
    main()
