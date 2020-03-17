---
title: 'Python Decorator Examples: Timeout, Retry, and Logging'
slug: python-decorator-examples-timeout-retry
aliases:
    - /blog/python-decorators-retry-timeout-exec-time/
date: '2020-02-12'
draft: true
menu_section: "blog"
categories:
  - Python
summary: 'Decorators can be a daunting topic when first encountered. While the Zen of Python states "There should be one-- and preferably only one --obvious way to do it", there are many, equally valid ways to implement the same decorator. These different methods can be grouped as function-based and class-based. In this post I will explain both methods and provide examples of three decorators.'
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Yeh Xintong on Unsplash"
---

## What is a Decorator?

In Python, _**absolutely everything is an object**_, including functions. Since functions are objects, they can be passed as arguments to another function, they can be the return value of a function, and they can be assigned to a variable. If you understand these concepts then you have everything you need to understand decorators.

A decorator is any callable object that takes a function as an input parameter. I specifically said "callable object" rather than "function" since Python allows you to create other types of callable objects. This interesting language feature is what allows us to create class-based decorators, as we will see shortly.

## A Simple Decorator

Decorators are wrappers that allow you to execute code before and after the "wrapped" (or "decorated") function is executed. This "wrapping" effect can easily be demonstrated by constructing a decorator function manually. Consider the <code>decorators.basic</code> module given below:

```python {linenos=table}
"""decorators.basic"""
def simple_decorator(function_to_decorate):
    def wrapper_for_decorated_function():

        print(f"Preparing to execute: {function_to_decorate.__name__}")
        function_to_decorate()
        print(f"Finished executing: {function_to_decorate.__name__}")

    return wrapper_for_decorated_function


def undecorated_function():
    print("I FORBID you from modifying how this function behaves!")

```

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 2: </strong><code>simple_decorator</code> accepts a function as a parameter, making it a decorator.</p>
      </li>
      <li>
        <p><strong>Line 3: </strong><code>wrapper_for_decorated_function</code> is defined within the decorator and is the wrapper which allows us to execute code before and after executing the wrapped function.</p>
      </li>
      <li>
        <p><strong>Line 5: </strong>The print statement will be executed BEFORE the wrapped function.</p>
      </li>
      <li>
        <p><strong>Line 6: </strong>The wrapped function is executed within the <code>wrapper_for_decorated_function</code> function.</p>
      </li>
      <li>
        <p><strong>Line 7: </strong>The print statement will be executed AFTER the wrapped function</p>
      </li>
      <li>
        <p><strong>Line 9: </strong>This is probably the most confusing part. The wrapper function, <code>wrapper_for_decorated_function</code>, is the return value of the decorator function (<code>simple_decorator</code>). At this point, the wrapped function (<code>function_to_decorate</code>) <span class="bold-text">HAS NOT</span> been executed.</p>
      </li>
      <li>
        <p><strong>Line 12: </strong>We will use this function to demonstrate how <code>simple_decorator</code> works.</p>
      </li>
    </ul>
</div>

Let's open an interactive Python shell and execute <code>undecorated_function()</code> to see the behavior before applying any decorator. Next, we pass <code>undecorated_function</code> as a parameter to <code>simple_decorator</code>, and store the return value in <code>decorated_function</code>. Remember, the return value is the wrapper function <code>wrapper_for_decorated_function</code>:

<pre><code><span class="cmd-venv">(venv) decorators $</span> <span class="cmd-input">python</span>
<span class="cmd-results">Python 3.7.6 (default, Jan 19 2020, 06:08:58)
[Clang 11.0.0 (clang-1100.0.33.8)] on darwin
Type "help", "copyright", "credits" or "license" for more information.</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from decorators.basic import * </span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">undecorated_function()</span>
<span class="cmd-repl-results">I FORBID you from modifying how this function behaves!</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">decorated_function = simple_decorator(undecorated_function)</span></code></pre>

{{< info_box >}}
Please note the difference between calling a function (<code>decorated_function()</code>) and passing a function as a parameter to another function (<code>simple_decorator(undecorated_function)</code>). If we had executed <code>simple_decorator(undecorated_function())</code>, we would not see the effect of the wrapper function. The behavior would be the same as when we executed <code>undecorated_function()</code>.

{{< /info_box >}}

Finally, we execute <code>decorated_function()</code>:

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">decorated_function()</span>
<span class="cmd-repl-results">Preparing to execute: undecorated_function</span>
<span class="cmd-repl-results">I FORBID you from modifying how this function behaves!</span>
<span class="cmd-repl-results">Finished executing: undecorated_function</span></code></pre>

This is the result we expect after applying <code>simple_decorator</code>. However, wouldn't it be better if we could permanently alter the behavior of <code>undecorated_function</code>? We can easily do this if we replace the reference to <code>undecorated_function</code> with the function returned by <code>simple_decorator</code>:

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">undecorated_function = simple_decorator(undecorated_function)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">undecorated_function()</span>
<span class="cmd-repl-results">Preparing to execute: undecorated_function</span>
<span class="cmd-repl-results">I FORBID you from modifying how this function behaves!</span>
<span class="cmd-repl-results">Finished executing: undecorated_function</span></code></pre>

