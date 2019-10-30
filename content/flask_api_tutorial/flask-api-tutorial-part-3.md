---
title: "How To: Create a Flask API with JWT-Based Authentication (Part 3)"
lead: "Part 3: API Configuration and User Registration"
slug: "part-3"
series: ["flask_api_tutorial"]
series_weight: 3
series_title: "How To: Create a Flask API with JWT-Based Authentication"
series_part: "Part 3"
series_part_lead: "API Configuration and User Registration"
categories: ["Flask", "Python"]
toc: true
summary: ""
twitter:
  card: "summary"
  creator: "@aaronlunadev"
  title: ""
  description: ""
---
## Project Structure

The chart below shows the folder structure for this section of the tutorial. In this post, we will work on all files marked as <code class="work-file">NEW CODE</code>. Files that contain code from previous sections but will not be modified in this post are marked as <code class="unmodified-file">NO CHANGES</code>.

<pre class="project-structure"><div><span class="project-folder">.</span> <span class="project-structure">(project root folder)</span>
|- <span class="project-folder">app</span>
|   |- <span class="project-folder">api</span>
|   |   |- <span class="project-folder">auth</span>
|   |   |   |- <span class="project-empty-file">__init__.py</span>
|   |   |   |- <span class="work-file">business.py</span>
|   |   |   |- <span class="work-file">dto.py</span>
|   |   |   |- <span class="work-file">endpoints.py</span>
|   |   |
|   |   |- <span class="project-folder">widgets</span>
|   |   |   |- <span class="project-empty-file">__init__.py</span>
|   |   |
|   |   |- <span class="work-file">__init__.py</span>
|   |
|   |- <span class="project-folder">models</span>
|   |   |- <span class="project-empty-file">__init__.py</span>
|   |   |- <span class="unmodified-file">user.py</span>
|   |
|   |- <span class="project-folder">util</span>
|   |   |- <span class="project-empty-file">__init__.py</span>
|   |-  |- <span class="unmodified-file">datetime_util.py</span>
|   |-  |- <span class="unmodified-file">result.py</span>
|   |
|   |- <span class="work-file">__init__.py</span>
|   |- <span class="unmodified-file">config.py</span>
|
|- <span class="project-folder">test</span>
|   |- <span class="unmodified-file">conftest.py</span>
|   |- <span class="work-file">test_auth_register.py</span>
|   |- <span class="unmodified-file">test_config.py</span>
|   |- <span class="unmodified-file">test_user.py</span>
|
|- <span class="unmodified-file">.env</span>
|- <span class="unmodified-file">pytest.ini</span>
|- <span class="unmodified-file">run.py</span>
|- <span class="unmodified-file">setup.py</span>
|- <span class="unmodified-file">pyproject.toml</span>
|- <span class="unmodified-file">requirements.txt</span>
|- <span class="unmodified-file">requirements_dev.txt</span></div>
<div class="project-structure-key-wrapper">
<div class="project-structure-key">
<div class="key-item key-label">KEY:</div>
<div class="key-item project-folder">FOLDER</div>
<div class="key-item work-file">NEW CODE</div>
<div class="key-item unmodified-file">NO CHANGES</div>
<div class="key-item project-empty-file">EMPTY FILE</div>
</div>
</div></pre>

## Introduction

It's finally time to start configuring the API! Keep in mind that the URL routes and the business logic that takes place when a user sends a `GET`, `POST`, `PUT` or `DELETE` request could all be accomplished using the functions, classes and decorators provided in Flask (that is, without using the Flask-RESTPlus extension). However, doing so would require considerably more code and would not give us the Swagger UI page to document and test the API.

Before we begin, let's discuss what makes a REST API <span class="bold-italics">RESTful</span> and make a decision to abide (or not to abide) by <a href="https://en.wikipedia.org/wiki/Representational_state_transfer#Architectural_constraints" target="_blank">the requirements and constraints of REST</a>.

### Understanding REST

The term "REST" was introduced in 2000 by Roy Fielding in his doctoral thesis, titled <span class="bold-italics"><a href="https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm" target="_blank">Architectural Styles and the Design of Network-based Software Architectures</a></span>. I strongly recommend trying to fully digest Fielding's thesis. At the very least you should read <a href="https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm" target="_blank">Chapter 5 Representational State Transfer (REST)</a>.

What makes an API <span class="bold-italics">RESTful</span> is much more than creating a set of URIs and implementing the response to `GET`, `POST`, `PUT`, etc. requests. First of all, REST does not require HTTP -- REST is protocol-agnostic. HTTP just happens to be very popular and well-suited to REST systems. REST is truly about resource state, and how hypermedia defines the actions available to these resources. REST is also about the media types that the system uses to represent the resources.

I say these things because most so-called REST APIs and articles explaining how to design and construct a REST API are not truly RESTful. In this section of the tutorial we will implement the user registration and authentication processes. What is the correct way to design a REST API to perform these actions? Are these actions even appropriate for a REST API? The answer is not as straightforward or obvious as you might think.

### User Authentication in a RESTful System

The following questions/topics are from stackoverflow:

<ul class="list-of-links">
  <li>
    <a href="https://stackoverflow.com/questions/2001773/understanding-rest-verbs-error-codes-and-authentication?noredirect=1&lq=1" target="_blank">Understanding REST: Verbs, error codes, and authentication</a>
  </li>
  <li>
    <a href="https://stackoverflow.com/questions/7140074/restfully-design-login-or-register-resources" target="_blank">RESTfully design /login or /register resources?</a>
  </li>
  <li>
    <a href="https://stackoverflow.com/questions/15098392/which-http-method-should-login-and-logout-actions-use-in-a-restful-setup?noredirect=1&lq=1" target="_blank">Which HTTP method should Login and Logout Actions use in a “RESTful” setup</a>
  </li>
  <li>
    <a href="https://stackoverflow.com/questions/51376453/how-to-design-a-restful-url-for-login?noredirect=1&lq=1" target="_blank">How to design a restful url for login?</a>
  </li>
  <li>
    <a href="https://stackoverflow.com/questions/6068113/do-sessions-really-violate-restfulness" target="_blank">Do sessions really violate RESTfulness?</a>
  </li>
  <li>
    <a href="https://stackoverflow.com/questions/319530/restful-authentication?rq=1" target="_blank">RESTful Authentication</a>
  </li>
</ul>

I recommend skimming these discussions. What I took away from them is that there is nothing close to a consensus on the topic of the "correct" way to design a RESTful authentication system. The design that we will implement ensures that the client's application state is never stored by the server, which adheres to the **statelessness** constraint of REST. However, the design I chose for the endpoint names clearly violates the naming requirements for RESTful URIs.

I believe that you should follow the tenets of REST as long as it makes sense for your application. For an authentication API, I believe the best design is to use routes with the verbs `/register`, `/login`, etc. A RESTful design where all routes strictly refer to a resource such as `/session` is far less intuitive, IMO.

### Bearer Token Authentication

<a href="https://tools.ietf.org/html/rfc6750" target="_blank">RFC6750 is the specification document</a> that defines an authorization process where clients utilize tokens issued by a resource server to access protected resources. The tokens are exchanged via HTTP response fields and header fields. RFC6750 defines the required format and contents of these fields, as well as recommended best practices for mitigating possible security threats.

RFC6750 is a concrete implementation of the **OAuth 2.0 Authorization Framework**. OAuth 2.0 has its own specification document, <a href="https://tools.ietf.org/html/rfc6749" target="_blank">RFC6749</a>. To avoid duplicating work and to make maintenance of these reference docs easier, quite often terminology referred to in the Bearer Token Authentication spec references RFC6749 for the full definition/explanation. Because of this, I will refer to both documents and reproduce text whenever I am implementing something in order to fulfull a requirement for Bearer Token Authentication.

My intent is to adhere to the requirements in every possible case. Please let me know if you believe I have implemented anything incorrectly.

### API Versioning

