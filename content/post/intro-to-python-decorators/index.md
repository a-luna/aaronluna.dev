---
title: 'An Introduction to Decorators in Python'
slug: intro-to-python-decorators
aliases:
    - /blog/python-decorators-retry-timeout-exec-time/
    - /blog/python-decorator-examples-timeout-retry/
date: '2020-02-27'
toc: true
menu_section: "blog"
categories:
  - Python
summary: 'Decorators can be a daunting topic when first encountered. While the Zen of Python states "There should be one-- and preferably only one --obvious way to do it", there are many, equally valid ways to implement the same decorator. These different methods can be categorized as either function-based, class-based, or a hybrid of both. In this post I will explain the design and behavior of Python decorators and provide examples of decorators that I frequently use in my own code.'
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Yeh Xintong on Unsplash"
---

## Introduction

Decorators can be a daunting topic when first encountered. While <a href="https://www.python.org/dev/peps/pep-0020/" target="_blank">The Zen of Python</a> states _**"There should be one-- and preferably only one --obvious way to do it"**_, there are many, equally valid ways to implement the same decorator. These different methods can be categorized as either function-based, class-based, or a hybrid of both. In this post I will explain the design and behavior of Python decorators and provide examples of decorators that I frequently use in my own code.

## What is a Decorator?

In Python, _**absolutely everything is an object**_, including functions. Since functions are objects, they can be passed as arguments to another function, they can be the return value of a function, and they can be assigned to a variable. If you understand these concepts then you have everything you need to understand decorators.

A decorator is any callable object that takes a function as an input parameter. I specifically said "callable object" rather than "function" since Python allows you to create other types of callable objects. This interesting language feature is what allows us to create class-based decorators, as we will see shortly.

## A Simple Decorator

Decorators are wrappers that allow you to execute code before and after the "wrapped" (or "decorated") function is executed. By manually constructing a decorator function this "wrapping" effect can easily be demonstrated. Consider the <code>decorators.basic</code> module given below:

```python {linenos=table}
"""decorators.basic"""
def simple_decorator(function_to_decorate):
    def function_wrapper():

        print(f"Preparing to execute: {function_to_decorate.__name__}")
        function_to_decorate()
        print(f"Finished executing: {function_to_decorate.__name__}")

    return function_wrapper


def undecorated_function():
    print("I FORBID you from modifying how this function behaves!")

```

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 2: </strong><code>simple_decorator</code> accepts a function as a parameter, making it a decorator.</p>
      </li>
      <li>
        <p><strong>Line 3: </strong><code>function_wrapper</code> (defined within <code>simple_decorator</code>) allows us to execute code before and after executing the wrapped function.</p>
      </li>
      <li>
        <p><strong>Line 5: </strong>This print statement will be executed <span class="bold-text">before</span> the wrapped function.</p>
      </li>
      <li>
        <p><strong>Line 6: </strong>The wrapped function is executed within <code>function_wrapper</code>.</p>
      </li>
      <li>
        <p><strong>Line 7: </strong>This print statement will be executed <span class="bold-text">after</span> the wrapped function</p>
      </li>
      <li>
        <p><strong>Line 9: </strong>This is probably the most confusing part. <code>function_wrapper</code> is the return value of the decorator function (<code>simple_decorator</code>). At this point, the wrapped function (<code>function_to_decorate</code>) <span class="bold-text">HAS NOT</span> been executed.</p>
      </li>
      <li>
        <p><strong>Line 12: </strong>We will use this function to demonstrate how <code>simple_decorator</code> works.</p>
      </li>
    </ul>
</div>

Open an interactive Python shell and execute <code>undecorated_function()</code> to see the behavior before applying any decorator. Next, we pass <code>undecorated_function</code> as a parameter to <code>simple_decorator</code>, and store the return value in <code>decorated_function</code>:

<pre><code><span class="cmd-venv">(venv) decorators $</span> <span class="cmd-input">python</span>
<span class="cmd-results">Python 3.7.6 (default, Jan 19 2020, 06:08:58)
[Clang 11.0.0 (clang-1100.0.33.8)] on darwin
Type "help", "copyright", "credits" or "license" for more information.</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from decorators.basic import * </span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">undecorated_function()</span>
<span class="cmd-repl-results">I FORBID you from modifying how this function behaves!</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">decorated_function = simple_decorator(undecorated_function)</span></code></pre>

