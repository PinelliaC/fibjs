/*
 * Worker.cpp
 *
 *  Created on: Apr 18, 2017
 *      Author: lion
 */

#include "object.h"
#include "Worker.h"
#include "WorkerMessage.h"
#include "SandBox.h"
#include "Fiber.h"
#include "EventInfo.h"
#include "path.h"

namespace fibjs {

result_t Worker_base::_new(exlib::string path, v8::Local<v8::Object> opts,
    obj_ptr<Worker_base>& retVal, v8::Local<v8::Object> This)
{
    bool isAbs = false;
    path_base::isAbsolute(path, isAbs);
    if (!isAbs)
        return CHECK_ERROR(Runtime::setError("Worker: only accept absolute path."));

    obj_ptr<Worker> worker = new Worker(path, opts);
    worker->wrap(This);
    worker->start();

    retVal = worker;
    return 0;
}

void Worker::start()
{
    m_event = new Event();
    syncCall(m_isolate, worker_fiber, this);
    m_event->wait();
}

void Worker::_main()
{
    JSFiber::scope s;

    m_isolate->start_profiler();

    m_worker->wrap();
    m_event->set();

    s.m_hr = m_isolate->m_topSandbox->run_worker(m_isolate->m_fname, m_worker);
    if (s.m_hr < 0) {
        Variant v = new EventInfo(this, "error", s.m_hr, GetException(s.try_catch, s.m_hr));
        _emit("error", &v, 1);
    }
}

result_t Worker::worker_fiber(Worker* worker)
{
    worker->_main();
    return 0;
}

Worker::Worker(exlib::string path, v8::Local<v8::Object> opts)
{
    m_worker = new Worker(this);
    m_isolate = new Isolate(path);
}

result_t Worker::postMessage(v8::Local<v8::Value> data)
{
    obj_ptr<WorkerMessage> wm = new WorkerMessage(data);
    result_t hr = wm->unbind();
    if (hr < 0)
        return hr;

    Variant m = wm;
    m_worker->_emit("message", &m, 1);

    return 0;
}
}