After you develop and release an API, it is important to remember that even minor changes such as a value in the request or response data changing from a string to an int could be a breaking change for clients. The best way to avoid causing frustration is to apply strict versioning with the promise that no breaking changes will be introduced within a major version.

There are several approaches to API versioning, but the one I prefer is the most explicit -- embed the version number in the URL route. For example, the API route that registers a new user account will be `/api/v1/auth/register`. The `/api/v1` prefix will apply to all API routes, and clients will expect that any tools or proceses that integrate with our API will continue to function as long as they use the same URI.

<a href="https://dev.to/sparkpost/restful-api-versioning-best-practices-why-v1-is-1" target="_blank">This post on the SparkNotes blog</a> provides a nice summary of the types of changes that are breaking changes and the types that are not:

<div class="steps" style="margin:0">
    <ul style="list-style: none; margin: 0 0 0 0.5em">
      <li class="pink">
          <p class="emphasis" style="font-size:1.1em; margin: 5px 0">Breaking Changes (Very Bad)</p>
          <ul style="font-size:0.95em; margin: 0 0 1em 2em">
            <li>A new required parameter</li>
            <li>A new required key in POST bodies</li>
            <li>Removal of an existing endpoint</li>
            <li>Removal of an existing endpoint request method</li>
            <li>A materially different internal behavior of an API call – such as a change to the default behavior.</li>
          </ul>
      </li>
      <li class="green" style="margin:20px 0 0 0">
          <p class="emphasis" style="font-size:1.1em; margin: 5px 0">NOT Breaking Changes (Good)</p>
          <ul style="font-size:0.95em; margin: 0 0 0 2em">
            <li>A new resource or API endpoint</li>
            <li>A new optional parameter</li>
            <li>A change to a non-public API endpoint</li>
            <li>A new optional key in the JSON POST body</li>
            <li>A new key returned in the JSON response body</li>
          </ul>
      </li>
    </ul>
</div>

## API Configuration with Flask-RESTPlus

Just like every other extension, Flask-RESTPlus can be initialized with a Flask application object (i.e., `api.init_app(app)` -- doing so would place the API at the website root). However, in most applications we would rather have the API routes configured with a prefix such as <code>/api/v1</code> to enforce our versioning system.

The best way to accomplish this is with <a href="http://flask.pocoo.org/docs/1.0/blueprints/#why-blueprints" target="_blank">Flask blueprints</a>. Typically, blueprints are used to factor a large, monolithic Flask application into a set of blueprints. Using a blueprint to register our Flask-RESTPlus API with the Flask application will allow us to define a `url_prefix` for the API endpoints.

### `api_bp` Blueprint

In the `app/api/__init__.py` file, add the following content:

{{< highlight python "linenos=table" >}}"""API blueprint configuration."""
from flask import Blueprint
from flask_restplus import Api

api_bp = Blueprint("api", __name__, url_prefix="/api/v1")
authorizations = {
  "Bearer": {
    "type": "apiKey",
    "in": "header",
    "name": "Authorization"
  }
}

api = Api(
    api_bp,
    version="1.0",
    title="Flask API with JWT-Based Authentication",
    description="Welcome to the Swagger UI documentation for the Widget API",
    doc="/ui",
    authorizations=authorizations,
){{< /highlight >}}

There are a few important things to note about how we are configuring the `api` and `api_bp` objects:

<div class="code-details">
    <ul>
      <li>
          <p><strong>Line 5: </strong>This is where we create the Flask blueprint object for our API. The first parameter, <code>"api"</code>, is the name of the blueprint. All API endpoint names will be prefixed with this value (e.g., <code>api.func_name</code>). The <code>url_prefix</code> value makes all API routes begin with <code>/api/v1</code> (e.g., <code>api/v1/auth/login</code>).</p>
      </li>
      <li>
          <p><strong>Lines 6, 20: </strong>The API will implement <a href="https://tools.ietf.org/html/rfc6750" target="_blank">Bearer token authentication</a>. This dictionary value is passed to the Flask-RESTPlus <code>Api</code> constructor which adds the authorization to the Swagger UI page. This creates a "Authorize" button in the Swagger UI that prompts you to enter a Bearer token value (i.e., JWT value). After providing a token, all API methods that require authorization will automatically send the token in the Authorization field of the request header.</p>
          <div class="note note-flex">
            <div class="note-icon">
              <i class="fa fa-pencil" aria-hidden="true"></i>
            </div>
            <div class="note-message">
              <p>Currently, Flask-RESTPlus only supports OpenAPI 2.0, which lacks sufficient configuration settings to accurately describe Bearer token authentication as a security scheme object. This is not the case in OpenAPI 3.0. Defining an <code>apiKey</code> named <code>Bearer</code> which is located in the <code>Authorization</code> field of the request header achieves nearly the same behavior as Bearer Token Authentication, and provides a dialog window on the Swagger UI page to send requests with the access token in the header.</p>
            </div>
          </div>
      </li>
      <li>
        <p><strong>Line 15: </strong>Passing the <code>api_bp</code> blueprint object to the Flask-RESTPlus <code>Api</code> constructor links the two objects and is how all API routes become prefixed with the <code>url_prefix</code> value from <code>api_bp</code>. Later, we will import the <code>api_bp</code> object in the <code>run</code> module and register the blueprint with the Flask application object to complete the process of configuring the API.</p>
      </li>
      <li>
        <p><strong>Lines 16-18: </strong>All of these string values are displayed in the Swagger UI.</p>
      </li>
      <li>
        <p><strong>Line 19: </strong>The <code>doc</code> value controls the URL path of the Swagger UI. With this value, the Swagger UI path is <code>/api/v1/ui</code>.</p>
      </li>
    </ul>
</div>

The next step in configuring the API is registering the `api_bp` blueprint with our Flask application. The correct place to do this is within the `create_app` method in the `app/__init__.py` file. Open this file and add the highlighted lines below:

{{< highlight python "linenos=table,hl_lines=20-22" >}}"""Flask app initialization via factory pattern."""
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

from app.config import get_config

cors = CORS()
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()


def create_app(config_name):
    app = Flask("flask-api-tutorial")
    app.config.from_object(get_config(config_name))

    from app.api import api_bp

    app.register_blueprint(api_bp)

    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    return app{{< /highlight >}}

The placement of the import statement is deliberate. To avoid a circular import, we do not want the `app.api` package to be imported <span class="bold-text">unless</span> the `create_app` method is invoked.

It's a good idea to make sure that everything still works and we have not broken anything, so run the unit tests with `pytest`. They should all pass. Then, run `flask routes` to see the new URL routes that have been registered in our application:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask routes</span>
<span class="cmd-results">Endpoint             Methods  Rule
-------------------  -------  --------------------------
api.doc              GET      /api/v1/ui
api.root             GET      /api/v1/
api.specs            GET      /api/v1/swagger.json
restplus_doc.static  GET      /swaggerui/<path:filename>
static               GET      /static/<path:filename></span></code></pre>

The first four routes in the list were added by registering the `api_bp` blueprint with our application. Next, run `flask run` to start the development server and point your browser to `http://localhost:5000/api/v1/ui` (if you are using a different port or hostname on your dev machine, adjust accordingly).

You should see something similar to the screenshot below. Note that the URL path, API version, title and description are taken directly from values we provided to the `Api` constructor in the `app/api/__init__.py` file.

<figure>
    <a href="/img/flask-api-tutorial/p03-01-empty-api.jpg">
        <img src="/img/flask-api-tutorial/p03-01-empty-api.jpg" style="width:500px" alt="">
    </a>
    <figcaption><p>Figure 1 - Swagger UI without API Routes</p></figcaption>
</figure>

### API Namespaces

In the same way that we can organize our Flask project with **blueprints**, we can organize our Flask-RESTPlus API with **namespace** objects. Our API will contain two namespaces: `auth_ns` and `widget_ns`, which correspond to the `app.api.auth` and `app.api.widget` packages, respectively. For now, we will focus on `auth_ns`, since this is the namespace that handles authentication requests.