{{< info_box >}}
Please note the difference between calling a function (<code>undecorated_function()</code>) and passing a function as a parameter to another function (<code>simple_decorator(undecorated_function)</code>). If we had executed <code>simple_decorator(undecorated_function())</code>, we would not see the effect of the wrapper function. The behavior would be the same as when we executed <code>undecorated_function()</code>.
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

This is **exactly** what happens when you decorate a function using Python's <code>@decorator</code> syntax. To reinforce this point, we can modify our code to use the normal decorator syntax. Note that we are applying the decorator to <code>undecorated_function</code> in **Line 12**:

```python {linenos=table}
"""decorators.basic"""
def simple_decorator(function_to_decorate):
    def function_wrapper():

        print(f"Preparing to execute: {function_to_decorate.__name__}")
        function_to_decorate()
        print(f"Finished executing: {function_to_decorate.__name__}")

    return function_wrapper


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

Fixing this is very easy. Remember, when we execute the "wrapped" function, we are really executing the function returned by the decorator function (<code>function_wrapper</code> in the previous example). Any values we provide to this function can be passed on to the wrapped function.

However, we need to accommodate all possible combinations of input parameters. We can do this by modifying <code>function_wrapper</code> to accept <code>*args, **kwargs</code> and passing them on to <code>function_to_decorate</code>. This has been implemented in a new module, <code>decorators.better</code>:

```python {linenos=table}
"""decorators.better"""
def a_better_decorator(function_to_decorate):
    def function_wrapper(*args, **kwargs):

        print(f"Preparing to execute: {function_to_decorate.__name__}")
        function_to_decorate(*args, **kwargs)
        print(f"Finished executing: {function_to_decorate.__name__}")

    return function_wrapper


@a_better_decorator
def greeting_anonymous():
    print("Hello anonymous website viewer!")


@a_better_decorator
def greeting_personal(name="Aaron"):
    print(f"Hello {name}!")

```

Let's test this version with the two decorated functions, <code>greeting_anonymous</code> and <code>greeting_personal</code>:

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

This works exactly the way we need it to, the value we passed to <code>greeting_personal</code> is used because it was passed from <code>function_wrapper</code> to <code>function_to_decorate</code>. Also, we did not break any existing functionality since the function that does not take any input parameters (<code>greeting_anonymous</code>) is also decorated and behaves as expected.

## Passing Arguments to the Decorator

The decorators we have created so far are certainly useful for many different scenarios, but they are also limited since there is no way to pass arguments to the decorator itself. How is this different than the last decorator we created? A decorator that accepts arguments would have the form shown below:

```python
@foo(baz, fiz=buz)
def bar():
    ...
```

If you remember back to the beginning of this post, I mentioned that, in general, there are two different ways to implement Python decorators: function-based and class-based. The examples we have seen so far have all been function-based. Unless you need to create a decorator that accepts arguments, you should use these function-based designs since they are more readable and require less nesting/indentation than the equivalent class-based design.

However, when you need to pass arguments to a decorator, there isn't an advantage to using either the function-based or class-based design. Let's take a look at the function-based design first since it is a natural progression from the decorators we have already examined.

### Function-based Design

The generic form of a function-based decorator that accepts arguments is given below:

```python {linenos=table}
"""decorators.function_based"""
def decorator_factory(arg1, arg2):
    def decorator_with_args(function_to_decorate):
        def function_wrapper(*args, **kwargs):

            print(f"First argument provided to decorator: {arg1}")
            function_to_decorate(*args, **kwargs)
            print(f"Second argument provided to decorator: {arg2}")

        return function_wrapper

    return decorator_with_args


@decorator_factory("foo", "bar")
def special_greeting(name="Dennis"):
    print(f"Allow me to give a very special welcome to {name}!")

