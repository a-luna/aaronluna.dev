---
title: 'A Few Useful Python Decorators'
slug: python-decorator-examples-timeout-retry
aliases:
    - /blog/python-decorators-retry-timeout-exec-time/
date: '2020-02-12'
draft: true
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
"""Decorator that aborts a function call after N seconds have elapsed."""
from functools import wraps, partial
from signal import signal, alarm, SIGALRM

def timeout(*, seconds=3, error_message="Call to function timed out!"):
    """Abort the wrapped function call after the specified number of seconds have elapsed."""

    def _handle_timeout(signum, frame):
        raise TimeoutError(error_message)

    def decorated(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            signal(SIGALRM, _handle_timeout)
            alarm(seconds)
            try:
                result = func(*args, **kwargs)
            finally:
                alarm(0)
            return result

        return wrapper
    return decorated

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
        def wrapper(*args, **kwargs):
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
        return wrapper
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
"""decorators.log_this"""
import inspect
import logging
from datetime import datetime
from functools import wraps

DT_NAIVE = "%Y-%m-%d %I:%M:%S %p"


class log_this:
    """Log call signature and execution time of decorated function."""

    def __init__(self, logger=None):
        self.logger = logger

    def __call__(self, func):
        if not self.logger:
            logging.basicConfig()
            self.logger = logging.getLogger(func.__module__)
            self.logger.setLevel(logging.INFO)

        @wraps(func)
        def wrapper(*args, **kwargs):
            func_call_args = get_function_call_args(func, *args, **kwargs)
            exec_start = datetime.now()
            result = func(*args, **kwargs)
            exec_finish = datetime.now()
            exec_time = format_timedelta_str(exec_finish - exec_start)
            exec_start_str = exec_start.strftime(DT_NAIVE)
            self.logger.info(f"{exec_start_str} | {func_call_args} | {exec_time}")
            return result

        def get_function_call_args(func, *args, **kwargs):
            """Return a string containing function name and list of all argument names/values."""
            func_args = inspect.signature(func).bind(*args, **kwargs)
            func_args.apply_defaults()
            func_args_str = ", ".join(f"{arg}={val}" for arg, val in func_args.arguments.items())
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

        return wrapper

```

```python {linenos=table}
"""tests.test_log_this"""
import time
import logging
from random import randint

from decorators.log_this import log_this


logging.basicConfig()
log = logging.getLogger("custom_log")
log.setLevel(logging.INFO)
log.info("logging started")


@log_this()
def save_values(a, b, c):
    pass


@log_this(log)
def rand_time(min=1, max=3, add_random=False):
    time.sleep(randint(min, max))
    if add_random:
        time.sleep(randint(100, 500) / 1000.0)


def test_default_logger(caplog):
    save_values("Aaron", "Charlie", "Ollie")
    logger, level, message = caplog.record_tuples[-1]
    assert logger == "tests.test_log_this"
    assert level == logging.INFO
    assert "save_values(a=Aaron, b=Charlie, c=Ollie)" in message


def test_custom_logger(caplog):
    rand_time(max=4, add_random=True)
    logger, level, message = caplog.record_tuples[-1]
    assert logger == "custom_log"
    assert level == logging.INFO
    assert "rand_time(min=1, max=4, add_random=True)" in message

```

<pre><code class="tox"><span class="cmd-venv">(venv) decorators $</span> <span class="cmd-input">pytest tests/test_*</span>
<span class="cmd-results">================================================================= test session starts ==================================================================
platform darwin -- Python 3.7.6, pytest-5.3.5, py-1.8.1, pluggy-0.13.1 -- /Users/aaronluna/Projects/decorators/venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/aaronluna/Projects/decorators, inifile: pytest.ini
plugins: clarity-0.3.0a0, black-0.3.8, mypy-0.5.0, dotenv-0.4.0, flake8-1.0.4, cov-2.8.1
collected 4 items

tests/test_log_this.py::FLAKE8 PASSED                                                                                                            [ 25%]
tests/test_log_this.py::BLACK PASSED                                                                                                             [ 50%]
tests/test_log_this.py::test_default_logger PASSED                                                                                               [ 75%]
tests/test_log_this.py::test_custom_logger PASSED                                                                                                [100%]

================================================================== 4 passed in 3.95s ===================================================================
</span></code></pre>
