---
title: "The Complete Guide to Creating a Flask API with JWT-Based Authentication (Part 1)"
lead: "Part 1: Project Setup and Environment Configuration"
slug: "flask-api-tutorial-part-1"
date: "2019-08-11"
series: ["Flask API Tutorial"]
series_title: "The Complete Guide to Creating a Flask API with JWT-Based Authentication"
series_part: "Part 1"
series_part_lead: "Project Setup and Environment Configuration"
categories: ["Flask", "Python"]
toc: true
summary: ""
twitter:
  card: "summary"
  creator: "@aaronlunadev"
  title: ""
  description: ""
---
## Introduction

My goal is to make this tutorial as informative as possible, however I assume that you have experience with Python and that you are familiar with Flask. Here's a quick test, read the instructions below:

<div class="steps">
  <ol>
    <li>Create a new Python 3.6 virtual environment and install the project dependencies from the <code>requirements.txt</code> file (using <code>pip</code>). Then, activate the virtual environment.</li>
    <li>Create a method named <code>login</code> and bind it to the URL <strong>/login/</strong>, users are allowed to submit GET and POST requests to this URL. For a GET, this method should render the <code>login.html</code> template. For a POST, inspect the form data and attempt to authenticate the user based on the submitted credentials.</li>
  </ol>
</div>

If every word makes sense to you and you could explain the CLI commands needed to perform **Step 1**, and the code needed to implement the route in **Step 2**, congratulations! You should have no problem understanding this tutorial. If you have an idea of how to perform these instructions but you're not 100% confident, I suggest looking through the docs/articles listed below until you have it all figured out:

<ul class="list-of-links">
  <li><a href="https://docs.python.org/3/tutorial/venv.html" target="_blank">Virtual Environments and Packages (The Python Tutorial)</a></li>
  <li><a href="http://flask.pocoo.org/docs/1.0/quickstart/" target="_blank">Quickstart (Flask Documentation)</a></li>
  <li><a href="https://realpython.com/python-virtual-environments-a-primer/" target="_blank">Python Virtual Environments: A Primer (Real Python)</a></li>
</ul>

If the instructions make absolutely zero sense to you, I have no idea how you ended up reading a series of articles about designing and creating a Flask API. You're welcome to stay, but I would suggest doing something more productive and enjoyable with your time.

Ok, since we are all on the same page, let's discuss some of the core concepts we will be using in this project.

### Statelessness

I have made the conscious decision NOT to refer to this series as a REST API tutorial. Seemingly every API and every how-to article on API design written in the last few years proclaims itself RESTful. This trend is a disservice to the depth and complexity that Roy Fielding laid out in his doctoral thesis introducing and defining REST. I will go into further detail on this subject in [Part 3](/flask-api-tutorial-part-3/) when we begin configuring the API.

However, I think it is important to point out where I am attempting to adhere to the requirements/constraints of REST. One of these constaints is **statelessness**. Statelessness is an essential characteristic of a RESTful system, but it can be a confusing concept at first.

Obviously both the client and server in any hypothetical system keep state; they just keep different types of state. For example, a web browser keeps track of each web page visited as well as the current page; in a RESTful system, this is called **application state**. If the website is a banking application, the server hosting the website keeps track of which bank accounts have been accessed or modified; this is called  **resource state**. "Statelessness" is meant to convey that the server doesn't care about the client's application state, and therefore no data about the client's application state should be stored by the server.

This has obvious implications for authentication scenarios since in a RESTful system the server does not store any information about which users are currently logged in. Therefore, in order to access a protected resource a client must must include authentication information with every request. In order to avoid including the client's password with every request, a common practice is for the server to generate an access token when user credentials have been verified. Now, when the client sends a request for access to a protected resource, the token is included in the request header and verified by the server. The most common format for authorization tokens is the JSON Web Token, which we will take a look at in the next section.

### JSON Web Tokens