This is exactly what decorators do when one is applied to a function using the <code>@</code> syntax you are familiar with. Here is the same example using the normal decorator syntax. Note that we are applying the decorator to <code>undecorated_function</code> in **Line 12**:

```python {linenos=table}
"""decorators.basic"""
def simple_decorator(function_to_decorate):
    def wrapper_for_decorated_function():

        print(f"Preparing to execute: {function_to_decorate.__name__}")
        function_to_decorate()
        print(f"Finished executing: {function_to_decorate.__name__}")

    return wrapper_for_decorated_function


@simple_decorator
def undecorated_function():
    print("I FORBID you from modifying how this function behaves!")

```

Let's verify that the behavior of the function has been modified:

<pre><code><span class="cmd-venv">(venv) decorators $</span> <span class="cmd-input">python</span>
<span class="cmd-results">Python 3.7.6 (default, Jan 19 2020, 06:08:58)
[Clang 11.0.0 (clang-1100.0.33.8)] on darwin
Type "help", "copyright", "credits" or "license" for more information.</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from decorators.basic import * </span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">undecorated_function()</span>
<span class="cmd-repl-results">Preparing to execute: undecorated_function</span>
<span class="cmd-repl-results">I FORBID you from modifying how this function behaves!</span>
<span class="cmd-repl-results">Finished executing: undecorated_function</span></code></pre>

As you can see, <code>@simple_decorator</code> is just syntactic sugar for <code>undecorated_function = simple_decorator(undecorated_function)</code>.

This type of decorator is nice, but what if our original function has one or more input parameters? It wouldn't be possible to provide values for these parameters with the current implementation of <code>simple_decorator</code>. What can we do to fix this?

## Passing Arguments to the Wrapped Function

Fixing this is very easy. Remember, when we execute the "wrapped" function, we are really executing the function returned by the decorator function (<code>wrapper_for_decorated_function</code> in the previous example). Any values we provide to this function can be passed on to the wrapped function.

However, we need to accommodate all possible combinations of input parameters for our decorator to support all functions. We can do this by modifying <code>wrapper_for_decorated_function</code> to accept <code>*args, **kwargs</code> and passing them on to <code>function_to_decorate</code>. This has been implemented in a new module, <code>decorators.better</code>:

```python {linenos=table}
"""decorators.better"""
def a_better_decorator(function_to_decorate):
    def wrapper_for_decorated_function(*args, **kwargs):

        print(f"Preparing to execute: {function_to_decorate.__name__}")
        function_to_decorate(*args, **kwargs)
        print(f"Finished executing: {function_to_decorate.__name__}")

    return wrapper_for_decorated_function


@a_better_decorator
def greeting_anonymous():
    print("Hello anonymous website viewer!")


@a_better_decorator
def greeting_personal(name="Aaron"):
    print(f"Hello {name}!")

```

Let's test this version with the two undecorated functions from this module, <code>greeting_anonymous</code> and <code>greeting_personal</code>:

<pre><code><span class="cmd-venv">(venv) decorators $</span> <span class="cmd-input">python</span>
<span class="cmd-results">Python 3.7.6 (default, Jan 19 2020, 06:08:58)
[Clang 11.0.0 (clang-1100.0.33.8)] on darwin
Type "help", "copyright", "credits" or "license" for more information.</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from decorators.better import * </span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">greeting_anonymous()</span>
<span class="cmd-repl-results">Preparing to execute: greeting_anonymous</span>
<span class="cmd-repl-results">Hello anonymous website viewer!</span>
<span class="cmd-repl-results">Finished executing: greeting_anonymous</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">greeting_personal()</span>
<span class="cmd-repl-results">Preparing to execute: greeting_personal</span>
<span class="cmd-repl-results">Hello Aaron!</span>
<span class="cmd-repl-results">Finished executing: greeting_personal</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">greeting_personal(name="Jerry")</span>
<span class="cmd-repl-results">Preparing to execute: greeting_personal</span>
<span class="cmd-repl-results">Hello Jerry!</span>
<span class="cmd-repl-results">Finished executing: greeting_personal</span></code></pre>

This works exactly the way we need it to, the value we passed to <code>greeting_personal</code> is used when we execute it because it was passed from <code>wrapper_for_decorated_function</code> to <code>function_to_decorate</code>.

## Passing Arguments to the Decorator

The decorators we have created so far are certainly useful for many different scenarios, but they are also limited since there is no way to pass arguments to the decorator itself. How is this different than the last decorator we created? A decorator that accepts arguments would have the form shown below:

```python
@foo(baz, fim=bim)
def bar():
    ...
```



```python {linenos=table}
"""decorators.timeout"""
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
"""tests.test_timeout"""
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
"""decorators.retry"""
from functools import wraps
from time import sleep

class RetryLimitExceededError(Exception):
    """Implement retry logic on a decorated function."""

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
"""tests.test_retry"""
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