```

In order to pass arguments to the decorator, we add another wrapper function, called `decorator_factory` **(Line 2)**. I am calling it a factory because the return value is the actual function decorator (`decorator_with_args` is where `function_to_decorate` is passed in as an argument).

In order to understand how this works you need to realize that <span class="bold-text">Line 15</span> (where we are applying the decorator to a function) is actually a function call to `decorator_factory("foo", "bar")` which returns `decorator_with_args`. `decorator_with_args` is the actual decorator but in order to pass the params "foo" and "bar" to the decorator, we had to call the factory method that creates the actual decorator which accepts the function `special_greeting` as an argument and wraps it.

Contrast this with the other decorators we have created: when a function is decorated with `@simple_decorator` or `@a_better_decorator` <span class="bold-text">these are not function calls</span> (notice that there are no parentheses after the decorator name).

Let's fire up the REPL and test this decorator. We will also verify that we are still able to use the decorated function as expected by passing arguments that modify its behavior:

<pre><code><span class="cmd-venv">(venv) decorators $</span> <span class="cmd-input">python</span>
<span class="cmd-results">Python 3.7.6 (default, Jan 19 2020, 06:08:58)
[Clang 11.0.0 (clang-1100.0.33.8)] on darwin
Type "help", "copyright", "credits" or "license" for more information.</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from decorators.function_based import * </span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">special_greeting()</span>
<span class="cmd-repl-results">First argument provided to decorator: foo</span>
<span class="cmd-repl-results">Allow me to give a very special welcome to Dennis!</span>
<span class="cmd-repl-results">Second argument provided to decorator: bar</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">special_greeting(name="Harold")</span>
<span class="cmd-repl-results">First argument provided to decorator: foo</span>
<span class="cmd-repl-results">Allow me to give a very special welcome to Harold!</span>
<span class="cmd-repl-results">Second argument provided to decorator: bar</span></code></pre>

As you can see, the arguments that were passed into the decorator (`"foo"` and `"bar"`) were used by the wrapper function, and the value passed into the decorated function (`"Dennis"`/`"Harold"`) is also used when the wrapper function is executed.

### Functions, Classes and Callables

Are you familiar with <a href="https://docs.python.org/3/library/functions.html#callable" target="_blank">the built-in `callable` function</a>? `callable` accepts a single argument and returns a bool value: `True` if the object provided appears to be callable and `False` if it does not. If you think that functions are the only "callable" that exists you might consider this function rather useless or unnecessary. However, classes are also callable since this is how new instances are created (e.g., `object = MyObject()`).

The call syntax, `(...)`, can call functions or create class instances as we have just seen. But Python has a unique feature that objects other than functions can also be called. Adding the `__call__` method to any class **will make instances of that class callable**. This allows us to create decorators that are implemented using classes.

### Class-based Design

The same decorator can be implemented using a callable class instance:

```python {linenos=table}
"""decorators.class_based"""
class DecoratorFactory:
    def __init__(self, arg1, arg2):
        self.arg1 = arg1
        self.arg2 = arg2

    def __call__(self, function_to_decorate):
        def function_wrapper(*args, **kwargs):

            print(f"First argument provided to decorator: {self.arg1}")
            function_to_decorate(*args, **kwargs)
            print(f"Second argument provided to decorator: {self.arg2}")

        return function_wrapper


@DecoratorFactory("foo", "bar")
def special_greeting(name="Dennis"):
    print(f"Allow me to give a very special welcome to {name}!")

