#Coroutine of a Ringbuffer

import numpy as np
#import sidekit


def coroutine(func):
    """
    Decorator that allows to forget about the first call of a coroutine .next()
    method or .send(None)
    This call is done inside the decorator
    :param func: the coroutine to decorate
    """
    def start(*args,**kwargs):
        cr = func(*args,**kwargs)
        next(cr)
        return cr
    return start

@coroutine
def sink_call(callback):
    try:
        while(True):
            input = yield

            #print ">Sink received {}".format(input)
            input = "+1 sample from ring buffer\n"
            callback(input)
    except GeneratorExit:
        print("Sink callback closed")

@coroutine
def sink_reco(callback):
    try:
        while(True):
            input = yield
            #replace with the result return by the recognition algorithm
            #note that the order of the % of correspondance is the same as the one used of the id list reveived
            input = [15,12,45,32,80]
            callback(input)
    except  GeneratorExit:
        print("Sink_reco callback closed")

#Function which send tabs into the pipeline
@coroutine
def audio_reader(next_routine, audio_file):
    input_filename = audio_file
    sampling_rate = 16000
    if input_filename.endswith('.sph') or input_filename.endswith('.pcm')\
            or input_filename.endswith('.wav') or input_filename.endswith('.raw'):
        x, rate = sidekit.frontend.io.read_audio(input_filename, sampling_rate)

    # add random noise to avoid any issue due to zeros
    np.random.seed(0)
    if x.ndim == 1:
        x += 0.0001 * np.random.randn(x.shape[0])
    elif x.ndim == 2:
        x[:, 0] += 0.0001 * np.random.randn(x.shape[0])
        if x.shape[1] == 2:
            x[:, 1] += 0.0001 * np.random.randn(x.shape[0])

    (yield None)
    idx = 0
    next_routine.send(x)
    next_routine.close()

@coroutine
def  source(suiv):
    x = [1,2,3,4,5,6,7,8,9,10]
    y = ['a','b','c']
    while (True):
        (yield None)
        suiv.send(x)
        suiv.send(y)
    suiv.close()

#Send every other value
@coroutine
def everyOtherValue(suiv):
    try :
        while True:
            input=yield
            print("Pipe :", input)
            lettre = 1
            while (lettre < len(input)):
                suiv.send(input[lettre])
                lettre = lettre+2;
    except GeneratorExit:
        suiv.close()

#Buffer
@coroutine
def buffer(suiv):
    try :
        buf1 = [None] * 2
        while(True):
            i = 0
            while(i<2):
                input = yield
                print("Buffer :", input)
                buf1[i] = input
                i+= 1
            suiv.send(buf1)
    except GeneratorExit:
        suiv.close()

#Output of the pipeline, print the result of the treatment
@coroutine
def sink():
    try:
        while True:
            input=yield
            print("Sink :", input)
    except GeneratorExit:
        print("ici")



@coroutine
def ring_buffer(next, window, covering):
    """
    Ring buffer inside a coroutine that allows to bufferize received data
    Hand send it to next method when window size is reached. A covering size
    can be set to include this amount of the previous data with the next send.
    :param next: next coroutine to send data
    :param window: data size to send
    :param covering: data size sent with the next window
    """
    try:
        buffer = [None]*(window*10)
        write_index = 0
        read_index = 0
        data_size = 0
        offset = window - covering
        while True :
            input = yield
            print (len(input))
            if input is None:
                continue
            # add new data to buffer
            for j in range (0, len(input)):
                buffer[write_index] = input[j]
                #update write_index
                write_index = (write_index + 1 ) % len(buffer)
                # data size between indexes
                data_size =  write_index - read_index if read_index < write_index else len(buffer) - read_index + write_index
                #test if a data window can be sent
                if data_size > window:
                    # send a window (testing the case we must concatenate the beginning and end of the buffer)
                    if (read_index < (read_index + window)%len(buffer)):
                        next.send(buffer[read_index : read_index + window])
                    else:
                        next.send(buffer[read_index : len(buffer)] + buffer[0 : (window - len(buffer) + read_index)])
                    read_index = (read_index + offset) % len(buffer)

    except GeneratorExit:
        next.close()
