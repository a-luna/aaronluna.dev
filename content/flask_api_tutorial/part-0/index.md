---
title: "How To: Create a Flask API with JWT-Based Authentication (Overview)"
lead: "Project Overview"
slug: "overview"
series: ["flask_api_tutorial"]
series_weight: 0
series_title: "How To: Create a Flask API with JWT-Based Authentication"
series_part: "Overview"
series_part_lead: "Project Overview"
menu_section: "tutorials"
categories: ["Flask", "Python", "Tutorial-Series"]
toc: true
summary: "This tutorial series provides step-by-step instructions and in-depth explanations to guide you through the process of creating a robust, production-quality REST API. The toolstack consists of Flask, Flask-RESTPlus, pyjwt, SQLAlchemy and other packages. Code quality is a major focus, with considerable time dedicated to testing (using pytest), logging and tools such as coverage, flake8 and mypy. The tutorial concludes by creating a process that continuously integrates (with tox, travis/circle CI, coveralls) and deploys the API (with either Github or Azure DevOps to Heroku)."
url: "/series/flask-api-tutorial/overview/"
aliases:
    - "/flask_api_tutorial/"
    - "/series/flask_api_tutorial/"
    - "/series/flask-api-tutorial/"
twitter:
  card: "summary"
  creator: "@aaronlunadev"
  title: "How To: Create a Flask API with JWT-Based Authentication"
  description: "Step-by-step instructions and in-depth explanations to guide you through the process of creating a robust, production-quality REST API using Flask, Flask-RESTlus, pyjwt, SQLAlchemy and more."
---
## Project Overview

My goal for this tutorial is to provide a detailed guide to designing and creating a Flask API that uses JSON Web Tokens (JWT) to authenticate HTTP requests. There are many different Flask extensions and Python packages that can be used to create a web service that satisfies these requirements. The toolchain that this product utilizes includes Flask-RESTPlus, SQLAlchemy, PyJWT, pytest and tox (this is simply my personal preference).

This is <span class="emphasis">NOT</span> a full-stack tutorial, creating a front-end that consumes the API is not covered. However, Flask-RESTPlus will automatically generate a Swagger UI webpage that allows anyone to send requests and inspect responses from the API.

In addition to the user management and authentication functions, the API will contain a resource that registered users can interact with &mdash; a list of "widgets". This is intentionally generic, allowing you to use the final API code as boilerplate for any project.

Performing CRUD actions on an item from a collection and restricting access to a resource based on the user's assigned role/permissions are extremely common, and the code to do so is the same for a widget, blog post or whatever your API needs to expose to clients.

The requirements for the API are listed below. At the end of each section, any requirements that have been completely implemented will be marked as complete (<span class="fa fa-star goldenrod"></span>):

<div class="requirements">
  <p class="title">User Management/JWT Authentication</p>
  <div class="fa-bullet-list">
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>New users can register by providing an email address and password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Existing users can obtain a JWT by providing their email address and password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>JWT contains the following claims: time the token was issued, time the token expires, a value that identifies the user, and a flag that indicates if the user has administrator access</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>JWT is sent in access_token field of HTTP response after successful authentication with email/password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>JWTs must expire after 1 hour (in production)</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>JWT is sent by client in Authorization field of request header</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Requests must be rejected if JWT has been modified</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Requests must be rejected if JWT is expired</p>
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
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>The widget model contains a "name" attribute which must be a string value containing only lowercase-letters, numbers and the "-" (hyphen character) or "_" (underscore character).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>The widget model contains a "deadline" attribute which must be a datetime value where the date component is equal to or greater than the current date. The comparison does not consider the value of the time component when this comparison is performed.</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Widget name must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>If input validation fails either when adding a new widget or editing an existing widget, the API response must include error messages indicating the name(s) of the fields that failed validation.</p>
  </div>
</div>

## Core Concepts

It is important to understand the history and actual meaning of the term REST, as well as the structure and purpose of JSON Web Tokens. Let's review these topics before we begin working on the application.

### Statelessness

