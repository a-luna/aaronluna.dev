---
title: "How To: Create a Flask API with JWT-Based Authentication (Part 4)"
lead: "Part 4: JWT Authentication, Decorators and Blacklisting Tokens"
slug: "part-4"
series: ["flask_api_tutorial"]
series_weight: 4
series_title: "How To: Create a Flask API with JWT-Based Authentication"
series_part: "Part 4"
series_part_lead: "JWT Authentication, Decorators and Blacklisting Tokens"
menu_section: "tutorials"
categories: ["Flask", "Python", "Tutorial-Series"]
toc: true
summary: "Part 4 completes the user authorization API by implementing login, logout and user verification API endpoints. The process to create a custom decorator that only allows access to users with a valid JWT is covered in-depth. How to send an HTTP request for a protected resource that includes a JWT is demonstrated with both Swagger UI and command-line tools. A new class/database model is introduced to create a token blacklist, to ensure that JWTs cannot be used after the user has logged out. Test cases are created and executed for all API endpoints covering successful and failed attempts to login/logout/retrieve user info."
git_release_name: "v0.4"
url_git_rel_browse: "https://github.com/a-luna/flask-api-tutorial/tree/v0.4"
url_git_rel_zip: "https://github.com/a-luna/flask-api-tutorial/archive/v0.4.zip"
url_git_rel_tar: "https://github.com/a-luna/flask-api-tutorial/archive/v0.4.tar.gz"
url_git_rel_diff: "https://github.com/a-luna/flask-api-tutorial/compare/v0.3...v0.4"
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Alex Pudov on Unsplash"
  - name: img1
    src: images/p04-01-login-endpoint.jpg
    title: Figure 1 - Swagger UI with /auth/login endpoint
  - name: img2
    src: images/p04-02-swagger-ui-auth.jpg
    title: Figure 2 - Swagger UI with /auth/user endpoint
  - name: img3
    src: images/p04-03-auth-user-no-token-swagger.jpg
    title: Figure 3 - Endpoint requires authorization (Swagger UI)
  - name: img4
    src: images/p04-04-retrieve-access-token-swagger.jpg
    title: Figure 4 - Retrieve access token from response body (Swagger UI)
  - name: img5
    src: images/p04-05-configure-access-token-swagger.jpg
    title: Figure 5 - Configure Swagger UI access token
  - name: img6
    src: images/p04-06-close-authorizations-dialog-swagger.jpg
    title: Figure 6 - Access token configuration complete
  - name: img7
    src: images/p04-07-lock-icons-swagger.jpg
    title: Figure 7 - Authorization required icons are locked after configuring access token
  - name: img8
    src: images/p04-08-auth-user-success-swagger.jpg
    title: Figure 8 - Request for /auth/user successful (Swagger UI)
  - name: img9
    src: images/p04-09-auth-user-token-expired-swagger.jpg
    title: Figure 9 - Request failed (Token expired)
  - name: img10
    src: images/p04-10-auth-user-invalid-token-swagger.jpg
    title: Figure 10 - Request failed (Invalid token)
---
## Project Structure

The chart below shows the folder structure for this section of the tutorial. In this post, we will work on all files marked as <code class="work-file">NEW CODE</code>. Files that contain code from previous sections but will not be modified in this post are marked as <code class="unmodified-file">NO CHANGES</code>.

<pre class="project-structure"><div><span class="project-folder">.</span> <span class="project-structure">(project root folder)</span>
|- <span class="project-folder">src</span>
|   |- <span class="project-folder">flask_api_tutorial</span>
|       |- <span class="project-folder">api</span>
|       |   |- <span class="project-folder">auth</span>
|       |   |   |- <span class="project-empty-file">__init__.py</span>
|       |   |   |- <span class="work-file">business.py</span>
|       |   |   |- <span class="work-file">decorator.py</span>
|       |   |   |- <span class="work-file">dto.py</span>
|       |   |   |- <span class="work-file">endpoints.py</span>
|       |   |
|       |   |- <span class="project-folder">widgets</span>
|       |   |   |- <span class="project-empty-file">__init__.py</span>
|       |   |
|       |   |- <span class="unmodified-file">__init__.py</span>
|       |
|       |- <span class="project-folder">models</span>
|       |   |- <span class="project-empty-file">__init__.py</span>
|       |-  |- <span class="work-file">token_blacklist.py</span>
|       |-  |- <span class="work-file">user.py</span>
|       |
|       |- <span class="project-folder">util</span>
|       |   |- <span class="project-empty-file">__init__.py</span>
|       |-  |- <span class="unmodified-file">datetime_util.py</span>
|       |-  |- <span class="unmodified-file">result.py</span>
|       |
|       |- <span class="unmodified-file">__init__.py</span>
|       |- <span class="unmodified-file">config.py</span>
|
|- <span class="project-folder">tests</span>
|   |- <span class="project-empty-file">__init__.py</span>
|   |- <span class="unmodified-file">conftest.py</span>
|   |- <span class="work-file">test_auth_login.py</span>
|   |- <span class="work-file">test_auth_logout.py</span>
|   |- <span class="unmodified-file">test_auth_register.py</span>
|   |- <span class="work-file">test_auth_user.py</span>
|   |- <span class="unmodified-file">test_config.py</span>
|   |- <span class="unmodified-file">test_user.py</span>
|   |- <span class="work-file">util.py</span>
|
|- <span class="unmodified-file">.env</span>
|- <span class="unmodified-file">.gitignore</span>
|- <span class="unmodified-file">.pre-commit-config.yaml</span>
|- <span class="unmodified-file">pyproject.toml</span>
|- <span class="unmodified-file">pytest.ini</span>
|- <span class="unmodified-file">README.md</span>
|- <span class="work-file">run.py</span>
|- <span class="unmodified-file">setup.py</span>
|- <span class="unmodified-file">tox.ini</span></div>
<div class="project-structure-key-wrapper">
<div class="project-structure-key">
<div class="key-item key-label">KEY:</div>
<div class="key-item project-folder">FOLDER</div>
<div class="key-item work-file">NEW CODE</div>
<div class="key-item unmodified-file">NO CHANGES</div>
<div class="key-item project-empty-file">EMPTY FILE</div>
</div>
</div></pre>

## `api.auth_login` Endpoint

That last section ended up being a lot longer than I anticipated, but I don't think the rest of the `auth_ns` endpoints will require the same amount of explanation since there's no need to repeat the same information. Right off the bat, we do not need to create a `RequestParser` or API model since the <code>api.auth_login</code> endpoint can use the `auth_reqparser` to validate request data.

Why is this the case? The data required to register a new user or authenticate an existing user is the same: email address and password. With that out of the way, we can move on to defining the business logic needed to authenticate an existing user.

### `process_login_request` Function