JSON Web Token (JWT) is an [open IETF standard](https://tools.ietf.org/html/rfc7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. JWTs are made up of three parts: header, payload and signature. These are converted to a URL-safe base64-encoded string and concatenated together. Each part is separated by "." (the <a href="http://www.fileformat.info/info/unicode/char/2e/index.htm" target="_blank">full-stop</a> or period character).

The **header** will identify the object as a JWT and also identify the algorithm used to generate the signature (e.g., `{"typ": "JWT", "alg": "HS256"}`). The conversion to URL-safe base64-encoded string is shown below:

<pre><code><span class="green">      ASCII: </span><span class="goldenrod">{"t</span>  <span class="blue">yp"</span>  <span class="goldenrod">:"J</span>  <span class="blue">WT"</span>  <span class="goldenrod">,"a</span>  <span class="blue">lg"</span>  <span class="goldenrod">:"H</span>  <span class="blue">S25</span>  <span class="goldenrod">6"}</span>
<span class="green">URLSAFE-B64: </span><span class="goldenrod">eyJ0</span> <span class="blue">eXAi</span> <span class="goldenrod">OiJK</span> <span class="blue">V1Qi</span> <span class="goldenrod">LCJh</span> <span class="blue">bGci</span> <span class="goldenrod">OiJS</span> <span class="blue">UzI1</span> <span class="goldenrod">NiJ9</span></code></pre>

The **payload** is made up of various **claims**, which are key/value pairs containing information about the user and the key itself. There are many claims which are predefined (called <a href="https://tools.ietf.org/html/rfc7519#section-4.1" target="_blank">registered claims</a>), but you are free to create your own as well.

Usually, the payload contains the time when the token was issued and the time when the token expires. These are registered claims and are identified by `iat` and `exp`, respectively. Datetime values must be expressed as "seconds since the epoch", and python contains [built-in functions](https://docs.python.org/3/library/time.html) for converting `datetime` objects to this numeric format. However, the PyJWT package will take care of this conversion for you when creating a token.

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
    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
  </div>
  <div class="alert-message">
    <p>Base64-encoded strings may look like gibberish, but <strong><u>DO NOT</u></strong> make the mistake of assuming that the payload data has been encrypted. <strong><u>NEVER</u></strong> include any sensitive data (e.g., user password, payment info) in the JWT payload since it can be easily decoded by anyone.</p>
  </div>
</div>

## Project Dependencies

I'm sure you're familiar with the `requirements.txt` file that comes with nearly every Python project you see on Github. In my projects, I like to create both a `requirements.txt` file and a `requirements_dev.txt` file. The `dev` version installs the packages listed in `requirements.txt` as well as packages that are only needed when developing the project.

In this project, `requirements_dev.txt` will install a code formatter, linter, the unit testing framework and a few pytest plugins. Let's discuss these tools as well as some of the most important packages that we will use in this project.

### PyJWT

[PyJWT](https://pyjwt.readthedocs.io/en/latest/) is the package we will use to generate and decode JSON Web Tokens (JWTs).

### Flask-RESTPlus

[Flask-RESTPlus](https://flask-restplus.readthedocs.io/en/stable/) is a Flask extension that makes creating APIs simple (in fact, most of the configuration can be done with decorators). This extension provides helpful tools for marshalling data from custom Python objects to an appropriate format for sending as a HTTP response. As you would expect, there are also tools for parsing data from HTTP requests into basic and custom Python datatypes. However, my favorite feature is the visual, interactive documentation that is automatically generated for you using <a href="https://swagger.io/tools/swagger-ui/" target="_blank">Swagger UI</a>.

### OpenAPI/Swagger UI

The <a href="https://www.openapis.org" target="_blank">OpenAPI Initiative (OAI)</a> is an organization that aims to curate a single format for documenting API services. The OpenAPI format was originally known as the <a href="https://docs.swagger.io/spec.html" target="_blank">Swagger Specification</a>. <a href="https://swagger.io/tools/swagger-ui/" target="_blank">Swagger UI</a> is an extremely useful tool that generates a webpage from an OpenAPI/Swagger spec, providing visual documentation for your API that allows anybody to test your API methods, construct requests, inspect responses, etc.

### Flask-CORS

[Flask-CORS](https://flask-cors.readthedocs.io/en/latest/) is a Flask extension for handling Cross Origin Resource Sharing (CORS), making cross-origin AJAX possible. Using this extension to enable CORS for all routes (as is the case in this project) is extremely simple. As you will see shortly, the entire process involves initializing the extension with the Flask application instance with default values.

### Flask-SQLAlchemy

[Flask-SQLAlchemy](http://flask-sqlalchemy.palletsprojects.com/en/2.x/) is a Flask extension that adds support for [SQLAlchemy](https://www.sqlalchemy.org/) and makes integrating the ORM with your Flask application simple. If you are unfamiliar with SQLAlchemy, the description below from the official documentation is a perfect summation:

<blockquote cite="https://docs.sqlalchemy.org/en/13/orm/tutorial.html"><p>The <strong>SQLAlchemy Object Relational Mapper</strong> presents a method of associating user-defined Python classes with database tables, and instances of those classes (objects) with rows in their corresponding tables. It includes a system that transparently synchronizes all changes in state between objects and their related rows, called a unit of work, as well as a system for expressing database queries in terms of the user defined classes and their defined relationships between each other.</p></blockquote>

I know, it sounds like magic. [Another key feature](https://docs.sqlalchemy.org/en/13/core/engines.html) of SQLALchemy is that the type of database you use (MySQL, SQLite, PostgreSQL, etc.) is almost completely irrelevent (it comes into play if you need to use a feature that is only supported by a specific backend). For example, you could have your API configured to use a PostgreSQL database in production, and use a simple SQLite file as the backend in your test and development environments. There would be no need to change any code to support each configuration, which, again sounds like magic.

### Flask-Migrate (Alembic)

[Alembic](https://pypi.org/project/alembic/) is a database migrations tool created by the author of SQLAlchemy, and [Flask-Migrate](https://flask-migrate.readthedocs.io/en/latest/) is a Flask extension that adds Alembic's operations to the Flask CLI. A database migration is a set of changes to a database schema (e.g., add new table, update foreign key relationships, etc.), similar to a commit in a version-control system. With Flask-Migrate, each migration is represented as a script of SQL statements, allowing you to "upgrade" a database to apply the schema changes or "downgrade" and undo the changes. This makes the process of deploying database changes to a production environment safe and easy; simply create a migration script when your changes have been tested and verified, then run the migration script in the production environment to apply the changes.

### Pytest

I have a strong preference for <a href="https://pytest.org" target="_blank">pytest</a> as my testing framework. Compared to the built-in unittest library (or other frameworks like nose), pytest requires almost no boilerplate code (e.g., inheriting from `TestCase`) and relies solely on the built-in `assert` statement for verifying expected behavior. In contrast, with unittest you have to learn a new API with several different methods in order to "assert" the same expression (i.e., `self.assertEqual`, `self.assertFalse`, `self.assertIsNotNone`, etc.).

The other feature that sets pytest apart is <a href="https://pytest.readthedocs.io/en/latest/fixture.html#fixtures" target="_blank">fixtures</a>. Fixtures can be extremely complex but in the simplest case a fixture is just a function that constructs and returns a test object (e.g., a function named `db` that returns a mock database object). A fixture is created by decorating the function with `@pytest.fixture`:

{{< highlight python >}}@pytest.fixture
def db():
    return MockDatabase(){{< /highlight >}}

If we wish to use the mock database object in a test case, we simply add a parameter with the same name as the fixture (i.e., `db`) to the test case function as shown below:

{{< highlight python >}}def test_new_user(db, email, password):
    new_user = User(email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    user_exists = User.query.filter_by(email=email).first()
    assert user_exists{{< /highlight >}}

When this test executes, pytest will discover and call the fixture named `db`, making the mock database object available within the test case. This method of decoupling test code from the objects needed to execute the test code is an example of <a href="http://en.wikipedia.org/wiki/Dependency_injection" target="_blank">dependency injection</a>.

### Black

[Black](https://github.com/python/black) is my preferred code formatter. Compared to YAPF or autopep8, black is deliberately opinionated and provides very few configuration options. With the other formatting tools, you have to spend time tweaking the configuration until it produces your desired format. With black, the only setting I tweak is the maximum line length (I increase it from 79 to 99).

This has an additional benefit if you are collaborating with others on a code base, since enforcing consistent style/format is difficult when everyone is using different customized autopep8 settings. Having a consistent style throughout a project will make your team more productive since less time will be spent conforming to style and the code will become easier to digest visually.

### Flake8

Flake8 is my preferred code linter. While black reformats your code, it doesn't modify the behavior in any way (black verifies that the AST is not modified before applying any changes). Flake8 is actually a wrapper for three different static-analysis tools: pydocstyle (checks for compliance with PEP8 formatting rules, like black but stricter), PyFlakes (checks for programming errors that would only be caught at run-time) and mccabe (checks cyclomatic complexity).

Flake8 can be configured in a multitude of ways, so getting the most out of it requires a bit of an investment. Applied correctly, flake8 will make your code easier to read, less bug-prone and more maintainable. We will explore my preferred flake8 settings later in this tutorial.

## Project Setup

The location of your test code in relation to your app code is very important. There are multiple valid ways to layout your project, and the pros and cons of each approach are collected as <a href="https://docs.pytest.org/en/latest/goodpractices.html" target="_blank">a helpful set of best practices</a> on the pytest documentation site. The specific recommendations that I have applied to this project are:

<div class="steps">
  <ul>
    <li>Place a <code>setup.py</code> file in your project's root folder. We will cover the contents of this file shortly, having this file allows you to install your application with <code>pip</code>.</li>
    <li>Place your test code in a separate folder <span class="emphasis">outside</span> of your application code.
      <ul>
        <li>This allows you to run your tests against an installed version of your application after executing <code>pip install .</code></li>
        <li>This allows you to run your tests against your local development version of your application after executing <code>pip install -e .</code></li>
      </ul>
    </li>
    <li>Installing your application in "editable" mode (<code>pip install -e .</code>) allows you to modify your app code and test code and re-run your test cases on demand.</li>
    <li>"Editable" mode installs your application using a symlink to your dev code.</li>
  </ul>
</div>

### Project Structure

With those guidelines in mind, let's start by creating the folder layout for our application.

You can name your root folder whatever you like (represented by the top-level "." node below), or you can be just like me and use `flask-api-tutorial`. In this post, we will work on everything marked as <code class="work-file">NEW CODE</code> in the chart below (all files will be empty at this point):

<pre class="project-structure"><div><span class="project-folder">.</span> <span class="project-structure">(project root folder)</span>
|- <span class="project-folder">app</span>
|   |- <span class="project-folder">api</span>
|   |   |- <span class="project-folder">auth</span>
|   |   |   |- <span class="project-empty-file">__init__.py</span>
|   |   |
|   |   |- <span class="project-folder">widgets</span>
|   |   |   |- <span class="project-empty-file">__init__.py</span>
|   |   |
|   |   |- <span class="project-empty-file">__init__.py</span>
|   |
|   |- <span class="project-folder">models</span>
|   |   |- <span class="project-empty-file">__init__.py</span>
|   |
|   |- <span class="project-folder">util</span>
|   |   |- <span class="project-empty-file">__init__.py</span>
|   |-  |- <span class="work-file">datetime_util.py</span>
|   |-  |- <span class="work-file">result.py</span>
|   |
|   |- <span class="work-file">__init__.py</span>
|   |- <span class="work-file">config.py</span>
|
|- <span class="project-folder">test</span>
|   |- <span class="work-file">test_config.py</span>
|
|- <span class="work-file">.env</span>
|- <span class="work-file">pytest.ini</span>
|- <span class="work-file">run.py</span>
|- <span class="work-file">setup.py</span>
|- <span class="work-file">pyproject.toml</span>
|- <span class="work-file">requirements.txt</span>
|- <span class="work-file">requirements_dev.txt</span></div>
<div class="project-structure-key-wrapper">
<div class="project-structure-key">
<div class="key-item key-label">KEY:</div>
<div class="key-item project-folder">FOLDER</div>
<div class="key-item work-file">NEW CODE</div>
<div class="key-item project-empty-file">EMPTY FILE</div>
</div>
</div></pre>

Feel free to create the project structure manually or through the command line as shown below:

<pre><code><span class="cmd-prompt">~ $</span> <span class="cmd-input">mkdir flask-api-tutorial && cd flask-api-tutorial</span>
<span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">touch .env pytest.ini run.py setup.py pyproject.toml requirements.txt requirements_dev.txt</span>
<span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">mkdir app && cd app && touch __init__.py config.py</span>
<span class="cmd-prompt">flask-api-tutorial/app $</span> <span class="cmd-input">mkdir api && cd api && touch __init__.py</span>
<span class="cmd-prompt">flask-api-tutorial/app/api $</span> <span class="cmd-input">mkdir auth && cd auth && touch __init__.py</span>
<span class="cmd-prompt">flask-api-tutorial/app/api/auth $</span> <span class="cmd-input">cd ..</span>
<span class="cmd-prompt">flask-api-tutorial/app/api $</span> <span class="cmd-input">mkdir widget && cd widget && touch __init__.py</span>
<span class="cmd-prompt">flask-api-tutorial/app/api/widget $</span> <span class="cmd-input">cd ../..</span>
<span class="cmd-prompt">flask-api-tutorial/app $</span> <span class="cmd-input">mkdir models && cd models && touch __init__.py</span>
<span class="cmd-prompt">flask-api-tutorial/app/models $</span> <span class="cmd-input">cd ..</span>
<span class="cmd-prompt">flask-api-tutorial/app $</span> <span class="cmd-input">mkdir util && cd util && touch __init__.py</span>
<span class="cmd-prompt">flask-api-tutorial/app/util $</span> <span class="cmd-input">cd ../..</span>
<span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">mkdir test && cd test && touch test_config.py</span>
<span class="cmd-prompt">flask-api-tutorial/test $</span> <span class="cmd-input">cd ..</span>
<span class="cmd-prompt">flask-api-tutorial $</span></code></pre>

### Installation Script & Requirements Files

After the folder structure is in place, open the `setup.py` file in the project root and add the content below. Then, save and close the file:

{{< highlight python >}}"""Installation script for flask-api-tutorial."""
from setuptools import setup, find_packages

setup(
    name="flask-api-tutorial",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "Flask",
        "Flask-Bcrypt",
        "Flask-Cors",
        "Flask-Migrate",
        "flask-restplus",
        "Flask-SQLAlchemy",
        "PyJWT",
        "python-dotenv",
        "requests",
        "urllib3",
    ],
){{< /highlight >}}

Next, open the `requirements.txt` file and add the content below. Then, save and close the file:

{{< highlight python >}}Flask
Flask-Bcrypt
Flask-Cors
Flask-Migrate
flask-restplus
Flask-SQLAlchemy
PyJWT
python-dotenv
pytz
requests
tzlocal
urllib3{{< /highlight >}}

Finally, open the `requirements_dev.txt` file and add the content below. Then, save and close the file:

{{< highlight python >}}#install packages listed in requirements.txt
-r requirements.txt

black
flake8
pydocstyle
pytest
pytest-black
pytest-clarity
pytest-dotenv
pytest-flake8
pytest-flask{{< /highlight >}}

### Create Virtual Environment

Next, create a new virtual environment by whatever method you prefer (this project requires Python 3.6+). I use a Mac, and since MacOS "officially" supports Python 2.7, I use `pyenv` to install as many versions as I want. For a quick and easy guide to setting up and using `pyenv`, check out <a href="https://hackernoon.com/reaching-python-development-nirvana-bb5692adf30c" target="_blank">this article from Hacker Noon</a>.

Even if you do not use `pyenv`, the process to create and activate a virtual environment will be similar to the steps below:

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">python --version</span>
<span class="cmd-results">Python 2.7.14</span>
<span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">pyenv local 3.7.4</span>
<span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">python --version</span>
<span class="cmd-results">Python 3.7.4</span>
<span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">python -m venv venv</span>
<span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">source venv/bin/activate</span>
<span class="cmd-venv">(venv) flask-api-tutorial $</span></code></pre>

At this point, <a href="https://packaging.python.org/guides/tool-recommendations/" target="_blank">the PyPA recommends</a> using `pipenv` for installing and managing project dependencies. However, my various encounters with `pipenv` and these newfangled "Pipfiles" have been frustrating, slow, and generally not a smooth experience.

Chastise me if you wish, but I will be using `pip` to manage project dependencies throughout this tutorial. Please upgrade `pip`, `setuptools` and `wheel`:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">pip install --upgrade pip setuptools wheel</span>
<span class="cmd-comment"># removed package upgrade messages...</span>
<span class="cmd-results">Successfully installed pip-19.2.1 setuptools-41.0.1 wheel-0.33.4</span></code></pre>

Next, install the project dependencies and development/testing dependencies (`requirements_dev.txt` calls `requirements.txt` so there's no need to run `pip install -r` for both files):

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">pip install -r requirements_dev.txt</span>
<span class="cmd-comment"># removed package install messages...</span>
<span class="cmd-results">Successfully installed Flask-1.1.1 Flask-Bcrypt-0.7.1 Flask-Cors-3.0.8 Flask-Migrate-2.5.2 Flask-SQLAlchemy-2.4.0 Jinja2-2.10.1 Mako-1.0.14 MarkupSafe-1.1.1 PyJWT-1.7.1 SQLAlchemy-1.3.6 Six-1.12.0 Werkzeug-0.15.5 alembic-1.0.11 aniso8601-7.0.0 appdirs-1.4.3 atomicwrites-1.3.0 attrs-19.1.0 bcrypt-3.1.7 black-19.3b0 certifi-2019.6.16 cffi-1.12.3 chardet-3.0.4 click-7.0 entrypoints-0.3 flake8-3.7.8 flask-restplus-0.12.1 idna-2.8 importlib-metadata-0.18 itsdangerous-1.1.0 jsonschema-3.0.1 mccabe-0.6.1 more-itertools-7.2.0 packaging-19.0 pluggy-0.12.0 py-1.8.0 pycodestyle-2.5.0 pycparser-2.19 pydocstyle-4.0.0 pyflakes-2.1.1 pyparsing-2.4.0 pyrsistent-0.15.3 pytest-5.0.1 pytest-black-0.3.7 pytest-clarity-0.2.0a1 pytest-dotenv-0.4.0 pytest-flake8-1.0.4 pytest-flask-0.15.0 python-dateutil-2.8.0 python-dotenv-0.10.3 python-editor-1.0.4 pytz-2019.1 requests-2.22.0 snowballstemmer-1.9.0 termcolor-1.1.0 toml-0.10.0 tzlocal-2.0.0 urllib3-1.25.3 wcwidth-0.1.7 zipp-0.5.2</span></code></pre>

Finally, install our application in editable mode:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">pip install -e .</span>
<span class="cmd-comment"># removed package install messages...</span>
<span class="cmd-results">Installing collected packages: flask-api-tutorial
  Running setup.py develop for flask-api-tutorial
Successfully installed flask-api-tutorial</span>
<span class="cmd-venv">(venv) flask-api-tutorial $</span></code></pre>

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil" aria-hidden="true"></i>
  </div>
  <div class="note-message">
    <p><code>pip install -e .</code> installs the <code>flask-api-tutorial</code> application in the virtual environment in <span class="bold-italics">editable mode</span>. This allows our tests to be executed with the folder layout discussed previously, and also allows any changes made to app code or test code to be tested without needing to re-install the <code>flask-api-tutorial</code> application.</p>
  </div>
</div>

## `app.util` Package

The `app.util` package contains utlity classes and functions that I have curated over time. They are not related to the main topics of this tutorial, so let's just get them out of the way before we begin working on the actual project.

### `Result` Class

[In a previous post](/blog/error-handling-python-result-class/), I demonstrated and explained the merits of incorporating principles from functional programming, with the `Result` class as a useful example. We will use this class frequently, so please read the linked post. When you finish that, create a new file in `app/util` named `result.py` and add the content below:

{{< highlight python >}}"""This module provides classes and exceptions for representing the outcome of an operation."""


class Result:
    """Represent the outcome of an operation."""

    def __init__(self, success, value, error):
        """Represent the outcome of an operation."""
        self.success = success
        self.error = error
        self.value = value

    def __str__(self):
        """Informal string representation of a result."""
        if self.success:
            return "[Success]"
        else:
            return f"[Failure] {self.error}"

    def __repr__(self):
        """Official string representation of a result."""
        if self.success:
            return f"<Result success={self.success}>"
        else:
            return f'<Result success={self.success}, message="{self.error}">'

    @property
    def failure(self):
        """Flag that indicates if the operation failed."""
        return not self.success

    def on_success(self, func, *args, **kwargs):
        """Continuation method. Pass result of successful operation (if any) to function."""
        if self.failure:
            return self
        if self.value:
            return func(self.value, *args, **kwargs)
        return func(*args, **kwargs)

    def on_failure(self, func, *args, **kwargs):
        """Continuation method. Pass error message from failed operation to function."""
        if self.success:
            return self.value if self.value else None
        if self.error:
            return func(self.error, *args, **kwargs)
        return func(*args, **kwargs)

    def on_both(self, func, *args, **kwargs):
        """Continuation method. Pass result of operation (if any) to function."""
        if self.value:
            return func(self.value, *args, **kwargs)
        return func(*args, **kwargs)

    @staticmethod
    def Fail(error_message):
        """Create a Result object for a failed operation."""
        return Result(False, value=None, error=error_message)

    @staticmethod
    def Ok(value=None):
        """Create a Result object for a successful operation."""
        return Result(True, value=value, error=None)

    @staticmethod
    def Combine(results):
        """Return a Result object based on the outcome of a list of Results."""
        if all([result.success for result in results]):
            return Result.Ok()
        errors = [result.error for result in results if result.failure]
        return Result.Fail("\n".join(errors)){{< /highlight >}}

### `datetime_util` Module

If you've spent anytime programming in Python, there is a 100% chance that you have encountered an annoying issue with `datetime`, `timezone` and/or `timedelta` objects. The `datetime_util` module contains helper functions for converting `datetime` objects from naive to timezone-aware, formatting `datetime` and `timedelta` objects as strings and a `namedtuple` named `timespan` that represents the difference between two `datetime` values but provides more data than the set of attributes provided by the `timedelta` class.

Create a new file in `app/util` named `datetime_util.py` and add the content below:

{{< highlight python >}}"""Helper functions for datetime, timezone and timedelta objects."""
import time
from collections import namedtuple
from datetime import datetime, timedelta, timezone


DT_AWARE = "%m/%d/%y %I:%M:%S %p %Z"
DT_NAIVE = "%m/%d/%y %I:%M:%S %p"
DATE_MONTH_NAME = "%b %d %Y"
DATE_ISO = "%Y-%m-%d"

timespan = namedtuple(
    "timespan",
    [
        "days",
        "hours",
        "minutes",
        "seconds",
        "milliseconds",
        "microseconds",
        "total_seconds",
        "total_milliseconds",
        "total_microseconds",
    ],
)


def is_naive(dt):
    """Return True if datetime object is not time-zone aware."""
    return not dt.tzinfo or not dt.tzinfo.utcoffset(dt)


def is_tzaware(dt):
    """Return True if datetime object is time-zone aware."""
    return dt.tzinfo and dt.tzinfo.utcoffset(dt)


def localized_dt_string(dt, use_tz=None):
    """Convert datetime value to a string, localized for the specified timezone."""
    if not dt.tzinfo and not use_tz:
        return dt.strftime(DT_NAIVE)
    if not dt.tzinfo:
        return dt.replace(tzinfo=use_tz).strftime(DT_AWARE)
    return dt.astimezone(use_tz).strftime(DT_AWARE) if use_tz else dt.strftime(DT_AWARE)


def get_local_utcoffset():
    """Get UTC offset from local system and return as timezone object."""
    utc_offset = timedelta(seconds=time.localtime().tm_gmtoff)
    return timezone(offset=utc_offset)


def make_tzaware(dt, use_tz=None, localize=True):
    """Make a naive datetime object timezone-aware."""
    if not use_tz:
        use_tz = get_local_utcoffset()
    return dt.astimezone(use_tz) if localize else dt.replace(tzinfo=use_tz)


def dtaware_fromtimestamp(timestamp, use_tz=None):
    """Time-zone aware datetime object from UNIX timestamp."""
    timestamp_aware = datetime.fromtimestamp(timestamp).replace(tzinfo=get_local_utcoffset())
    return timestamp_aware.astimezone(use_tz) if use_tz else timestamp_aware


def remaining_fromtimestamp(timestamp):
    """Calculate time remaining from now until UNIX timestamp value."""
    now = datetime.now(timezone.utc)
    dt_aware = dtaware_fromtimestamp(timestamp, use_tz=timezone.utc)
    if dt_aware < now:
        return timespan(0, 0, 0, 0, 0, 0, 0, 0, 0)
    return get_timespan(dt_aware - now)


def format_timespan_digits(ts):
    """Format a timespan namedtuple as a string resembling a digital display."""
    if ts.days:
        return f"{ts.days}, {ts.hours:02d}:{ts.minutes:02d}:{ts.seconds:02d}"
    if ts.seconds:
        return f"{ts.hours:02d}:{ts.minutes:02d}:{ts.seconds:02d}"
    return f"00:00:00.{ts.total_microseconds}"


def format_timedelta_digits(td):
    """Format a timedelta object as a string resembling a digital display."""
    return format_timespan_digits(get_timespan(td))


def format_timespan_str(ts):
    """Format a timespan namedtuple as a readable string."""
    if ts.days:
        return f"{ts.days}d {ts.hours:.0f}h {ts.minutes:.0f}m {ts.seconds}s"
    if ts.hours:
        return f"{ts.hours:.0f}h {ts.minutes:.0f}m {ts.seconds}s"
    if ts.minutes:
        return f"{ts.minutes:.0f}m {ts.seconds}s"
    if ts.seconds:
        return f"{ts.seconds}s {ts.milliseconds:.0f}ms"
    return f"{ts.total_microseconds}us"


def format_timedelta_str(td):
    """Format a timedelta object as a readable string."""
    return format_timespan_str(get_timespan(td))


def get_timespan(td):
    """Convert timedelta object to timespan namedtuple."""
    td_days = td.days
    td_hours = 0
    td_seconds = td.seconds % 60
    td_minutes = (td.seconds - td_seconds) / 60
    (td_milliseconds, td_microseconds) = divmod(td.microseconds, 1000)
    if td_minutes > 60:
        (td_hours, td_minutes) = divmod(td_minutes, 60)
    return timespan(
        td_days,
        td_hours,
        int(td_minutes),
        td_seconds,
        td_milliseconds,
        td_microseconds,
        td.seconds,
        (td.seconds * 1000 + td_milliseconds),
        (td.seconds * 1000 * 1000 + td_milliseconds * 1000 + td_microseconds),
    ){{< /highlight >}}

## Environment Configuration

At this point, I recommend switching to your IDE of choice for Python development. I am a huge fan of <a href="https://code.visualstudio.com" target="_blank">VSCode</a>, so that is what I will be using.

### `.env` File

First, open the `.env` file in the project root and add the values below. Save the file:

{{< highlight ini >}}FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY="please change me"{{< /highlight >}}

`FLASK_APP` is the filepath (or module import-path) where the Flask application object is located (<a href="http://flask.pocoo.org/docs/1.0/cli/#application-discovery" target="_blank">More info on <code>FLASK_APP</code></a>).

`FLASK_ENV` only has two valid values: `development` and `production`. Setting `FLASK_ENV=development` enables the interactive debugger and automatic file reloader (<a href="http://flask.pocoo.org/docs/1.0/config/#environment-and-debug-features" target="_blank">More info on <code>FLASK_ENV</code></a>).

The `SECRET_KEY` will be used to sign our JSON authorization tokens. The value you choose for this key should be a long, random string of bytes. <span class="emphasis">It is absolutely vital that this value remains secret</span> since anyone who knows the value can generate authorization keys for your API. <a href="http://flask.pocoo.org/docs/1.0/config/?highlight=secret_key#SECRET_KEY" target="_blank">The recommended way</a> to generate a `SECRET_KEY` is to use the Python interpreter:

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">import os</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">os.urandom(24)</span>
<span class="cmd-repl-results">b'\x1ah\xe9\x00\x04\x1d>\x00\x14($\x17\x90\x1f?~?\xdc\xe9\x91U\xd2\xb5\xd7'</span></code></pre>

Update your `.env` file to use the random value you generated. Save the changes:

{{< highlight ini >}}FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY="\x1ah\xe9\x00\x04\x1d>\x00\x14($\x17\x90\x1f?~?\xdc\xe9\x91U\xd2\xb5\xd7"{{< /highlight >}}

### Black Configuration

Before we write any app code, let's customize the rules used by black. Open `pyproject.toml` in the project root folder and add the following content:

{{< highlight ini >}}[tool.black]
line-length = 99
target-version = ['py37']
include = '\.pyi?$'
exclude =  '''
/(
    \.eggs
    | \.git
    | \.hg
    | \.mypy_cache
    | \.pytest_cache
    | \.tox
    | \.vscode
    | __pycache__
    | _build
    | buck-out
    | build
    | dist
    | venv
)/
'''{{< /highlight >}}

I prefer to increase the maximum line length to 99. The black maintainers recommend a line-length of roughly 90, but you should use whatever line length works best for you and your team. `target-version` controls which Python versions Black-formatted code should target. `include` and `exclude` are both regular expressions that match files and folders to (respectively) format with black and exclude from formatting.

### `get_config` Function

Next, open `config.py` in the `app` folder and add the content below. Save the file:

{{< highlight python "linenos=table" >}}"""Config settings for for development, testing and production environments."""
import os
from pathlib import Path


APP_ROOT = Path(__file__).resolve().parent.parent
SQLITE_DEV = "sqlite:///" + str(APP_ROOT / "flask_api_tutorial_dev.db")
SQLITE_TEST = "sqlite:///" + str(APP_ROOT / "flask_api_tutorial_test.db")
SQLITE_PROD = "sqlite:///" + str(APP_ROOT / "flask_api_tutorial_prod.db")


class Config:
    """Base configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY", "open sesame")
    BCRYPT_LOG_ROUNDS = 4
    TOKEN_EXPIRE_HOURS = 0
    TOKEN_EXPIRE_MINUTES = 0
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PRESERVE_CONTEXT_ON_EXCEPTION = False
    SWAGGER_UI_DOC_EXPANSION = "list"
    RESTPLUS_MASK_SWAGGER = False
    JSON_SORT_KEYS = False


class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = SQLITE_TEST


class DevelopmentConfig(Config):
    """Development configuration."""

    TOKEN_EXPIRE_MINUTES = 15
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", SQLITE_DEV)


class ProductionConfig(Config):
    """Production configuration."""

    TOKEN_EXPIRE_HOURS = 1
    BCRYPT_LOG_ROUNDS = 13
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", SQLITE_PROD)
    PRESERVE_CONTEXT_ON_EXCEPTION = True


ENV_CONFIG_DICT = dict(
    development=DevelopmentConfig, testing=TestingConfig, production=ProductionConfig
)


def get_config(config_name):
    """Retrieve environment configuration settings."""
    return ENV_CONFIG_DICT.get(config_name, ProductionConfig){{< /highlight >}}

There are several important things to note about the `Config` class:

<div class="code-details">
  <ul>
    <li>
      <strong>Line 15: </strong>In the <code>Config</code> base class, we store the value of the <code>SECRET_KEY</code> environment variable. Since this value must be set to something, a default value of <code>"open sesame"</code> is used if the <code>SECRET_KEY</code> variable has not been set. This value (and all others) that are set in the base class are available in the <code>Config</code> subclasses (<code>TestingConfig</code>, <code>DevelopmentConfig</code>, <code>ProductionConfig</code>).
    </li>
    <li>
      <p><strong>Line 17-18, 35, 42: </strong>This is where start using our subclasses to make unique configurations for each environment. The amount of time until a token expires is determined by these two values:</p>
      <p>Token expires after: <code>TOKEN_EXPIRE_HOURS</code> + <code>TOKEN_EXPIRE_MINUTES</code> + 5 seconds (the hard-coded 5 second addition allows us to write test cases where the access token has expired).</p>
      <ul>
        <li><code>TestingConfig</code>: </strong>5 seconds</li>
        <li><code>DevelopmentConfig</code>: </strong>15 minutes, 5 seconds</li>
        <li><code>ProductionConfig</code>: </strong>1 hour, 5 seconds</li>
      </ul>
    </li>
    <li>
      <strong>Line 29, 36, 44: </strong>The value of <code>SQLALCHEMY_DATABASE_URI</code> is set to a different value for each environment. By default, separate SQLite database files will be used for each environment. However, if you add an environment variable named <code>DATABASE_URL</code> to the <code>.env</code> file that contains a URL to a database instance (e.g., PostgreSQL, MSSQL, etc) that value will be used for either the development or production environment based on the value of <code>FLASK_ENV</code>.</p>
    </li>
    <li>
      <strong>Line 53: </strong>The <code>get_config</code> function retrieves the configuration settings for each environment. This will be used by the <code>create_app</code> method which instantiates the Flask application.
    </li>
  </ul>
</div>

### python-dotenv

In order for our `Config` classes to work correctly, the environment variables defined in `.env` must be set. Rather than setting the value for each environment variable at the command-line every time we open a new terminal, we will use the `python-dotenv` package to set the values automatically. `python-dotenv` was installed from `setup.py` and requires no configuration after being installed.

As long as `python-dotenv` is installed, when the `flask` command is run any environment variables defined in `.env` will be set. This allows the `os.getenv` method to retrieve the values defined in `.env` and use them in our Flask application.

<div class="alert alert-flex">
  <div class="alert-icon">
    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
  </div>
  <div class="alert-message">
    <p>Never commit your <code>.env</code> file to your project's git repository. Doing so publicly exposes the <code>SECRET_KEY</code>, allowing anyone to issue authorization tokens for the API.</p>
  </div>
</div>

## The Application Factory Pattern

In the `app` package's `__init__.py` file, add the following content and save the file:

{{< highlight python >}}"""Flask app initialization via factory pattern."""
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

    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    return app{{< /highlight >}}

We are using the [application factory pattern](http://flask.pocoo.org/docs/0.12/patterns/appfactories/) to create instances of our app. This makes creating different versions of our application with different settings simple, just provide the type of environment you wish to use as the `config_name` parameter to the `create_app` function. This value retrieves the configuration settings using the `get_config` function we created in `config.py`.

After creating the Flask app and applying the config settings, we initialize the extension objects (`cors`, `db`, `migrate`, `bcrypt`) by calling each object's `init_app` method with the newly-created Flask app. By doing this, no application-specific state is stored on the extension object, so one extension object can be used for multiple apps.

You should recognize all of the Flask extensions from the first section of this post, except for Flask-Bcrypt. This extension provides bcrypt hashing utitlities which will be used to securely store and verify user passwords.

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil" aria-hidden="true"></i>
  </div>
  <div class="note-message">
    <p>By initializing the Flask-CORS extension as shown, CORS support for all domains and for all origins for all routes has been enabled.</p>
  </div>
</div>

## Pytest Configuration

Before we begin writing any test code, let's configure how pytest reports test results and setup some of the plugins from `requirements_dev.txt` that we installed. Open `pytest.ini` in the project root folder and enter the content below:

{{< highlight ini "linenos=table" >}}[pytest]
addopts =
    # generate report with details of all (non-pass) test results
    -ra
    # show local variables in tracebacks
    --showlocals
    # report formatting changes suggested by black
    --black
    # report linting issues with flake8
    --flake8
    # verbose output
    --verbose
norecursedirs =
    .git
    .pytest_cache
    .vscode
    migrations
    venv
flake8-max-line-length = 99
flake8-ignore = E203, E266, E501, W503
flake8-max-complexity = 18{{< /highlight >}}

We are obviously making many configuration decisions in this file. Please note the following:

<div class="code-details">
  <ul>
    <li><strong>Line 2: </strong>The <span class="bold-text">addopts</span> config option <span class="bold-text">add</span>s the specified <span class="bold-text">opt</span>ion<span class="bold-text">s</span> to the set of command line arguments whenever <code>pytest</code> is executed by the user. In other words, if <code>addopts = -ra --showlocals</code>, executing the command <code>pytest test_config.py</code> would actually execute <code>pytest -ra --showlocals test_config.py</code>.</li>
    <li><strong>Line 4: </strong>The <code>-r</code> flag generates a "short test summary info" section at the end of the test session making it easier to see all the non-pass test results. The <code>-a</code> flag means "all except passes".</li>
    <li><strong>Line 6: </strong>The <code>--showlocals</code> flag adds all local variable values to the traceback for all test failures.</li>
    <li><strong>Line 8: </strong>The <code>--black</code> flag reports formatting changes that are suggested by black. This option is only available because we installed the pytest-black plugin as a dev requirement.</li>
    <li><strong>Line 10: </strong>The <code>--flake8</code> flag reports linting changes that are suggested by flake8. This option is only available because we installed the pytest-flake8 plugin as a dev requirement.</li>
    <li><strong>Line 12: </strong>This option should be self-explanatory, I prefer to enable verbose output for all test results.</li>
    <li><strong>Lines 13-18: </strong>The <span class="bold-text">norecursedirs</span> config option tells pytest to not look for test code in the specified list of folders. This makes pytest run much faster since the total number of locations to search is greatly reduced.</li>
    <li><strong>Line 19: </strong>This and all config options that begin with <code>flake8</code> only apply to the pytest-flake8 plugin. <code>flake8-max-line-length</code> is set to 99 to enforce the same style rule I have customized in my black configuration.</li>
    <li><strong>Line 20: </strong><code>flake8-ignore</code> tells pytest-flake8 to never report instances of the specified rule violations. This list is copied from the <code>flake8</code> <a href="https://github.com/python/black/blob/master/.flake8" target="_blank">config settings in black</a>, which supressses these errors since the rules they enfore violate PEP8.</li>
    <li><strong>Line 21: </strong><code>flake8-max-complexity</code> sets the allowed threshold for cyclomatic complexity. If any function is more complex than the specified value, a flake8 error will be reported in the test results.</li>
  </ul>
</div>

## Unit Tests: `test_config.py`

Let's verify that the config classes work as expected when we create an instance of our application and specify the environment configuration by name. In the `test_config.py` file inside the `test` folder, add the following content and save the file:

{{< highlight python >}}"""Unit tests for environment config settings."""
import os

from app import create_app
from app.config import SQLITE_DEV, SQLITE_PROD, SQLITE_TEST


def test_config_development():
    app = create_app("development")
    assert app.config["SECRET_KEY"] != "open sesame"
    assert not app.config["TESTING"]
    assert app.config["SQLALCHEMY_DATABASE_URI"] == os.getenv("DATABASE_URL", SQLITE_DEV)
    assert app.config["TOKEN_EXPIRE_HOURS"] == 0
    assert app.config["TOKEN_EXPIRE_MINUTES"] == 15


def test_config_testing():
    app = create_app("testing")
    assert app.config["SECRET_KEY"] != "open sesame"
    assert app.config["TESTING"]
    assert app.config["SQLALCHEMY_DATABASE_URI"] == SQLITE_TEST
    assert app.config["TOKEN_EXPIRE_HOURS"] == 0
    assert app.config["TOKEN_EXPIRE_MINUTES"] == 0


def test_config_production():
    app = create_app("production")
    assert app.config["SECRET_KEY"] != "open sesame"
    assert not app.config["TESTING"]
    assert app.config["SQLALCHEMY_DATABASE_URI"] == os.getenv("DATABASE_URL", SQLITE_PROD)
    assert app.config["TOKEN_EXPIRE_HOURS"] == 1
    assert app.config["TOKEN_EXPIRE_MINUTES"] == 0{{< /highlight >}}

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil" aria-hidden="true"></i>
  </div>
  <div class="note-message">
    <p>In order for the pytest runner to discover the tests, each test class and test case method must begin with "test" (or "Test").</p>
  </div>
</div>

In the first line of each test case, the `create_app` function is called to create a flask application object with the desired configuration settings. We pass the name of the environment to the `create_app` function, which will retrieve the desired config settings from the `get_config` function.

For each configuration, we verify that the value of `SECRET_KEY` is not equal to the default value, which verifies that the value from the `.env` file was successfully retieved. We also check that each database URL is set correctly and that the `TOKEN_EXPIRE_HOURS` and `TOKEN_EXPIRE_MINUTES` settings are correct for each environment.
<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil" aria-hidden="true"></i>
  </div>
  <div class="note-message">
    <p>If you are using a different database for any environment and you retrieved the URL from the <code>.env</code> file, make sure you update the test case to verify that this value is retrieved correctly.</p>
  </div>
</div>

We can run these tests (and our static-analysis tools) with the `pytest` command:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">pytest</span>
<span class="cmd-results">=============================================== test session starts ================================================
platform darwin -- Python 3.7.4, pytest-5.0.1, py-1.8.0, pluggy-0.12.0 -- /Users/aaronluna/Projects/flask-api-tutorial/venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/aaronluna/Projects/flask-api-tutorial, inifile: pytest.ini
plugins: dotenv-0.4.0, clarity-0.2.0a1, flake8-1.0.4, black-0.3.7, flask-0.15.0
collected 23 items

run.py::BLACK PASSED                                                                                         [  4%]
run.py::FLAKE8 PASSED                                                                                        [  8%]
setup.py::BLACK PASSED                                                                                       [ 13%]
setup.py::FLAKE8 PASSED                                                                                      [ 17%]
app/__init__.py::BLACK PASSED                                                                                [ 21%]
app/__init__.py::FLAKE8 PASSED                                                                               [ 26%]
app/config.py::BLACK PASSED                                                                                  [ 30%]
app/config.py::FLAKE8 PASSED                                                                                 [ 34%]
app/api/__init__.py::BLACK PASSED                                                                            [ 39%]
app/api/__init__.py::FLAKE8 PASSED                                                                           [ 43%]
app/api/auth/__init__.py::BLACK PASSED                                                                       [ 47%]
app/api/auth/__init__.py::FLAKE8 PASSED                                                                      [ 52%]
app/api/widget/__init__.py::BLACK PASSED                                                                     [ 56%]
app/api/widget/__init__.py::FLAKE8 PASSED                                                                    [ 60%]
app/models/__init__.py::BLACK PASSED                                                                         [ 65%]
app/models/__init__.py::FLAKE8 PASSED                                                                        [ 69%]
app/util/__init__.py::BLACK PASSED                                                                           [ 73%]
app/util/__init__.py::FLAKE8 PASSED                                                                          [ 78%]
test/test_config.py::BLACK PASSED                                                                            [ 82%]
test/test_config.py::FLAKE8 PASSED                                                                           [ 86%]
test/test_config.py::test_config_development PASSED                                                          [ 91%]
test/test_config.py::test_config_testing PASSED                                                              [ 95%]
test/test_config.py::test_config_production PASSED                                                           [100%]

============================================ 23 passed in 2.79 seconds =============================================</span></code></pre>

## Flask CLI/Application Entry Point

One of the many neat features of Flask is that it comes with a built-in Command-Line Interface (CLI) that is powered by <a href="https://click.palletsprojects.com/en/7.x/" target="_blank">click</a>. In order to use the CLI, Flask needs to be able to find an application instance, which is accomplished with the `FLASK_APP` environment variable. `FLASK_APP` must be set to a file path or an import path of a module containing a Flask application (<a href="http://flask.pocoo.org/docs/1.0/cli/#application-discovery" target="_blank">Read this for more info</a>).

<div class="alert alert-flex">
  <div class="alert-icon">
    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
  </div>
  <div class="alert-message">
    <p>Make sure you have activated your virtual environment, you will not be able to use the Flask CLI otherwise.</p>
  </div>
</div>

You may remember that `FLASK_APP` was one of the values we defined in our `.env` file (`FLASK_APP=run.py`). This tells Flask to look within `run.py` for an object named `app` (or a factory method named `create_app`). Currently, the `run.py` file is empty. If you attempt to run the Flask CLI with the `flask` command, an exception is thrown:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask</span>
<span class="cmd-results">Traceback (most recent call last):
  File "/Users/aaronluna/Desktop/temp/venv/lib/python3.7/site-packages/flask/cli.py", line 540, in list_commands
    rv.update(info.load_app().cli.list_commands(ctx))
  File "/Users/aaronluna/Desktop/temp/venv/lib/python3.7/site-packages/flask/cli.py", line 381, in load_app
    app = locate_app(self, import_name, name)
  File "/Users/aaronluna/Desktop/temp/venv/lib/python3.7/site-packages/flask/cli.py", line 255, in locate_app
    return find_best_app(script_info, module)
  File "/Users/aaronluna/Desktop/temp/venv/lib/python3.7/site-packages/flask/cli.py", line 96, in find_best_app
    module=module.__name__
<span class="highlite">flask.cli.NoAppException: Failed to find Flask application or factory in module "run". Use "FLASK_APP=run:name to specify one.</span>
Usage: flask [OPTIONS] COMMAND [ARGS]...

  A general utility script for Flask applications.

  Provides commands from Flask, extensions, and the application. Loads the
  application defined in the FLASK_APP environment variable, or from a
  wsgi.py file. Setting the FLASK_ENV environment variable to 'development'
  will enable debug mode.

    $ export FLASK_APP=hello.py
    $ export FLASK_ENV=development
    $ flask run

Options:
  --version  Show the flask version
  --help     Show this message and exit.

Commands:
  db      Perform database migrations.
  routes  Show the routes for the app.
  run     Run a development server.
  shell   Run a shell in the app context.</span></code></pre>

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil" aria-hidden="true"></i>
  </div>
  <div class="note-message">
    <p>Because we installed <code>python-dotenv</code>, the environment variables defined in <code>.env</code> are read from the file every time the <code>flask</code> command is executed (they can be accessed with the <code>os.getenv</code> method). Without this, we would need to set the value of <code>FLASK_APP</code> manually whenever we open a new terminal window.</p>
  </div>
</div>

Open `run.py` and add the following content:

{{< highlight python "linenos=table" >}}"""Flask CLI/Application entry point."""
import os

from app import create_app, db

app = create_app(os.getenv("FLASK_ENV", "development"))


@app.shell_context_processor
def shell():
    return {"db": db}{{< /highlight >}}

Please note the following about `run.py` (a.k.a the application entry point):

<div class="code-details">
  <ul>
    <li><strong>Line 6: </strong>This is the Flask application object which must exist in the <code>run</code> module in order for the <code>flask</code> command to execute without throwing an exception.</li>
    <li><strong>Line 9: </strong>The <code>@app.shell_context_processor</code> decorator makes the decorated method execute when the <code>flask shell</code> command is run.</li>
    <li><strong>Line 11: </strong>The <code>flask shell</code> command will automatically import the objects which are defined in the dictionary which is returned from the <code>shell</code> function.</li>
  </ul>
</div>

The `shell` method in the `run.py` file is decorated with `@app.shell_context_processor`. This is the method that executes when we run `flask shell`. According to the `flask --help` documentation this command "Runs a shell in the app context." If you are not sure what this means, consider the examples below:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">python</span>
<span class="cmd-results">Python 3.7.4 (default, May  7 2019, 00:14:38)
[Clang 10.0.1 (clang-1001.0.46.4)] on darwin
Type "help", "copyright", "credits" or "license" for more information.</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">app</span>
<span class="cmd-repl-results">Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'app' is not defined</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">db</span>
<span class="cmd-repl-results">Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'db' is not defined</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from run import app</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from app import db</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">app</span>
<span class="cmd-repl-results">&#60;Flask 'app'&#62;</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">db</span>
<span class="cmd-repl-results">&#60;SQLAlchemy engine=sqlite:////Users/aaronluna/Projects/flask-api-tutorial/flask_api_tutorial_dev.db&#62;</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">exit()</span></code></pre>

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask shell</span>
<span class="cmd-results">Python 3.7.4 (default, May  7 2019, 00:14:38)
[Clang 10.0.1 (clang-1001.0.46.4)] on darwin
App: app [development]
Instance: /Users/aaronluna/Projects/flask-api-tutorial/instance</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">app</span>
<span class="cmd-repl-results">&#60;Flask 'app'&#62;</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">db</span>
<span class="cmd-repl-results">&#60;SQLAlchemy engine=sqlite:////Users/aaronluna/Projects/flask-api-tutorial/flask_api_tutorial_dev.db&#62;</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">exit()</span></code></pre>

In the regular Python interpreter, the `app` and `db` objects are not recognized unless explicitly imported. But when we start the interpreter using `flask shell` the `app` object is imported automatically. This is nice, but what makes `flask shell` really useful is the ability to import a dictionary of objects that will be automatically imported in the Python interpreter. We configure this dictionary as the return value of the `shell_context_processor` function:

{{< highlight python >}}@app.shell_context_processor
def shell():
    return {"db": db}{{< /highlight >}}

In [Part 2](/flask-api-tutorial-part-2/), as we add model classes for each database table, we will add the models to this dictionary so they will be available to us in the shell context without importing them manually. The `shell_context_processor` function must return a dictionary and not a list. This allows you to control the names used in the shell, since the dictionary key for each object will be used as the name.

Let's make sure that the error we saw earlier has been fixed, Run `flask`:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask</span>
<span class="cmd-results">Usage: flask [OPTIONS] COMMAND [ARGS]...

  A general utility script for Flask applications.

  Provides commands from Flask, extensions, and the application. Loads the
  application defined in the FLASK_APP environment variable, or from a
  wsgi.py file. Setting the FLASK_ENV environment variable to 'development'
  will enable debug mode.

    $ export FLASK_APP=hello.py
    $ export FLASK_ENV=development
    $ flask run

Options:
  --version  Show the flask version
  --help     Show this message and exit.

Commands:
  db      Perform database migrations.
  routes  Show the routes for the app.
  run     Run a development server.
  shell   Run a shell in the app context.</span></code></pre>

## Checkpoint

Most of the work done in this section wasn't related to any specific project requirements, but I think we can claim at least partial credit on one (the `ProductionConfig` settings define the token age as one hour and will be used when creating JWTs). The <span class="italics requirements">JWTs must expire after 1 hour (in production)</span> item has been marked as partially complete (<span class="fa fa-star-half-o goldenrod"></span>):

<div class="requirements">
  <p class="title">User Management/JWT Authentication</p>
  <div class="fa-bullet-list">
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>New users can register by providing an email address and password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Existing users can obtain a JWT by providing their email address and password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>JWT contains the following claims: time the token was issued, time the token expires, a value that identifies the user, and a flag that indicates if the user has administrator access</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>JWT is sent in access_token field of HTTP response after successful authentication with email/password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-half-o fa-bullet-icon"></span>JWTs must expire after 1 hour (in production)</p>
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
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>The widget model contains fields with URL and datetime data types, along with normal text fields.</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>URL and datetime values must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>The widget model contains a "name" field which must be a string value containing only letters, numbers and the "-" (hyphen character) or "_" (underscore character).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Widget name must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>If input validation fails either when adding a new widget or editing an existing widget, the API response must include error messages indicating the name(s) of the fields that failed validation.</p>
  </div>
</div>

If you have any questions (or suggestions/complaints), please let me know in the comments.