I have made the conscious decision NOT to refer to this series as a REST API tutorial. Seemingly every API and every how-to article on API design written in the last few years proclaims itself RESTful. This trend is a disservice to the depth and complexity that Roy Fielding laid out in his doctoral thesis introducing and defining REST. I will go into further detail on this subject in [Part 3](/series/flask-api-tutorial/part-3/) when we begin configuring the API.

However, I think it is important to point out where I am attempting to adhere to the requirements/constraints of REST. One of these constaints is **statelessness**. Statelessness is an essential characteristic of a RESTful system, but it can be a confusing concept at first.

Obviously both the client and server in any hypothetical system keep state; they just keep different types of state. For example, a web browser keeps track of each web page visited as well as the current page; in a RESTful system, this is called **application state**. If the website is a banking application, the server hosting the website keeps track of which bank accounts have been accessed or modified; this is called  **resource state**. "Statelessness" is meant to convey that the server doesn't care about the client's application state, and therefore no data about the client's application state should be stored by the server.

This has obvious implications for authentication scenarios since in a RESTful system the server does not store any information about which users are currently logged in. Therefore, in order to access a protected resource a client must must include authentication information with every request. In order to avoid including the client's password with every request, a common practice is for the server to generate an access token when user credentials have been verified. Now, when the client sends a request for access to a protected resource, the token is included in the request header and verified by the server. The most common format for authorization tokens is the JSON Web Token, which we will take a look at in the next section.

### JSON Web Tokens

JSON Web Token (JWT) is an <a href="https://tools.ietf.org/html/rfc7519" target="_blank">open IETF standard</a> that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. JWTs are made up of three parts: header, payload and signature. These are converted to a URL-safe base64-encoded string and concatenated together. Each part is separated by "." (the <a href="http://www.fileformat.info/info/unicode/char/2e/index.htm" target="_blank">full-stop</a> or period character).

The **header** will identify the object as a JWT and also identify the algorithm used to generate the signature (e.g., `{"typ": "JWT", "alg": "HS256"}`). The conversion to URL-safe base64-encoded string is shown below:

<pre><code><span class="green">      ASCII: </span><span class="goldenrod">{"t</span>  <span class="blue">yp"</span>  <span class="goldenrod">:"J</span>  <span class="blue">WT"</span>  <span class="goldenrod">,"a</span>  <span class="blue">lg"</span>  <span class="goldenrod">:"H</span>  <span class="blue">S25</span>  <span class="goldenrod">6"}</span>
<span class="green">URLSAFE-B64: </span><span class="goldenrod">eyJ0</span> <span class="blue">eXAi</span> <span class="goldenrod">OiJK</span> <span class="blue">V1Qi</span> <span class="goldenrod">LCJh</span> <span class="blue">bGci</span> <span class="goldenrod">OiJS</span> <span class="blue">UzI1</span> <span class="goldenrod">NiJ9</span></code></pre>

The **payload** is made up of various **claims**, which are key/value pairs containing information about the user and the key itself. There are many claims which are predefined (called <a href="https://tools.ietf.org/html/rfc7519#section-4.1" target="_blank">registered claims</a>), but you are free to create your own as well.

Usually, the payload contains the time when the token was issued and the time when the token expires. These are registered claims and are identified by `iat` and `exp`, respectively. Datetime values must be expressed as "seconds since the epoch", and python contains <a href="https://docs.python.org/3/library/time.html" target="_blank">built-in functions</a> for converting `datetime` objects to this numeric format. However, the PyJWT package will take care of this conversion for you when creating a token.

Another registered claim is `sub` (subject) which is meant to represent the entity that the token was issued to. When a user registers with the API, a random UUID value is generated and stored in the database which will be used as the value for `sub`.

An example payload containing these three claims would be: `{"sub": "570eb73b-b4b4-4c86-b35d-390b47d99bf6", "exp": 1555873759, "iat": 1555872854}`. The conversion to URL-safe base64-encoded string is shown below:

<pre><code><span class="green">      ASCII: </span><span class="goldenrod">{"s</span>  <span class="blue">ub"</span>  <span class="goldenrod">:"5</span>  <span class="blue">70e</span>  <span class="goldenrod">b73</span>  <span class="blue">b-b</span>  <span class="goldenrod">4b4</span>  <span class="blue">-4c</span>  <span class="goldenrod">86-</span>  <span class="blue">b35</span>  <span class="goldenrod">d-3</span>  <span class="blue">90b</span>  <span class="goldenrod">47d</span>  <span class="blue">99b</span>  <span class="goldenrod">f6"</span>  <span class="blue">,"e</span>  <span class="goldenrod">xp"</span>  <span class="blue">:15</span>  <span class="goldenrod">558</span>  <span class="blue">737</span>  <span class="goldenrod">59,</span>  <span class="blue">"ia</span>  <span class="goldenrod">t":</span>  <span class="blue">155</span>  <span class="goldenrod">587</span>  <span class="blue">285</span>  <span class="goldenrod">4}</span>
<span class="green">URLSAFE-B64: </span><span class="goldenrod">eyJz</span> <span class="blue">dWIi</span> <span class="goldenrod">OiI1</span> <span class="blue">NzBl</span> <span class="goldenrod">Yjcz</span> <span class="blue">Yi1i</span> <span class="goldenrod">NGI0</span> <span class="blue">LTRj</span> <span class="goldenrod">ODYt</span> <span class="blue">YjM1</span> <span class="goldenrod">ZC0z</span> <span class="blue">OTBi</span> <span class="goldenrod">NDdk</span> <span class="blue">OTli</span> <span class="goldenrod">ZjYi</span> <span class="blue">LCJl</span> <span class="goldenrod">eHAi</span> <span class="blue">OjE1</span> <span class="goldenrod">NTU4</span> <span class="blue">NzM3</span> <span class="goldenrod">NTks</span> <span class="blue">Imlh</span> <span class="goldenrod">dCI6</span> <span class="blue">MTU1</span> <span class="goldenrod">NTg3</span> <span class="blue">Mjg1</span> <span class="goldenrod">NH0=</span></code></pre>

The cryptographic **signature** is calculated from the header and payload which ensures that the information in both parts has not been modified. The conversion to URL-safe base64-encoded string is shown below:

<pre><code><span class="green">        HEX: </span><span class="goldenrod">c88b51</span> <span class="blue">cb57fc</span> <span class="goldenrod">521fff</span> <span class="blue">0baf19</span> <span class="goldenrod">162dba</span> <span class="blue">b7d3e6</span> <span class="goldenrod">c2395b</span> <span class="blue">90512b</span> <span class="goldenrod">1f1847</span> <span class="blue">4f3ec5</span> <span class="goldenrod">672e</span>
<span class="green">URLSAFE-B64: </span><span class="goldenrod">yItR</span>   <span class="blue">y1f8</span>   <span class="goldenrod">Uh__</span>   <span class="blue">C68Z</span>   <span class="goldenrod">Fi26</span>   <span class="blue">t9Pm</span>   <span class="goldenrod">wjlb</span>   <span class="blue">kFEr</span>   <span class="goldenrod">HxhH</span>   <span class="blue">Tz7F</span>   <span class="goldenrod">Zy4=</code></pre>

Combining these into a JWT would result in the following token:

<div class="command"><code><span class="white">eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1NzBlYjczYi1iNGI0LTRjODYtYjM1ZC0zOTBiNDdkOTliZjYiLCJleHAiOjE1NTU4NzM3NTksImlhdCI6MTU1NTg3Mjg1NH0.yItRy1f8Uh__C68ZFi26t9PmwjlbkFErHxhHTz7FZy4</span></code></div>

The PyJWT package trims all padding characters ("=") from the JWT components. The payload and signature each originally had one such character that is not present in the final version shown above.

<div class="alert alert-flex">
  <div class="alert-icon">
    <i class="fa fa-exclamation-triangle"></i>
  </div>
  <div class="alert-message">
    <p>Base64-encoded strings may look like gibberish, but <strong><u>DO NOT</u></strong> make the mistake of assuming that the payload data has been encrypted. <strong><u>NEVER</u></strong> include any sensitive data (e.g., user password, payment info) in the JWT payload since it can be easily decoded by anyone.</p>
  </div>
</div>

## Project Dependencies