When a user sends a login request and their credentials are successfully validated, the server must return an HTTP response that includes an access token. As we saw when we implemented the registration process, any response that includes sensitive information (e.g., an access token) must satisfy all <a href="https://tools.ietf.org/html/rfc6749#section-5.1" target="_blank">OAuth 2.0 requirements</a>, which we thoroughly documented and implemented [in Part 3](/series/flask-api-tutorial/part-3/#process-registration-request). The implementation for the response to a successful login request will be nearly identical.

Open `src/flask_api_tutorial/api/auth/business.py`, add the content below and save the file:

```python {linenos=table,linenostart=31}
def process_login_request(email, password):
    user = User.find_by_email(email)
    if not user or not user.check_password(password):
        abort(HTTPStatus.UNAUTHORIZED, "email or password does not match", status="fail")
    access_token = user.encode_access_token()
    response = jsonify(
        status="success",
        message="successfully logged in",
        access_token=access_token.decode(),
        token_type="bearer",
        expires_in=_get_token_expire_time(),
    )
    response.status_code = HTTPStatus.OK
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return response
  ```

The first thing we do in this function is call `User.find_by_email` with the email address provided by the user. If no user exists with this email address, the current request is aborted with a response including 401 `HTTPStatus.UNAUTHORIZED`.

If a user matching the provided email address was found in the database, we call `check_password` on the `user` instance, which verifies that the password provided by the user matches the `password_hash` value stored in the database. If the password does not match, the current request is aborted with a response including 401 `HTTPStatus.UNAUTHORIZED`.

If the password is verified, then the response is almost exactly the same as a successful response to a registration request &mdash; we create an access token for the user and include the token in the response. Also, we adhere to the <a href="https://tools.ietf.org/html/rfc6749#section-5.1" target="_blank">requirements from RFC6749</a> which were [fully explained earlier](#process-registration-request). The only difference is the status code, instead of 201 we use 200 `HTTPStatus.OK`.

### `LoginUser` Resource

The API resource that processes login requests will be very similar to the `RegisterUser` resource. First, update the import statements in `src/flask_api_tutorial/api/auth/endpoints.py` to include the `process_login_request` function that we just created (**Line 9**):

```python {linenos=table,hl_lines=[9]}
"""API endpoint definitions for /auth namespace."""
from http import HTTPStatus

from flask_restplus import Namespace, Resource

from flask_api_tutorial.api.auth.dto import auth_reqparser
from flask_api_tutorial.api.auth.business import (
    process_registration_request,
    process_login_request,
)
```

Next, add the content below and save the file:

```python {linenos=table,linenostart=32}
@auth_ns.route("/login", endpoint="auth_login")
class LoginUser(Resource):
    """Handles HTTP requests to URL: /api/v1/auth/login."""

    @auth_ns.expect(auth_reqparser)
    @auth_ns.response(HTTPStatus.OK, "Login succeeded.")
    @auth_ns.response(HTTPStatus.UNAUTHORIZED, "email or password does not match")
    @auth_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    @auth_ns.response(HTTPStatus.INTERNAL_SERVER_ERROR, "Internal server error.")
    def post(self):
        """Authenticate user and return a session token."""
        request_data = auth_reqparser.parse_args()
        email = request_data.get("email")
        password = request_data.get("password")
        return process_login_request(email, password)
  ```

There are two minor differences in the implementation of the `LoginUser` resource and the `RegisterUser` resource:

<div class="code-details">
  <ul>
    <li>
      <p><strong>Line 32: </strong>The <code>@auth_ns.route</code> decorator binds this resource to the <code>/api/v1/auth/login</code> URL route.</p>
    </li>
    <li>
      <p><strong>Line 37: </strong>The HTTP status codes for successfully registering a new user and successfully authenticating an existing user are 201 <code>HTTPStatus.CREATED</code> and 200 <code>HTTPStatus.OK</code> , respectively.</p>
    </li>
  </ul>
</div>

We can verify that the new route was correctly registered by running `flask routes`:

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">flask routes</span>
<span class="cmd-results">Endpoint             Methods  Rule
-------------------  -------  --------------------------
<span class="cmd-hl-gold">api.auth_login       POST     /api/v1/auth/login</span>
api.auth_register    POST     /api/v1/auth/register
api.doc              GET      /api/v1/ui
api.root             GET      /api/v1/
api.specs            GET      /api/v1/swagger.json
restplus_doc.static  GET      /swaggerui/&lt;path:filename&gt;
static               GET      /static/&lt;path:filename&gt;</span></code></pre>

The Swagger UI should also be updated to include the new API endpoint:

{{< linked_image img1 >}}

Finally, let's create unit tests to verify the login process is working correctly.

### Unit Tests: `test_auth_login.py`

First, we need to create a function that sends a post request to the new endpoint we just created. Since this function will be used by nearly all of our test cases, we place it in the `tests/util.py` file:

```python {linenos=table,linenostart=17}
def login_user(test_client, email=EMAIL, password=PASSWORD):
    return test_client.post(
        url_for("api.auth_login"),
        data=f"email={email}&password={password}",
        content_type="application/x-www-form-urlencoded",
    )
```

Hopefully this looks familiar to you since it is nearly the same as the `register_user` function. Next, create a new file named `test_auth_login.py` in the `tests` folder, add the content below and save the file:

```python {linenos=table}
"""Unit tests for api.auth_login API endpoint."""
from http import HTTPStatus

from flask_api_tutorial.models.user import User
from tests.util import EMAIL, register_user, login_user

SUCCESS = "successfully logged in"
UNAUTHORIZED = "email or password does not match"


def test_login(client, db):
    register_user(client)
    response = login_user(client)
    assert response.status_code == HTTPStatus.OK
    assert "status" in response.json and response.json["status"] == "success"
    assert "message" in response.json and response.json["message"] == SUCCESS
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    result = User.decode_access_token(access_token)
    assert result.success
    token_payload = result.value
    assert not token_payload["admin"]
    user = User.find_by_public_id(token_payload["public_id"])
    assert user and user.email == EMAIL


def test_login_email_does_not_exist(client, db):
    response = login_user(client)
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "status" in response.json and response.json["status"] == "fail"
    assert "message" in response.json and response.json["message"] == UNAUTHORIZED
    assert "access_token" not in response.json
```

Everything in this file should be simple to understand since it is so similar to the test set we just created. Run  `tox` and make sure no failures occur.

## Decorators

Let's take a break from implementing the API endpoints in the `auth_ns` namespace to create two custom decorators. Understanding how decorators work and how to create them can be a daunting topic. I recommend reading at least one of the following articles:

<ul class="list-of-links">
  <li><a href="https://realpython.com/primer-on-python-decorators/" target="_blank">Primer on Python Decorators (Real Python)</a></li>
  <li><a href="https://blog.apcelent.com/python-decorator-tutorial-with-example.html" target="_blank">Python Decorator Tutorial with Example (Apcelent Tech Blog)</a></li>
  <li><a href="https://stackoverflow.com/questions/739654/how-to-make-a-chain-of-function-decorators" target="_blank">How to make a chain of function decorators? (Stack Overflow)</a></li>
</ul>

It might seem weird to recommend a Stack Overflow post as a general-purpose guide, but I think you will be pleasantly surprised if you visit the page.

Create a new file named `decorator.py` in `src/flask_api_tutorial/api/auth` and add the content below:

```python {linenos=table}
"""Decorators that decode and verify authorization tokens."""
from functools import wraps
from http import HTTPStatus

from flask import jsonify, request
from flask_restplus import abort

from flask_api_tutorial.models.user import User

_REALM_REGULAR_USERS = "registered_users@mydomain.com"
_REALM_ADMIN_USERS = "admin_users@mydomain.com"


def token_required(f):
    """Allow access to the wrapped function if the request header contains a valid access token."""

    @wraps(f)
    def decorated(*args, **kwargs):
        token_payload = _check_access_token(admin_only=False)
        for name, val in token_payload.items():
            setattr(decorated, name, val)
        return f(*args, **kwargs)

    return decorated


def admin_token_required(f):
    """Allow access to the wrapped function if the user has admin privileges."""

    @wraps(f)
    def decorated(*args, **kwargs):
        token_payload = _check_access_token(admin_only=True)
        if not token_payload["admin"]:
            _admin_token_required()
        for name, val in token_payload.items():
            setattr(decorated, name, val)
        return f(*args, **kwargs)

    return decorated


def _check_access_token(admin_only):
    token = request.headers.get("Authorization")
    if not token:
        _no_access_token(admin_only)
    payload = User.decode_access_token(token).on_failure(_invalid_token, admin_only)
    return payload


def _no_access_token(admin_only):
    response = jsonify(status="fail", message="Unauthorized")
    response.status_code = HTTPStatus.UNAUTHORIZED
    realm = _REALM_ADMIN_USERS if admin_only else _REALM_REGULAR_USERS
    response.headers["WWW-Authenticate"] = f'Bearer realm="{realm}"'
    abort(response)


def _invalid_token(message, admin_only):
    response = jsonify(status="fail", message=f"{message}")
    response.status_code = HTTPStatus.UNAUTHORIZED
    realm = _REALM_ADMIN_USERS if admin_only else _REALM_REGULAR_USERS
    response.headers["WWW-Authenticate"] = (
        f'Bearer realm="{realm}", '
        f'error="invalid_token", '
        f'error_description="{message}"'
    )
    abort(response)


def _admin_token_required():
    response = jsonify(status="fail", message="You are not an administrator")
    response.status_code = HTTPStatus.FORBIDDEN
    response.headers["WWW-Authenticate"] = (
        f'Bearer realm="{_REALM_ADMIN_USERS}", '
        f'error="insufficient_scope", '
        f'error_description="You are not an administrator"'
    )
    abort(response)
```

The decorators defined in this module are responsible for implementing key parts of the Bearer token authentication model. It is important to understand how they are designed and how this design is driven by the need to obey the specifications from <a href="https://tools.ietf.org/html/rfc6750" target="_blank">RFC6750</a>:

<div class="code-details">
  <ul>
    <li>
      <p><strong>Lines 14, 27: </strong>This module exposes two decorators, <code>@token_required</code> and <code>@admin_token_required</code>. If access to a method/function needs to be restricted to users who have a valid <code>access_token</code>, simply decorate it with <code>@token_required</code>. If access needs to be restricted solely to users who have a valid <code>access_token</code> <span class="emphasis">AND</span> administrator privileges, decorate the method with <code>@admin_token_required</code> instead.</p>
    </li>
    <li>
      <p><strong>Lines 19, 32: </strong>The first thing both decorators do is call the <code>_check_access_token</code> function. This function returns a <code>token_payload</code> object if an <code>access_token</code> was sent in the request header <span class="emphasis">AND</span> the token was successfully decoded. If no <code>access_token</code> was sent or the token is invalid/expired, the current request is aborted.</p>
    </li>
    <li>
      <p><strong>Lines 20-21, 35-36: </strong>Both decorators pass the contents of <code>token_payload</code> to the decorated function in the same way &mdash; by iterating over the dictionary items and (for each item) creating a new attribute on the decorated function (attribute name = dict item key, attribute value = dict item value). This allows the decorated function to access the user's <code>public_id</code>, the <code>access_token</code> string value, etc.</p>
      <p>If that explanation was confusing, it should make more sense after we apply the decorator to a function and step through the code, which will happen very shortly.</p>
    </li>
    <li>
      <p><strong>Lines 43-45: </strong>Within the <code>_check_access_token</code> function, <code>request</code> is the global <code>flask.request</code> object, which allows us to access the headers from the current request, among other things. For more info, check out <a href="https://flask.palletsprojects.com/en/1.1.x/reqcontext/" target="_blank">the Flask docs</a>. If no token is found in the header's <code>Authorization</code> field, the current request is aborted to prevent access to the requested resource.</p>
    </li>
    <li>
      <p><strong>Line 46: </strong>This line demonstrates how <code>Result</code> objects can be used to chain a sequence of function calls based on the outcome of the previous operation. If the call to <code>User.decode_access_token</code> was successful, the <code>result.value</code> from the decoded token is returned to the decorator function. If the token was not decoded successfully, then the <code>on_failure</code> method passes <code>result.error</code> from the failed operation to <code>_invalid_token</code>.</p>
    </li>
    <li>
      <p><strong>Lines 50-55: </strong>If a function is decorated with either <code>@token_required</code> or <code>@admin_token_required</code>, and the request does not include an <code>access_token</code> in the header, then the request will be aborted by calling <code>_no_access_token</code>.</p>
      <p>The <code>jsonify</code> function (in a nutshell) calls <code>json.dumps</code> and turns the JSON into a HTTP response (the <a href="https://flask.palletsprojects.com/en/1.1.x/api/?highlight=jsonify#flask.json.jsonify" target="_blank">actual behavior</a> is more nuanced than that). Creating a response object manually is necessary if you need to add a custom header, which is required whenever a request for a protected resource does not contain an access token.</p>
      <P><a href="https://tools.ietf.org/html/rfc6750#section-3" target="_blank">Per Section 3 of RFC6750</a>:</P>
      <blockquote class="rfc">If the protected resource request does not include authentication credentials or does not contain an access token that enables access to the protected resource, <strong>the resource server MUST include the HTTP
   "WWW-Authenticate" response header field</strong> ... If the request lacks any authentication information (e.g., the client
   was unaware that authentication is necessary or attempted using an unsupported authentication method), the resource server <strong>SHOULD NOT</strong> include an error code or other error information.
        <p>For example:</p>
        <p style="margin: 0 0 0 1em"><code>HTTP/1.1 401 Unauthorized<br>
     WWW-Authenticate: Bearer realm="example"</code></p>
      </blockquote>
      <p>RFC6750 also states that <code>WWW-Authenticate: Bearer</code> "MUST be followed by one or more
   auth-param values" and goes on to suggest that "a <span class="bold-text">realm</span> attribute MAY be included to indicate the scope of
   protection". <a href="https://tools.ietf.org/html/rfc2617#section-3.2.1" target="_blank">Section 3.2.1 of RFC2167</a> (HTTP Authentication: Basic and Digest Access Authentication) defines the <span class="bold-text">realm</span> attribute:</p>
      <blockquote class="rfc"><strong>realm</strong>
        <p style="margin: 0 0 0 1em">A string to be displayed to users so they know which username and password to use. This string should contain at least the name of the host performing the authentication and might additionally indicate the collection of users who might have access. An example might be "registered_users@gotham.news.com".</p>
      </blockquote>
      <p>If a request is recieved without an access token in the request header, the <span class="bold-text">realm</span> attribute in the <span class="bold-text">WWW-Authenticate</span> field of the response header will communicate the access level necessary for the requested resource &mdash; either <code>registered_users@mydomain.com</code> or <code>admin_users@mydomain.com</code>.</p>
    </li>
    <li>
      <p><strong>Line 58: </strong>If a function is decorated with either <code>@token_required</code> or <code>@admin_token_required</code>, and the <code>access_token</code> is invalid or expired, then the request will be aborted by calling <code>_invalid_token</code>.</p>
    </li>
    <li>
      <p><strong>Lines 62-65: </strong>The required response to a request where the token failed authentication is given in <a href="https://tools.ietf.org/html/rfc6750#section-3.1" target="_blank">Section 3.1 of RFC6750</a>:</p>
      <blockquote class="rfc">If the protected resource request included an access token and failed authentication, <strong>the resource server SHOULD include the "error" attribute</strong> to provide the client with the reason why the access request was declined ... In addition, <strong>the resource server MAY include the "error_description" attribute</strong> to provide developers a human-readable explanation that is not meant to be displayed to end-users.
      <p>For example, ... in response to a protected resource request with an authentication attempt using an expired access token:</p>
      <p style="margin: 0 0 0 1em"><code>HTTP/1.1 401 Unauthorized<br>
     WWW-Authenticate: Bearer realm="example", error="invalid_token", error_description="The access token expired"</code></p></blockquote>
    </li>
    <li>
      <p><strong>Line 70: </strong>If a function is decorated with <code>@admin_token_required</code> and the <code>access_token</code> is decoded successfully <span class="emphasis">BUT</span> the user does not have administrator priveleges, then the request will be aborted by calling <code>_admin_token_required</code>.</p>
    </li>
    <li>
      <p><strong>Lines 73-76: </strong>The required response to a request where the token was successfully decoded but the user does not have administrator privileges is nearly the same as the required response to a request where the token failed authentication. The "error" attribute of the response should be <a href="https://tools.ietf.org/html/rfc6750#section-3.1" target="_blank">"insufficient_scope"</a>, and the HTTP status code is 403 <code>HTTPStatus.FORBIDDEN</code> rather than 401 <code>HTTPStatus.UNAUTHORIZED</code>:</p>
      <blockquote class="rfc"><strong>insufficient_scope</strong>
      <p style="margin: 0 0 0 1em">The request requires higher privileges than provided by the access token.  The resource server SHOULD respond with the HTTP 403 (Forbidden) status code and MAY include the "scope" attribute with the scope necessary to access the protected resource.</p></blockquote>
    </li>
  </ul>
</div>

Let's see how we can apply the <code>@token_required</code> decorator to the remaining API endpoints since both rely upon the <code>access_token</code> being sent with the HTTP request.

## `api.auth_user` Endpoint

The purpose of this endpoint is to verify that the `access_token` issued to the logged-in user is currently valid, and if so, to return a representation of the current user containing the `email`, `public_id`, `admin` and `registered_on` attributes from the `User` model class.

The way we implement this endpoint will demonstrate a few new concepts:

<ul>
  <li>How to create an API model and use it to serialize a database object to JSON, in order to send the database object in a HTTP response.</li>
  <li>How to use the <code>@token_required</code> decorator</li>
  <li>How to send requests from Swagger UI and httpie that include the <code>access_token</code> in the request header.</li>
</ul>

### `user_model` API Model

The first thing we need to do is create an API model for the `User` class. In `src/flask_api_tutorial/api/auth/dto.py`, update the import statements to incude the `Model` class from `flask_restplus` and the `String` and `Boolean` classes from the `flask_restplus.fields` module (**Lines 2-3**):

```python {linenos=table,hl_lines=["2-3"]}
"""Parsers and serializers for /auth API endpoints."""
from flask_restplus import Model
from flask_restplus.fields import String, Boolean
from flask_restplus.inputs import email
from flask_restplus.reqparse import RequestParser
```

Next, add the content below and save the file:

```python {linenos=table,linenostart=16}
user_model = Model(
    "User",
    {
        "email": String,
        "public_id": String,
        "admin": Boolean,
        "registered_on": String(attribute="registered_on_str"),
        "token_expires_in": String,
    },
)
```

`"User"` is the name of the API Model, and this value will be used to identify the JSON object in the Swagger UI page. Please read <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html" target="_blank">the Flask-RESTPlus documentation</a> for detailed examples of creating API models. Basically, an API model is a dictionary where the keys are the names of attributes on the object that we need to serialize, and the values are a class from the `fields` module that formats the value of the attibute on the object to ensure that it can be safely included in the HTTP response.

Any other attributes of the object are considered private and will not be included in the JSON. If the name of the attribute on the object is different than the name that you wish to use in the JSON, specify the name of the attribute on the object using the `attribute` parameter, which is what we are doing for `registered_on` in the code above (**Line 22**).

You may have noticed that the `User` class has attributes named `registered_on` and `registered_on_str`, a `datetime` and `str` value, respectively. `registered_on_str` is the `datetime` value formatted as a concise, easy-to-read string. We want to use the string version in our JSON, but would rather use `registered_on` as the name, rather than `registered_on_str`. Specifying `attribute="registered_on_str"` in the `fields.String` constructor achieves this.

The last attribute in the `User` API model is named `token_expires_in`, but the `User` db model does not contain an attribute that matches this in any way. So why would we define an API model with a value that doesn't exist on the object being modeled?

Objects in Python are quite permissive due to the language's dynamic nature. For example, you are free to create new attributes of your choosing on any object, and we will modify the `User` object to include an attribute named `token_expires_in` before we marshal the object to JSON and send it to the client. The value for this attribute will be a formatted string representing the `timedelta` until the token expires, which is available from the payload of the user's access token after validating that the token is valid.

The Flask-RESTPlus docs contain a <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#module-flask_restplus.fields" target="_blank">full list of the classes available in the `fields' module</a> as well as <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html#custom-fields-multiple-values" target="_blank">instructions for creating a custom formatter</a>.

### `get_logged_in_user` Function

Our next task is to create the business logic for the `api.auth_user` endpoint. The first thing we need to do is verify that the access token included in the request is valid. Sounds like a job for the `@token_required` decorator!

Open `src/flask_api_tutorial/api/auth/business.py` and update the import statements to include the `@token_required` decorator and a few helper functions from the `datetime_util` module (<strong>Line 8</strong> and <strong>Line 10</strong>).

```python {linenos=table,hl_lines=[8,10]}
"""Business logic for /auth API endpoints."""
from http import HTTPStatus

from flask import current_app, jsonify
from flask_restplus import abort

from flask_api_tutorial import db
from flask_api_tutorial.api.auth.decorator import token_required
from flask_api_tutorial.models.user import User
from flask_api_tutorial.util.datetime_util import (
    remaining_fromtimestamp,
    format_timespan_digits,
)
```

Then, add the decorated function:

```python {linenos=table,linenostart=54}
@token_required
def get_logged_in_user():
    public_id = get_logged_in_user.public_id
    user = User.find_by_public_id(public_id)
    expires_at = get_logged_in_user.expires_at
    user.token_expires_in = format_timespan_digits(remaining_fromtimestamp(expires_at))
    return user
```

Thanks to the `@token_required` decorator, if the request header does not contain an access token or the access token was sent but is invalid/expired, the `get_logged_in_user` function is never actually executed (unless a valid token is found, the current request is aborted before calling the wrapped function). So what's the deal with **Line 56** above? It isn't very obvious, so let's break it down line-by-line. First, look at the code for `@token_required`:

```python {linenos=table,linenostart=14}
def token_required(f):
    """Allow access to the wrapped function if the request header contains a valid access token."""

    @wraps(f)
    def decorated(*args, **kwargs):
        token_payload = _check_access_token(admin_only=False)
        for name, val in token_payload.items():
            setattr(decorated, name, val)
        return f(*args, **kwargs)

    return decorated
```

After successfully decoding the token in **Line 19**, the function iterates over the items in `token_payload`. Each item's name and value are then used to call `setattr` on `decorated` (remember, `decorated` is the wrapped function, in this case `get_logged_in_user`).

The code below shows the value of all local variables while iterating over `token_payload`'s items:

```python
# f = <function get_logged_in_user at 0x1080a1ef0>
@wraps(f)
def decorated(*args, **kwargs):
    # decorated = <function get_logged_in_user at 0x1080a1f80>
    token_payload = _check_access_token(admin_only=False)
    # token_payload = {'public_id': '77e8570c-5432-4a5a-9a5d-71915604a0db', 'admin': False, 'token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE...HNlfQ.wNvDzYMiY70wWm4xmt698G1WYgPPup6OH1NrcsfaXy0', 'expires_at': 1565075425}
    # len(token_payload) = 4
    for name, val in token_payload.items():
    # name = 'public_id'
    # val = '77e8570c-5432-4a5a-9a5d-71915604a0db'
        setattr(decorated, name, val)
        # decorated.public_id = '77e8570c-5432-4a5a-9a5d-71915604a0db'
    for name, val in token_payload.items():
    # name = 'admin'
    # val = False
        setattr(decorated, name, val)
        # decorated.admin = False
    for name, val in token_payload.items():
    # name = 'token'
    # val = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE...HNlfQ.wNvDzYMiY70wWm4xmt698G1WYgPPup6OH1NrcsfaXy0'
        setattr(decorated, name, val)
        # decorated.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE...HNlfQ.wNvDzYMiY70wWm4xmt698G1WYgPPup6OH1NrcsfaXy0'
    for name, val in token_payload.items():
    # name = 'expires_at'
    # val = 1565075425
        setattr(decorated, name, val)
        # decorated.expires_at = 1565075425
    return f(*args, **kwargs)
```

The important thing to grasp is that we are creating attributes on the `get_logged_in_user` function for each item in `token_payload`. I've isolated the lines from above that only report the value of the `decorated` object (which is the `get_logged_in_user` function):

```python
# decorated = <function get_logged_in_user at 0x1080a1f80>
# decorated.public_id = '77e8570c-5432-4a5a-9a5d-71915604a0db
# decorated.admin = False
# decorated.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE...HNlfQ.wNvDzYMiY70wWm4xmt698G1WYgPPup6OH1NrcsfaXy0'
# decorated.expires_at = 1565075425
```

Let's again look at the code for `get_logged_in_user`:

```python {linenos=table,linenostart=54}
@token_required
def get_logged_in_user():
    public_id = get_logged_in_user.public_id
    user = User.find_by_public_id(public_id)
    expires_at = get_logged_in_user.expires_at
    user.token_expires_in = format_timespan_digits(remaining_fromtimestamp(expires_at))
    return user
```

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 56: </strong>When this line is executed, <code>get_logged_in_user.public_id</code> contains the value of <code>token_payload["public_id"]</code>, which was decoded from the <code>access_token</code> sent in the request header.</p>
      </li>
      <li>
        <p><strong>Line 57: </strong>Retrieve the <code>User</code> object from the database that matches the <code>public_id</code> decoded from the token.</p>
      </li>
      <li>
        <p><strong>Lines 58: </strong><code>get_logged_in_user.expires_at</code> contains the value of <code>token_payload['expires_at']</code>, which is a timestamp stored as an integer. This value determines when the token is considered to be expired.</p>
      </li>
      <li>
        <p><strong>Lines 59: </strong>We can use the <code>remaining_fromtimestamp</code> function to calculate the time remaining until a token expires. Since this function returns a <code>timespan</code> object (this is a custom namedtuple defined in the <code>datetime_util</code> module), we format it as a string value using <code>format_timespan_digits</code>.</p>
        <p>Finally, we store the formatted string in a new attribute named <code>token_expires_in</code>, which we defined as a field in the <code>user_model</code> API model that we created in the <code>flask_api_tutorial.api.auth.dto</code> module.</p>
      </li>
    </ul>
</div>

Whew! That was a lot of detail for a simple function. The next step is to define the concrete `Resource` class for the `api.auth_user` endpoint.

### `GetUser` Resource

Next, open `src/flask_api_tutorial/api/auth/endpoints.py` and update the import statements to include the `user_model` we created in the `flask_api_tutorial.api.auth.dto` module (**Line 6**) and the `get_logged_in_user` function we created in `flask_api_tutorial.api.auth.business` (**Line 10**). We also need to register `user_model` with the `auth_ns` namespace (**Line 14**):

```python {linenos=table,hl_lines=[6,10,14]}
"""API endpoint definitions for /auth namespace."""
from http import HTTPStatus

from flask_restplus import Namespace, Resource

from flask_api_tutorial.api.auth.dto import auth_reqparser, user_model
from flask_api_tutorial.api.auth.business import (
    process_registration_request,
    process_login_request,
    get_logged_in_user,
)

auth_ns = Namespace(name="auth", validate=True)
auth_ns.models[user_model.name] = user_model
```

Next, add the content below and save the file (this is the same file, `src/flask_api_tutorial/api/auth/endpoints.py`):

```python {linenos=table,linenostart=51}
@auth_ns.route("/user", endpoint="auth_user")
class GetUser(Resource):
    """Handles HTTP requests to URL: /api/v1/auth/user."""

    @auth_ns.doc(security="Bearer")
    @auth_ns.response(HTTPStatus.OK, "Token is currently valid.", user_model)
    @auth_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    @auth_ns.response(HTTPStatus.UNAUTHORIZED, "Token is invalid or expired.")
    @auth_ns.marshal_with(user_model)
    def get(self):
        """Validate access token and return user info."""
        return get_logged_in_user()
```

There are a few new concepts to note:

<div class="code-details">
  <ul>
    <li>
      <p><strong>Line 55: </strong><a href="#api-blueprint">When we configured the <code>api</code> object</a>, we specified that the <a href="https://tools.ietf.org/html/rfc6750" target="_blank">Bearer authentication scheme</a> would be used. In order to mark an HTTP method as a protected resource that requires authorization, we decorate the HTTP method with <code>@auth_ns.doc</code> and set the value of the <code>security</code> parameter to <code>"Bearer"</code>.</p>
    </li>
    <li>
      <p><strong>Line 56: </strong>The <code>@auth_ns.response</code> decorator can be configured with an API model as an optional third argument. This has no effect on the resource's behavior, but the API model is displayed on the Swagger UI page as an example response body for requests that produce a status code 200 <code>HTTPStatus.OK</code>.</p>
    </li>
    <li>
      <p><strong>Line 59: </strong>The <code>@auth_ns.marshal_with</code> decorator is how we tell Flask-RESTPlus to filter the data returned from this method against the provided API model (<code>user_model</code>), and validate the data against the set of fields configured in the API model.</p>
    </li>
    <li>
      <p><strong>Line 62: </strong>Remember, <code>get_logged_in_user</code> returns a <code>User</code> object. Without the <code>@marshal_with</code> decorator, this would produce a server error since we are not returning an HTTP response object as expected. The <code>@marshal_with</code> decorator creates the JSON using the <code>user_model</code> and assigns status code 200 <code>HTTPStatus.OK</code> before returning the response.</p>
    </li>
  </ul>
</div>

We can verify that the new route was correctly registered by running `flask routes`:

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">flask routes</span>
<span class="cmd-results">Endpoint             Methods  Rule
-------------------  -------  --------------------------
api.auth_login       POST     /api/v1/auth/login
api.auth_register    POST     /api/v1/auth/register
<span class="cmd-hl-gold">api.auth_user        GET      /api/v1/auth/user</span>
api.doc              GET      /api/v1/ui
api.root             GET      /api/v1/
api.specs            GET      /api/v1/swagger.json
restplus_doc.static  GET      /swaggerui/&lt;path:filename&gt;
static               GET      /static/&lt;path:filename&gt;</span></code></pre>

By now, you should know what's next: unit tests for the `api.auth_user` endpoint.

### Unit Tests: `test_auth_user.py`

As with the two previous API endpoints, before we write any test cases we need to update the `tests/util.py` file with any error/success message string values and functions that will be re-used across the test set. Add `WWW_AUTH_NO_TOKEN` on **Line 8**:

```python {linenos=table,hl_lines=[8]}
"""Shared functions and constants for unit tests."""
from flask import url_for

EMAIL = "new_user@email.com"
PASSWORD = "test1234"
BAD_REQUEST = "Input payload validation failed"
WWW_AUTH_NO_TOKEN = 'Bearer realm="registered_users@mydomain.com"'
```

Then, reate a function to send a `GET` request to the `api.auth_user` endpoint. Open the `tests/util.py` file and add the function below:

```python {linenos=table,linenostart=26}
def get_user(test_client, access_token):
    return test_client.get(
        url_for("api.auth_user"), headers={"Authorization": f"Bearer {access_token}"}
    )
```

Up to this point, we have used the test client to only send `POST` requests, however the `api.auth_user` endpoint only responds to `GET` requests. To accomplish this, we simply use the test client's `get` method rather than the `post` method.

The `api.auth_user` endpoint requires a valid access token to be included in the request header's `Authorization` field. We have already used `dict` objects to construct response headers, and we can also use a `dict` as the value of the `headers` argument. The `access_token` is provided as a parameter to the `get_user` function, and the format of the `Authorization` field is specified in <a href="https://tools.ietf.org/html/rfc6750#section-2.1" target="_blank">Section 2.1 of RFC6750</a>: "Bearer" plus a single whitespace followed by the access token in url-safe base64 encoding.

Next, create a new file named `test_auth_user.py` in the `tests` folder, add the content below and save the file:

```python {linenos=table}
"""Unit tests for api.auth_user API endpoint."""
import time
from http import HTTPStatus

from flask import url_for
from tests.util import EMAIL, register_user, login_user, get_user


def test_auth_user(client, db):
    register_user(client)
    response = login_user(client)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = get_user(client, access_token)
    assert response.status_code == HTTPStatus.OK
    assert "email" in response.json and response.json["email"] == EMAIL
    assert "admin" in response.json and not response.json["admin"]
```
`test_auth_user` is the "happy path" for the <code>api.auth_user</code> endpoint, so we start by registering a new user and logging in. The response from the login request contains an access token, so we retrieve it and send it with the request to get the logged-in user info.

After verifying that the response from the `api.auth_user` endpoint indicates the request was successful, we check that the response includes the correct user info. Since the response includes the user email and the admin flag, we verify that the email matches the email address we used to register the user and the admin flag should be `False`.

I'm sure by now you're getting used to the pattern I use to write test cases. Since we created the test case for the happy path, it's time to think about all the ways we could send a request that does not succeed. Since `api.auth_user` is a protected resource, we should get an error if we send a `GET` request without an access token in the request header.

First, update the import statements to include `WWW_AUTH_NO_TOKEN` from `tests.util` **(Line 6)**. This is the value we expect to receive in the `WWW-Authenticate` header field if a request is sent to a protected resource without an access token.

```python {linenos=table,hl_lines=[6]}
"""Unit tests for api.auth_user API endpoint."""
import time
from http import HTTPStatus

from flask import url_for
from tests.util import EMAIL, WWW_AUTH_NO_TOKEN, register_user, login_user, get_user
```

Copy the test case below and add it to `test_auth_user.py`:

```python {linenos=table,linenostart=22}
def test_auth_user_no_token(client, db):
    response = client.get(url_for("api.auth_user"))
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "status" in response.json and response.json["status"] == "fail"
    assert "message" in response.json and response.json["message"] == "Unauthorized"
    assert "WWW-Authenticate" in response.headers
    assert response.headers["WWW-Authenticate"] == WWW_AUTH_NO_TOKEN
```

There are a few things to note about this test case:

<div class="code-details">
  <ul>
    <li>
      <p><strong>Line 23: </strong>The first thing we do is send a <code>GET</code> request using the test client to the <code>api.auth_user</code> endpoint without any headers.</p>
    </li>
    <li>
      <p><strong>Line 24: </strong>The expected response code when a request is sent to a protected resource without an access token is 401 <code>HTTPStatus.UNAUTHORIZED</code>.</p>
    </li>
    <li>
      <p><strong>Lines 25-26: </strong>These two lines verify that the <strong>status</strong> and <strong>message</strong> attributes exist in the response JSON and that the values indicate that the request did not succeed because the requested resource requires authorization which was not included in the request.</p>
    </li>
    <li>
      <p><strong>Lines 27-28: </strong>We <a href="#decorators">previously explained</a> the different values that the <code>WWW-Authenticate</code> header must include based on whether or not the request was successfully authorized, so please refer back to the <a href="#decorators">Decorators</a> section if you are unclear why this is the expected value.</p>
      <p>When a request for a protected resource does not include an access token, <code>WWW-Authenticate</code> must only include the <span class="bold-text">realm</span> attribute and must not contain any error information.</p>
    </li>
  </ul>
</div>

Let's do one more. In [Part 2](/series/flask-api-tutorial/part-2/#decode-access-token-function), when we created test cases for the `User` class we used the `time.sleep` method to cause an access token to expire. If we send a request to the `api.auth_user` endpoint with an expired token, we should receive an error indicating that the token is expired.

First, add the highlighted string values to `test_auth_user.py` after the import statements **(Lines 8-13)**:

```python {linenos=table,hl_lines=["8-13"]}
"""Unit tests for api.auth_user API endpoint."""
import time
from http import HTTPStatus

from flask import url_for
from tests.util import EMAIL, WWW_AUTH_NO_TOKEN, register_user, login_user, get_user

TOKEN_EXPIRED = "Access token expired. Please log in again."
WWW_AUTH_EXPIRED_TOKEN = (
    f"{WWW_AUTH_NO_TOKEN}, "
    'error="invalid_token", '
    f'error_description="{TOKEN_EXPIRED}"'
)
```

Then, add the content below:

```python {linenos=table,linenostart=36}
def test_auth_user_expired_token(client, db):
    register_user(client)
    response = login_user(client)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    time.sleep(6)
    response = get_user(client, access_token)
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "status" in response.json and response.json["status"] == "fail"
    assert "message" in response.json and response.json["message"] == TOKEN_EXPIRED
    assert "WWW-Authenticate" in response.headers
    assert response.headers["WWW-Authenticate"] == WWW_AUTH_EXPIRED_TOKEN
```

As always, please note the following:

<div class="code-details">
  <ul>
    <li>
      <p><strong>Lines 36-39: </strong>The first four lines of this test case are the same as the happy path test case <code>test_auth_user</code>. We register a new user, login and retrieve the <code>access_token</code> from the sucessful login response.</p>
    </li>
    <li>
      <p><strong>Lines 40: </strong>We suspend execution of the test case for six seconds to ensure the access token is expired.</p>
    </li>
    <li>
      <p><strong>Line 42: </strong>The expected response code when a request is sent to a protected resource with an expired access token is 401 <code>HTTPStatus.UNAUTHORIZED</code>.</p>
    </li>
    <li>
      <p><strong>Lines 43-44: </strong>These two lines verify that the status and message attributes exist in the response JSON and that the values indicate that the request did not succeed because the access token sent by the client is expired.</p>
    </li>
    <li>
      <p><strong>Lines 45-46: </strong>We verify that the <code>WWW-Authenticate</code> header contains the <span class="bold-text">realm</span> attribute as well as the <span class="bold-text">error</span> attribute and the <span class="bold-text">error_description</span> attribute.</p>
    </li>
  </ul>
</div>

## How To: Request a Protected Resource

We just demonstrated how to make a request for a protected resource in code (using the Flask test client). But, for ad hoc testing it would be nice to be able to send requests and include an access token using Swagger UI or a command-line tool like httpie. Let's go through the process for both tools.

### Swagger UI

Did you check out the Swagger UI page after implementing the `/auth/user` endpoint? Fire up the development server with `flask run` and navigate to `http://localhost:5000/api/v1/ui`:

{{< linked_image img2 >}}

You may have already seen this and wondered, why is the `GET` `/auth/user` component the only one with a lock icon (<span class="fa fa-unlock-alt"></span>), or more accurately, a unlocked lock icon? And does it have anything to do with that button labeled **Authorize** that also has a lock icon?

The two are in fact related. The lock icon indicates that the API endpoint requires authorization, and the `GET` `/auth/user` component is the only one with a lock icon because the `GetUser.get` method is the only resource method that we decorated with `@doc(security="Bearer")`. "Bearer" is the name of the security object that we created in `src/flask_api_tutorial/api/__init__.py` and provided to the `Api` constructor, which causes the **Authorize** button to appear.

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil"></i>
  </div>
  <div class="note-message">
    <p>The unlocked lock icon indicates <span class="emphasis">two</span> things: the API method requires authorization,  <span class="emphasis">and</span> the access token is currently not being sent in the request header. After clicking the <strong>Authorize</strong> button and entering the access token, all unlocked icons will become locked icons. When the icon is locked, this indicates that the access token will be sent in the header of any request.</p>
  </div>
</div>

<div class="alert alert-flex">
  <div class="alert-icon">
    <i class="fa fa-exclamation-triangle"></i>
  </div>
  <div class="alert-message">
    <p>There's one more thing to note about the Swagger UI page, the <code>User</code> model is shown at the bottom of the page (also on the <code>/auth/user</code> component under <strong>Responses</strong>). Any API model that you register with the API or an API namespcace will be rendered in this location (we registered <code>user_model</code> with the <code>auth_ns</code> namespace in <code>src/flask_api_tutorial/api/auth/endpoints.py</code>).</p>
  </div>
</div>

Let's see what happens if we attempt to send a request to `/auth/user` as the component is currently configured. First, expand the component by clicking anywhere on the blue bar, click **Try it out**, then click **Execute**:

{{< linked_image img3 >}}

We already knew that this would be the response since we created a test case (`test_auth_user_no_token`) to verify that sending a request to the `api.auth_user` endpoint without an access token would not succeed. So how do we get an access token and how do we send it in the request header with Swagger UI?

Getting an access token is easy, just register a new user <span class="emphasis">OR</span> login with an existing user and the response will include a token in the <code>access_token</code> field. Copy the access token from the **Response body** text box:

{{< linked_image img4 >}}

Next, click the **Authorize** button above the API routes (1). A dialog box will appear titled **Avaialable authorizations**. Paste the access token that was copied from the **Response body** text box into the **Value** text box in the dialog (2). Click **Authorize** (3):

{{< linked_image img5 >}}

After clicking **Authorize**, the button text changes to **Logout**, and the **Value** text box is replaced by a label of asterisk characters (see below). Click **Close** to dismiss the dialog and return to the Swagger UI:

{{< linked_image img6 >}}

Notice that with the access token successfully configured, the lock icons have changed from being unlocked (<span class="fa fa-unlock-alt"></span>) to locked (<span class="fa fa-lock"></span>):

{{< linked_image img7 >}}

Let's send a request to the `api.auth_user` endpoint again, now that the access token will be sent in the request header:

{{< linked_image img8 >}}

As you can see, the access token is sent in the `Authorization` field of the request header, as required by the specification doc for Bearer Token Authentication (RFC6750).

With the `development` environment configuration settings, all access tokens expire fifteen minutes after being issued. If a request is sent with an expired access token, both the response body and header should contain error messages explaining why the request was not succesful:

{{< linked_image img9 >}}

Similarly, try changing any part of an access token (even just a single character) and updating the value in the **Available authorizations** dialog box. The request will be rejected and the response will contain a different error message than the message for an expired token or for not sending an access token at all:

{{< linked_image img10 >}}

That's all you need to do to automatically include the access token when a request is made to a protected resource. Let's figure out how to do the same with httpie.

### httpie

Rather than using screenshots to illustrate the process of requesting a protected resoure with httpie, I will reproduce the text of the CLI commands and output from httpie.

If you enter a URL without a domain, for example `:5000/api/v1/auth/user`, the <a href="https://httpie.org/doc#url-shortcuts-for-localhost" target="_blank">URL is automatically expanded</a> to `http://localhost:5000/api/v1/auth/user`. With that in mind, the command below is a `GET` request to the `api.auth_user` endpont that does not include an access token (this is the same request/response pictured in **Figure 3**):

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">http :5000/api/v1/auth/user</span>

<span class="cmd-results"><span class="bold-text goldenrod">GET /api/v1/auth/user HTTP/1.1</span>
<span class="purple">Accept</span>: <span class="light-blue">*/*</span>
<span class="purple">Accept-Encoding</span>: <span class="light-blue">gzip, deflate</span>
<span class="purple">Connection</span>: <span class="light-blue">keep-alive</span>
<span class="purple">Host</span>: <span class="light-blue">localhost:5000</span>
<span class="purple">User-Agent</span>: <span class="light-blue">HTTPie/1.0.2</span>


<span class="bold-text goldenrod">HTTP/1.0 401 UNAUTHORIZED</span>
<span class="purple">Access-Control-Allow-Origin</span>: <span class="light-blue">*</span>
<span class="purple">Content-Length</span>: <span class="light-blue">53</span>
<span class="purple">Content-Type</span>: <span class="light-blue">application/json</span>
<span class="purple">Date</span>: <span class="light-blue">Sat, 03 Aug 2019 23:19:16 GMT</span>
<span class="purple">Server</span>: <span class="light-blue">Werkzeug/0.15.5 Python/3.7.4</span>
<span class="purple">WWW-Authenticate</span>: <span class="light-blue">Bearer realm="registered_users@mydomain.com"</span>

<span class="bold-text">{
  <span class="purple">"message"</span>: <span class="light-blue">"Unauthorized"</span>,
  <span class="purple">"status"</span>: <span class="light-blue">"fail"</span>
}</span></span></code></pre>

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil"></i>
  </div>
  <div class="note-message">
    <p>The command above is assumed to be a <code>GET</code> request since that is the default used by httpie if the only argument in the command is a URL.</p>
  </div>
</div>

We need to obtain an access token, so let's login and retrieve the token generated by the server from the response (this is the same request/response pictured in **Figure 4**):

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">http -f :5000/api/v1/auth/login email=user@test.com password=123456</span>

<span class="cmd-results"><span class="bold-text goldenrod">POST /api/v1/auth/login HTTP/1.1</span>
<span class="purple">Accept</span>: <span class="light-blue">*/*</span>
<span class="purple">Accept-Encoding</span>: <span class="light-blue">gzip, deflate</span>
<span class="purple">Connection</span>: <span class="light-blue">keep-alive</span>
<span class="purple">Content-Length</span>: <span class="light-blue">37</span>
<span class="purple">Content-Type</span>: <span class="light-blue">application/x-www-form-urlencoded; charset=utf-8</span>
<span class="purple">Host</span>: <span class="light-blue">localhost:5000</span>
<span class="purple">User-Agent</span>: <span class="light-blue">HTTPie/1.0.2</span>

<span class="bold-text">email=user%40test.com&password=123456</span>

<span class="bold-text goldenrod">HTTP/1.0 200 OK</span>
<span class="purple">Cache-Control</span>: <span class="light-blue">no-store</span>
<span class="purple">Access-Control-Allow-Origin</span>: <span class="light-blue">*</span>
<span class="purple">Content-Length</span>: <span class="light-blue">345</span>
<span class="purple">Content-Type</span>: <span class="light-blue">application/json</span>
<span class="purple">Date</span>: <span class="light-blue">Sat, 03 Aug 2019 23:20:29 GMT</span>
<span class="purple">Pragma</span>: <span class="light-blue">no-cache</span>
<span class="purple">Server</span>: <span class="light-blue">Werkzeug/0.15.5 Python/3.7.4</span>

<span class="bold-text">{
  <span class="purple">"access_token"</span>: <span class="light-blue">"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjQ4NzUzMjksImlhdCI6MTU2NDg3NDQyOSwic3ViIjoiNzdiNGYzYjctNzg2NC00ZmM0LWE4MzQtZjJhNjQ5OWYxNzJhIiwiYWRtaW4iOmZhbHNlfQ.LBYrCr5-8FqCKIF_1WEpk8ake235cB9hZNL01oQjPvw"</span>,
  <span class="purple">"expires_in"</span>: <span class="pink">900</span>,
  <span class="purple">"message"</span>: <span class="light-blue">"successfully logged in"</span>,
  <span class="purple">"status"</span>: <span class="light-blue">"success"</span>,
  <span class="purple">"token_type"</span>: <span class="light-blue">"bearer"</span>
}</span></span></code></pre>

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil"></i>
  </div>
  <div class="note-message">
    <p>The <code>-f</code> option is short for <code>--form</code> and tells httpie that this command is submitting a form. When this option is used, <code>POST</code> is used as the method type, the data fields are serialized as URL parameters and the <code>Content-Type</code> is set to <code>application/x-www-form-urlencoded; charset=utf-8</code>.</p>
  </div>
</div>

Now that we have an access token, the only thing we need to do is send it in the `Authorization` field of the request header. httpie makes this really simple, any arguments in the form `{name}:{value}` will be added as headers (this is the same request/response pictured in **Figure 8**):

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">http :5000/api/v1/auth/user Authorization:"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjQ4NzUzMjksImlhdCI6MTU2NDg3NDQyOSwic3ViIjoiNzdiNGYzYjctNzg2NC00ZmM0LWE4MzQtZjJhNjQ5OWYxNzJhIiwiYWRtaW4iOmZhbHNlfQ.LBYrCr5-8FqCKIF_1WEpk8ake235cB9hZNL01oQjPvw"</span>

<span class="cmd-results"><span class="bold-text goldenrod">GET /api/v1/auth/user HTTP/1.1</span>
<span class="purple">Accept</span>: <span class="light-blue">*/*</span>
<span class="purple">Accept-Encoding</span>: <span class="light-blue">gzip, deflate</span>
<span class="purple">Authorization</span>: <span class="light-blue">Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjQ4NzUzMjksImlhdCI6MTU2NDg3NDQyOSwic3ViIjoiNzdiNGYzYjctNzg2NC00ZmM0LWE4MzQtZjJhNjQ5OWYxNzJhIiwiYWRtaW4iOmZhbHNlfQ.LBYrCr5-8FqCKIF_1WEpk8ake235cB9hZNL01oQjPvw</span>
<span class="purple">Connection</span>: <span class="light-blue">keep-alive</span>
<span class="purple">Host</span>: <span class="light-blue">localhost:5000</span>
<span class="purple">User-Agent</span>: <span class="light-blue">HTTPie/1.0.2</span>


<span class="bold-text goldenrod">HTTP/1.0 200 OK</span>
<span class="purple">Access-Control-Allow-Origin</span>: <span class="light-blue">*</span>
<span class="purple">Content-Length</span>: <span class="light-blue">159</span>
<span class="purple">Content-Type</span>: <span class="light-blue">application/json</span>
<span class="purple">Date</span>: <span class="light-blue">Sat, 03 Aug 2019 23:25:13 GMT</span>
<span class="purple">Server</span>: <span class="light-blue">Werkzeug/0.15.5 Python/3.7.4</span>

<span class="bold-text">{
  <span class="purple">"admin"</span>: <span class="orange">false</span>,
  <span class="purple">"email"</span>: <span class="light-blue">"user@test.com"</span>,
  <span class="purple">"public_id"</span>: <span class="light-blue">"77b4f3b7-7864-4fc4-a834-f2a6499f172a"</span>,
  <span class="purple">"registered_on"</span>: <span class="light-blue">"08/01/19 10:34:41 PM UTC"</span>
}</span></span></code></pre>

## `api.auth_logout` Endpoint

The "logout" process for the API is really simple since we don't actually implement any session handling. The `api.auth_logout` endpoint will use the `@token_required` decorator, just like the `api.auth_user` endpoint. Therefore, if a request is received without an access token or with an invalid/expired token, it will be aborted without executing any of the business logic we define for the logout process.

One of the requirements states: <span class="italics requirements">If user logs out, their JWT is immediately invalid/expired</span>. In order to satisfy this requirement, when a user logs out and their access token is <span class="emphasis">NOT</span> invalid/expired, we must add the token to a blacklist and ensure that any subsequent request for a protected resource that includes the token is unsuccessful.

Even though access tokens are typically configured to expire less than a day after being issued, the blacklist should be persistent (i.e., stored in the database, <span class="emphasis">NOT</span> in RAM). We can create a database table to store blacklisted tokens, which is what we will do next.

### `BlacklistedToken` DB Model

Create a new file `token_blacklist.py` in `src/flask_api_tutorial/models` and add the content below:

```python {linenos=table}
"""Class definition for BlacklistedToken."""
from datetime import timezone

from flask_api_tutorial import db
from flask_api_tutorial.util.datetime_util import utc_now, dtaware_fromtimestamp


class BlacklistedToken(db.Model):
    """BlacklistedToken Model for storing JWT tokens."""

    __tablename__ = "token_blacklist"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    token = db.Column(db.String(500), unique=True, nullable=False)
    blacklisted_on = db.Column(db.DateTime, default=utc_now)
    expires_at = db.Column(db.DateTime, nullable=False)

    def __init__(self, token, expires_at):
        self.token = token
        self.expires_at = dtaware_fromtimestamp(expires_at, use_tz=timezone.utc)

    def __repr__(self):
        return f"<BlacklistToken token={self.token}>"

    @classmethod
    def check_blacklist(cls, token):
        exists = cls.query.filter_by(token=token).first()
        return True if exists else False
```

The `BlacklistedToken` class is pretty simple, but please note the following:

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 14: </strong><code>token</code> is the string value of the access token.</p>
      </li>
      <li>
        <p><strong>Line 15: </strong>Notice that we are capturing the current time with <code>utc_now</code>, which is a function from the <code>flask_api_tutorial.util.datetime_util</code> module. What is the difference between using this function which returns a timezone-aware <code>datetime</code> object and <code>datetime.utcnow</code> which returns a naive <code>datetime</code>? Consider the REPL commands below:</p>
        <pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from flask_api_tutorial.util.datetime_util import utc_now</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from datetime import datetime</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">utc_now()</span>
<span class="cmd-repl-results">datetime.datetime(2019, 8, 8, 9, 52, 4, tzinfo=datetime.timezone.utc)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">datetime.utcnow()</span>
<span class="cmd-repl-results">datetime.datetime(2019, 8, 8, 9, 52, 6, 793105)</span></code></pre>
        <p>Working with <code>datetime</code> objects can be a source of insidious bugs that are very difficult to diagnose. For a thorough explanation of best practices that will prevent such issues, read <a href="https://lo.calho.st/dev-culture/the-problem-with-pythons-datetime-class/" target="_blank">this post by Travis Mick</a>. The TL;DR version boils down to two guidelines:</p>
        <ul class="alert bold-text">
          <li>Always ensure that your code produces and handles <code style="background-color: #252525; font-weight: 400">datetime</code> objects that are timezone-aware.</li>
          <li>Always ensure that the <code style="background-color: #252525; font-weight: 400">datetime</code> objects produced and utilized by your code are localized to the UTC timezone when written to the database (i.e., <code style="background-color: #252525; font-weight: 400">tzinfo=datetime.timezone.utc</code>).</li>
        </ul>
        <p>A simple example of why you should always use timezone "aware" <code>datetime</code> values is given below. When we create a <code>BlacklistedToken</code> object, the required <code>expires_at</code> parameter is a UNIX timestamp (i.e., an integer value) which can be converted to a <code>datetime</code> object using the <code>fromtimestamp</code> method:</p>
        <pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">expires_at = 1565257955</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">datetime.fromtimestamp(expires_at).astimezone(timezone.utc)</span>
<span class="cmd-repl-results">datetime.datetime(2019, 8, 8, 9, 52, 35, tzinfo=datetime.timezone.utc)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">datetime.fromtimestamp(expires_at)</span>
<span class="cmd-repl-results">datetime.datetime(2019, 8, 8, 2, 52, 35)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">exit()</span></code></pre>
        <p>Python assumes that the <code>datetime</code> value produced from <code>datetime.fromtimestamp(expires_at)</code> should be converted to the local time zone (in my case, PST or -700 UTC at the time this was written). You will quickly encounter bugs that are extremely difficult to diagnose unless you ensure that you are always dealing with "aware" <code>datetime</code> objects in the same timezone.</p>
      </li>
      <li>
        <p><strong>Lines 25-28: </strong>Whenever we need to check a user's access token, we will call <code>BlacklistedToken.check_blacklist</code> which will return a <code>bool</code> value based on whether or not the token has been added to the blacklist.</p>
      </li>
    </ul>
</div>

In order to register the <code>BlacklistedToken</code> model with the Flask application, we need to make a couple changes to `run.py` in the project root folder:

```python {linenos=table,hl_lines=[5,13]}
"""Flask CLI/Application entry point."""
import os

from flask_api_tutorial import create_app, db
from flask_api_tutorial.models.token_blacklist import BlacklistedToken
from flask_api_tutorial.models.user import User

app = create_app(os.getenv("FLASK_ENV", "development"))


@app.shell_context_processor
def shell():
    return {"db": db, "User": User, "BlacklistedToken": BlacklistedToken}
```

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 5: </strong>We need to import the new model class as shown here.</p>
      </li>
      <li>
        <p><strong>Line 13: </strong>We should add the new model class here to make it available in the <code>flask shell</code> without needing to import it explicitly.</p>
      </li>
    </ul>
</div>

Finally, we need to create a new migration script and upgrade the database to create the actual <code>token_blacklist</code> table. We already went through this in [Part 2](/series/flask-api-tutorial/part-2/#creating-the-first-migration) when we created the <code>User</code> model class, but let's demonstrate the process once more.

First, run <code>flask db migrate</code> and add a message explaining the changes that will be made by running this migration:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask db migrate --message "add BlacklistedToken model"</span>
<span class="cmd-results">INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.autogenerate.compare] Detected added table 'token_blacklist'
  Generating
  /Users/aaronluna/Projects/flask_api_tutorial/migrations/versions/97f449048b52_add_blacklistedtoken_model.py ...  done</span></code></pre>

Next, run <code>flask db upgrade</code> to run the migration script and add the new table to the database:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask db upgrade</span>
<span class="cmd-results">INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade 5789387e80dd -> 97f449048b52, add BlacklistedToken model</span></code></pre>

With the `BlacklistedToken` class fully implemented, we have everything we need to create the business logic for the `api.auth_logout` endpoint.

### `process_logout_request` Function

After receiving a logout request containing a valid, unexpired token, the server then proceeds to create a `BlasklistedToken` object, add it to the database and commit the changes. Then, the server sends an HTTP response indicating that the logout request succeeded.

The function that performs this process will be defined in`src/flask_api_tutorial/api/auth/business.py`. Open that file and update the import statements to include the `BlacklistedToken` class: (**Line 9**)

```python {linenos=table,hl_lines=[9]}
"""Business logic for /auth API endpoints."""
from http import HTTPStatus

from flask import current_app, jsonify
from flask_restplus import abort

from flask_api_tutorial import db
from flask_api_tutorial.api.auth.decorator import token_required
from flask_api_tutorial.models.token_blacklist import BlacklistedToken
from flask_api_tutorial.models.user import User
from flask_api_tutorial.util.datetime_util import (
    remaining_fromtimestamp,
    format_timespan_digits,
)
```

Next, add the `process_logout_request` function and save the file:

```python {linenos=table,linenostart=64}
@token_required
def process_logout_request():
    access_token = process_logout_request.token
    expires_at = process_logout_request.expires_at
    blacklisted_token = BlacklistedToken(access_token, expires_at)
    db.session.add(blacklisted_token)
    db.session.commit()
    response_dict = dict(status="success", message="successfully logged out")
    return response_dict, HTTPStatus.OK
```

As explained in the [Decorators](#decorators) section of this post, the `access_token` and `expires_at` attributes on `process_logout_request` come from decoding the access token's payload, which takes place whenever the `@token_required` decorator is used (these values are required to create the `BlacklistedToken` object). Then, a HTTP response indicating the operation succeeded is sent to the client.

### Update `decode_access_token` Method

There's one more process we need to update in order to make the blacklist fully functional. Currently, when verifying an access token, it is only rejected by the server if the token is invalid or expired. Now, the server must also check if the token has been blacklisted before processing the client's request.

Open `src/flask_api_tutorial/models/user.py` and update the import statements to include the `BlacklistedToken` class: (**Line 10**)

```python {linenos=table,hl_lines=[10]}
"""Class definition for User model."""
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
from flask import current_app
from sqlalchemy.ext.hybrid import hybrid_property

from flask_api_tutorial import db, bcrypt
from flask_api_tutorial.models.token_blacklist import BlacklistedToken
from flask_api_tutorial.util.datetime_util import (
    utc_now,
    get_local_utcoffset,
    make_tzaware,
    localized_dt_string,
)
from flask_api_tutorial.util.result import Result
```

We need to modify the `decode_access_token` method to reurn a `Result` object indicating the token has been blacklisted if that is the case. Add **Lines 76-78** and save the changes:

```python {linenos=table,linenostart=59,hl_lines=["18-20"]}
@staticmethod
def decode_access_token(access_token):
    if isinstance(access_token, bytes):
        access_token = access_token.decode("ascii")
    if access_token.startswith("Bearer "):
        split = access_token.split("Bearer")
        access_token = split[1].strip()
    try:
        key = current_app.config.get("SECRET_KEY")
        payload = jwt.decode(access_token, key, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        error = "Access token expired. Please log in again."
        return Result.Fail(error)
    except jwt.InvalidTokenError:
        error = "Invalid token. Please log in again."
        return Result.Fail(error)

    if BlacklistedToken.check_blacklist(access_token):
        error = "Token blacklisted. Please log in again."
        return Result.Fail(error)
    token_payload = dict(
        public_id=payload["sub"],
        admin=payload["admin"],
        token=access_token,
        expires_at=payload["exp"],
    )
    return Result.Ok(token_payload)
```

With that out of the way, we can create the concrete `Resource` class for the `api.auth_logout` endpoint.

### `LogoutUser` Resource

Open `src/flask_api_tutorial/api/auth/endpoints.py` and update the import statements to include the `process_logout_request` function we just created **(Line 11)**:

```python {linenos=table,hl_lines=[11]}
"""API endpoint definitions for /auth namespace."""
from http import HTTPStatus

from flask_restplus import Namespace, Resource

from flask_api_tutorial.api.auth.dto import auth_reqparser, user_model
from flask_api_tutorial.api.auth.business import (
    process_registration_request,
    process_login_request,
    get_logged_in_user,
    process_logout_request,
)
```

Next, add the content below and save the file:

```python {linenos=table,linenostart=66}
@auth_ns.route("/logout", endpoint="auth_logout")
class LogoutUser(Resource):
    """Handles HTTP requests to URL: /auth/logout."""

    @auth_ns.doc(security="Bearer")
    @auth_ns.response(HTTPStatus.OK, "Log out succeeded, token is no longer valid.")
    @auth_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    @auth_ns.response(HTTPStatus.UNAUTHORIZED, "Token is invalid or expired.")
    @auth_ns.response(HTTPStatus.INTERNAL_SERVER_ERROR, "Internal server error.")
    def post(self):
        """Add token to blacklist, deauthenticating the current user."""
        return process_logout_request()
```

This should all look very familiar, the only difference between the `LogoutUser` and `GetUser` is the HTTP method name (`post` vs `get`). Also, `GetUser` returned a JSON object which we defined in `user_model` and `LogoutUser` returns a regular HTTP response.

### Unit Tests: `test_auth_logout.py`

Finally, we need to create tests for the `api.auth_logout` endpoint. The "happy path" test case shown below simply registers a new user, logs in and then logs out. Create a new file `/test/test_auth_logout.py` and add the content below:

```python {linenos=table}
"""Unit tests for api.auth_logout API endpoint."""
from http import HTTPStatus

from flask_api_tutorial.models.token_blacklist import BlacklistedToken
from tests.util import register_user, login_user, logout_user

SUCCESS = "successfully logged out"


def test_logout(client, db):
    register_user(client)
    response = login_user(client)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    blacklist = BlacklistedToken.query.all()
    assert len(blacklist) == 0
    response = logout_user(client, access_token)
    assert response.status_code == HTTPStatus.OK
    assert "status" in response.json and response.json["status"] == "success"
    assert "message" in response.json and response.json["message"] == SUCCESS
    blacklist = BlacklistedToken.query.all()
    assert len(blacklist) == 1
    assert access_token == blacklist[0].token
```

There are a few things in this test case that we are seeing for the fist time, please note:

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 15-16: </strong>After retrieving the <code>access_token</code>, we verify that the <code>blacklist</code> is currently empty (i.e., no tokens have been blacklisted at this point).</p>
      </li>
      <li>
        <p><strong>Line 17-20: </strong>We submit a request to the <code>api.auth_logout</code> endpoint and verify that the response indicates that the request succeeded.</p>
      </li>
      <li>
        <p><strong>Line 21-22: </strong>If the logout request succeeded, the token must have been added to the <code>blacklist</code>. The first way we verify this is by checking that the <code>blacklist</code> now contains one token.</p>
      </li>
      <li>
        <p><strong>Line 23: </strong>Finally, we verify that the blacklisted token is the same <code>access_token</code> that was submitted with the logout request.</p>
      </li>
    </ul>
</div>

We should definitely ensure that any requests for a protected resource using a blacklisted token does not succeed, and that the response indicates that the reason the request failed is due to the token being blacklisted.

First, update the import statements to include the `WWW_AUTH_NO_TOKEN` string from `tests.util` **(Line 4)**, and then add the highlighted lines to `test_auth_logout.py`

```python {linenos=table,hl_lines=[5,"8-13"]}
"""Unit tests for api.auth_logout API endpoint."""
from http import HTTPStatus

from flask_api_tutorial.models.token_blacklist import BlacklistedToken
from tests.util import WWW_AUTH_NO_TOKEN, register_user, login_user, logout_user

SUCCESS = "successfully logged out"
TOKEN_BLACKLISTED = "Token blacklisted. Please log in again."
WWW_AUTH_BLACKLISTED_TOKEN = (
    f"{WWW_AUTH_NO_TOKEN}, "
    'error="invalid_token", '
    f'error_description="{TOKEN_BLACKLISTED}"'
)
```

This is the scenario contained in `test_logout_token_blacklisted`, below. Add the function to `test_auth_logout.py`:

```python {linenos=table,linenostart=32}
def test_logout_token_blacklisted(client, db):
    register_user(client)
    response = login_user(client)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = logout_user(client, access_token)
    assert response.status_code == HTTPStatus.OK
    response = logout_user(client, access_token)
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "status" in response.json and response.json["status"] == "fail"
    assert "message" in response.json and response.json["message"] == TOKEN_BLACKLISTED
    assert "WWW-Authenticate" in response.headers
    assert response.headers["WWW-Authenticate"] == WWW_AUTH_BLACKLISTED_TOKEN
```

  <div class="code-details">
    <ul>
      <li>
        <p><strong>Line 33-38: </strong>We begin by performing the same actions as the previous test case, registering a new user, logging in and finally logging out.</p>
      </li>
      <li>
        <p><strong>Line 39-44: </strong>The second time we call <code>POST /api/v1/auth/logout</code> with the same <code>access_token</code>, the status code of the HTTP response is <code>401 HTTPStatus.UNAUTHORIZED</code>. This is the expected behavior since the token has not been tampered with, has not yet expired <span class="emphasis">BUT</span> has been added to the <code>token_blacklist</code>.</p>
      </li>
    </ul>
</div>

There are plenty of necessary test cases that are missing from the current set. You should try to identify as many different scenarios as you can think of and create test cases. You should compare your set to the final version in the github repository.

You should run <code>tox</code> to make sure the new test case passes and that nothing else broke because of the changes:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">tox</span>
<span class="cmd-results">GLOB sdist-make: /Users/aaronluna/Projects/flask_api_tutorial/setup.py
py37 inst-nodeps: /Users/aaronluna/Projects/flask_api_tutorial/.tox/.tmp/package/1/flask-api-tutorial-0.1.zip
py37 installed: alembic==1.3.2,aniso8601==8.0.0,appdirs==1.4.3,attrs==19.3.0,bcrypt==3.1.7,black==19.10b0,certifi==2019.11.28,cffi==1.13.2,chardet==3.0.4,Click==7.0,entrypoints==0.3,flake8==3.7.9,Flask==1.1.1,flask-api-tutorial==0.1,Flask-Bcrypt==0.7.1,Flask-Cors==3.0.8,Flask-Migrate==2.5.2,flask-restplus==0.13.0,Flask-SQLAlchemy==2.4.1,idna==2.8,importlib-metadata==1.3.0,itsdangerous==1.1.0,Jinja2==2.10.3,jsonschema==3.2.0,Mako==1.1.0,MarkupSafe==1.1.1,mccabe==0.6.1,more-itertools==8.0.2,packaging==20.0,pathspec==0.7.0,pluggy==0.13.1,py==1.8.1,pycodestyle==2.5.0,pycparser==2.19,pydocstyle==5.0.2,pyflakes==2.1.1,PyJWT==1.7.1,pyparsing==2.4.6,pyrsistent==0.15.7,pytest==5.3.2,pytest-black==0.3.7,pytest-clarity==0.2.0a1,pytest-dotenv==0.4.0,pytest-flake8==1.0.4,pytest-flask==0.15.0,python-dateutil==2.8.1,python-dotenv==0.10.3,python-editor==1.0.4,pytz==2019.3,regex==2020.1.8,requests==2.22.0,six==1.13.0,snowballstemmer==2.0.0,SQLAlchemy==1.3.12,termcolor==1.1.0,toml==0.10.0,typed-ast==1.4.0,urllib3==1.25.7,wcwidth==0.1.8,Werkzeug==0.16.0,zipp==0.6.0
py37 run-test-pre: PYTHONHASHSEED='3343573933'
py37 run-test: commands[0] | pytest
============================================== test session starts ==============================================
platform darwin -- Python 3.7.5, pytest-5.3.2, py-1.8.1, pluggy-0.13.1 -- /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/bin/python
cachedir: .tox/py37/.pytest_cache
rootdir: /Users/aaronluna/Desktop/flask_api_tutorial, inifile: pytest.ini
plugins: dotenv-0.4.0, clarity-0.2.0a1, flake8-1.0.4, black-0.3.7, flask-0.15.0
collected 69 items

run.py::BLACK PASSED                                                                                      [  1%]
run.py::FLAKE8 PASSED                                                                                     [  2%]
setup.py::BLACK SKIPPED                                                                                   [  4%]
setup.py::FLAKE8 SKIPPED                                                                                  [  5%]
src/flask_api_tutorial/__init__.py::BLACK SKIPPED                                                         [  7%]
src/flask_api_tutorial/__init__.py::FLAKE8 SKIPPED                                                        [  8%]
src/flask_api_tutorial/config.py::BLACK SKIPPED                                                           [ 10%]
src/flask_api_tutorial/config.py::FLAKE8 SKIPPED                                                          [ 11%]
src/flask_api_tutorial/api/__init__.py::BLACK SKIPPED                                                     [ 13%]
src/flask_api_tutorial/api/__init__.py::FLAKE8 SKIPPED                                                    [ 14%]
src/flask_api_tutorial/api/auth/__init__.py::BLACK SKIPPED                                                [ 15%]
src/flask_api_tutorial/api/auth/__init__.py::FLAKE8 SKIPPED                                               [ 17%]
src/flask_api_tutorial/api/auth/business.py::BLACK PASSED                                                 [ 18%]
src/flask_api_tutorial/api/auth/business.py::FLAKE8 PASSED                                                [ 20%]
src/flask_api_tutorial/api/auth/decorator.py::BLACK SKIPPED                                               [ 21%]
src/flask_api_tutorial/api/auth/decorator.py::FLAKE8 SKIPPED                                              [ 23%]
src/flask_api_tutorial/api/auth/dto.py::BLACK SKIPPED                                                     [ 24%]
src/flask_api_tutorial/api/auth/dto.py::FLAKE8 SKIPPED                                                    [ 26%]
src/flask_api_tutorial/api/auth/endpoints.py::BLACK PASSED                                                [ 27%]
src/flask_api_tutorial/api/auth/endpoints.py::FLAKE8 PASSED                                               [ 28%]
src/flask_api_tutorial/api/widgets/__init__.py::BLACK SKIPPED                                             [ 30%]
src/flask_api_tutorial/api/widgets/__init__.py::FLAKE8 SKIPPED                                            [ 31%]
src/flask_api_tutorial/models/__init__.py::BLACK SKIPPED                                                  [ 33%]
src/flask_api_tutorial/models/__init__.py::FLAKE8 SKIPPED                                                 [ 34%]
src/flask_api_tutorial/models/token_blacklist.py::BLACK PASSED                                            [ 36%]
src/flask_api_tutorial/models/token_blacklist.py::FLAKE8 PASSED                                           [ 37%]
src/flask_api_tutorial/models/user.py::BLACK PASSED                                                       [ 39%]
src/flask_api_tutorial/models/user.py::FLAKE8 PASSED                                                      [ 40%]
src/flask_api_tutorial/util/__init__.py::BLACK SKIPPED                                                    [ 42%]
src/flask_api_tutorial/util/__init__.py::FLAKE8 SKIPPED                                                   [ 43%]
src/flask_api_tutorial/util/datetime_util.py::BLACK SKIPPED                                               [ 44%]
src/flask_api_tutorial/util/datetime_util.py::FLAKE8 SKIPPED                                              [ 46%]
src/flask_api_tutorial/util/result.py::BLACK SKIPPED                                                      [ 47%]
src/flask_api_tutorial/util/result.py::FLAKE8 SKIPPED                                                     [ 49%]
tests/__init__.py::BLACK SKIPPED                                                                          [ 50%]
tests/__init__.py::FLAKE8 SKIPPED                                                                         [ 52%]
tests/conftest.py::BLACK SKIPPED                                                                          [ 53%]
tests/conftest.py::FLAKE8 SKIPPED                                                                         [ 55%]
tests/test_auth_login.py::BLACK SKIPPED                                                                   [ 56%]
tests/test_auth_login.py::FLAKE8 SKIPPED                                                                  [ 57%]
tests/test_auth_login.py::test_login PASSED                                                               [ 59%]
tests/test_auth_login.py::test_login_email_does_not_exist PASSED                                          [ 60%]
tests/test_auth_logout.py::BLACK PASSED                                                                   [ 62%]
tests/test_auth_logout.py::FLAKE8 PASSED                                                                  [ 63%]
tests/test_auth_logout.py::test_logout PASSED                                                             [ 65%]
tests/test_auth_logout.py::test_logout_token_blacklisted PASSED                                           [ 66%]
tests/test_auth_register.py::BLACK SKIPPED                                                                [ 68%]
tests/test_auth_register.py::FLAKE8 SKIPPED                                                               [ 69%]
tests/test_auth_register.py::test_auth_register PASSED                                                    [ 71%]
tests/test_auth_register.py::test_auth_register_email_already_registered PASSED                           [ 72%]
tests/test_auth_register.py::test_auth_register_invalid_email PASSED                                      [ 73%]
tests/test_auth_user.py::BLACK PASSED                                                                     [ 75%]
tests/test_auth_user.py::FLAKE8 PASSED                                                                    [ 76%]
tests/test_auth_user.py::test_auth_user PASSED                                                            [ 78%]
tests/test_auth_user.py::test_auth_user_no_token PASSED                                                   [ 79%]
tests/test_auth_user.py::test_auth_user_expired_token PASSED                                              [ 81%]
tests/test_config.py::BLACK SKIPPED                                                                       [ 82%]
tests/test_config.py::FLAKE8 SKIPPED                                                                      [ 84%]
tests/test_config.py::test_config_development PASSED                                                      [ 85%]
tests/test_config.py::test_config_testing PASSED                                                          [ 86%]
tests/test_config.py::test_config_production PASSED                                                       [ 88%]
tests/test_user.py::BLACK SKIPPED                                                                         [ 89%]
tests/test_user.py::FLAKE8 SKIPPED                                                                        [ 91%]
tests/test_user.py::test_encode_access_token PASSED                                                       [ 92%]
tests/test_user.py::test_decode_access_token_success PASSED                                               [ 94%]
tests/test_user.py::test_decode_access_token_expired PASSED                                               [ 95%]
tests/test_user.py::test_decode_access_token_invalid PASSED                                               [ 97%]
tests/util.py::BLACK PASSED                                                                               [ 98%]
tests/util.py::FLAKE8 PASSED                                                                              [100%]

=============================================== warnings summary ================================================
src/flask_api_tutorial/api/auth/business.py::BLACK
  /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/lib/python3.7/site-packages/flask_restplus/model.py:8: DeprecationWarning: Using or importing the ABCs from 'collections' instead of from 'collections.abc' is deprecated since Python 3.3,and in 3.9 it will stop working
    from collections import OrderedDict, MutableMapping

-- Docs: https://docs.pytest.org/en/latest/warnings.html
============================================ short test summary info ============================================
SKIPPED [18] /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/lib/python3.7/site-packages/pytest_black.py:59: file(s) previously passed black format checks
SKIPPED [18] /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/lib/python3.7/site-packages/pytest_flake8.py:106: file(s) previously passed FLAKE8 checks
================================== 33 passed, 36 skipped, 1 warning in 16.09s ===================================
____________________________________________________ summary ____________________________________________________
  py37: commands succeeded
  congratulations :)</span></code></pre>

## Checkpoint

As promised, we have implemented all of the required features in the **User Management/JWT Authentication** section of the requirements list:

<div class="requirements">
  <p class="title complete">User Management/JWT Authentication</p>
  <div class="fa-bullet-list">
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>New users can register by providing an email address and password</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>Existing users can obtain a JWT by providing their email address and password</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>JWT contains the following claims: time the token was issued, time the token expires, a value that identifies the user, and a flag that indicates if the user has administrator access</p>
    <p class="fa-bullet-list-item complete""><span class="fa fa-star fa-bullet-icon"></span>JWT is sent in access_token field of HTTP response after successful authentication with email/password</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>JWTs must expire after 1 hour (in production)</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>JWT is sent by client in Authorization field of request header</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>Requests must be rejected if JWT has been modified</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>Requests must be rejected if JWT is expired</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>If user logs out, their JWT is immediately invalid/expired</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>If JWT is expired, user must re-authenticate with email/password to obtain a new JWT</p>
  </div>
  <p class="title">API Resource: Widget List</p>
  <div class="fa-bullet-list">
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>All users can retrieve a list of all widgets</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>All users can retrieve individual widgets by name</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Users with administrator access can add new widgets to the database</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Users with administrator access can edit existing widgets</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Users with administrator access can delete widgets from the database</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>The widget model contains a "name" attribute which must be a string value containing only lowercase-letters, numbers and the "-" (hyphen character) or "_" (underscore character).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>The widget model contains a "deadline" attribute which must be a datetime value where the date component is equal to or greater than the current date. The comparison does not consider the value of the time component when this comparison is performed.</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>URL and datetime values must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>The widget model contains a "name" field which must be a string value containing only lowercase-letters, numbers and the "-" (hyphen character) or "_" (underscore character).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Widget name must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>If input validation fails either when adding a new widget or editing an existing widget, the API response must include error messages indicating the name(s) of the fields that failed validation.</p>
  </div>
</div>

Creating the Widget API will build upon the concepts introduced while the Auth API was being implemented. We will use most of these concepts and encounter many new ones in order to build the Widget API. If you have any questions/feedback, please leave a comment!
