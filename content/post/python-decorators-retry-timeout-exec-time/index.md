---
title: 'Python Decorators: Retry, Timeout, and Measure Execution Time '
slug: python-decorators-retry-timeout-exec-time
date: '2020-02-12'
menu_section: "blog"
categories:
  - Python
summary: "Here are three Python decorators that I use quite often: add timeout functionality to potentially long-running functions, add retry-logic to unreliable functions, and measure the execution time of a function. Also, unittest methods are included as usage examples of each decorator."
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Yeh Xintong on Unsplash"
---

```python {linenos=table}
"""Decorator that prints a report including the total execution time of the wrapped function."""
import inspect
from datetime import datetime
from functools import wraps

DT_NAIVE = "%Y-%m-%d %I:%M:%S %p"

def measure_time(func):
    """Measure the execution time of the wrapped method."""

    @wraps(func)
    def wrapper_measure_time(*args, **kwargs):
        func_call_args = get_function_call_args(func, *args, **kwargs)
        exec_start = datetime.now()
        result = func(*args, **kwargs)
        exec_finish = datetime.now()
        exec_time = format_timedelta_str(exec_finish - exec_start)
        exec_start_str = exec_start.strftime(DT_NAIVE)
        print(f"{exec_start_str} | {func_call_args} | {exec_time}")
        return result
    return wrapper_measure_time

def get_function_call_args(func, *args, **kwargs):
    func_args = inspect.signature(func).bind(*args, **kwargs).arguments
    func_args_str =  ", ".join(f"{arg}={val}" for arg, val in func_args.items())
    return f"{func.__name__}({func_args_str})"

def format_timedelta_str(td):
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

```

```python {linenos=table}
"""Decorator that will attempt to retry a function after an exception is raised.""""
from functools import wraps
from time import sleep

class RetryLimitExceededError(Exception):
    """Custom exception raised by retry decorator when max_attempts limit is reached."""

    def __init__(self, func, max_attempts):
        message = f"Retry limit exceeded! (function: {func.__name__}, max attempts: {max_attempts})"
        super().__init__(message)

def handle_failed_attempt(func, remaining, e, delay):
    """Example function that could be supplied to on_failure attribute of retry decorator."""
    message = (
        f"Function name: {func.__name__}\n"
        f"Error: {repr(e)}\n"
        f"{remaining} attempts remaining, retrying in {delay} seconds...")
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
                except exceptions as e:
                    if remaining > 0:
                        if on_failure:
                            on_failure(func, remaining, e, delay)
                        sleep(delay)
                    else:
                        raise RetryLimitExceededError(func, max_attempts) from e
                else:
                    break
        return wrapper_retry
    return decorated

```

```python {linenos=table}
"""Decorator that aborts a function call after N seconds have elapsed."""
from functools import wraps
from signal import signal, alarm, SIGALRM

def timeout(*, seconds=3, error_message="Call to function timed out"):
    """Abort the wrapped function call if not finished after N seconds have elapsed."""

    def decorated(func):
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
        return wraps(func)(wrapper_timeout)
    return decorated

```

```python {linenos=table}
import time
from random import randint

from unittest import TestCase

from decorator_measure_time import measure_time
from decorator_retry import retry, RetryLimitExceededError
from decorator_timeout import timeout


@timeout(seconds=1)
def sleep():
    time.sleep(2)


@retry(max_attempts=2, delay=1, exceptions=(TimeoutError,))
@timeout(seconds=1)
def retry_with_timeout():
    time.sleep(2)


@measure_time
def rand_time(min, max=1000, doSomething=False):
    time.sleep(1)
    if doSomething:
        time.sleep(randint(min, max) / 100.0)


class TestDecorators(TestCase):
    def test_timeout(self):
        with self.assertRaises(TimeoutError):
            sleep()

    def test_retry_with_timeout(self):
        with self.assertRaises(RetryLimitExceededError):
            retry_with_timeout()

    def test_measure_time(self):
        rand_time(300, 1000, True)
        # Example output:
        # '2020-01-11 09:44:25 PM | rand_time(min=300, max=1000, doSomething=True) | 6s 302ms'

```