My favorite thing about Python is that for any type of application or library you could possibly need, it's already been created and made available via `pip`. When it comes to tools for creating REST APIs and JWTs, there is a dizzying array of possibilities. I'd like to give a brief overview of the most important packages and Flask extensions that we will be using in this project.

### PyJWT

<a href="https://pyjwt.readthedocs.io/en/latest/" target="_blank">PyJWT</a> is the package we will use to generate and decode JSON Web Tokens (JWTs).

### Flask-RESTPlus

<a href="https://flask-restplus.readthedocs.io/en/stable/" target="_blank">Flask-RESTPlus</a> is a Flask extension that makes creating APIs simple (in fact, most of the configuration can be done with decorators). This extension provides helpful tools for marshalling data from custom Python objects to an appropriate format for sending as a HTTP response. As you would expect, there are also tools for parsing data from HTTP requests into basic and custom Python datatypes. However, my favorite feature is the visual, interactive documentation that is automatically generated for you using <a href="https://swagger.io/tools/swagger-ui/" target="_blank">Swagger UI</a>.

### OpenAPI/Swagger UI

The <a href="https://www.openapis.org" target="_blank">OpenAPI Initiative (OAI)</a> is an organization that aims to curate a single format for documenting API services. The OpenAPI format was originally known as the <a href="https://docs.swagger.io/spec.html" target="_blank">Swagger Specification</a>. <a href="https://swagger.io/tools/swagger-ui/" target="_blank">Swagger UI</a> is an extremely useful tool that generates a webpage from an OpenAPI/Swagger spec, providing visual documentation for your API that allows anybody to test your API methods, construct requests, inspect responses, etc.

### Flask-CORS

<a href="https://flask-cors.readthedocs.io/en/latest/" target="_blank">Flask-CORS</a> is a Flask extension for handling Cross Origin Resource Sharing (CORS), making cross-origin AJAX possible. Using this extension to enable CORS for all routes (as is the case in this project) is extremely simple. As you will see shortly, the entire process involves initializing the extension with the Flask application instance with default values.

### Flask-SQLAlchemy

<a href="http://flask-sqlalchemy.palletsprojects.com/en/2.x/" target="_blank">Flask-SQLAlchemy</a> is a Flask extension that adds support for <a href="https://www.sqlalchemy.org/" target="_blank">SQLAlchemy</a> and makes integrating the ORM with your Flask application simple. If you are unfamiliar with SQLAlchemy, the description below from the official documentation is a perfect summation:

<blockquote cite="https://docs.sqlalchemy.org/en/13/orm/tutorial.html"><p>The <strong>SQLAlchemy Object Relational Mapper</strong> presents a method of associating user-defined Python classes with database tables, and instances of those classes (objects) with rows in their corresponding tables. It includes a system that transparently synchronizes all changes in state between objects and their related rows, called a unit of work, as well as a system for expressing database queries in terms of the user defined classes and their defined relationships between each other.</p></blockquote>

I know, it sounds like magic. <a href="https://docs.sqlalchemy.org/en/13/core/engines.html" target="_blank">Another key feature</a> of SQLALchemy is that the type of database you use (MySQL, SQLite, PostgreSQL, etc.) is almost completely irrelevent (it comes into play if you need to use a feature that is only supported by a specific backend). For example, you could have your API configured to use a PostgreSQL database in production, and use a simple SQLite file as the backend in your test and development environments. There would be no need to change any code to support each configuration, which, again sounds like magic.

### Flask-Migrate (Alembic)

<a href="https://pypi.org/project/alembic/" target="_blank">Alembic</a> is a database migrations tool created by the author of SQLAlchemy, and <a href="https://flask-migrate.readthedocs.io/en/latest/" target="_blank">Flask-Migrate</a> is a Flask extension that adds Alembic's operations to the Flask CLI. A database migration is a set of changes to a database schema (e.g., add new table, update foreign key relationships, etc.), similar to a commit in a version-control system. With Flask-Migrate, each migration is represented as a script of SQL statements, allowing you to "upgrade" a database to apply the schema changes or "downgrade" and undo the changes. This makes the process of deploying database changes to a production environment safe and easy; simply create a migration script when your changes have been tested and verified, then run the migration script in the production environment to apply the changes.

