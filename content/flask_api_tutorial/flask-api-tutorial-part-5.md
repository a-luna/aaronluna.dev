---
title: "How To: Create a Flask API with JWT-Based Authentication (Part 5)"
lead: "Part 5: Widget API"
slug: "part-5"
series: ["flask_api_tutorial"]
series_weight: 5
series_title: "How To: Create a Flask API with JWT-Based Authentication"
series_part: "Part 5"
series_part_lead: "Widget API"
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
|   |   |   |- <span class="unmodified-file">business.py</span>
|   |   |   |- <span class="unmodified-file">decorator.py</span>
|   |   |   |- <span class="unmodified-file">dto.py</span>
|   |   |   |- <span class="unmodified-file">endpoints.py</span>
|   |   |
|   |   |- <span class="project-folder">widgets</span>
|   |   |   |- <span class="project-empty-file">__init__.py</span>
|   |   |   |- <span class="work-file">business.py</span>
|   |   |   |- <span class="work-file">dto.py</span>
|   |   |   |- <span class="work-file">endpoints.py</span>
|   |   |
|   |   |- <span class="work-file">__init__.py</span>
|   |
|   |- <span class="project-folder">models</span>
|   |   |- <span class="project-empty-file">__init__.py</span>
|   |   |- <span class="unmodified-file">token_blacklist.py</span>
|   |   |- <span class="unmodified-file">user.py</span>,
|   |   |- <span class="work-file">widget.py</span>
|   |
|   |- <span class="project-folder">util</span>
|   |   |- <span class="project-empty-file">__init__.py</span>
|   |-  |- <span class="unmodified-file">datetime_util.py</span>
|   |-  |- <span class="unmodified-file">result.py</span>
|   |
|   |- <span class="unmodified-file">__init__.py</span>
|   |- <span class="unmodified-file">config.py</span>
|
|- <span class="project-folder">test</span>
|   |- <span class="work-file">conftest.py</span>
|   |- <span class="unmodified-file">test_auth_login.py</span>
|   |- <span class="unmodified-file">test_auth_logout.py</span>
|   |- <span class="unmodified-file">test_auth_register.py</span>
|   |- <span class="unmodified-file">test_auth_user.py</span>
|   |- <span class="unmodified-file">test_config.py</span>
|   |- <span class="unmodified-file">test_user.py</span>
|   |- <span class="work-file">test_widget.py</span>
|
|- <span class="unmodified-file">.env</span>
|- <span class="unmodified-file">pytest.ini</span>
|- <span class="work-file">run.py</span>
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