Currently, the `app/api/auth` folder only contains the `__init__.py` file. We need to create 3 new files in the `auth` folder: `business.py`, `dto.py` and `endpoints.py`. Run the command below from the project root folder to create the files (or create them yourself however you wish):

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">cd app/api/auth && touch business.py dto.py endpoints.py</span>
<span class="cmd-venv">(venv) flask-api-tutorial/app/api/auth $</span> <span class="cmd-input">ls -al</span>
<span class="cmd-results">total 8
drwxr-xr-x  7 aaronluna  staff  224 Jun 30 01:20 .
drwxr-xr-x  5 aaronluna  staff  160 Jun 27 02:47 ..
-rw-r--r--  1 aaronluna  staff    0 Jun 29 13:05 __init__.py
-rw-r--r--  1 aaronluna  staff    0 Jun 30 01:20 business.py
-rw-r--r--  1 aaronluna  staff    0 Jun 30 01:20 dto.py
-rw-r--r--  1 aaronluna  staff    0 Jun 30 01:20 endpoints.py</span></code></pre>

All of these files are standard for any Flask-RESTPlus API namespace package that I create. These files perform specific roles that are common to request handling and response formatting:

<div class="code-details">
  <ul>
    <li>
      <p><strong>business.py: </strong>This file contains the business logic that executes when an API endpoint in this namespace receives a valid request. (e.g., process registration request, process login request, etc.)</p>
    </li>
    <li>
      <p><strong>dto.py: </strong>DTO stands for <span class="bold-italics">data transfer object</span>. This file will contain custom objects that parse and validate request data, and API model classes that will serialize our database model classes to JSON objects before sending them in an HTTP response.</p>
    </li>
    <li>
      <p><strong>endpoints.py: </strong>This file will contain Flask-RESTPlus <code>Resource</code> classes. Resources are the most important individual parts of a REST API. Each resource is an API endpoint, and the methods we add to each <code>Resource</code> class control the HTTP methods the endpoint responds to . The following method names are automatically mapped to the corresponding HTTP methods: <code>get</code>, <code>post</code>, <code>put</code>, <code>delete</code>, <code>patch</code>, <code>options</code> and <code>head</code>.</p>
    </li>
  </ul>
</div>

Before we begin implementing the API routes and business logic for the authentication processes, we need to understand how to parse the information sent by the client in a HTTP request.

## Request Parsing and Response Marshalling

Flask-RESTPlus provides two different approaches for parsing and validating request data. Deciding which method to use will depend on the complexity of the data and the interface you provide to the client.

In many cases the source of an HTTP POST request is a form submission from a page. Another common scenario is an HTTP GET request that occurs when a client accesses a URL with a query string containing pertinent request data. In these cases, you should use the `RequestParser` class provided in the `reqparse` module.

If your API endpoint expects a complex object (e.g., a blog post containing full content and metadata) and the source of the reqeust data is <span class="emphasis">NOT</span> a web form (i.e., client is accessing the API programmatically), then you should use the `fields` module to document the format of the object and instruct the client to send the object as serialized JSON. The expected JSON format is defined as an API model, and is used both for validating request data and documenting the output format for objects returned from HTTP GET requests.

Documenting the expected format of request and response data has an additional benefit -- the Swagger UI automatically documents the expected format for any API routes we specify.

### Request Parser Configuration

Flask-RESTPlus provides the `RequestParser` class as a way to parse data from the Flask `request` object. For each value to be parsed, we add an instance of the `Argument` class to the `RequestParser`. The `Argument` class is very flexible and is configured by the parameters listed below:

<div style="font-size: 0.9em; padding: 5px; line-height: 1.5">
  <ul>
    <li><strong>name: </strong>The name of the argument to parse from the request.</li>
    <li><strong>default: </strong>The value to use if the argument is not found in the request, default value is <code>None</code>.</li>
    <li><strong>type: </strong>The type to convert the parsed argument to. This can be any primitive (e.g., int, str, etc.), but Flask-RESTPlus also provides more advanced types in the <code>inputs</code> module (e.g., email address, URL, etc.). You can also define your own custom data types.</li>
    <li><strong>required: </strong>By default, arguments that are added to a <code>RequestParser</code> that are not found in the request are set to the default value. If <code>required=True</code>, any request where the argument is not found will be aborted with HTTP exception 400 <code>HTTPStatus.BAD_REQUEST</code>.</li>
    <li>
      <p><strong>location: </strong>Where to look on the <code>Flask.request</code> object for the argument (can be <code>args</code>, <code>form</code>, <code>headers</code>, <code>json</code>, <code>values</code> or <code>files</code>). The default behavior is to parse values from <code>values</code> and <code>json</code>. <code>values</code> is actually a dictionary that conbines <code>args</code> and <code>form</code>. Also, you can specify multiple locations with a list (e.g., <code>["form", "args"]</code>), the last location in the list takes precedence in the result set.</p>
      <p>I'm sure that this explanation is confusing. I think that you should explicitly define the location on the request object where you expect the data to be found. Since this value is documented on the Swagger UI, it is beneficial to users of the API to know how their requests should be constructed.</p>
    </li>
    <li><strong>help: </strong>If you provide a value, it will be pre-pended to any error message that is raised while parsing the argument.</li>
    <li><strong>nullable: </strong>Whether a null or <code>None</code> value is allowed. By default, this is True.</li>
  </ul>
</div>

I recommend reading and fully understanding the documentation explaining <a href="https://flask-restplus.readthedocs.io/en/stable/parsing.html#advanced-types-handling" target="_blank">how to specify input validation for advanced and custom data types</a>. Also, please review the API documentation for the `inputs` module which contains <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#module-flask_restplus.inputs" target="_blank">a list of advanced data types</a> that are available before you create your own custom validator.

### Defining API Models

For POST and PUT requests that create a new resource or update an existing resource in a collection, you should instruct the client to send the resource as a JSON object in the request body. You can define the expected API model by creating a `dict` object where the keys are the names of the attributes on the JSON object and the values are a class that will validate and convert the attribute to the required data type.

In the same way that the `inputs` module provides primitive data types and a set of predefined data formats to specify the `type` of each `RequestParser` `Argument`, the `fields` module fulfills the same role for `model` objects. You can find <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#models" target="_blank">a list of pre-defined</a> `fields` in the API documentation. You can also easily create your own custom `field` by subclassing `fileds.Raw`, <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html#custom-fields-multiple-values" target="_blank">as shown in the Flask-RESTPlus docs</a>.

To avoid duplicating code, if you need to define two models which represent the same ORM object but expose slightly different sets of attributes, you can <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html#duplicating-with-clone" target="_blank">inherit a model</a> rather than defining the same set of `fields` twice.

### Response Marshalling

API models can be used to document the output of an API operation as well as the expected request format. This is most often used to return a representation of an ORM object with a subset of the attributes defined by the actual ORM model. For example, the `User` class includes `id` and `password_hash` attributes which store the primary key for the database table and password hash used to verify a user's password during login. There's very little security risk to exposing these two values, but at the bare minimum they expose implementation details which the client has no need for.

We will see this shortly in the `auth/user` API route which inspects the access token of the current user and returns a representation of the `User` object as the HTTP response. The API model we define as the expected output of this API route omits the `id` and `password_hash` attributes from the response.

## `auth_ns` Endpoints

Within the <code>auth_ns</code> namespace, we will create the four API endpoints listed in the table below:

<div class="table-wrapper">
    <div class="responsive">
        <table>
            <thead>
            <tr>
                <th scope="col" class="first-column column-header">Endpoint Name</th>
                <th scope="col" class="column-header">URL Path</th>
                <th scope="col"  class="column-header">HTTP Method</th>
                <th scope="col" class="last-column column-header">Authentication Process</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td class="first-column">api.auth_register</td>
                <td>/api/v1/auth/register</td>
                <td>POST</td>
                <td class="last-column">Register new user</td>
            </tr>
            <tr>
                <td class="first-column">api.auth_login</td>
                <td>/api/v1/auth/login</td>
                <td>POST</td>
                <td class="last-column">Authenticate user</td>
            </tr>
            <tr>
                <td class="first-column">api.auth_user</td>
                <td>/api/v1/auth/user</td>
                <td>GET</td>
                <td class="last-column">Get logged-in user info</td>
            </tr>
            <tr>
                <td class="first-column">api.auth_logout</td>
                <td>/api/v1/auth/logout</td>
                <td>POST</td>
                <td class="last-column">Blacklist access token</td>
            </tr>
            </tbody>
        </table>
    </div>
</div>

We will implement each endpoint in the same way, following the steps listed below:

<div class="steps">
  <ol>
    <li>Create request parsers/API models to validate request data and serialize response data.</li>
    <li>Define the business logic necessary to process the request if validation succeeds.</li>
    <li>Create a class that inherits from <code>Resource</code> and bind it to the API endpoint/URL route.</li>
    <li>Define the set of HTTP methods that the API endpoint will support and expose methods on the concrete <code>Resource</code> class for each. Methods named <code>get</code>, <code>post</code>, <code>put</code>, <code>delete</code>, <code>patch</code>, <code>options</code> or <code>head</code> will be called when the API endpoint receives a request of the same HTTP method type.
    <div class="alert alert-flex">
      <div class="alert-icon">
        <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
      </div>
      <div class="alert-message">
        <p>If the API endpoint does not support the HTTP method, do not expose a method with the name of the HTTP method and the client will receive a response with status code 405 <code>HTTPStatus.METHOD_NOT_ALLOWED</code></p>
      </div>
    </div>
    </li>
    <li>Document the <code>Resource</code> class and all methods <a href="https://flask-restplus.readthedocs.io/en/stable/swagger.html" target="_blank">as explained in the Flask-RESTPlus docs</a>. Most of the content on the Swagger UI page is generated by decorating your concrete <code>Resource</code> classes and their methods.</li>
    <li>Utilize the business logic created in Step 2 within the approprate HTTP methods to process the request.</li>
    <li>Create unit tests to verify that the input validation provided by the request parsers/API models is working correctly, and verify the endpoint behaves as expected.</li>
  </ol>
</div>

This process will result in an updated Swagger UI page containing a documented version of the API endpoint which allows clients to construct data in the expected format, send HTTP requests and inspect responses from the server.

## `api.auth_register` Endpoint

The first resource we create will handle the process of registering a new user account. If this were a full-stack tutorial, we would probably create a registration form that calls this API endpoint when a user clicks the Submit button. I'm leaving all decisions regarding the front-end in your hands, therefore designing such a form is your task to conquer.

### `auth_reqparser` Request Parser

When a new user attempts to register, what data is required? The way our `User` model is defined, the value for `email` must be unique (i.e., two users cannot register with the same email address). The only other value which is provided by the user is their password, which is not stored in the database (the actual password is ony needed to create the `password_hash` value and to authenticate a user attempting to login). Open `app/api/auth/dto.py`, add the content below and save the file:

{{< highlight python >}}"""Parsers and serializers for /auth API endpoints."""
from flask_restplus.inputs import email
from flask_restplus.reqparse import RequestParser


auth_reqparser = RequestParser(bundle_errors=True)
auth_reqparser.add_argument(
    name="email",
    type=email(),
    location="form",
    required=True,
    nullable=False
)
auth_reqparser.add_argument(
    name="password",
    type=str,
    location="form",
    required=True,
    nullable=False
){{< /highlight >}}

The first thing to note here is the parameter `bundle_errors=True` when we instantiate `auth_reqparser`. This value is false by default, which means that only a single error is reported whenever the request data fails validation. I prefer to have all error messages reported for all arguments in our request parser.

Next, notice that we have specified `type=email()` for the `email` argument. This is a pre-defined type provided by Flask-RESTPlus that verifies that the value sent in the request is a valid email address. If a request includes a value of "213323 kjljk" for `email`, we expect that the user will not be registered and the response will include a status code indicating that a validation error occurred and a message explaining that the value for `email` is not valid.

The remaining parameters are the same for both arguments: `location="form", required=True, nullable=False`. [The purpose of each parameter was explained previously](#request-parser-configuration), and should answer any questions you have about these settings.

### Process Registration Request

Next, we need to create a function that performs the following actions:

* Add a new user to the database
* Issue an access token for the new user
* Construct an HTTP response including the access token and send the response the client

For any response containing sensitive information (e.g., access tokens, credentials, etc), <a href="https://tools.ietf.org/html/rfc6749#section-5.1" target="_blank">RFC6749 (OAuth 2.0)</a> defines the required and optional fields in both the response body and header:

<blockquote class="rfc" cite="https://tools.ietf.org/html/rfc6749#section-5.1"><span class="bold-text">5.1 Successful Response</span>
  <p style="margin: 1em 0 0 1em">The authorization server issues an access token and optional refresh token, and constructs the response by adding the following parameters to the entity-body of the HTTP response:
  </p>
  <p class="defined-term">access_token</p>
  <p style="margin: 0 0 0 2em"><span class="bold-text">REQUIRED</span>.  The access token issued by the authorization server.</p>
  <p class="defined-term">token_type</p>
  <p style="margin: 0 0 0 2em"><span class="bold-text">REQUIRED</span>.  The type of the token issued as described in Section 7.1.  Value is case insensitive.</p>
  <p class="defined-term">expires_in</p>
  <p style="margin: 0 0 0 2em"><span class="bold-text">RECOMMENDED</span>.  The lifetime in seconds of the access token.  For example, the value "3600" denotes that the access token will expire in one hour from the time the response was generated.  If omitted, the authorization server SHOULD provide the expiration time via other means or document the default value.</p>
  <p class="defined-term">refresh_token</p>
  <p style="margin: 0 0 0 2em"><span class="bold-text">OPTIONAL</span>.  The refresh token, which can be used to obtain new access tokens using the same authorization grant as described in Section 6.</p>
  <p class="defined-term">scope</p>
  <p style="margin: 0 0 0 2em"><span class="bold-text">OPTIONAL</span>, if identical to the scope requested by the client; otherwise, REQUIRED.  The scope of the access token as described by Section 3.3.</p>
  <p style="margin: 1em 0 0.5em 1em">The parameters are included in the entity-body of the HTTP response using the "application/json" media type as defined by [RFC4627].  The parameters are serialized into a JavaScript Object Notation (JSON) structure by adding each parameter at the highest structure level.  Parameter names and string values are included as JSON strings.  Numerical values are included as JSON numbers.  The order of parameters does not matter and can vary.</p>
  <p style="margin: 1em 0 0.5em 1em">The authorization server MUST include the HTTP "Cache-Control" response header field [RFC2616] with a value of "no-store" in any response containing tokens, credentials, or other sensitive information, as well as the "Pragma" response header field [RFC2616] with a value of "no-cache".</p>
  <p style="margin: 1em 0 0.5em 1em">For example:</p>
  <pre><code>HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
 "access_token":"2YotnFZFEjr1zCsicMWpAA",
 "token_type":"example",
 "expires_in":3600,
 "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
 "example_parameter":"example_value"
}</code></pre>
</blockquote>


Open `app/api/auth/business.py`, add the content below and save the file:

{{< highlight python "linenos=table" >}}"""Business logic for /auth API endpoints."""
from http import HTTPStatus

from flask import current_app, jsonify
from flask_restplus import abort

from app import db
from app.models.user import User