## Development Dependencies

The installation script for our application will allow the user to install dependencies that are only needed to run the test set and/or contribute to the development of the app. This is an extremely common option for a Python application, and in fact this is how we will install the application to ensure that we are executing our test cases against the code as it would be installed by an end-user.

For a good description of the process we will use to enable this installation option, please read <a href="https://codefellows.github.io/sea-python-401d4/lectures/python_packaging_1.html#specifying-dependencies" target="_blank">this section from <span class="italics">An Introduction to Python Packaging</span></a>.

The `[dev]` installation option for our project will install a code formatter, a linter, the unit testing framework, some pytest plugins and the pre-commit package which will automatically run the code formatter on all changed files. Next, for each of these tools, I will give a brief explanation of why I chose that specific tool/package.

### Pytest

I have a strong preference for <a href="https://pytest.org" target="_blank">pytest</a> as my testing framework. Compared to the built-in unittest library (or other frameworks like nose), pytest requires almost no boilerplate code (e.g., inheriting from `TestCase`) and relies solely on the built-in `assert` statement for verifying expected behavior. In contrast, with unittest you have to learn a new API with several different methods in order to "assert" the same expression (i.e., `self.assertEqual`, `self.assertFalse`, `self.assertIsNotNone`, etc.).

The other feature that sets pytest apart is <a href="https://pytest.readthedocs.io/en/latest/fixture.html#fixtures" target="_blank">fixtures</a>. Fixtures can be extremely complex but in the simplest case a fixture is just a function that constructs and returns a test object (e.g., a function named `db` that returns a mock database object). A fixture is created by decorating the function with `@pytest.fixture`:

```python
@pytest.fixture
def db():
    return MockDatabase()
```

If we wish to use the mock database object in a test case, we simply add a parameter with the same name as the fixture (i.e., `db`) to the test case function as shown below:

```python
def test_new_user(db, email, password):
    new_user = User(email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    user_exists = User.query.filter_by(email=email).first()
    assert user_exists
```

When this test executes, pytest will discover and call the fixture named `db`, making the mock database object available within the test case. This method of decoupling test code from the objects needed to execute the test code is an example of <a href="http://en.wikipedia.org/wiki/Dependency_injection" target="_blank">dependency injection</a>.

### Black

<a href="https://github.com/python/black" target="_blank">Black</a> is my preferred code formatter. Compared to YAPF or autopep8, black is deliberately opinionated and provides very few configuration options. With the other formatting tools, you have to spend time tweaking the configuration until it produces your desired format. With black, the only setting I tweak is the maximum line length (I increase it from 79 to 89).

This has an additional benefit if you are collaborating with others on a code base, since enforcing consistent style/format is difficult when everyone is using different customized autopep8 settings. Having a consistent style throughout a project will make your team more productive since less time will be spent conforming to style and the code will become easier to digest visually.

### Flake8

Flake8 is my preferred code linter. While black reformats your code, it doesn't modify the behavior in any way (black verifies that the AST is not modified before applying any changes). Flake8 is actually a wrapper for three different static-analysis tools: pydocstyle (checks for compliance with PEP8 formatting rules, like black but stricter), PyFlakes (checks for programming errors that would only be caught at run-time) and mccabe (checks cyclomatic complexity).

Flake8 can be configured in a multitude of ways, so getting the most out of it requires a bit of an investment. Applied correctly, flake8 will make your code easier to read, less bug-prone and more maintainable. We will explore my preferred flake8 settings later in this tutorial.

### Tox

<a href="https://tox.readthedocs.io/en/latest/" target="_blank">Tox is a very powerful tool</a> that can be used as a single entry point for various build, test and release activities. The most common use case for tox is validating the installation process for a project and running arbitrary commands (such as unit tests) within isolated virtual environments. This is extremely important if you need to support multiple Python versions, and extremely helpful since tox automates what would otherwise be a tedious, involved process.

## Conclusion

That's all of the introductory/background information that is needed for this project. Click below to begin working on the application!

{{< api_tutorial_all_github_links >}}