```

The main difference between the function-based and class-based designs is how the arguments passed to the decorator are handled. In the function-based approach, the arguments are available to `function_wrapper` as local variables. In the class-based design, the arguments are provided to the `__init__` method and assigned to instance variables which can be accessed from `function_wrapper`.

We can confirm that this decorator behaves in exactly the same way as the function-based version:

<pre><code><span class="cmd-venv">(venv) decorators $</span> <span class="cmd-input">python</span>
<span class="cmd-results">Python 3.7.6 (default, Jan 19 2020, 06:08:58)
[Clang 11.0.0 (clang-1100.0.33.8)] on darwin
Type "help", "copyright", "credits" or "license" for more information.</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from decorators.class_based import * </span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">special_greeting()</span>
<span class="cmd-repl-results">First argument provided to decorator: foo</span>
<span class="cmd-repl-results">Allow me to give a very special welcome to Dennis!</span>
<span class="cmd-repl-results">Second argument provided to decorator: bar</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">special_greeting(name="Hank")</span>
<span class="cmd-repl-results">First argument provided to decorator: foo</span>
<span class="cmd-repl-results">Allow me to give a very special welcome to Hank!</span>
<span class="cmd-repl-results">Second argument provided to decorator: bar</span></code></pre>

### Which Design Is Better?

Is there any advantage to using either decorator design? In my opinion, the class-based design is flatter and easier to read, making it the more Pythonic choice. However, I acknowledge that the function-based design is more conventional since the idea of a callable object that is an instance of a class (rather than a function) is not what most people expect when they encounter the concept of decorators.

Other than that, there are no obvious benefits to choosing one design over the other. You should use the design that makes the most sense to you.

### Always Use `functools.wraps`

I have intentionally left out something very important from these decorator examples. You should **ALWAYS** decorate `function_wrapper` (or whatever name is used in your application) with the `functools.wraps` decorator (located in the standard library's `functools` module). Why is this important? Consider the example below:

<pre><code><span class="cmd-venv">(venv) decorators $</span> <span class="cmd-input">python</span>
<span class="cmd-results">Python 3.7.6 (default, Jan 19 2020, 06:08:58)
[Clang 11.0.0 (clang-1100.0.33.8)] on darwin
Type "help", "copyright", "credits" or "license" for more information.</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from decorators.class_based import * </span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">import inspect</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">special_greeting.__name__</span>
<span class="cmd-repl-results">'function_wrapper'</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">inspect.signature(special_greeting)</span>
<span class="cmd-repl-results">&lt;Signature (*args, **kwargs)&gt;</span></code></pre>

When we inspect the name and signature of the `special_greeting` function, we instead receive the name and signature of the decorator that was applied to it. While confusing, it becomes even more of a headache if you need to debug this code. This is easily fixed with the `functools.wraps` decorator **(Lines 2,11)**:

```python {linenos=table,hl_lines=[2,11]}
"""decorators.class_based"""
from functools import wraps


class DecoratorFactory:
    def __init__(self, arg1, arg2):
        self.arg1 = arg1
        self.arg2 = arg2

    def __call__(self, function_to_decorate):
        @wraps(function_to_decorate)
        def function_wrapper(*args, **kwargs):

            print(f"First argument provided to decorator: {self.arg1}")
            function_to_decorate(*args, **kwargs)
            print(f"Second argument provided to decorator: {self.arg2}")

        return function_wrapper


@DecoratorFactory("foo", "bar")
def special_greeting(name="Dennis"):
    print(f"Allow me to give a very special welcome to {name}!")

```

Now, if we inspect `special_greeting` we will see the correct name and signature:

<pre><code><span class="cmd-venv">(venv) decorators $</span> <span class="cmd-input">python</span>
<span class="cmd-results">Python 3.7.6 (default, Jan 19 2020, 06:08:58)
[Clang 11.0.0 (clang-1100.0.33.8)] on darwin
Type "help", "copyright", "credits" or "license" for more information.</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from decorators.class_based import * </span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">import inspect</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">special_greeting.__name__</span>
<span class="cmd-repl-results">'special_greeting'</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">inspect.signature(special_greeting)</span>
<span class="cmd-repl-results">&lt;Signature (name='Dennis')&gt;</span></code></pre>

{{< info_box >}}
Why did I not include the `functools.wraps` decorator in the previous examples? Since the point was to explain how decorators work, seeing a random decorator in the middle of everything would have been confusing and would have drawn attention away from the core concepts being demonstrated.
{{< /info_box >}}

Hopefully you have a better understanding of how decorators are designed and how they behave in Python. The remainder of this post will contain examples of decorators that I frequently use in my Python projects along with pytest functions that demonstrate the intended usage.

## Example: Function Timeout

If you have ever written code that interacts with an outside service, you have probably encountered a situation where your program becomes stuck waiting for a response with no way to abort the function call. One way to get un-stuck is with the `@timeout` decorator:

```python {linenos=table}
"""decorators.timeout"""
from functools import wraps
from signal import signal, alarm, SIGALRM


def timeout(*, seconds=3, error_message="Call to function timed out!"):
    """Abort the wrapped function call after the specified number of seconds have elapsed."""

    def _handle_timeout(signum, frame):
        raise TimeoutError(error_message)

    def decorator(func):
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

    return decorator

