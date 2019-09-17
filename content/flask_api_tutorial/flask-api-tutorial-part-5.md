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
|   |   |- <span class="unmodified-file">result.py</span>
|   |   |- <span class="work-file">datetime_util.py</span>
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

In the previous section, we created four API endpoints to perform basic user registration and authentication operations. However, these API endpoints <span class="emphasis">are not</span> designed as RESTful resources (I explained [my reasoning for this choice in Part 3](/series/flask_api_tutorial/part-3/#user-authentication-in-a-restful-system)).

In this section of the tutorial, we will create a resource that is REST-like. I am deliberately <span class="emphasis">NOT</span> describing it as RESTful, because <strong>designing a truly RESTful system is</strong> <span class="emphasis">HARD</span>. Check out <a href="https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven" target="_blank">this blog post from Roy Fielding</a> and the discussion in the comments to get an idea of what I mean.

The only features of this resource that I am willing to state are 100% bona fide REST-compliant are:

<ul>
  <li>The naming convention of the resource and associated endpoints.</li>
  <li>The HTTP methods supported by each endpoint that enables clients to perform CRUD operations.</li>
  <li>Through the use of pagination and navigational links included in JSON sent by the server, clients can interact with the API purely through hypertext (i.e., clients <span class="emphasis">NEVER</span> need to manually construct URLs to interact with the API).</li>
</ul>

The resource we will create is a collection of **widgets**. I decided to model something generic rather than the cliche "to-do list" project that you encounter in every introductory programming tutorial. I feel safe assuming that you are not reading this because you have a burning desire to create the next, great API-driven  to-do list.

The `Widget` model will contain custom validators for parsing request data and custom field types for marshalling `Widget` objects to JSON. . Whatever project you have in mind, the widget implementation can easily be adapted to any object in your domain model.

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

<a href="https://phauer.com/2015/restful-api-design-best-practices/#use-consistently-plural-nouns" target="_blank">The accepted best practice for naming resources</a> is to use plural nouns when constructing a URI for a resource. <a href="https://phauer.com/2015/restful-api-design-best-practices/#use-two-urls-per-resource" target="_blank">Another widely accepted standard</a> is to create two endpoints (i.e., URIs) per resource &mdash; one for operations that apply to the entire collection (e.g., <code>/api/v1/widgets</code>) and one for operations that apply only to a single resource (e.g., <code>/api/v1/widgets/&lt;name&gt;</code>).



These endpoints allow the client to perform CRUD operations on the resource (<strong>C</strong>reate, <strong>R</strong>etrieve, <strong>U</strong>pdate, <strong>D</strong>elete) by defining the set of HTTP methods that each endpoint supports. The full set of HTTP methods that we will implement in the `widget_ns` namespace are explained in the table below:

<div class="table-wrapper">
    <div class="responsive">
        <table>
            <thead>
            <tr>
                <th scope="col" class="first-column column-header">Endpoint Name</th>
                <th scope="col" class="column-header">URL Path</th>
                <th scope="col"  class="column-header">HTTP Method</th>
                <th scope="col" class="column-header">CRUD Operation</th>
                <th scope="col" class="last-column column-header">Required Token</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td class="first-column">api.widget_list</td>
                <td>/api/v1/widgets</td>
                <td>GET</td>
                <td>Retrieve a list of widgets</td>
                <td class="last-column">Regular user</td>
            </tr>
            <tr>
                <td class="first-column">api.widget_list</td>
                <td>/api/v1/widgets</td>
                <td>POST</td>
                <td>Create a new widget</td>
                <td class="last-column">Admin user</td>
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

<div class="alert alert-flex">
  <div class="alert-icon">
    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
  </div>
  <div class="alert-message">
    <p>Operations that create, modify or delete widgets are restricted to users with the administrator role. Regular (non-admin) users can only retrieve individual widgets and lists of widgets from the database.</p>
  </div>
</div>

## `flask add-user` Command

[Way back in Part 1](/series/flask_api_tutorial/part-1/#flask-cli-application-entry-point), we discussed the Flask CLI and created the method that executes when the `flask shell` command is invoked. The Flask CLI is based on a project called <a href="https://palletsprojects.com/p/click/" target="_blank">Click</a>. Click can create powerful CLI applications, and is easy to get started with thanks to <a href="https://click.palletsprojects.com" target="_blank">excellent documentation</a>.

Currently, the `api/v1/auth/register` endpoint can only create regular (non-admin) users. We want to leave it this way since this endpoint is publically-accessible. However, we also need a way to create admin users since regular users cannot create, update or delete widget objects.

There are a few different methods we could use to create admin users. Using the `flask shell` command, we can execute arbitrary statements to create admin users. Or, we could create a function and store it in a file in our project, then run the function through the command-line. However, both of these methods are cumbersome and would require documentation if anyone else needed to create an admin user.

My preferred solution is to expose a command in the Flask CLI that can create both regular and admin users. To do so, open `run.py` in the project root folder. First, update the import statements to include `click` (**Line 4** below):

{{< highlight python "linenos=table,hl_lines=4" >}}"""Flask CLI/Application entry point."""
import os

import click

from app import create_app, db
from app.models.token_blacklist import BlacklistedToken
from app.models.user import User
from app.models.widget import Widget{{< /highlight >}}

Then, add the content below and save the file:

{{< highlight python "linenos=table,linenostart=19" >}}@app.cli.command("add-user", short_help="add a new user")
@click.option("--admin", is_flag=True, default=False, help="New user has administrator role")
@click.password_option(help="Do not set password on the command line!")
@click.argument("email")
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
    <pre style="margin: 5px 0 20px"><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask add-user --admin admin@test.com</span>
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

## Pagination

When a client sends a `GET` request to the `api.widget_list` endpoint, they are requesting every widget in the database. As the number of widgets increases, so does the size of the HTTP response. As the size of the response data increases, the time required to send and receive the data increases, resulting in a sluggish API.

Obviously, returning every widget in the database at once would be foolish. Instead, REST APIs typically employ pagination to limit the number of items to the first 20, 50, etc database items. An example of a request/response pair containing paginated data is given below:

<pre><code><span class="cmd-lineno"> 1</span>  <span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">http :5000/api/v1/widgets Authorization:"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjY4MjA3NDksImlhdCI6MTU2NjgxOTg0NCwic3ViIjoiMzUyMDg5N2EtZWQ0My00YWMwLWIzYWYtMmZjMTY3NzE5MTYwIiwiYWRtaW4iOmZhbHNlfQ.AkpscH6QoCrfHYeyJTyouanwyj4KH34f3YmzMnyKKdM"</span>
<span class="cmd-lineno"> 2</span>
<span class="cmd-lineno"> 3</span>  <span class="cmd-results"><span class="bold-text goldenrod">GET /api/v1/widgets HTTP/1.1</span>
<span class="cmd-lineno"> 4</span>  <span class="purple">Accept</span>: <span class="light-blue">*/*</span>
<span class="cmd-lineno"> 5</span>  <span class="purple">Accept-Encoding</span>: <span class="light-blue">gzip, deflate</span>
<span class="cmd-lineno"> 6</span>  <span class="purple">Authorization</span>: <span class="light-blue">Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjY4MjA3NDksImlhdCI6MTU2NjgxOTg0NCwic3ViIjoiMzUyMDg5N2EtZWQ0My00YWMwLWIzYWYtMmZjMTY3NzE5MTYwIiwiYWRtaW4iOmZhbHNlfQ.AkpscH6QoCrfHYeyJTyouanwyj4KH34f3YmzMnyKKdM</span>
<span class="cmd-lineno"> 7</span>  <span class="purple">Connection</span>: <span class="light-blue">keep-alive</span>
<span class="cmd-lineno"> 8</span>  <span class="purple">Host</span>: <span class="light-blue">localhost:5000</span>
<span class="cmd-lineno"> 9</span>  <span class="purple">User-Agent</span>: <span class="light-blue">HTTPie/1.0.2</span>
<span class="cmd-lineno">10</span>
<span class="cmd-lineno">11</span>
<span class="cmd-lineno">12</span>  <span class="bold-text goldenrod">HTTP/1.0 200 OK</span>
<span class="cmd-lineno">13</span>  <span class="purple">Access-Control-Allow-Origin</span>: <span class="light-blue">*</span>
<span class="cmd-lineno">14</span>  <span class="purple">Content-Length</span>: <span class="light-blue">1407</span>
<span class="cmd-lineno">15</span>  <span class="purple">Content-Type</span>: <span class="light-blue">application/json</span>
<span class="cmd-lineno">16</span>  <span class="purple">Date</span>: <span class="light-blue">Mon, 26 Aug 2019 11:45:39 GMT</span>
<span class="cmd-lineno-hl">17</span>  <span class="purple">Link</span>: <span class="light-blue">&lt;http://localhost:5000/api/v1/widgets?page=1&per_page=10>; rel="self",
<span class="cmd-lineno-hl">18</span>    &lt;http://localhost:5000/api/v1/widgets?page=2&per_page=10>; rel="next",
<span class="cmd-lineno-hl">19</span>    &lt;http://localhost:5000/api/v1/widgets?page=1&per_page=10>; rel="first",
<span class="cmd-lineno-hl">20</span>    &lt;http://localhost:5000/api/v1/widgets?page=5&per_page=10>; rel="last"</span>
<span class="cmd-lineno">21</span>  <span class="purple">Server</span>: <span class="light-blue">Werkzeug/0.15.5 Python/3.7.4</span>
<span class="cmd-lineno">22</span>
<span class="cmd-lineno">23</span>  <span class="bold-text">{
<span class="cmd-lineno-hl">24</span>    <span class="purple">"links"</span>: {
<span class="cmd-lineno-hl">25</span>      <span class="purple">"self"</span>: <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=1&per_page=10"</span>,
<span class="cmd-lineno-hl">26</span>      <span class="purple">"next"</span>: <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=2&per_page=10"</span>,
<span class="cmd-lineno-hl">27</span>      <span class="purple">"first"</span>: <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=1&per_page=10"</span>,
<span class="cmd-lineno-hl">28</span>      <span class="purple">"last"</span>: <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=5&per_page=10"</span>
<span class="cmd-lineno">29</span>    },
<span class="cmd-lineno">30</span>    <span class="purple">"page"</span>: <span class="pink">1</span>
<span class="cmd-lineno">31</span>    <span class="purple">"total_pages"</span>: <span class="pink">5</span>,
<span class="cmd-lineno">32</span>    <span class="purple">"items_per_page"</span>: <span class="pink">10</span>,
<span class="cmd-lineno">33</span>    <span class="purple">"total_items"</span>: <span class="pink">43</span>,
<span class="cmd-lineno">34</span>    <span class="purple">"items"</span>: [
<span class="cmd-lineno">35</span>      {
<span class="cmd-lineno">36</span>        <span class="gray">//...</span>
<span class="cmd-lineno">37</span>        <span class="purple">"name"</span>: <span class="light-blue">"test"</span>
<span class="cmd-lineno-hl">38</span>        <span class="purple">"link"</span>: <span class="light-blue">"http://localhost:5000/api/v1/widgets/test"</span>,
<span class="cmd-lineno">39</span>      },
<span class="cmd-lineno">40</span>      <span class="gray">//...</span>
<span class="cmd-lineno">41</span>    ]
<span class="cmd-lineno">42</span>  }</span></span></code></pre>

If you've spent time reading about REST APIs, you have probably encountered the term <strong>HATEOAS</strong>, which stands for <strong>Hypertext As The Engine Of Application State</strong>. This is part of Roy Fielding's formal definition of REST, and the main takeaway is that clients shouldn't need to construct URLs in order to interact with a REST API, since this ties the client to an implementation. This is bad because any change to the structure/syntax of an existing URI is a breaking change for the client.

Ideally, a REST API should provide links in the header or body of the response that direct the client to the next logical set of actions/resources based on the client's request. The navigational links in the header **(Lines 17-20)** and body of the response **(Lines 24-28)** above allow the client to browse through the collection of widgets.

The object named "items" contains the first ten (of 43 total) widget objects. Each widget contains a "link" attribute **(Line 38)** containing the URI for the widget.

The value of the navigational link labeled `self` is `http://localhost:5000/api/v1/widgets?page=1&per_page=10`, and the URL that we sent the `GET` request to was `http://localhost:5000/api/v1/widgets`. `page` and `per_page` are <a href="https://en.wikipedia.org/wiki/Query_string" target="_blank">query string parameters</a>. `page=1` and `per_page=10` are the default values that are used if the request sent by the client does not include either parameter.

Query string parameters can be parsed from request data with `RequestParser` arguments, using the same technique that we used to parse email/password values from form data in the `auth_ns` namespace. However, before we can do that we need to define our `Widget` model.

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil" aria-hidden="true"></i>
  </div>
  <div class="note-message">
    <p>While Fielding defined HATEOAS and stipulated that it is a requirement for a REST API, he did not specify the format for doing so. Depending on the project, navigational links could be provided in either the response header or body (obviously I have provided both for this demonstration). The format of the <code>Link</code> header field is defined in <a href="https://tools.ietf.org/html/rfc8288" target="_blank">RFC 8288</a>, which is a Proposed Standard that is widely employed througout the internet (i.e., it's pretty safe to use it in your application, too).</p>
  </div>
</div>

## `Widget` DB Model

Create a new file `widget.py` in `/app/models` and add the content below:

{{< highlight python "linenos=table" >}}"""Class definition for Widget model."""
from datetime import datetime, timezone, timedelta

from flask import url_for
from sqlalchemy.ext.hybrid import hybrid_property

from app import db
from app.util.datetime_util import (
    format_timedelta_digits,
    get_local_utcoffset,
    localized_dt_string,
    make_tzaware,
)


class Widget(db.Model):
    """Widget model for a generic resource in a REST API."""

    __tablename__ = "widget"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    info_url = db.Column(db.String(255), unique=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
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
        time_remaining = self.deadline.replace(tzinfo=timezone.utc) - datetime.now(timezone.utc)
        return timedelta(0) if self.deadline_passed else time_remaining

    @hybrid_property
    def time_remaining_str(self):
        return format_timedelta_digits(self.time_remaining)

    @hybrid_property
    def uri(self):
        return url_for("api.widget", name=self.name, _external=True)

    @classmethod
    def find_by_name(cls, name):
        return cls.query.filter_by(name=name).first(){{< /highlight >}}

Most of the interesting things about the `Widget` model were previously discussed when introducing other classes, but there are a couple new things worth calling out:

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 17: </strong>The <code>name</code> attribute will be used as the identifier in the widget's URI path. When we define the <code>RequestParser</code> for requests to create a new widget, we will ensure that this value contains only lowercase-letters, numbers, underscore and/or hyphen characters. Also, obviously, this value must be unique.</p>
      </li>
      <li>
        <p><strong>Line 18: </strong>The purpose of the <code>info_url</code> attribute is to demonstrate how to implement input validation for URL values. Any values that are not valid URLs must be rejected without adding the widget to the database.</p>
      </li>
      <li>
        <p><strong>Line 19: </strong>.</p>
      </li>
      <li>
        <p><strong>Lines 22-23: </strong>.</p>
      </li>
      <li>
        <p><strong>Lines 29-30: </strong>.</p>
      </li>
      <li>
        <p><strong>Lines 33-34: </strong>.</p>
      </li>
    </ul>
</div>

## Create Widget

### `widget_reqparser` Request Parser

{{< highlight python "linenos=table" >}}"""Parsers and serializers for /widgets API endpoints."""
import re
from datetime import date, datetime
from dateutil import parser

from flask_restplus.inputs import URL
from flask_restplus.reqparse import RequestParser

from app.util.datetime_util import get_date_with_min_time


def widget_name(name):
    """Return name if valid, raise an excaption if validation fails."""
    if re.compile(r"^[\w-]+$").match(name):
        return name
    else:
        raise ValueError(
            f"'{name}' contains one or more invalid characters. Widget name must contain "
            "only letters, numbers, hyphen and/or underscore characters."
        )


def future_date_string(input):
    """Validation logic for future_date_string.

    Return parsed_date if dateutil.parser correctly parsed input string AND if parsed_date is
    greater than or equal to today's date, raise an excaption if validation fails.
    """
    try:
        parsed_date = parser.parse(input)
    except ValueError:
        raise ValueError(
            f"Failed to parse '{input}' as a valid date. You can use any format recognized "
            "by dateutil.parser. For example, all of the strings below are valid ways to "
            "represent the same date: '2018-5-13' -or- '05/13/2018' -or- 'May 13 2018'."
        )

    parsed_date = get_date_with_min_time(parsed_date)
    if parsed_date.date() < date.today():
        raise ValueError(
            f"Successfully parsed {input} as {parsed_date.strftime('%b %d %Y')}. However, this "
            f"value must be a date in the future and {parsed_date.strftime('%b %d %Y')} is "
            f"BEFORE {datetime.now().strftime('%b %d %Y')}"
        )
    return parsed_date


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
    type=future_date_string,
    location="form",
    required=True,
    nullable=False,
){{< /highlight >}}

### `create_widget` Method

{{< highlight python "linenos=table" >}}"""Business logic for /widgets API endpoints."""
from http import HTTPStatus

from flask_restplus import abort

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

## Get Widget List

### `pagination_model` API Model

{{< highlight python >}}from datetime import date, datetime, timezone

from flask_restplus import Model
from flask_restplus.fields import String, DateTime, Integer, List, Nested{{< /highlight >}}

{{< highlight python "linenos=table,linenostart=74" >}}pagination_reqparser = RequestParser(bundle_errors=True)
pagination_reqparser.add_argument(
    "page",
    type=int,
    required=False,
    default=1,
)
pagination_reqparser.add_argument(
    "per_page",
    type=int,
    required=False,
    choices=[5, 10, 25, 50, 100],
    default=10,
)

widget_owner_model = Model(
    "Widget Owner",
    {
        "email": String,
        "public_id": String,
    },
)

widget_model = Model(
    "Widget",
    {
        "name": String,
        "info_url": String,
        "date_created": Date(dt_format="rfc822"),
        "deadline": String(
            attribute=lambda x: x.deadline.replace(tzinfo=timezone.utc).strftime("%Y-%m-%d")
        ),
        "days_remaining": Integer,
        "owner": Nested(widget_owner_model),
        "link": String(attribute="uri"),
    },
)

pagination_links_model = Model(
    "Nav Links",
    {
        "self": String,
        "prev": String,
        "next": String,
        "first": String,
        "last": String,
    },
)

pagination_model = Model(
    "Pagination",
    {
        "links": Nested(pagination_links_model, skip_none=True),
        "page": Integer,
        "total_pages": Integer(attribute="pages"),
        "items_per_page": Integer(attribute="per_page"),
        "total_items": Integer(attribute="total"),
        "items": List(Nested(widget_model)),
    },
){{< /highlight >}}

### `retrieve_widget_list` Method

{{< highlight python >}}from flask import jsonify, url_for
from flask_restplus import abort, marshal

from app import db
from app.api.widget.dto import pagination_model{{< /highlight >}}

{{< highlight python "linenos=table,linenostart=14" >}}def retrieve_widget_list(page_num, per_page):
    pagination = Widget.query.paginate(page_num, per_page, error_out=False)
    response_data = marshal(pagination, pagination_model)
    response_data["links"] = _pagination_nav_links(pagination)
    response = jsonify(response_data)
    response.headers["Link"] = _pagination_nav_header_links(pagination)
    response.headers["Total-Count"] = pagination.total
    return response{{< /highlight >}}

{{< highlight python "linenos=table,linenostart=41" >}}def _pagination_nav_links(pagination):
    url_dict = _pagination_url_dict(pagination)
    link_dict = dict(self=url_dict["self"], first=url_dict["first"], last=url_dict["last"])
    if pagination.has_prev:
        link_dict["prev"] = url_dict["prev"]
    if pagination.has_next:
        link_dict["next"] = url_dict["next"]
    return link_dict


def _pagination_nav_header_links(pagination):
    url_dict = _pagination_url_dict(pagination)
    link_header = f'<{url_dict["self"]}>; rel="self", '
    if pagination.has_prev:
        link_header += f'<{url_dict["prev"]}>; rel="prev", '
    if pagination.has_next:
        link_header += f'<{url_dict["next"]}>; rel="next", '
    link_header += f'<{url_dict["first"]}>; rel="first", '
    link_header += f'<{url_dict["last"]}>; rel="last", '
    return link_header.strip().strip(",")


def _pagination_url_dict(pagination):
    this_page = pagination.page
    per_page = pagination.per_page
    total_pages = pagination.pages
    url_self = url_for("api.widget_list", page=this_page, per_page=per_page, _external=True)
    url_prev = url_for("api.widget_list", page=this_page - 1, per_page=per_page, _external=True)
    url_next = url_for("api.widget_list", page=this_page + 1, per_page=per_page, _external=True)
    url_first = url_for("api.widget_list", page=1, per_page=per_page, _external=True)
    url_last = url_for("api.widget_list", page=total_pages, per_page=per_page, _external=True)
    return dict(self=url_self, prev=url_prev, next=url_next, first=url_first, last=url_last){{< /highlight >}}

### `WidgetList` Resource (HTTP GET)

{{< highlight python >}}from app.api.auth.decorator import token_required, admin_token_required
from app.api.widget.dto import (
    widget_reqparser,
    pagination_reqparser,
    widget_owner_model,
    widget_model,
    pagination_links_model,
    pagination_model,
)
from app.api.widget.business import create_widget, retrieve_widget_list{{< /highlight >}}

{{< highlight python "linenos=table,linenostart=17" >}}widget_ns = Namespace(name="widgets", validate=True)
widget_ns.models[widget_owner_model.name] = widget_owner_model
widget_ns.models[widget_model.name] = widget_model
widget_ns.models[pagination_links_model.name] = pagination_links_model
widget_ns.models[pagination_model.name] = pagination_model{{< /highlight >}}

{{< highlight python "linenos=table,linenostart=28" >}}    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.OK, "Retrieved widget list.", pagination_model)
    @widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    @widget_ns.expect(pagination_reqparser)
    @token_required
    def get(self):
        """Get a list of all widgets."""
        request_data = pagination_reqparser.parse_args()
        page_num = request_data.get("page")
        per_page = request_data.get("per_page")
        return retrieve_widget_list(page_num, per_page){{< /highlight >}}

### Unit Tests: `test_get_widget_list.py`

## Get Widget

### `retrieve_widget` Method

{{< highlight python "linenos=table,linenostart=24" >}}def retrieve_widget(name):
    widget = Widget.find_by_name(name)
    if widget:
        return widget, HTTPStatus.OK
    error = f"{name} not found in database."
    abort(HTTPStatus.NOT_FOUND, error, status="fail"){{< /highlight >}}

### `Widget` Resource (HTTP GET)

{{< highlight python "linenos=table,linenostart=15" >}}from app.api.widgets.business import (
    create_widget,
    retrieve_widget_list,
    retrieve_widget
){{< /highlight >}}

{{< highlight python "linenos=table,linenostart=56" >}}    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.OK, "Retrieved widget.", widget_model)
    @widget_ns.response(HTTPStatus.NOT_FOUND, "Widget not found.")
    @widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    @widget_ns.marshal_with(widget_model)
    @token_required
    def get(self, name):
        """Retrieve a widget."""
        return retrieve_widget(name){{< /highlight >}}

### Unit Tests: `test_get_widget.py`

## Update Widget

### `update_widget` Method

{{< highlight python "linenos=table,linenostart=2" >}}from datetime import datetime, timezone{{< /highlight >}}

{{< highlight python "linenos=table,linenostart=50" >}}def update_widget(name, widget_dict):
    widget = Widget.find_by_name(name)
    if not widget:
        error = f"Widget name: {name} not found."
        abort(HTTPStatus.NOT_FOUND, error, status="fail")
    for k, v in widget_dict.items():
        setattr(widget, k, v)
    setattr(widget, "last_update", datetime.now(timezone.utc))
    db.session.commit()
    return widget, HTTPStatus.OK{{< /highlight >}}

### `Widget` Resource (HTTP PUT)

{{< highlight python "linenos=table,linenostart=15" >}}from app.api.widgets.business import (
    create_widget,
    retrieve_widget_list,
    retrieve_widget,
    update_widget,
){{< /highlight >}}

{{< highlight python "linenos=table,linenostart=76" >}}    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.OK, "Widget was updated.", widget_model)
    @widget_ns.response(HTTPStatus.UNAUTHORIZED, "Unauthorized.")
    @widget_ns.response(HTTPStatus.FORBIDDEN, "Administrator token required.")
    @widget_ns.response(HTTPStatus.NOT_FOUND, "Widget not found")
    @widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    @widget_ns.response(HTTPStatus.INTERNAL_SERVER_ERROR, "Internal server error.")
    @widget_ns.expect(widget_reqparser)
    @widget_ns.marshal_with(widget_model)
    @admin_token_required
    def put(self, name):
        """Update an existing widget."""
        request_data = widget_reqparser.parse_args()
        widget_dict = {k: v for k, v in request_data.items()}
        return update_widget(name, widget_dict){{< /highlight >}}

### Unit Tests: `test_update_widget.py`

## Delete Widget

### `delete_widget` Method

{{< highlight python "linenos=table,linenostart=63" >}}def delete_widget(name):
    widget = Widget.find_by_name(name)
    if not widget:
        return "", HTTPStatus.NO_CONTENT
    db.session.delete(release_info)
    db.session.commit()
    return "", HTTPStatus.NO_CONTENT{{< /highlight >}}

### `Widget` Resource (HTTP DELETE)

{{< highlight python "linenos=table,linenostart=92" >}}    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.NO_CONTENT, "Widget was deleted.")
    @widget_ns.response(HTTPStatus.UNAUTHORIZED, "Unauthorized.")
    @widget_ns.response(HTTPStatus.FORBIDDEN, "Administrator token required.")
    @widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    @admin_token_required
    def delete(self, name):
        """Delete a widget."""
        return delete_widget(name){{< /highlight >}}

### Unit Tests: `test_delete_widget.py`