def process_registration_request(email, password):
    if User.find_by_email(email):
        abort(HTTPStatus.CONFLICT, f"{email} is already registered", status="fail")
    new_user = User(email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    access_token = new_user.encode_access_token()
    response = jsonify(
        status="success",
        message="successfully registered",
        access_token=access_token.decode(),
        token_type="bearer",
        expires_in=_get_token_expire_time(),
    )
    response.status_code = HTTPStatus.CREATED
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return response


def _get_token_expire_time():
    token_age_h = current_app.config.get("TOKEN_EXPIRE_HOURS")
    token_age_m = current_app.config.get("TOKEN_EXPIRE_MINUTES")
    expires_in_seconds = token_age_h * 3600 + token_age_m * 60
    return expires_in_seconds if not current_app.config["TESTING"] else 5{{< /highlight >}}

<div class="code-details">
  <ul>
    <li>
      <p><strong>Lines 12-13: </strong>The first thing we do is verify that the email address provided by the user has not been registered. If a <code>User</code> already exists with the same email address, the request is aborted.</p>
      <div class="note note-flex">
        <div class="note-icon">
          <i class="fa fa-pencil" aria-hidden="true"></i>
        </div>
        <div class="note-message">
          <p>The <code>abort</code> function is provided by Flask-RESTPlus and is the correct way to abort a request received by an API endpoint. The first argument is the HTTP status code to include in the response. In this case, the appropriate response code is <code>HTTPStatus.CONFLICT</code> (409). The remaining arguments are included in the response body.</p>
        </div>
      </div>
    </li>
    <li>
      <p><strong>Line 14-16: </strong>If the email address has not been registered, we proceed to create a <code>User</code> object with the provided email and password values, and then commit the new user to the database.</p>
    </li>
    <li>
      <p><strong>Line 17: </strong>The response needs to include an access token and we can issue one by calling <code>encode_access_token</code> on the <code>user</code> object.</p>
    </li>
    <li>
      <p><strong>Line 18: </strong>The specification cited above requires that any response containing an access token must have the <code>Cache-Control</code> and <code>Pragma</code> fields present in the header. The only way to add the necessary headers is by constructing the response object ourselves.</p>
      <p>Flask provides the <code>jsonify</code> function which takes either a dict, a list of arguments, or a list of keyword-arguments and converts the data to a JSON object (similar to calling <code>json.dumps</code> on an object). Finally, <code>jsonify</code> returns a response object with the JSON object as the response body.</p>
    </li>
    <li>
      <p><strong>Line 21: </strong>Per the specification, the <code>access_token</code> attribute is included as a parameter of the serialized JSON in the response body.</p>
    </li>
    <li>
      <p><strong>Line 22: </strong>Per the specification, the <code>token_type</code> attribute is included as a parameter of the serialized JSON in the response body.</p>
    </li>
    <li>
      <p><strong>Line 23: </strong>Per the specification, the <code>expires_in</code> attribute is included as a parameter of the serialized JSON in the response body.</p>
      <p>We calculate the lifespan of the <code>access_token</code> from the <code>app.config</code> values <code>TOKEN_EXPIRE_HOURS</code> and <code>TOKEN_EXPIRE_MINUTES</code>. If the <code>app.config["TESTING"]</code> flag is set, then five seconds is used as the lifespan of the token. Otherwise, the lifespan in seconds is calculated with <code>TOKEN_EXPIRE_HOURS * 3600 + TOKEN_EXPIRE_MINUTES * 60</code>.</p>
    </li>
    <li>
      <p><strong>Line 25: </strong>The most appropriate HTTP status code for a response indicating we have created a new resource is <code>HTTPStatus.CREATED</code> (201).</p>
    </li>
    <li>
      <p><strong>Line 26-27: </strong>The final requirement in the specification cited above is that the response must include the HTTP <code>Cache-Control</code> response header field with a value of <code>no-store</code>, and the <code>Pragma</code> response header field with a value of <code>no-cache</code></p>
    </li>
    <li>
      <p><strong>Line 28: </strong>After ensuring that all required response body and header elements have been created and populated correctly, we send the HTTP response containing the newly issued <code>access_token</code> to the client.</p>
    </li>
  </ul>
</div>

Next, we need to create the API endpoint and incorporate it with the `auth_reqparser` and `process_registration_request` function.

### `RegisterUser` Resource

If you look back at all of the material covered in this tutorial, it's amazing (IMO) that we haven't written one line of code that that makes our Flask application perform one of the basic functions of a web server: URL routing. It's time to fix that.

In an application that adheres to the [principles of REST](#understanding-rest), each API endpoint (IOW, each URL) is a representation of a resource. Clients interact with resources by sending HTTP requests. The method type of the client's request (e.g., `GET`, `PUT`, `POST`) is used to perform different operations, and the nature of the operation should be related to the. For this reason, when we need to add a URL route to the API, we define a class that inherits from the `flask_restplus.Resource` base class.



[According to the table defining the API endpoints for the `auth_ns` namespace](#auth-ns-endpoints), users can register for a new account by sending a `POST` request to `/api/v1/auth/register`. To create this API endpoint, open `app/api/auth/endpoints.py`, add the content below and save the file:

{{< highlight python "linenos=table" >}}"""API endpoint definitions for /auth namespace."""
from http import HTTPStatus

from flask_restplus import Namespace, Resource

from app.api.auth.dto import auth_reqparser
from app.api.auth.business import process_registration_request

auth_ns = Namespace(name="auth", validate=True)


@auth_ns.route("/register", endpoint="auth_register")
class RegisterUser(Resource):
    """Handles HTTP requests to URL: /api/v1/auth/register."""

    @auth_ns.expect(auth_reqparser)
    @auth_ns.response(HTTPStatus.CREATED, "New user was successfully created.")
    @auth_ns.response(HTTPStatus.CONFLICT, "Email address is already registered.")
    @auth_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    @auth_ns.response(HTTPStatus.INTERNAL_SERVER_ERROR, "Internal server error.")
    def post(self):
        """Register a new user."""
        request_data = auth_reqparser.parse_args()
        email = request_data.get("email")
        password = request_data.get("password")
        return process_registration_request(email, password){{< /highlight >}}

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 9: </strong>Flask-RESTPlus <code>Namespace</code> objects are used to group a related set of API endpoints in the same way that Flask <code>Blueprint</code> objects can be used to group related URL routes.</p>
        <p>In this file, we will use the <code>auth_ns</code> object reapeatedly as a decorator. Most of these have an effect on the behavior of the class or method they decorate, some do not. All of these decorators have one thing in common  &mdash; they all produce some sort of documentation on the Swagger UI page.</p>
        <p>These decorators can inform clients about the expected format of request and response data or the set of possible HTTP status codes that the client can expect to receive from the server in a response. Also, docstrings for HTTP methods are rendered on the Swagger UI page and should be used to provide a short description of the method's purpose.</p>
        <p>Check out the Flask-RESTPlus docs for <a href="https://flask-restplus.readthedocs.io/en/stable/swagger.html" target="_blank">examples of using decorators to document the Swagger UI page</a> (if you need even more info it's probably in the <a href="https://flask-restplus.readthedocs.io/en/stable/api.html" target="_blank">API documentation</a>).</p>
      </li>
      <li>
        <p><strong>Line 12: </strong>The <code>route</code> decorator is used to decorate a class that inherits from <code>Resource</code>. Here, the <code>@auth_ns.route</code> decorator registers the <code>RegisterUser</code> resource with the <code>auth_ns</code> namespace.</p>
        <p>The first argument (<code>"/register"</code>) is the URL route to register. The <code>endpoint</code> parameter overrides the default value for the endpoint name. I like to specify this value to enforce a consistent naming scheme for all endpoints within the same namespace.</p>
      </li>
      <li>
        <p><strong>Line 13: </strong>The <code>RegisterUser</code> class, which adds the "/register" endpoint to the <code>auth_ns</code> namespace, inherits from the <code>Resource</code> base class.</p>
      </li>
      <li>
        <p><strong>Line 16: </strong>The <code>expect</code> decorator is used to specify the data that the server expects the client to send in the HTTP request. The first argument can be either a request parser or an API model that defines the expected input model. The optional second argument is a bool value named <code>validate</code>. If <code>validate=True</code>, the request data will be checked to make sure it matches the expected input model.</p>
        <p>You can also control validation behavior for an entire namespace, which we did when the <code>auth_ns</code> namespace was created in <strong>Line 9</strong>. You can also define this behavior for the entire API when instantiating the <code>api</code> object, or by setting the value of the app configuration setting <code>RESTPLUS_VALIDATE</code>. You can override the validation behavior for each method using the <code>expect</code> decorator.</p>
        <p>We are using the <code>auth_reqparser</code> we created in <code>app/api/auth/dto.py</code>. In the Swagger UI, this renders a form with textboxes for the email and password values and also enforces the rules we configured for each argument. If we had used an API model, the Swagger UI instead renders a single textbox and an example of the expected JSON.</p>
      </li>
      <li>
        <p><strong>Line 17-20: </strong>The <code>response</code> decorator is solely for documentation purposes, removing these lines would have no impact on the behavior of this API endpoint. Still, you should document all of the response codes that can possibly be received from this endpoint. The second argument is a string value explaining why the client's request resulted in the response code that was sent, and is included in the Swagger UI page.</p>
      </li>
      <li>
        <p><strong>Line 21: </strong>Since the only supported HTTP method for this endpoint is <code>POST</code>, the only method exposed by the <code>RegisterUser</code> class is named <code>post</code>.</p>
      </li>
      <li>
        <p><strong>Line 22: </strong>This docstring will be rendered on the Swagger UI page.</p>
      </li>
      <li>
        <p><strong>Line 23-25: </strong>In order to access the email and password values provided by the user, we call the <code>parse_args</code> method on the <code>auth_reqparer</code> object. This method returns a dict object containing the validated arguments.</p>
      </li>
      <li>
        <p><strong>Line 26: </strong>Finally, we call the method we created to process a registration request and provide the email and password provided by the user.</p>
      </li>
    </ul>
</div>

### Add <code>auth_ns</code> Namespace to <code>api</code>

In order to register the `auth_ns` namespae with the `api` object, open `app/api/__init__.py` and add the highlighted lines (<strong>Line 5</strong> and <strong>Line 25</strong>):

{{< highlight python "linenos=table,hl_lines=5 25" >}}"""API blueprint configuration."""
from flask import Blueprint
from flask_restplus import Api

from app.api.auth.endpoints import auth_ns


api_bp = Blueprint("api", __name__, url_prefix="/api/v1")
authorizations = {
  "Bearer": {
    "type": "apiKey",
    "in": "header",
    "name": "Authorization"
  }
}

api = Api(
    api_bp,
    version="1.0",
    title="Flask API with JWT-Based Authentication",
    description="Welcome to the Swagger UI documentation for the Widget API",
    doc="/ui",
    authorizations=authorizations,
)
api.add_namespace(auth_ns, path="/auth"){{< /highlight >}}

The `path` parameter in the `add_namespace` method sets the prefix for all endpoints in the `auth_ns` namepsace. This, along with the `url_prefix` value in **Line 8**, is why all URL routes in the `auth_ns` namespace begin with `/api/v1/auth`.

We can verify that our route has been correctly registered by running `flask routes`:

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">flask routes</span>
<span class="cmd-results">Endpoint             Methods  Rule
-------------------  -------  --------------------------
<span class="highlite">api.auth_register    POST     /api/v1/auth/register</span>
api.doc              GET      /api/v1/ui
api.root             GET      /api/v1/
api.specs            GET      /api/v1/swagger.json
restplus_doc.static  GET      /swaggerui/<path:filename>
static               GET      /static/<path:filename></span></code></pre>

The presence of the `api.auth_register` endpoint in the list of routes confirms a number of things:

<ul>
  <li>The <code>RegisterUser</code> resource supports HTTP <code>POST</code> requests, and no other method types.</li>
  <li><code>RegisterUser</code> is within the <code>auth_ns</code> namespace.</li>
  <li>Because the <code>api_bp</code> <code>Blueprint</code> object is linked with the <code>api</code>  object AND registered with the <code>app</code> <code>Flask</code> application object, adding the <code>auth_ns</code> <code>Namespace</code> object to the <code>api</code> object with the <code>add_namespace</code> method automatically registers all routes within the namespace with the <code>Flask</code> application object.
  </li>
</ul>

Start the development server by running `flask run` and point your browser to `http://localhost:5000/api/v1/ui` to check out the Swagger UI:

<figure>
    <a href="/img/flask-api-tutorial/p03-02-swagger-ui.jpg">
        <img src="/img/flask-api-tutorial/p03-02-swagger-ui.jpg" style="width:500px" alt="">
    </a>
    <figcaption><p>Figure 2 - Swagger UI with <code>/auth/register</code> endpoint</p></figcaption>
</figure>

You can click anywhere on the green bar to expand the component. It might not seem like a huge deal, but everything you see was automatically generated by Flask-RESTPlus (from the `api` object, `auth_ns` object, `auth_reqparser`, `RegisterUser`, etc):

<figure>
    <a href="/img/flask-api-tutorial/p03-03-register-endpoint.jpg">
        <img src="/img/flask-api-tutorial/p03-03-register-endpoint.jpg" style="width:500px" alt="">
    </a>
    <figcaption><p>Figure 3 - <code>/auth/register</code> endpoint expanded</p></figcaption>
</figure>

If you'd like to send a request, click the **Try It Out** button. Then, enter any valid email address and any value for password and click **Execute**:

<figure>
    <a href="/img/flask-api-tutorial/p03-04-register-endpoint.jpg">
        <img src="/img/flask-api-tutorial/p03-04-register-endpoint.jpg" style="width:500px" alt="">
    </a>
    <figcaption><p>Figure 4 - <code>/auth/register</code> endpoint ready to test</p></figcaption>
</figure>

You should receive a response with status code 201 `HTTPStatus.CREATED` if the email address is formatted correctly (this is the only validation process being performed by `auth_reqparser`):

<figure>
    <a href="/img/flask-api-tutorial/p03-05-register-response.jpg">
        <img src="/img/flask-api-tutorial/p03-05-register-response.jpg" style="width:500px" alt="">
    </a>
    <figcaption><p>Figure 5 - New user successfully registered (Swagger UI)</p></figcaption>
</figure>

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil" aria-hidden="true"></i>
  </div>
  <div class="note-message">
    <p>The Swagger UI helpfully provides a <strong>Curl</strong> textbox that contains the exact request that was submitted to the server based on the values you provided. <code>cURL</code> is a ubiquitous tool and you can copy and paste the contents of the textbox into any terminal if you would like to test your API from the command-line.</p>
  </div>
</div>

If you attempt to register with an email address that already exists in the database, you should receive a response with status code 409 `HTTPStatus.CONFLICT`. You can also test the API with a command-line tool (e.g., httpie, curl, wget, etc):

<figure>
    <a href="/img/flask-api-tutorial/p03-06-conflict-409.jpg">
        <img src="/img/flask-api-tutorial/p03-06-conflict-409.jpg" style="width:500px" alt="">
    </a>
    <figcaption><p>Figure 6 - Email address already registered</p></figcaption>
</figure>

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil" aria-hidden="true"></i>
  </div>
  <div class="note-message">
    <p>The CLI examples I provide in this tutorial will <span class="emphasis">NOT</span> use <code>cURL</code>. I prefer <a href="https://httpie.org/" target="_blank">httpie</a> because the syntax is much cleaner and more intuitive. The options for styling and formatting the output are a huge plus as well.</p>
  </div>
</div>

Here's an example of a successful request using httpie. Note that on the command-line or Swagger UI the response from the server is always formatted as JSON:

<figure>
    <a href="/img/flask-api-tutorial/p03-07-register-response-cli.jpg">
        <img src="/img/flask-api-tutorial/p03-07-register-response-cli.jpg" style="width:500px" alt="">
    </a>
    <figcaption><p>Figure 7 - New user successfully registered (CLI)</p></figcaption>
</figure>

Everything appears to be working correctly for the `/register` endpoint. Next, we will figure out how to create unit tests that interact with the API.

### Unit Tests: <code>test_auth_register.py</code>

In the [previous post](/series/flask_api_tutorial/part-2/#global-test-fixtures-code-conftest-py-code), I explained the meaning and purpose of the `app` and `client` test fixtures. In order to make an HTTP request to the Flask application, you need to include `client` as a parameter of your test function.

To demonstrate how the `client` object can be used to interact with the API, create a new file `test_auth_register.py` in the `test` foder, add the content below and save the file:

{{< highlight python "linenos=table" >}}"""Unit tests for api.auth_register API endpoint."""
from http import HTTPStatus

from flask import url_for

from app.models.user import User

EMAIL = "new_user@email.com"
PASSWORD = "test1234"
SUCCESS = "successfully registered"
BAD_REQUEST = "Input payload validation failed"
REQ_PARAMETER_MISSING = "Missing required parameter in the post body"
EMAIL_ALREADY_EXISTS = f"{EMAIL} is already registered"


def register_user(test_client, email=EMAIL, password=PASSWORD):
    return test_client.post(
        url_for("api.auth_register"),
        data=f"email={email}&password={password}",
        content_type="application/x-www-form-urlencoded",
    )


def test_auth_register(client, db):
    response = register_user(client)
    assert response.status_code == HTTPStatus.CREATED
    assert "status" in response.json and response.json["status"] == "success"
    assert "message" in response.json and response.json["message"] == SUCCESS
    assert "token_type" in response.json and response.json["token_type"] == "bearer"
    assert "expires_in" in response.json and response.json["expires_in"] == 5
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    result = User.decode_access_token(access_token)
    assert result.success
    user_dict = result.value
    assert not user_dict["admin"]
    user = User.find_by_public_id(user_dict["public_id"])
    assert user and user.email == EMAIL{{< /highlight >}}

This is the first time we are creating a test case that sends requests to an API endpoint, so let's go through the `test_auth_register` function and explain everything that is being done:

<div class="code-details">
  <ul>
    <li>
      <p><strong>Line 8-9: </strong>Rather than copy the same values over and over, I defined <code>EMAIL</code> and <code>PASSWORD</code> as global variables since they will be used multiple times throughout this test set.</p>
    </li>
    <li>
      <p><strong>Line 10-12: </strong>These error messages are stored in variables to save horizontal space and avoid splitting a single statement across two lines.</p>
    </li>
    <li>
      <p><strong>Line 15: </strong>This function is not a test case (since the name does not begin with <code>test_</code>). <code>register_user</code> takes a Flask test client instance, and values for <code>email</code> and <code>password</code> as parameters. The test client instance must always be passed when using this function, but <code>email</code> and <code>password</code> will use the default values if none are specified.</p>
    </li>
    <li>
      <p><strong>Line 16: </strong>The <a href="https://werkzeug.palletsprojects.com/en/0.15.x/test/#werkzeug.test.Client" target="_blank">Flask test client</a> allows us to make HTTP requests. In order to register a new user, we must send a <code>POST</code> request to the <code>api.auth_register</code> endpoint. To do so, we call the test client's <code>post</code> method. The test client is capable of sending requests for all HTTP method types: <code>get</code>, <code>post</code>, <code>put</code>, <code>delete</code>, <code>patch</code>, <code>options</code>, <code>head</code> and <code>trace.</code></p>
    </li>
    <li>
      <p><strong>Line 17: </strong>The first argument to the <code>post</code> method is the request URL. Since the target URL is within our Flask application, we can dynamically construct the URL using <a href="https://flask.palletsprojects.com/en/1.1.x/api/#flask.url_for" target="_blank">the <code>url_for</code> function</a>. This is really useful because it allows us to create links within our application without hardcoding any part of the path. All we need to do to use the <code>url_for</code> function is provide the name of the API endpoint, and voila, the URL is dynamically generated and provided to the <code>post</code> method.</p>
    </li>
    <li>
      <p><strong>Line 18: </strong>For a <code>POST</code> request, the server expects the data to be sent in the request body. Since we are simulating a form submission, we must format the data as a series of name/value pairs, each pair separated by an ampersand (&), and for each pair, the name is separated from the value by an equals (=) sign.</p>
    </li>
    <li>
      <p><strong>Line 19: </strong>This is how we specify the value of the <code>Content-Type</code> HTTP header. The value of this header is very important because it tells the server what type of data is being sent. The value <code>application/x-www-form-urlencoded</code> tells the server that the request contains form data encoded as URL parameters.</p>
    </li>
    <li>
      <p><strong>Line 23: </strong><code>test_auth_register</code> is a test case, and <code>client</code> and <code>db</code> are test fixtures defined in <code>conftest.py</code>. The reason for invoking the <code>client</code> fixture is obvious &mdash; we need it to test the API. However, the reason for invoking <code>db</code> is not so obvious since it isn't actually being called in the test function. This fixture initializes the database by creating tables for each database model class (the only model class at this point is <code>User</code>).</p>
      <p>In this test case, we are sending a request to register a new user and expecting the request to succeed. This will only work if the database has been initialized and the <code>site_user</code> table exists in the database since the SQLAlchemy extension will attempt to execute a <code>INSERT INTO site_user...</code> SQL statement.</p>
      <p><span class="emphasis">BOTTOM LINE</span> &mdash; Invoking the <code>db</code> fixture is necessary for any test cases that add or modify database objects.</p>
    </li>
    <li>
      <p><strong>Line 24: </strong>We start off the test case by submitting the registration request with the default values. This is really the only action performed in this test case, the rest of the code just verifies the server response to the registration request.</p>
    <li>
      <p><strong>Line 25: </strong>This <code>assert</code> statement verifies that server response is in JSON format.</p>
    </li>
    <li>
      <p><strong>Line 26: </strong>Next, we verify that the HTTP status code of the server response is 201 <code>HTTPStatus.CREATED</code> which indicates that a new user was created in the database.</p>
    </li>
    </li>
    <li>
      <p><strong>Line 27-28: </strong>These two lines verify that the <code>status</code> and <code>message</code> attributes exist in the response JSON and that the values indicate that the user was successfully registered.</p>
    </li>
      <p><strong>Line 29: </strong>This <code>assert</code> statement verifies that the <code>token_type</code> attribute exists in the response JSON and that the value is <code>bearer</code>.</p>
    </li>
      <p><strong>Line 30: </strong>This <code>assert</code> statement verifies that the <code>expires_in</code> attribute exists in the response JSON and that the value is <code>5</code>.</p>
    </li>
    <li>
      <p><strong>Line 31-32: </strong>Next, we verify that the <code>access_token</code> exists and retrieve the <code>access_token</code>.</p>
    </li>
    <li>
      <p><strong>Line 33-36: </strong>Next, we call <code>User.decode_access_token</code> and verify the operation was successful. Then, we retrieve the <code>user_dict</code> and verify that the token (for the user that we just registered) does not have administrator priveleges.</p>
    </li>
    <li>
      <p><strong>Line 37-38: </strong>The next thing we do is call <code>User.find_by_public_id</code> with the <code>public_id</code> value decoded from <code>access_token</code>. This verifies that the user we registered actually exists within the database. Using the object from the database, we verify that the email address for the user matches the value submitted in the original HTTP request.</p>
    </li>
  </ul>
</div>

If `test_auth_register` works correctly, that verifies the "happy path" for the `api.auth_register` endpoint. We obviously need to test scenarios where a registration request is not successful, as well. To verify the expected behavior when a registration request is sent for an email address that has already been registered, add the content below and save the file:

{{< highlight python "linenos=table,linenostart=41" >}}def test_auth_register_email_already_registered(client, db):
    user = User(email=EMAIL, password=PASSWORD)
    db.session.add(user)
    db.session.commit()
    response = register_user(client)
    assert response.status_code == HTTPStatus.CONFLICT
    assert "status" in response.json and response.json["status"] == "fail"
    assert "message" in response.json and response.json["message"] == EMAIL_ALREADY_EXISTS
    assert "token_type" not in response.json
    assert "expires_in" not in response.json
    assert "access_token" not in response.json{{< /highlight >}}

<div class="code-details">
  <ul>
    <li>
      <p><strong>Line 42-45: </strong>The first thing we do in this test case is manually create a <code>User</code> instance and add it to the database. Then, we send the same registration request that was sent in the previous test case.</p>
    </li>
    <li>
      <p><strong>Line 47: </strong>Since a <code>User</code> already exists in the database with the same email address that is sent in the registration request, the response code 409 (<code>HTTPStatus.CONFLICT</code>) indicates that the request could not be completed, but the user might be able to resolve the source of the conflict and resubmit the request.</p>
    </li>
    <li>
      <p><strong>Line 48-49: </strong>Next, we verify that "status" and "message" attributes exist in the JSON object sent in the response body and the value for each indicates that the registration request was not successful.</p>
    </li>
    <li>
      <p><strong>Line 50-52: </strong>The final three lines verify that the "token_type", "expires_in" and "access_token" attributes are not present in the JSON object sent in the response body.</p>
    </li>
  </ul>
</div>

The last test case we will cover at this point is where the client submits an email address that is not in the correct format (the final version of the API will have more test cases). Let's take a look at the actual response that is sent if the email value in a registration request is not a valid email (the example below uses <a href="https://httpie.org/" target="_blank">httpie</a>):

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">http -f :5000/api/v1/auth/register email="first last" password=123456</span>

<span class="cmd-results"><span class="bold-text goldenrod">POST /api/v1/auth/register HTTP/1.1</span>
<span class="purple">Accept</span>: <span class="light-blue">*/*</span>
<span class="purple">Accept-Encoding</span>: <span class="light-blue">gzip, deflate</span>
<span class="purple">Connection</span>: <span class="light-blue">keep-alive</span>
<span class="purple">Content-Length</span>: <span class="light-blue">32</span>
<span class="purple">Content-Type</span>: <span class="light-blue">application/x-www-form-urlencoded; charset=utf-8</span>
<span class="purple">Host</span>: <span class="light-blue">localhost:5000</span>
<span class="purple">User-Agent</span>: <span class="light-blue">HTTPie/1.0.2</span>

<span class="bold-text">email=first+last&password=123456</span>

<span class="bold-text goldenrod">HTTP/1.0 400 BAD REQUEST</span>
<span class="purple">Access-Control-Allow-Origin</span>: <span class="light-blue">*</span>
<span class="purple">Content-Length</span>: <span class="light-blue">127</span>
<span class="purple">Content-Type</span>: <span class="light-blue">application/json</span>
<span class="purple">Date</span>: <span class="light-blue">Fri, 02 Aug 2019 17:45:40 GMT</span>
<span class="purple">Server</span>: <span class="light-blue">Werkzeug/0.15.5 Python/3.7.4</span>

<span class="bold-text">{
  <span class="purple">"errors"</span>: {
    <span class="purple">"email"</span>: <span class="light-blue">"first last is not a valid email"</span>
  },
  <span class="purple">"message"</span>: <span class="light-blue">"Input payload validation failed"</span>
}</span></span></code></pre>

You might notice that none of the code we wrote for the `api.auth_register` endpoint generated the response above. That is because this response was automatically generated by Flask-RESTPlus based on the `auth_reqparser` we configured in `/app/api/auth.dto.py`.

<div class="alert alert-flex">
  <div class="alert-icon">
    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
  </div>
  <div class="alert-message">
    <p>The response above <span class="emphasis">DOES NOT</span> have an attribute named <span class="bold-text">status</span>, because Flask-RESTPlus generated the response rather than any of the code that was written for this tutorial.</p>
  </div>
</div>

Whenever a request is rejected because of one or more `RequestParser` arguments failed validation, the format of the response will always contain a **message** attribute equal to <code>"Input payload validation failed"</code> and a an **errors** attribute with the value being another embedded list. The embedded list contains an entry for each argument in the parser that failed validation, with the name of the argument as the attribute name and the value equal to a message describing the failure that occurred.

The information above should make writing the test case pretty easy. Add the content below and save the file:

{{< highlight python "linenos=table,linenostart=54" >}}def test_auth_register_invalid_email(client):
    invalid_email = "first last"
    response = register_user(client, email=invalid_email)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "message" in response.json and response.json["message"] == BAD_REQUEST
    assert "token_type" not in response.json
    assert "expires_in" not in response.json
    assert "access_token" not in response.json
    assert "errors" in response.json
    assert "password" not in response.json["errors"]
    assert "email" in response.json["errors"]
    assert response.json["errors"]["email"] == f"{invalid_email} is not a valid email"{{< /highlight >}}

I don't think there's anything that needs to be explained since most of it is the same as the previous test case, and the difference in the response JSON was explained thoroughly.

<p class="emphasis orange">TODO: LINK TO GITHUB REPO NEEDED BELOW</p>
There are quite a few more test cases that we need to create for the <code>api.auth_register</code> endpoint. I will not go through any more at this point, since you can find the full set in the github repo. Also, it's a great exercise to try to define the necessary test coverage yourself.

You should run <code>pytest</code> to make sure the new test case passes and that nothing else broke because of the changes:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">pytest</span>
<span class="cmd-warning">TEST RESULTS NEEDED!</span></code></pre>

## Checkpoint

Once again, we only implemented a small number of features from the requirements list. It's not too surprising if you realize we only created one of the four `auth_ns` endpoints in this section. I think we have fully satisfied one requirement: <span class="italics requirements">New users can register by providing an email address and password</span>, and partially satisfied one more since the JWT is sent in the registration and login response: <span class="italics requirements">JWT is sent in access_token field of HTTP response after successful authentication with email/password</span>.

<div class="requirements">
  <p class="title">User Management/JWT Authentication</p>
  <div class="fa-bullet-list">
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>New users can register by providing an email address and password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Existing users can obtain a JWT by providing their email address and password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>JWT contains the following claims: time the token was issued, time the token expires, a value that identifies the user, and a flag that indicates if the user has administrator access</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-half-o fa-bullet-icon"></span>JWT is sent in access_token field of HTTP response after successful authentication with email/password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-half-o fa-bullet-icon"></span>JWTs must expire after 1 hour (in production)</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>JWT is sent by client in Authorization field of request header</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-half-o fa-bullet-icon"></span>Requests must be rejected if JWT has been modified</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-half-o fa-bullet-icon"></span>Requests must be rejected if JWT is expired</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>If user logs out, their JWT is immediately invalid/expired</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>If JWT is expired, user must re-authenticate with email/password to obtain a new JWT</p>
  </div>
  <p class="title">API Resource: Widget List</p>
  <div class="fa-bullet-list">
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>All users can retrieve a list of all widgets</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>All users can retrieve individual widgets by name</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Users with administrator access can add new widgets to the database</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Users with administrator access can edit existing widgets</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Users with administrator access can delete widgets from the database</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>The widget model contains attributes with URL, datetime, timedelta and bool data types, along with normal text fields.</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>URL and datetime values must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>The widget model contains a "name" field which must be a string value containing only lowercase-letters, numbers and the "-" (hyphen character) or "_" (underscore character).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Widget name must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>If input validation fails either when adding a new widget or editing an existing widget, the API response must include error messages indicating the name(s) of the fields that failed validation.</p>
  </div>
</div>

In the next section we will create the remaining three `auth_ns` endpoints, so the entire set of JWT authentication requirements should be complete at the next checkpoint. Questions/comments are appreciated!