```

{{< info_box >}}
The syntax used in **Line 6** above prevents the user from specifying positional arguments with the `@timeout` decorator. This is done to ensure that the purpose of the decorator is clear to the reader based on its usage. Without the asterisk (`*`) in the function definition, the user could decorate a function with `@timeout(3)`, rather than `@timeout(seconds=3)`. The latter usage communicates the meaning of the value `3` in the context of the `@timeout` decorator. If you are unfamiliar with this syntax, you can find the background and justification for this feature in [PEP 3102](https://www.python.org/dev/peps/pep-3102/).
{{< /info_box >}}

It's very easy to use. Simply decorate any function with `@timeout(seconds=X)` and specify the number of seconds to wait before aborting the function call as shown below **(Line 7)**. If the function completes before the specified number of seconds have elapsed, your program will continue executing. However if the function has not completed after the specified number of seconds have elapsed, a `TimeoutError` will be raised, aborting the function call.

In the simple test scenario below, the `sleep` function waits for two seconds when called. Since it is decorated with `@timeout(seconds=1)` a `TimeoutError` will be raised one second after it is called. The `test_timeout` function verifies that the correct error is raised **(Lines 13-14)**.

```python {linenos=table}
"""tests.test_timeout"""
import time
import pytest
from decorators.timeout import timeout


@timeout(seconds=1)
def sleep():
    time.sleep(2)


def test_timeout():
    with pytest.raises(TimeoutError):
        sleep()

```

## Example: Retry Function

The next example is similar to the `@timeout` decorator since both are designed to handle functions that are unreliable. The `@retry` decorator adds retry logic to the decorated function.

To use it, you specify a **set** of `exceptions` that can trigger a failed attempt, the number of failed attempts that can occur before aborting the function call (`max_attempts`), the number of seconds to delay after each failed attempt before trying again (`delay`) and an optional handler method to be called whenever an exception is raised (for logging, etc).

The actual decorator definition begins on **Line 26** below. Before that, the custom Exception `RetryLimitExceededError` is defined **(Lines 6-13)**. This is the exception raised after `max_attempts` to call the function have failed. The `handle_failed_attempt` function **(Lines 16-23)** is provided as an example of what could be provided to the `@retry` decorator's `on_failure` parameter.

```python {linenos=table}
"""decorators.retry"""
from functools import wraps
from time import sleep


class RetryLimitExceededError(Exception):
    """Custom error raised by retry decorator when max_attempts have failed."""

    def __init__(self, func, max_attempts):
        message = (
            f"Retry limit exceeded! (function: {func.__name__}, max attempts: {max_attempts})"
        )
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

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for remaining in reversed(range(max_attempts)):
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

    return decorator

```

We can use the `@timeout` decorator to demonstrate and test the `@retry` decorator. Since we need to know the type of `Exception` that we expect to occur when we call the decorated function, we specify `exceptions=(TimeoutError,)` since this is the error raised by the `@timeout` decorator.

With the code below, we will attempt to call `retry_with_timeout` a maximum of two times. Since the only thing this function does is wait for two seconds and we have decorated it with `@timeout(seconds=1)`, calling it will always raise a `TimeoutError`. Therefore, after the second failed attempt, the `@retry` decorator will raise a `RetryLimitExceededError`.

Finally, the `test_retry_with_timeout` function verifies that the `RetryLimitExceededError` is in fact raised after calling the `retry_with_timeout` function.

```python {linenos=table}
"""tests.test_retry"""
import time

import pytest

from decorators.retry import retry, RetryLimitExceededError
from decorators.timeout import timeout


@retry(max_attempts=2, delay=1, exceptions=(TimeoutError,))
@timeout(seconds=1)
def retry_with_timeout():
    time.sleep(2)


def test_retry_with_timeout():
    with pytest.raises(RetryLimitExceededError):
        retry_with_timeout()

```

## Example: Log Call Signature and Execution Time

The most common application of decorators might be logging. It's easy to see why, having the ability to run code immediately before and after a function is called allows you to report information and capture metrics.

This decorator uses the class-based design, and allows the user to provide a custom logger. If none is provided, a logger will be created based on the module that contains the wrapped function.

Whenever the function is called, the `@LogCall()` decorator adds an `info` level entry the the log with the following data:

* Timestamp when the function was called
* function name and values of all arguments provided to the function (i.e. the call signature)
* Time elapsed while executing the function

```python {linenos=table}
"""decorators.log_call"""
import inspect
import logging
from datetime import datetime
from functools import wraps

