---
title: 'Python Decorators: Retry, Timeout, and Measure Execution Time '
slug: python-decorators-retry-timeout-exec-time
date: '2020-02-12'
menu_section: "blog"
categories:
  - Python
summary: "Here are three Python decorators that I use quite often: add timeout functionality to potentially long-running functions, add retry-logic to unreliable functions, and measure the execution time of a function. Also, unittest methods are included as usage examples of each decorator."
draft: true
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Yeh Xintong on Unsplash"
---

```python {linenos=table}
"""Report function name, argument names and values, and execution time of decorated function."""
import inspect
import logging
from datetime import datetime
from functools import wraps

DT_NAIVE = "%Y-%m-%d %I:%M:%S %p"
log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

class log_exec_time:
    """Measure and log the execution time of the decorated method."""

    def __init__(self, logger=None):
        self.logger = logger

    def __call__(self, func):
        if not self.logger:
            logging.basicConfig()
            self.logger = logging.getLogger(func.__module__)
            self.logger.setLevel(logging.INFO)

        def get_function_call_args(func, *args, **kwargs):
            """Return a string containing function name and list of all argument names/values."""
            func_args = inspect.signature(func).bind(*args, **kwargs).arguments
            func_args_str =  ", ".join(f"{arg}={val}" for arg, val in func_args.items())
            return f"{func.__name__}({func_args_str})"

        def format_timedelta_str(td):
            """Convert timedelta to an easy-to-read string value."""
            (milliseconds, microseconds) = divmod(td.microseconds, 1000)
            (minutes, seconds) = divmod(td.seconds, 60)
            (hours, minutes) = divmod(minutes, 60)
            if td.days > 0:
                return f"{td.days}d {hours:.0f}h {minutes:.0f}m {seconds}s"
            if hours > 0:
                return f"{hours:.0f}h {minutes:.0f}m {seconds}s"
            if minutes > 0:
                return f"{minutes:.0f}m {seconds}s"
            if td.seconds > 0:
                return f"{td.seconds}s {milliseconds:.0f}ms"
            if milliseconds > 0:
                return f"{milliseconds}ms"
            return f"{td.microseconds}us"

        @wraps(func)
        def wrapper_log_exec_time(*args, **kwargs):
            func_call_args = get_function_call_args(func, *args, **kwargs)
            exec_start = datetime.now()
            result = func(*args, **kwargs)
            exec_finish = datetime.now()
            exec_time = format_timedelta_str(exec_finish - exec_start)
            exec_start_str = exec_start.strftime(DT_NAIVE)
            self.logger.info(f"{exec_start_str} | {func_call_args} | {exec_time}")
            return result
        return wrapper_log_exec_time

```

```python {linenos=table}
import time, logging
from random import randint

from decorator_log_exec_time import log_exec_time


logging.basicConfig()
log = logging.getLogger("custom_log")
log.setLevel(logging.INFO)
log.info("logging started")

@log_exec_time()
def save_values(a, b, c):
    pass

@log_exec_time(log)
def rand_time(min, max=300, add_random=False):
    time.sleep(1)
    if add_random:
        time.sleep(randint(min, max) / 100.0)

def test_default_logger(caplog):
    save_values("Aaron", "Charlie", "Ollie")
    logger, level, message = caplog.record_tuples[-1]
    assert logger == "test_log_exec_time"
    assert level == logging.INFO
    assert "save_values(a=Aaron, b=Charlie, c=Ollie)" in message

def test_custom_logger(caplog):
    rand_time(100, add_random=True)
    logger, level, message = caplog.record_tuples[-1]
    assert logger == "custom_log"
    assert level == logging.INFO
    assert "rand_time(min=100, max=300, add_random=True)" in message

```

```python {linenos=table}
"""Implement retry logic on a decorated function."""
from functools import wraps
from time import sleep

class RetryLimitExceededError(Exception):
    """Exception raised when max_attempts limit is reached."""

    def __init__(self, func, max_attempts):
        message = f"Retry limit exceeded! (function: {func.__name__}, max attempts: {max_attempts})"
        super().__init__(message)

def handle_failed_attempt(func, remaining, ex, delay):
    """Example function that could be supplied to on_failure attribute of retry decorator."""
    message = (
        f"Function name: {func.__name__}\n"
        f"Error: {repr(ex)}\n"
        f"{remaining} attempts remaining, retrying in {delay} seconds..."
    )
    print(message)

def retry(*, max_attempts=2, delay=1, exceptions=(Exception,), on_failure=None):
    """Retry the wrapped function when an exception is raised until max_attempts have failed."""

    def decorated(func):
        @wraps(func)
        def wrapper_retry(*args, **kwargs):
            attempts = reversed(range(max_attempts))
            for remaining in attempts:
                try:
                    return func(*args, **kwargs)
                except exceptions as ex:
                    if remaining > 0:
                        if on_failure:
                            on_failure(func, remaining, ex, delay)
                        sleep(delay)
                    else:
                        raise RetryLimitExceededError(func, max_attempts) from ex
                else:
                    break
        return wrapper_retry
    return decorated

```

```python {linenos=table}
import time

import pytest

from decorator_retry import retry, RetryLimitExceededError
from decorator_timeout import timeout


@retry(max_attempts=2, delay=1, exceptions=(TimeoutError,))
@timeout(seconds=1)
def retry_with_timeout():
    time.sleep(2)


def test_retry_with_timeout():
    with pytest.raises(RetryLimitExceededError):
        retry_with_timeout()

```

```python {linenos=table}
"""Decorator that aborts a function call after N seconds have elapsed."""
from functools import wraps, partial
from signal import signal, alarm, SIGALRM

def timeout(func=None, /, seconds=3, error_message="Call to function timed out!"):
    """Abort the wrapped function call after the specified number of seconds have elapsed."""

    if not func:
        return partial(timeout, seconds=seconds, error_message=error_message)

    def _handle_timeout(signum, frame):
        raise TimeoutError(error_message)

    @wraps(func)
    def wrapper_timeout(*args, **kwargs):
        signal(SIGALRM, _handle_timeout)
        alarm(seconds)
        try:
            result = func(*args, **kwargs)
        finally:
            alarm(0)
        return result

    return wrapper_timeout

```

```python {linenos=table}
import time

import pytest

from decorator_timeout import timeout


@timeout(seconds=1)
def sleep():
    time.sleep(2)


def test_timeout():
    with pytest.raises(TimeoutError):
        sleep()

```