In the previous section, we created four API endpoints to perform basic user registration and authentication functions. However, these API endpoints are not designed as RESTful resources (I explained [my reasoning for this choice in Part 3](/series/flask_api_tutorial/part-3/#user-authentication-in-a-restful-system)).

In this section of the tutorial, we will create a resource that is <span class="bold-text">REST-like</span> (<span class="bold-text">REST-faux</span>? <span class="bold-text">REST-adjacent</span>?). I am deliberately not describing it as <span class="bold-text">RESTful</span>, because <span class="emphasis">designing a truly RESTful system is HARD</span>. Check out <a href="https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven" target="_blank">this blog post from Roy Fielding</a> and the discussion in the comments to get an idea of what I mean.

The only features of this resource that I am willing to state are 100% bona fide REST-compliant are:

<ul>
  <li>The naming convention of the resource and associated endpoints.</li>
  <li>The HTTP methods supported by each endpoint that enables clients to perform CRUD operations.</li>
  <li>Through the use of pagination and navigational links included in JSON sent by the server, clients can interact with the API purely through hypertext (i.e., clients <span class="emphasis">NEVER</span> need to manually construct URLs to interact with the API).</li>
</ul>

The resource we will create is a collection of **widgets**. I decided to model something generic rather than the cliche "to-do list" project that you encounter in every introductory programming tutorial. I feel safe assuming that you are not reading this because you have a burning desire to create the next, great API-driven  to-do list.

The main purpose of this section is to learn more advanced techniques for request parsing and response marshalling. The `Widget` model will contain attributes that require creating custom input types for parsing request data. The `Widget` model also contains hybrid properties that will require rendering various data types in JSON. Whatever project you have in mind, the techniques demonstrated with the `Widget` model and associated `RequestParser` and API model instances can easily be adapted to any object in your domain.

## `widget_ns` Endpoints

The proper way to name resources is one of the (many) hotly debated topics regarding RESTful web services. I recommend taking the time to read the articles below to understand the current, accepted best practices:

<ul class="list-of-links">
    <li>
        <a href="https://www.restapitutorial.com/lessons/restfulresourcenaming.html" target="_blank">Resource Naming (RestApiTutorial.com)</a>
    </li>
    <li>
        <a href="https://www.thoughtworks.com/insights/blog/rest-api-design-resource-modeling" target="_blank">REST API Design - Resource Modeling (ThoughtWorks)</a>
    </li>
    <li>
        <a href="https://phauer.com/2015/restful-api-design-best-practices" target="_blank">RESTful API Design. Best Practices in a Nutshell (Philipp Hauer's Blog)</a>
    </li>
</ul>

<a href="https://phauer.com/2015/restful-api-design-best-practices/#use-consistently-plural-nouns" target="_blank">The accepted best practice for naming resources</a> is to use plural nouns when constructing a URI for a resource (e.g. <code>/widgets</code> instead of `/widget`). <a href="https://phauer.com/2015/restful-api-design-best-practices/#use-two-urls-per-resource" target="_blank">Another widely accepted standard</a> is to create two endpoints per resource &mdash; one for operations that apply to the entire collection (e.g., `/api/v1/widgets`) and one for operations that apply only to a single instance (e.g., `/api/v1/widgets/<name>`).

Another common architectural pattern is to expose methods which allow the client to perform CRUD operations on the resource. CRUD (**C**reate, **R**etrieve, **U**pdate, **D**elete) is a term that usually refers to relational database systems, but it is also valid for any dataset that can be manipulated by a client, including RESTful resources.

Now, you might be wondering how this can be accomplished if we only expose two endpoints per resource, and CRUD defines (at leat) four different operations. Table 1 shows how we will structure the API for our `Widget` resource:

<div id="table-1" class="table-wrapper">
    <div class="responsive">
        <table class="tutorial">
            <thead>
                <tr>
                    <td colspan="4" class="table-number">Table 1</td>
                </tr>
                <tr>
                    <td colspan="4" class="table-title">Widget API endpoint specifications</td>
                </tr>
                <tr>
                    <th scope="col" class="first-column column-header">Endpoint Name</th>
                    <th scope="col" class="column-header">URI</th>
                    <th scope="col"  class="column-header">HTTP Method</th>
                    <th scope="col" class="column-header">CRUD Operation</th>
                    <th scope="col" class="last-column column-header">Required Token</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="first-column">api.widget_list</td>
                    <td>/api/v1/widgets</td>
                    <td>POST</td>
                    <td>Create a new widget</td>
                    <td class="last-column">Admin user</td>
                </tr>
                <tr>
                    <td class="first-column">api.widget_list</td>
                    <td>/api/v1/widgets</td>
                    <td>GET</td>
                    <td>Retrieve a list of widgets</td>
                    <td class="last-column">Regular user</td>
                </tr>
                <tr>
                    <td class="first-column">api.widget</td>
                    <td>/api/v1/widgets/&lt;name&gt;</td>
                    <td>GET</td>
                    <td>Retrieve a single widget</td>
                    <td class="last-column">Regular user</td>
                </tr>
                <tr>
                    <td class="first-column">api.widget</td>
                    <td>/api/v1/widgets/&lt;name&gt;</td>
                    <td>PUT</td>
                    <td>Update an existing widget</td>
                    <td class="last-column">Admin user</td>
                </tr>
                <tr>
                    <td class="first-column">api.widget</td>
                    <td>/api/v1/widgets/&lt;name&gt;</td>
                    <td>DELETE</td>
                    <td>Delete a single widget</td>
                    <td class="last-column">Admin user</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

Each endpoint can be configured to respond to a unique set of HTTP method types. Per **Table 1**, the `api.widget_list` endpoint will support `GET` and `POST` requests, and the `api.widget` endpoint will suport `GET`, `PUT`, and `DELETE` requests. Each combination of endpoint and method type are mapped to a CRUD operation. The remainder of this section (and the entire next section) are devoted to implementing the `Widget` API.

<div class="alert alert-flex">
  <div class="alert-icon">
    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
  </div>
  <div class="alert-message">
    <p>Operations that create, modify or delete widgets are restricted to users with the administrator role. Regular (non-admin) users can only retrieve individual widgets and/or lists of widgets from the database.</p>
  </div>
</div>

## `flask add-user` Command

[Way back in Part 1](/series/flask_api_tutorial/part-1/#flask-cli-application-entry-point), we discussed the Flask CLI and created the method that executes when the `flask shell` command is invoked. The Flask CLI is based on a project called <a href="https://palletsprojects.com/p/click/" target="_blank">Click</a> which can be used to create powerful Python CLI applications, and is easy to get started with thanks to <a href="https://click.palletsprojects.com" target="_blank">excellent documentation</a>.

Currently, the `api/v1/auth/register` endpoint can only create regular (non-admin) users. We want to leave it this way since this endpoint is publically-accessible. However, we also need a way to create admin users since regular users cannot create, update or delete widget objects.

There are a few different methods we could use to create admin users. Using the `flask shell` command, we can execute arbitrary Python code to create admin users. Or, we could create a function and store it in a file in our project, then run the function through the command-line. However, both of these methods are cumbersome and would require documentation if anyone else needed to create an admin user.

My preferred solution is to expose a command in the Flask CLI that can create both regular and admin users. To do so, open `run.py` in the project root folder. First, update the import statements to include `click` (**Line 4** below):

{{< highlight python "linenos=table,hl_lines=4" >}}"""Flask CLI/Application entry point."""
import os

import click

from app import create_app, db
from app.models.token_blacklist import BlacklistedToken
from app.models.user import User{{< /highlight >}}

Then, add the content below and save the file:

{{< highlight python "linenos=table,linenostart=18" >}}@app.cli.command("add-user", short_help="add a new user")
@click.argument("email")
@click.option("--admin", is_flag=True, default=False, help="New user has administrator role")
@click.password_option(help="Do not set password on the command line!")
def add_user(email, admin, password):
    """Add a new user to the database with email address = EMAIL."""
    if User.find_by_email(email):
        error = f"Error: {email} is already registered"
        click.secho(f"{error}\n", fg="red", bold=True)
        return 1
    new_user = User(email=email, password=password, admin=admin)
    db.session.add(new_user)
    db.session.commit()
    user_type = "admin user" if admin else "user"
    message = f"Successfully added new {user_type}:\n {new_user}"
    click.secho(message, fg="blue", bold=True)
    return 0{{< /highlight >}}

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil" aria-hidden="true"></i>
  </div>
  <div class="note-message" style="flex-flow: column wrap">
    <p style="margin: 0 0 10px">Explaining how to create a command with click is beyond the scope of this tutorial. Thankfully, the click documentation is exceptional. If you are interested, you can find everything you need to understand the <code>add_user</code> function in the links below:</p>
    <ul style="color: #86C8F9; list-style: square; margin: 0 0 10px 35px">
      <li><a href="https://click.palletsprojects.com/en/7.x/quickstart/#basic-concepts-creating-a-command" target="_blank">Basic Concepts - Creating a Command</a></li>
      <li><a href="https://click.palletsprojects.com/en/7.x/quickstart/#echoing" target="_blank">Echoing</a></li>
      <li><a href="https://click.palletsprojects.com/en/7.x/quickstart/#adding-parameters" target="_blank">Adding Parameters</a></li>
      <li><a href="https://click.palletsprojects.com/en/7.x/arguments/#basic-arguments" target="_blank">Basic Arguments</a></li>
      <li><a href="https://click.palletsprojects.com/en/7.x/options/#boolean-flags" target="_blank">Boolean Flags</a></li>
      <li><a href="https://click.palletsprojects.com/en/7.x/options/#password-prompts" target="_blank">Password Prompts</a></li>
      <li><a href="https://click.palletsprojects.com/en/7.x/documentation/#help-texts" target="_blank">Help Texts</a></li>
      <li><a href="https://click.palletsprojects.com/en/7.x/documentation/#documenting-arguments" target="_blank">Documenting Arguments</a></li>
      <li><a href="https://click.palletsprojects.com/en/7.x/documentation/#command-short-help" target="_blank">Command Short Help</a></li>
      <li><a href="https://click.palletsprojects.com/en/7.x/utils/#ansi-colors" target="_blank">ANSI Colors</a></li>
    </ul>
    <p style="margin: 0 0 5px">Finally, the Flask documentation explains <a href="https://flask.palletsprojects.com/en/1.0.x/cli/#custom-commands" target="_blank">how to add custom commands to the Flask CLI</a>. Coincidentally, the example given in the documentation is a command to create a new user.</p>
  </div>
</div>

You might be wondering how is this different than the idea I dismissed, <span class="bold-italics">"create a function and store it in a file in our project, then run the function through the command-line"</span>? The main difference is discoverability &mdash; Flask automatically includes a CLI with all installations and extending the CLI with custom commands is one of the intended use cases.

Also, help documentation is automatically generated for CLI commands (via click). You can view the documentation for the `add-user` command by running `flask add-user --help`:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask add-user --help</span>
<span class="cmd-results">Usage: flask add-user [OPTIONS] EMAIL

  Add a new user to the database with email address = EMAIL.

Options:
  --admin          New user has administrator privileges
  --password TEXT  Do not set password on the command line!
  --help           Show this message and exit.</span></code></pre>

Users can view all Flask CLI commands, including custom commands by running `flask`:

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
  <span class="highlite">add-user  add a new user</span>
  db        Perform database migrations.
  routes    Show the routes for the app.
  run       Run a development server.
  shell     Run a shell in the app context.</span></code></pre>

This is my preferred solution because the process for creating admin users is now documented, and the command is accessible only to those with access to the server where the flask instance is running.

Finally, let's demonstrate how to use the `flask add-user` command:

<ul style="list-style: none; margin: 0 0 20px 0">
  <li>
    <p style="margin: 0 0 5px"><span class="bold-text">Create regular user</span></p>
    <pre style="margin: 5px 0 20px"><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask add-user user@test.com</span>
<span class="cmd-results">Password:
Repeat for confirmation:
<span class="light-blue bold-text">Successfully added new user:
 &lt;User email=user@test.com, public_id=be5e164e-7d33-4919-8d37-a5d02ca27d47, admin=False&gt;</span></span></code></pre>
  </li>
  <li>
    <p style="margin: 0 0 5px"><span class="bold-text">Create admin user</span></p>
    <pre style="margin: 5px 0 20px"><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask add-user admin@test.com --admin</span>
<span class="cmd-results">Password:
Repeat for confirmation:
<span class="light-blue bold-text">Successfully added new admin user:
 &lt;User email=admin@test.com, public_id=1e248b12-e08b-467f-86bf-80f547f20ce6, admin=True&gt;</span></span></code></pre>
  </li>
  <li>
    <p style="margin: 0 0 5px"><span class="bold-text">Error: Email already exists</span></p>
    <pre style="margin: 5px 0 20px"><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask add-user user@test.com</span>
<span class="cmd-results">Password:
Repeat for confirmation:
<span class="pink bold-text">Error: user@test.com is already registered</span></span></code></pre>
  </li>
</ul>

As you can see, after running the command, the user is immediately prompted to create a password and to confirm the password for the new user. Before proceeding, please create an admin user with the `flask add-user` command since creating, modifying and deleting widgets cannot be performed otherwise.

## `Widget` DB Model

Before we can begin implementing the API endpoints in **Table 1**, we need to create a database table to store `Widget` instances. To do so, we extend `db.Model` (just like we did for the `User` and `BlacklistedToken` classes). Create a new file `widget.py` in `/app/models` and add the content below:

{{< highlight python "linenos=table" >}}"""Class definition for Widget model."""
from datetime import datetime, timezone, timedelta

from flask import url_for
from sqlalchemy.ext.hybrid import hybrid_property

from app import db
from app.util.datetime_util import (
    utc_now,
    format_timedelta_str,
    get_local_utcoffset,
    localized_dt_string,
    make_tzaware,
)


class Widget(db.Model):
    """Widget model for a generic resource in a REST API."""

    __tablename__ = "widget"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    info_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=utc_now)
    deadline = db.Column(db.DateTime)

    owner_id = db.Column(db.Integer, db.ForeignKey("site_user.id"), nullable=False)
    owner = db.relationship("User", backref=db.backref("widgets"))

    def __repr__(self):
        return f"<Widget name={self.name}, info_url={self.info_url}>"

    @hybrid_property
    def created_at_str(self):
        created_at_utc = make_tzaware(self.created_at, use_tz=timezone.utc, localize=False)
        return localized_dt_string(created_at_utc, use_tz=get_local_utcoffset())

    @hybrid_property
    def deadline_str(self):
        deadline_utc = make_tzaware(self.deadline, use_tz=timezone.utc, localize=False)
        return localized_dt_string(deadline_utc, use_tz=get_local_utcoffset())

    @hybrid_property
    def deadline_passed(self):
        return datetime.now(timezone.utc) > self.deadline.replace(tzinfo=timezone.utc)

    @hybrid_property
    def time_remaining(self):
        time_remaining = self.deadline.replace(tzinfo=timezone.utc) - utc_now()
        return time_remaining if not self.deadline_passed else timedelta(0)

    @hybrid_property
    def time_remaining_str(self):
        timedelta_str = format_timedelta_str(self.time_remaining)
        return timedelta_str if not self.deadline_passed else "No time remaining"

    @hybrid_property
    def uri(self):
        return url_for("api.widget", name=self.name, _external=True)

    @classmethod
    def find_by_name(cls, name):
        return cls.query.filter_by(name=name).first(){{< /highlight >}}

To demonstrate the process of serializing a complex object to/from JSON, the `Widget` class includes attributes with as many different data types as possible. Additionally, the project requirements include various rules restricting which values are considered valid for the `name` and `deadline` attributes:

<ul class="alert italics" style="font-size: 0.9em">
    <li>The widget model contains a "name" field which must be a string value containing only lowercase-letters, numbers and the "-" (hyphen character) or "_" (underscore character).</li>
    <li>The widget model contains attributes with URL, datetime, timedelta and bool data types, along with normal text fields.</li>
</ul>

Let's take a look at how these attributes are defined and how they fulfill the various project requirements:

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 23: </strong><span class="bold-text">Table 1</span> indicates that the value of the <code>name</code> attribute will be embedded in the URI for each <code>Widget</code>. Because of this, the value must be unique which is ensured by setting <code>unique=True</code>. Additionally, it would be ideal to prevent the user from creating a new <code>widget</code> if the <code>name</code> contains characters that are not URL-safe (/, +, & etc.). To accomplish this, we will design a custom <code>RequestParser</code> data type that considers a value to be valid if it contains <span class="emphasis">ONLY</span> lowercase-letters, numbers, underscore and/or hyphen characters.</p>
      </li>
      <li>
        <p><strong>Line 24: </strong>The purpose of the <code>info_url</code> attribute is to demonstrate how to implement input validation for URL values. Any values that are not recognized as a valid URL must be rejected without adding the widget to the database. The validation logic will be implemented using a built-in <code>RequestParser</code> data type for URL values.</p>
      </li>
      <li>
        <p><strong>Line 26: </strong>The purpose of the <code>deadline</code> attribute is to demonstrate how to implement input validation for <code>datetime</code> values. Additionally, only <code>datetime</code> values that are either the same as or greater than the current date are considered valid. Values not recognized as valid <code>datetime</code> values <span class="emphasis">AND</span> valid <code>datetime</code> values in the past must be rejected without adding the widget to the database.</p>
      </li>
      <li>
        <p><strong>Lines 28-29: </strong>We will also use the <code>Widget</code> class to demonstrate how relationships between database tables are defined and managed. We have defined a foreign key relationship between this table and the <code>site_user</code> table. The <code>owner</code> of each widget will be the <code>User</code> that created it (The <code>User.id</code> attribute will be stored when each <code>Widget</code> is created).</p>
      </li>
      <li>
        <p><strong>Lines 34-42: </strong>Both of these hybrid properties convert the datetime value stored in the database to the timezone of the machine executing the code and formats the datetime as a string value.</p>
      </li>
      <li>
        <p><strong>Lines 44-46: </strong><code>deadline_passed</code> is a bool value, this has been included as part of the <code>Widget</code> model solely to increase the number of data types that are serialized when <code>Widget</code> objects are included in an HTTP response. This attribute should return <code>True</code> if the curent date is greater than the date stored in <code>deadline</code>, and should return <code>False</code> if the current date is less than or the same as the date stored in <code>deadline</code>.</p>
      </li>
      <li>
        <p><strong>Lines 48-51: </strong><code>time_remaining</code> is a <code>timedelta</code> value that represents the time remaining until the <code>deadline</code> is passed. If the curent date is greater than the date stored in <code>deadline</code>, then this attribute should return <code>timedelta(0)</code>.</p>
      </li>
      <li>
        <p><strong>Lines 53-56: </strong><code>time_remaining_str</code> converts the <code>timedelta</code> object returned by <code>time_remaining</code> to a formatted string if the <code>deadline</code> has not been passed. If the <code>deadline</code> has passed, <span class="bold-text">"No time remaining"</span> is returned.</p>
      </li>
      <li>
        <p><strong>Lines 58-60: </strong><code>uri</code> is the API endpoint where clients can interact with this specific widget. The <code>url_for</code> function is used to dynamically construct the URL path (we have previously used the <code>url_for</code> function in test cases for <code>auth_ns</code> endpoints).</p>
      </li>
      <li>
        <p><strong>Lines 62-64: </strong><code>find_by_name</code> is a class method just like the <code>find_by_email</code> and <code>find_by_public_id</code> methods we previously created in the <code>User</code> class. Since the <code>name</code> attribute must be unique, we can use it to retrieve a specific <code>Widget</code>.</p>
      </li>
    </ul>
</div>

Next, we need to update `run.py` in order for the Flask-Migrate extension to recognize the <code>Widget</code> class and create a migration script that adds the new table to the database (this is the same process we previously performed for the User class in [Part 2](/series/flask_api_tutorial/part-2/#user-db-model) and for the BlacklistedToken class in [Part 4](/series/flask_api_tutorial/part-4/#blacklistedtoken-db-model)).

Open `run.py` in the project root folder and update the import statements to include the `Widget` class **(Line 9)**. Then add the `Widget` class to the `dict` object that is returned by the `make_shell_context` function **(Line 16)**:

{{< highlight python "linenos=table,hl_lines=9 16" >}}"""Flask CLI/Application entry point."""
import os

import click

from app import create_app, db
from app.models.token_blacklist import BlacklistedToken
from app.models.user import User
from app.models.widget import Widget

app = create_app(os.getenv("FLASK_ENV", "development"))


@app.shell_context_processor
def make_shell_context():
    return {"db": db, "User": User, "BlacklistedToken": BlacklistedToken, "Widget": Widget}{{< /highlight >}}

Next, run <code>flask db migrate</code> and add a message explaining the changes that will be made by executing this migration script:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask db migrate --message "add widget table"</span>
<span class="cmd-results">INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.autogenerate.compare] Detected added table 'widget'
  Generating /Users/aaronluna/Projects/flask-api-tutorial/migrations/versions/fdd8ca8d8666_add_widget_table.py ... done</span></code></pre>

<div class="note note-flex">
    <div class="note-icon">
        <i class="fa fa-pencil" aria-hidden="true"></i>
    </div>
    <div class="note-message" style="flex-flow: column wrap">
        <p>You can verify that the <code>widget</code> table was detected by the Flask Migrate extension from the output of the <code>flask db migrate</code> command. You should see a message similar to the example above (<strong>Detected added table 'widget'</strong>), followed by a statement indicating the migration script was successfully generated.</p>
    </div>
</div>

Next, run <code>flask db upgrade</code> to run the migration script on the database in your development environment:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask db upgrade</span>
<span class="cmd-results">INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade 8fa4b4909211 -> fdd8ca8d8666, add widget table</span></code></pre>

After the `widget` table has been added to the database, we can begin implementing the API endpoints specified in [Table 1](#table-1).

## Create Widget

So where should we begin? In my opinion, the endpoint that should be implemented first is the endpoint responsible for the create operation, since without `Widget` objects there's nothing to be retrieved, updated or deleted. In [Part 3](/series/flask_api_tutorial/part-3/#auth-ns-endpoints) we followed the process below for each endpoint in the `auth_ns` namespace. We will follow the same process to implement the `widget_ns` endpoints in **Table 1**:

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
      <li>Document the <code>Resource</code> class and methods which handle HTTP requests <a href="https://flask-restplus.readthedocs.io/en/stable/swagger.html" target="_blank">as explained in the Flask-RESTPlus docs</a>. Most of the content on the Swagger UI page is generated by decorating the concrete <code>Resource</code> classes created in <strong>Step 3</strong> and the handler methods in <strong>Step 4</strong>.</li>
      <li>Import the business logic functions created in <strong>Step 2</strong> and call them within the HTTP method that corresponds to the operation performed by the business logic.</li>
      <li>Create unit tests to verify that the input validation provided by the request parsers/API models is working correctly, and verify the endpoint behaves as expected.</li>
    </ol>
</div>

Step 1 says <span class="bold-italics">create request parsers/API models to validate request data and serialize response data</span>. So let's dive into it!

### `widget_reqparser` Request Parser

When a client sends a request to create a new `Widget`, what data is required? Take a look at the attributes of the `Widget` class:

{{< highlight python "linenos=table,linenostart=22,hl_lines=2-3 5" >}}id = db.Column(db.Integer, primary_key=True, autoincrement=True)
name = db.Column(db.String(100), unique=True, nullable=False)
info_url = db.Column(db.String(255))
created_at = db.Column(db.DateTime, default=utc_now)
deadline = db.Column(db.DateTime)

owner_id = db.Column(db.Integer, db.ForeignKey("site_user.id"), nullable=False)
owner = db.relationship("User", backref=db.backref("widgets")){{< /highlight >}}

<p style="margin: 0 0 10px">The client must provide values for the three attributes highlighted above (<code>name</code>, <code>info_url</code> and <code>deadline</code>). What about the other attributes?</p>

<div style="font-size: 0.9em; padding: 5px; line-height: 1.5">
    <ul>
      <li>
        <p><span class="bold-text">id: </span>This is the database table's primary key. The value is automatically set when a <code>Widget</code> is committed to the database (starting at one, then incrementing by one each time a <code>Widget</code> is added).</p>
      </li>
      <li>
        <p><span class="bold-text">created_at: </span>When a <code>Widget</code> object is created, the expression specified in the <code>default</code> parameter is evaluated and stored as the value for <code>created_at</code>. <code>utc_now</code> returns the current date and time as a <code>datetime</code> value that is timezone-aware and localized to UTC.</p>
      </li>
      <li>
        <p><span class="bold-text">owner_id: </span>This value is a foreign-key, which is indicated by <code>db.ForeignKey("site_user.id")</code>. <span class="bold-text">site_user</span> is the name of the database table where <code>User</code> objects are stored, and <span class="bold-text">site_user.id</span> is the primary-key that the <code>owner_id</code> column is referencing.</p>
      </li>
      <li>
        <p><span class="bold-text">owner: </span>It is important to note that <code>owner</code> is <span class="emphasis">NOT</span> an instance of <code>db.Column</code>. This means that unlike the other <code>Widget</code> class attributes, <code>owner</code> is not a column that exists in the <code>widget</code> database table. Instead, this is a relationship object that demonstates one of the main features of the SQLAlchemy ORM (<a href="https://docs.sqlalchemy.org/en/13/orm/basic_relationships.html#one-to-many" target="_blank">Click here</a> for more information).</p>
        <p>When processing a request to create a new <code>Widget</code>, the business logic will set the value of the <code>owner_id</code> attribute to the <code>id</code> of the <code>User</code> who sent the request. After the <code>Widget</code> is created and committed to the database, the <code>owner</code> attribute will contain a <code>User</code> object that represents the <code>User</code> who created it.</p>
        <p>Another interesting feature is achieved by <code>backref=db.backref("widgets")</code>. This creates a new attribute on all <code>User</code> objects named <span class="bold-text">widgets</span> (without modifying the <code>User</code> class at all), which is a list of all <code>Widget</code> objects in the database where <code>User.id</code> is equal to <code>owner_id</code>.</p>
      </li>
    </ul>
</div>

Flask-RESTPlus includes helpful pre-defined types (e.g., email, URL, etc.) in the `inputs` module for validating request data. When we created the `auth_reqparser` in [Part 3](/series/flask_api_tutorial/part-3/#auth-reqparser-request-parser), we imported the `email` class from `flask_restplus.inputs` to verify if a value provided by the client is a valid email address. You can also define custom input types if none of the pre-defined types are sufficient, and we will do so for both the `name` and `deadline` attributes.

Create a new file named `dto.py` in `app/api/widgets` and enter the content below:

{{< highlight python "linenos=table" >}}"""Parsers and serializers for /widgets API endpoints."""
import re
from datetime import date, datetime, time, timezone
from dateutil import parser

from flask_restplus.inputs import URL
from flask_restplus.reqparse import RequestParser

from app.util.datetime_util import make_tzaware, DATE_MONTH_NAME


def widget_name(name):
    """Validation method for a string containing only letters, numbers, '-' and '_'."""
    if not re.compile(r"^[\w-]+$").match(name):
        raise ValueError(
            f"'{name}' contains one or more invalid characters. Widget name must contain "
            "only letters, numbers, hyphen and underscore characters."
        )
    return name


def future_date_from_string(date_str):
    """Validation method for a date formatted as a string, the date must NOT be in the past."""
    try:
        parsed_date = parser.parse(date_str)
    except ValueError:
        raise ValueError(
            f"Failed to parse '{date_str}' as a valid date. You can use any format recognized "
            "by dateutil.parser. For example, all of the strings below are valid ways to "
            "represent the same date: '2018-5-13' -or- '05/13/2018' -or- 'May 13 2018'."
        )

    if parsed_date.date() < date.today():
        raise ValueError(
            f"Successfully parsed {date_str} as {parsed_date.strftime(DATE_MONTH_NAME)}. "
            "However, this value must be a date in the future and "
            f"{parsed_date.strftime(DATE_MONTH_NAME)} is BEFORE "
            f"{datetime.now().strftime(DATE_MONTH_NAME)}"
        )
    deadline = datetime.combine(parsed_date.date(), time.max)
    deadline_utc = make_tzaware(deadline, use_tz=timezone.utc)
    return deadline_utc


widget_reqparser = RequestParser(bundle_errors=True)
widget_reqparser.add_argument(
    "name",
    type=widget_name,
    location="form",
    required=True,
    nullable=False,
    case_sensitive=True,
)
widget_reqparser.add_argument(
    "info_url",
    type=URL(schemes=["http", "https"]),
    location="form",
    required=True,
    nullable=False,
)
widget_reqparser.add_argument(
    "deadline",
    type=future_date_from_string,
    location="form",
    required=True,
    nullable=False,
){{< /highlight >}}

Let's break this down by looking at how each of the attributes are validated by the code above:

#### `name` Argument

None of <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#module-flask_restplus.inputs" target="_blank">the pre-defined types in the <code>flask_restplus.inputs</code> module</a> perform input validation that satisfies the requirements of the `name` attribute. Thankfully, <a href="https://flask-restplus.readthedocs.io/en/stable/parsing.html#advanced-types-handling" target="_blank">Flask-RESTPlus provides a way to create custom types</a> that can be used in the same way. The example of a custom type shown below is taken from the documentation:

{{< highlight python >}}def my_type(value):
    '''Parse my type'''
    if not condition:
        raise ValueError('This is not my type')
    return parse(value){{< /highlight >}}

The term "type" is (IMO) misleading since we only need to create a function (not a class). The function must accept at least one parameter &mdash; the value provided by the client. If the value is successfully validated, the function must convert the value to the expected data type before returning it (in the case of the `name` attribute, the expected type is a string so no conversion is necessary). If the value provided by the client is invalid, the method must raise a `ValueError`.

The `widget_name` function is adapted directly from the example shown above to satisfy the project requirements:

{{< highlight python "linenos=table,linenostart=12" >}}def widget_name(name):
    """Validation method for a string containing only letters, numbers, '-' and '_'."""
    if not re.compile(r"^[\w-]+$").match(name):
        raise ValueError(
            f"'{name}' contains one or more invalid characters. Widget name must contain "
            "only letters, numbers, hyphen and underscore characters."
        )
    return name{{< /highlight >}}

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 14: </strong>The simplist way to implement our custom type is with a regular expression. The regex <code>^[\w-]+$</code> will match any string that consists of <span class="emphasis">ONLY</span> alphanumeric characters (which includes the underscore character) and the hyphen character.</p>
        <p>The syntax of regular expressions is extremely dense. To make any regex easier to understand, we could compile it with the <code>re.VERBOSE</code> flag. This causes whitespace that is not within a character class to be ignored, allowing us to place comments within the regex to document the design and the effect of each component of the expression. For example, we could document our regex as shown below (I am only showing this for demonstration purposes, and have not modified the code in <code>app/api/widgets/dto.py</code>):</p>
        <pre><code style="color: #f8f8f2">NAME_REGEX = re.compile(<span style="color: #ed9d13">r"""
    ^        # Matches the beginning of the string
    [\w-]    # Character class: \w matches all alphanumeric characters (including underscore), - matches the hyphen character
    +        # Match one or more instances of the preceding character class
    $        # Matches the end of the string
"""</span>, re.VERBOSE)</code></pre>
        <div class="note note-flex">
            <div class="note-icon">
                <i class="fa fa-pencil" aria-hidden="true"></i>
            </div>
            <div class="note-message" style="flex-flow: column wrap">
                <p>Teaching regular expressions is beyond the scope of this tutorial. However, if you are looking for a good introduction to the topic I recommend reading <a href="https://docs.python.org/3/howto/regex.html" target="_blank">Regular Expression HOWTO</a> from the official Python docs.</p>
            </div>
        </div>
      </li>
      <li>
        <p><strong>Line 15: </strong>If the value does not match the regex, a <code>ValueError</code> is raised with a message explaining why the value is not a valid <code>widget_name</code>.</p>
      </li>
      <li>
        <p><strong>Line 19: </strong>If the value passed to this function matches the regex, the value is a valid <code>widget_name</code> and is returned.</p>
      </li>
    </ul>
</div>

We can see how this function works by testing it in the `flask shell`:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask shell</span>
<span class="cmd-repl-results">Python 3.7.4 (default, Jul 20 2019, 23:16:09)
[Clang 10.0.1 (clang-1001.0.46.4)] on darwin
App: flask-api-tutorial [development]
Instance: /Users/aaronluna/Projects/flask-api-tutorial/instance</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from app.api.widgets.dto import widget_name</span>
<span class="cmd-repl-comment"># 1. 'test' is a valid widget_name</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">widget_name("test")</span>
<span class="cmd-repl-results">'test'</span>
<span class="cmd-repl-comment"># 2. 'test_1-AZ' is a valid widget_name</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">widget_name("test_1-AZ")</span>
<span class="cmd-repl-results">'test_1-AZ'</span>
<span class="cmd-repl-comment"># 3. 'some widget' is NOT a valid widget_name</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">widget_name("some widget")</span>
<span class="cmd-repl-results">Traceback (most recent call last):
  File "&lt;console&gt;", line 1, in &lt;module&gt;
  File "/Users/aaronluna/Projects/flask-api-tutorial/app/api/widgets/dto.py", line 18, in widget_name
    f"'{name}' contains one or more invalid characters. Widget name must contain "</span>
<span class="cmd-warning">ValueError: 'some widget' contains one or more invalid characters. Widget name must contain only letters, numbers, hyphen and/or underscore characters.</span>
<span class="cmd-repl-comment"># 4. 't**&*&' is NOT a valid widget_name</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">widget_name("t**&*&")</span>
<span class="cmd-repl-results">Traceback (most recent call last):
  File "&lt;console&gt;", line 1, in &lt;module&gt;
  File "/Users/aaronluna/Projects/flask-api-tutorial/app/api/widgets/dto.py", line 18, in widget_name
    f"'{name}' contains one or more invalid characters. Widget name must contain "</span>
<span class="cmd-warning">ValueError: 't**&*&' contains one or more invalid characters. Widget name must contain only letters, numbers, hyphen and/or underscore characters.</span></code></pre>

The first test passes since **test** consists of only letters. The second test passes because it contains one of each of the allowed character types (letter, number, hyphen, underscore) and no other characters. The third and fourth tests fail because they both contain one or more forbidden characters (space, asterisk, ampersand).

Wait, let's back up. Didn't the requirement for the `name` attribute say that only **lowercase** letters were allowed? Yep, you got me. I kinda sort-of lied about **test_1-AZ** being a valid `widget_name`. But there is a reason why I did this, which will be revealed by the configuration of the argument object for the `name` attribute:

{{< highlight python "linenos=table,linenostart=50" >}}widget_reqparser.add_argument(
    "name",
    type=widget_name,
    location="form",
    required=True,
    nullable=False,
    case_sensitive=True,
){{< /highlight >}}

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 52: </strong>All we need to do to use our custom type is set the value of the <code>type</code> parameter to the <code>widget_name</code> function.</p>
      </li>
      <li>
        <p><strong>Lines 53-55: </strong>The <code>location</code>, <code>required</code> and <code>nullable</code> parameters should be familiar since we explained their purpose in <a href="/series/flask_api_tutorial/part-3/#request-parser-configuration">Part 3</a>.</p>
      </li>
      <li>
        <p><strong>Line 56: </strong>This is the first time we are using the <code>case_sensitive</code> parameter. <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.reqparse.Argument" target="_blank">According to the documentation</a>, if <code>case_sensitive=True</code> "this will convert all values to lowercase".</p>
      </li>
    </ul>
</div>

Configuring the `name` argument with `type=widget_name` and `case_sensitive=True` allows the client to provide a value for the widget name in any combination of upper and lowercase letters. When an HTTP request is received to create a widget, if the request contains a `name` attribute, the value of that attribute will be passed to the `widget_name` function.

If the widget name contains only valid characters, it will be converted to lowercase before being passed to the business logic. The business logic will query the database for widgets with the same name. If a widget is found with the same name, the request will be aborted and the widget will not be created. If no widget is found with the same name, a new widget object will be created and added to the database.

#### `info_url` Argument

{{< highlight python "linenos=table,linenostart=58" >}}widget_reqparser.add_argument(
    "info_url",
    type=URL(schemes=["http", "https"]),
    location="form",
    required=True,
    nullable=False,
){{< /highlight >}}

The `info_url` attribute can be parsed using the pre-defined `URL` type from the `inputs` module, which can be configured in numerous ways. For example, it is possible to restrict the allowed values to a whitelist of domains and/or exclude a blacklist of domains. You can choose to perform a DNS lookup on the domain specified by the client and reject the value if the domain fails to resolve. <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.inputs.URL" target="_blank">Check out the documentation for the <code>URL</code> type</a> for even more ways you can control the allowed URL range/format.

The only restriction on `info_url` that we will employ is that the URL scheme must be either `http` or `https`. This can be more useful than you may think. Imagine if the `Widget` class had `git_url` and `ssh_url` attributes in addition to `info_url`. By simply changing the value of the `schemes` parameter from `schemes=['http', 'https']` to `schemes=['git']` and `schemes=['ssh']`, we could easily and effectively prevent clients from inserting values into the database that would cause errors if an application blindly tried to use those URLs to access a git repository or login to a server.

<div class="alert alert-flex">
  <div class="alert-icon">
    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
  </div>
  <div class="alert-message">
    <p>The value of the <code>schemes</code> parameter must always be a list or tuple, even if you intend to limit the allowed URL values to a single scheme.</p>
  </div>
</div>

There really isn't anything else to say about how the `info_url` attribute is parsed since we already covered using a pre-defined `input` type when we used the `email` type as part of the `auth_reqparser` in [Part 3](/series/flask_api_tutorial/part-3/#auth-reqparser-request-parser). So let's move on to something a bit more interesting.

#### `deadline` Argument

`deadline` is the last piece of data that we must receive from the client in order to create a new widget. Utlimately, this value must be converted to a `datetime` since the `Widget` class has several `hybrid_properties` that perform comparisons or calculations that assume this is the case. The `inputs` module provides several pre-defined types that can convert request data to either a `date` or a `datetime` value. I've summarized the requirements for these types in **Table 2** below:

<div class="table-wrapper">
    <div class="responsive">
        <table class="tutorial">
            <thead>
                <tr>
                    <td colspan="4" class="table-number">Table 2</td>
                </tr>
                <tr>
                    <td colspan="4" class="table-title">Pre-defined Input Types for <code>date</code> and <code>datetime</code> Values</td>
                </tr>
                <tr>
                    <th scope="col" class="first-column column-header">Pre-defined Type <sup>1</sup></th>
                    <th scope="col" class="column-header">Required Format <sup>2</sup></th>
                    <th scope="col" class="column-header">Example</th>
                    <th scope="col" class="last-column column-header">Reference</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="first-column"><code>date</code></td>
                    <td><code class="green">YYYY<span class="pink">-</span>MM<span class="pink">-</span>DD</code></td>
                    <td>2019-10-02</td>
                    <td class="last-column">N/A</td>
                </tr>
                <tr>
                    <td class="first-column"><code>date_from_iso8601</code></td>
                    <td><code class="green">YYYY<span class="pink">-</span>MM<span class="pink">-</span>DD</code></td>
                    <td>2019-10-02</td>
                    <td class="last-column"><a href="https://www.iso.org/iso-8601-date-and-time-format.html" target="_blank">ISO 8601</a></td>
                </tr>
                <tr>
                    <td class="first-column"><code>datetime_from_iso8601</code></td>
                    <td><code class="green">YYYY<span class="pink">-</span>MM<span class="pink">-</span>DD<span class="pink">T</span>hh<span class="pink">:</span>mm<span class="pink">:</span>ss<span class="pink">(+/-)</span>zh<span class="pink">:</span>zm</code></td>
                    <td>2019-10-02T15:05:06-07:00</td>
                    <td class="last-column"><a href="https://www.iso.org/iso-8601-date-and-time-format.html" target="_blank">ISO 8601</a></td>
                </tr>
                <tr>
                    <td class="first-column"><code>datetime_from_rfc822</code></td>
                    <td><code class="green">DN<span class="pink">, </span>DD MN YYYY hh<span class="pink">:</span>mm<span class="pink">:</span>ss <span class="pink">(+/-)</span>zhzm</code></td>
                    <td>Wed, 02 Oct 2019 15:05:06 -0700</td>
                    <td class="last-column"><a href="https://tools.ietf.org/html/rfc5322#section-3.3" target="_blank">RFC 5322</a> <sup>3</sup></td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4" class="table-footer"><sup>1</sup> Pre-defined types are located in the <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#module-flask_restplus.inputs" target="_blank"><code class="light-blue">flask_restplus.inputs</code></a> module.</td>
                </tr>
                <tr>
                    <td colspan="4" class="table-footer">
                      <p><sup>2</sup> <code>YYYY</code> = 4-digit year, <code>MM</code> = 2-digit month, <code>DD</code> = 2-digit day,</p>
                      <p><code>hh</code> = 2-digit hour, <code>mm</code> = 2-digit minutes, <code>ss</code> = 2-digit seconds,</p>
                      <p><code>zh</code> = 2-digit UTC offset hours, <code>zm</code> = 2-digit UTC offset minutes,</p>
                      <p><code>DN</code> (Day Name) = "Mon" / "Tue" / "Wed" / "Thu" / "Fri" / "Sat" / "Sun",</p>
                      <p><code>MN</code> (Month Name) = "Jan" / "Feb" / "Mar" / "Apr" / "May" / "Jun" / "Jul" / "Aug" / "Sep" / "Oct" / "Nov" / "Dec"</p>
                    </td>
                </tr>
                <tr>
                    <td colspan="4" class="table-footer"><sup>3</sup> RFC 5322 is a revision of <a href="https://tools.ietf.org/html/rfc2822" target="_blank">RFC 2822</a>, which itself obsoleted <a href="https://tools.ietf.org/html/rfc822" target="_blank">RFC 822</a></td>
                </tr>
            </tfoot>
        </table>
    </div>
</div>

It would absolutely be possible to satisfy the project requirements using the pre-defined types in **Table 2**, but (IMO) they all have one big limitation &mdash; there is only a single valid format for the value provided by the client. Dates are expressed in so many different ways via text, so my preference is to design a parser that can accommodate a variety of date formats.

There is also a problem that arises from the project requirements for the `deadline` attribute: the value must not be a date in the past. Since the pre-defined types only validate that the value provided by the client is in the proper format to be converted to a `datetime` value, we would have to perform the task of checking if the date provided by the client is in the past in the business logic.

This second issue is another matter of opinion, since you could easily object by pointing out that the `name` attribute has a requirement to be unique and the task of querying the database for widgets with the same name is not performed in the `wiget_name` function we just created.

I'll explain the distinction between these two requirements with a hypothetical situation: A request is received to create a new widget with `name="test"`. This is a valid widget name, so the request is passed to the business logic and since no widget already exists in the database with `name="test"`, a new widget is created. Then, an identical request is received to create a widget with `name="test"`. IMO, from the point-of-view of the `widget_reqparser`, `test` is a valid widget name, so the request is again passed to the business logic. However, since a widget already exists with `name="test"`, the request is aborted with a message indicating that a widget already exists in the database with `name="test"`.

OTOH, consider this scenario: A request is received to create a new widget with `deadline="1923-03-28"`. This string is in a valid format but since the date is obviously in the past, the `widget_reqparser` raises a `ValueError` and the request is aborted. A `deadline` in the past is always invalid and a request to create a widget containing an invalid value for a required parameter must always be rejected. Hopefully my reasoning makes sense to you.

##### `dateutil.parser`

Since the pre-defined types are adequate but inflexible, what can we use to parse a `date` value from a string? If we wanted to restrict ourselves to the Python standard library, we would need to create a complicated function that uses the `strptime` method of either the `date` or `datetime` class. This would involve testing as many format strings as possible and would quickly become a nightmare.

Luckily, I see no reason to impose such a restriction for this project. IMO, the most robust and usable way to parse `datetime` values from a string is the `parse` function in the `dateutil.parser` module (this was listed as a requirement in the `setup.py` file, so it is already installed). Unlike `strptime`, this method does not require you to provide a format string.

`dateutil.parser.parse` recognizes a wide variety of `date` and `datetime` formats. The locale setting of the machine where the function is executed is taken into consideration, which is extremely helpful in situations where the order of the month and day values are transposed (e.g., US date format vs. European). You can find more information in <a href="https://dateutil.readthedocs.io/en/stable/parser.html" target="_blank">the official documentation for the `dateutil.parser` module</a>.

##### `future_date_from_string`

Since `deadline` must be either the current date or a date in the future, I decided to name the custom type function for this attribute `future_date_from_string`. This function is more complex than `widget_name` since two separate validations must be peformed &mdash; parsing the input string to a `date` value and checking that the parsed date is not in the past:

{{< highlight python "linenos=table,linenostart=23" >}}def future_date_from_string(date_str):
    """Validate a string is formatted correctly as a datetime value that is not in the past."""
    try:
        parsed_date = parser.parse(date_str)
    except ValueError:
        raise ValueError(
            f"Failed to parse '{date_str}' as a valid date. You can use any format recognized "
            "by dateutil.parser. For example, all of the strings below are valid ways to "
            "represent the same date: '2018-5-13' -or- '05/13/2018' -or- 'May 13 2018'."
        )

    if parsed_date.date() < date.today():
        raise ValueError(
            f"Successfully parsed {date_str} as {parsed_date.strftime(DATE_MONTH_NAME)}. "
            "However, this value must be a date in the future and "
            f"{parsed_date.strftime(DATE_MONTH_NAME)} is BEFORE "
            f"{datetime.now().strftime(DATE_MONTH_NAME)}"
        )
    deadline = datetime.combine(parsed_date.date(), time.max)
    deadline_utc = make_tzaware(deadline, use_tz=timezone.utc)
    return deadline_utc{{< /highlight >}}

There are a few things about the `future_date_from_string` function that are worth pointing out:

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 26: </strong></p>
      </li>
      <li>
        <p><strong>Lines 27-32: </strong></p>
      </li>
      <li>
        <p><strong>Line 34: </strong>.</p>
      </li>
      <li>
        <p><strong>Lines 35-40: </strong></p>
      </li>
      <li>
        <p><strong>Line 41: </strong>.</p>
      </li>
      <li>
        <p><strong>Lines 42-43: </strong></p>
      </li>
    </ul>
</div>

{{< highlight python "linenos=table,linenostart=65" >}}widget_reqparser.add_argument(
    "deadline",
    type=future_date_from_string,
    location="form",
    required=True,
    nullable=False,
){{< /highlight >}}

### `create_widget` Method

{{< highlight python "linenos=table" >}}"""Business logic for /widgets API endpoints."""
from http import HTTPStatus

from flask import jsonify
from flask_restplus import abort

from app import db
from app.api.auth.decorator import admin_token_required
from app.models.user import User
from app.models.widget import Widget


@admin_token_required
def create_widget(widget_dict):
    name = widget_dict["name"]
    if Widget.find_by_name(name):
        error = f"Widget name: {name} already exists, must be unique."
        abort(HTTPStatus.CONFLICT, error, status="fail")
    widget = Widget(**widget_dict)
    owner = User.find_by_public_id(create_widget.public_id)
    widget.owner_id = owner.id
    db.session.add(widget)
    db.session.commit()
    response = jsonify(status="success", message=f"New widget added: {widget.name}.")
    response.status_code = HTTPStatus.CREATED
    response.headers["Location"] = widget.uri
    return response{{< /highlight >}}

### `WidgetList` Resource (HTTP POST)

{{< highlight python "linenos=table" >}}"""API endpoint definitions for /widgets namespace."""
from http import HTTPStatus

from flask_restplus import Namespace, Resource

from app.api.auth.decorator import admin_token_required
from app.api.widget.dto import widget_reqparser
from app.api.widget.business import create_widget

widget_ns = Namespace(name="widgets", validate=True)


@widget_ns.route("", endpoint="widget_list")
class WidgetList(Resource):
    """Handles HTTP requests to URL: /widgets."""

    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.CREATED, "Added new widget.")
    @widget_ns.response(HTTPStatus.UNAUTHORIZED, "Unauthorized.")
    @widget_ns.response(HTTPStatus.FORBIDDEN, "Administrator token required.")
    @widget_ns.response(HTTPStatus.CONFLICT, "Widget name already exists.")
    @widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    @widget_ns.response(HTTPStatus.INTERNAL_SERVER_ERROR, "Internal server error.")
    @widget_ns.expect(widget_reqparser)
    @admin_token_required
    def post(self):
        """Add new widget."""
        request_data = widget_reqparser.parse_args()
        widget_dict = {k: v for k, v in request_data.items()}
        return create_widget(widget_dict){{< /highlight >}}

### Add `widget_ns` Namespace to `api`

{{< highlight python "linenos=table,hl_lines=6 21" >}}"""API blueprint configuration."""
from flask import Blueprint
from flask_restplus import Api

from app.api.auth.endpoints import auth_ns
from app.api.widget.endpoints import widget_ns


api_bp = Blueprint("api", __name__, url_prefix="/api/v1")
authorizations = {"Bearer": {"type": "apiKey", "in": "header", "name": "Authorization"}}

api = Api(
    api_bp,
    version="1.0",
    title="Flask API with JWT-Based Authentication",
    description="Welcome to the Swagger UI documentation for the Widget API",
    doc="/ui",
    authorizations=authorizations,
)
api.add_namespace(auth_ns, path="/auth")
api.add_namespace(widget_ns, path="/widgets"){{< /highlight >}}

### Unit Tests: `test_create_widget.py`
