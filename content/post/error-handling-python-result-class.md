---
title: "Error Handling in Python: Result Class"
slug: "error-handling-python-result-class"
aliases:
    - /2019/02/06/error-handling-python-result-class/
date: "2019-02-06"
categories: ["Python"]
---

In a [previous post](/2018/02/04/csharp-tpl-socket-methods/), I presented a C# ``Result`` class that represents the outcome of an operation. This class is intended to be used for error handling as an alternative to throwing and handling exceptions. I was introduced to this concept by <a href="https://enterprisecraftsmanship.com/2015/03/20/functional-c-handling-failures-input-errors/" target="_blank">a post</a> from the <a href="https://enterprisecraftsmanship.com/" target="_blank">Enterprise Craftsmanship blog</a>. I recommend reading the entire post, which is part of a series examining how principles from Functional Programming can be applied to C#.

I thought it would be interesting to implement the ``Result`` class in Python, and since Python is dynamically-typed this ended up being much simpler than the C# implementation which required the use of generic types. The entire implementation is given below:

{{< highlight python "linenos=table" >}}"""app.util.result"""

class Result():
    """Represents the outcome of an operation.

    Attributes
    ----------
    success : bool
        A flag that is set to True if the operation was successful, False if
        the operation failed.
    value : object
        The result of the operation if successful, value is None if operation
        failed or if the operation has no return value.
    error : str
        Error message detailing why the operation failed, value is None if
        operation was successful.
    """

    def __init__(self, success, value, error):
        self.success = success
        self.error = error
        self.value = value

    @property
    def failure(self):
        """True if operation failed, False if successful (read-only)."""
        return not self.success

    def __str__(self):
        if self.success:
            return f'[Success]'
        else:
            return f'[Failure] "{self.error}"'

    def __repr__(self):
        if self.success:
            return f"<Result success={self.success}>"
        else:
            return f'<Result success={self.success}, message="{self.error}">'

    @classmethod
    def Fail(cls, error):
        """Create a Result object for a failed operation."""
        return cls(False, value=None, error=error)

    @classmethod
    def Ok(cls, value=None):
        """Create a Result object for a successful operation."""
        return cls(True, value=value, error=None){{< /highlight >}}

The ``Result`` class encapsulates all information relevant to the outcome of an operation. For example, let's say that we have a ``Result`` instance named ``result``. If the operation which ``result`` represents failed, ``result.success`` will be ``False`` and ``result.error`` will contain a string detailing why the operation failed. If the operation succeeded, ``result.success`` will be ``True`` (``result.error`` will be ``None``). If the operation produced any output, this will be stored in ``result.value`` (an operation is not required to produce an output). Result objects are not intended to replace exception handling in all scenarios, and the author of the EC blog provides a simple rule to determine when each should be used:

* Use a ``Result`` object for expected failures that you know how to handle.
* Throw an exception when an unexpected error occurs.

To demonstrate how the ``Result`` class should be used, the function ``decode_auth_token`` in module ``app.util.auth`` validates an access token in JWT format. Please note the highlighted line numbers:

{{< highlight python "linenos=table" >}}"""app.util.auth"""

import jwt

from app.config import key
from app.models.blacklist_token import BlacklistToken
from app.util.result import Result

def decode_auth_token(access_token):
    """Decode an access token in JWT format."""
    result = check_blacklist(access_token)
    if result.failure:
        return result
    try:
        payload = jwt.decode(access_token, key)
        return Result.Ok(payload['sub'])
    except jwt.ExpiredSignatureError:
        error =  'Access token expired. Please log in again.'
        return Result.Fail(error)
    except jwt.InvalidTokenError:
        error =  'Invalid token. Please log in again.'
        return Result.Fail(error)

def check_blacklist(access_token):
    exists = BlacklistToken.query.filter_by(token=str(access_token)).first()
    if exists:
        error = 'Token blacklisted. Please log in again.'
        return Result.Fail(error)
    return Result.Ok(){{< /highlight >}}

* **Lines 11-13:** If you call a function that returns a ``Result`` object, you should check the value of ``result.failure`` (or ``result.success``). I prefer checking ``result.failure`` to reduce unnecessary indentation.
  * If the operation failed, you should handle the failure immediately or return the result object upstream until you reach an appropriate place to handle and/or report the failure.
  * If the operation was successful and you expect the function to return a value, you can retrieve it by calling ``result.value``. If no value is expected, (as is the case for the ``check_blacklist`` function) you simply keep executing your current function.
* **Lines 16 and 29:** To indicate that a function (operation) was successful, the function should return ``Result.Ok()``. You may have noticed in the ``Result`` class that providing a ``value`` as a parameter is optional. If the successful operation produces a result (e.g. ``payload['sub']``) the client can retrieve it from ``result.value``.
* **Lines 19, 22, 28** In the case of decoding a json web token, we expect exceptions ``jwt.ExpiredSignatureError`` and ``jwt.InvalidTokenError`` to occur and we know how to handle them (Deny the user from performing the requested action and prompt them to re-authenticate). This is the exact use case we defined for the ``Result`` class earlier in this post. To indicate that a function has failed, return ``Result.Fail(error)`` (``error`` should be a message explaining why the operation failed).

The Python REPL code below demonstrates how the ``decode_auth_token`` function behaves and how to interact with the ``Result`` objects that the function returns:

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">access_token = request.headers.get('Authorization')</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result = decode_auth_token(access_token)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result</span>
<span class="cmd-repl-results">Result&lt;success=True&gt;</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.success</span>
<span class="cmd-repl-results">True</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.value</span>
<span class="cmd-repl-results">'570eb73b-b4b4-4c86-b35d-390b47d99bf6'</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.failure</span>
<span class="cmd-repl-results">False</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.error</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">print(result)</span>
<span class="cmd-repl-results">[Success]</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">exit()</span></code></pre>

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">auth_token_bad = request.headers.get('Authorization')</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result = decode_auth_token(auth_token_bad)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result</span>
<span class="cmd-repl-results">Result&lt;success=False, message="Invalid token. Please log in again."&gt;</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.success</span>
<span class="cmd-repl-results">False</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.value</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.failure</span>
<span class="cmd-repl-results">True</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.error</span>
<span class="cmd-repl-results">'Invalid token. Please log in again.'</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">print(result)</span>
<span class="cmd-repl-results">[Failure] "Invalid token. Please log in again."</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">exit()</span></code></pre>

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">auth_token_expired = request.headers.get('Authorization')</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result = decode_auth_token(auth_token_expired)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result</span>
<span class="cmd-repl-results">Result&lt;success=False, message="Access token expired. Please log in again."&gt;</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.success</span>
<span class="cmd-repl-results">False</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.value</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.failure</span>
<span class="cmd-repl-results">True</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.error</span>
<span class="cmd-repl-results">'Access token expired. Please log in again.'</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">print(result)</span>
<span class="cmd-repl-results">[Failure] "Access token expired. Please log in again."</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">exit()</span></code></pre>

I find that code becomes easier to read and digest visually when the ``Result`` class is incorporated. It becomes easier to discern what happens when a failure occurs and how the failure is handled, in contrast to a design that favors exception handling as the primary method of error handling.

I have taken the time to explain the Python version of the ``Result`` class because it will be referenced frequently in upcoming posts. As always, please give me your feedback or questions in the comments!