DT_NAIVE = "%Y-%m-%d %I:%M:%S %p"


class LogCall:
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

The code below tests the `@LogCall()` decorator with a custom logger and with the default logger. With the default logger, we expect the name of the logger to be the name of the module containing the decorated function, `tests.test_log_call` **(Line 30)**. When a custom logger is provided, we expect the name to match the value we specified when the logger was created, `custom_log` **(Lines 10, 38)**.

A nice feature of this decorator is that the function call signature contains the names and values of all keyword arguments, even if a default value was used or if the name was not given when the call occurred. For example, the call to the decorated function in **Line 28** is `save_values("Aaron", "Charlie", "Ollie")`, but the call signature that is logged contains the names of all three arguments, `save_values(a=Aaron, b=Charlie, c=Ollie)` **(Line 32)**.

Similarly, the call to the decorated function in **Line 36** is `rand_time(max=4, add_random=True)`, which only provides two arguments. The call signature that is logged includes the default value of the missing argument, `rand_time(min=1, max=4, add_random=True)` **(Line 40)**.

```python {linenos=table}
"""tests.test_log_call"""
import time
import logging
from random import randint

from decorators.log_call import LogCall


logging.basicConfig()
log = logging.getLogger("custom_log")
log.setLevel(logging.INFO)
log.info("logging started")


@LogCall()
def save_values(a, b, c):
    pass


@LogCall(log)
def rand_time(min=1, max=3, add_random=False):
    time.sleep(randint(min, max))
    if add_random:
        time.sleep(randint(100, 500) / 1000.0)


def test_default_logger(caplog):
    save_values("Aaron", "Charlie", "Ollie")
    logger, level, message = caplog.record_tuples[-1]
    assert logger == "tests.test_log_call"
    assert level == logging.INFO
    assert "save_values(a=Aaron, b=Charlie, c=Ollie)" in message


def test_custom_logger(caplog):
    rand_time(max=4, add_random=True)
    logger, level, message = caplog.record_tuples[-1]
    assert logger == "custom_log"
    assert level == logging.INFO
    assert "rand_time(min=1, max=4, add_random=True)" in message

```

If we run `pytest` for these decorator examples, all of the tests pass:

<pre><code class="pytest"><span class="cmd-venv">(venv) decorators $</span> <span class="cmd-input">pytest tests/test_*</span>
<span class="cmd-results">================================================================= test session starts ==================================================================
platform darwin -- Python 3.7.6, pytest-5.3.5, py-1.8.1, pluggy-0.13.1 -- /Users/aaronluna/Desktop/vigorish/venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/aaronluna/Desktop/vigorish, inifile: pytest.ini
plugins: clarity-0.3.0a0, black-0.3.8, mypy-0.5.0, dotenv-0.4.0, flake8-1.0.4, cov-2.8.1
collected 10 items

tests/test_log_call.py::FLAKE8 PASSED                                                                                                            [ 10%]
tests/test_log_call.py::BLACK PASSED                                                                                                             [ 20%]
tests/test_log_call.py::test_default_logger PASSED                                                                                               [ 30%]
tests/test_log_call.py::test_custom_logger PASSED                                                                                                [ 40%]
tests/test_retry.py::FLAKE8 PASSED                                                                                                               [ 50%]
tests/test_retry.py::BLACK PASSED                                                                                                                [ 60%]
tests/test_retry.py::test_retry_with_timeout PASSED                                                                                              [ 70%]
tests/test_timeout.py::FLAKE8 PASSED                                                                                                             [ 80%]
tests/test_timeout.py::BLACK PASSED                                                                                                              [ 90%]
tests/test_timeout.py::test_timeout PASSED                                                                                                       [100%]

================================================================== 10 passed in 6.63s ==================================================================

</span></code></pre>

## Summary

If you would like to download all or some of the code from this post, you can easily do so from the Github gist linked below:

<div class="hero-buttons">
  <a href="https://gist.github.com/a-luna/0a20912a82a8b867e19ab3734fce482a" target="_blank">Python Decorators</a>
</div>

I hope this introduction to decorators in Python was helpful and easy to understand. If you have any questions, criticism or feedback please leave a comment. Thanks!
