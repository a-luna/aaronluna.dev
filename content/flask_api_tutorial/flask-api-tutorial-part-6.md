---
title: "How To: Create a Flask API with JWT-Based Authentication (Part 6)"
lead: "Part 6: Widget API Continued"
slug: "part-6"
series: ["flask_api_tutorial"]
series_weight: 6
series_title: "How To: Create a Flask API with JWT-Based Authentication"
series_part: "Part 6"
series_part_lead: "Widget API Continued"
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
|   |   |- <span class="unmodified-file">__init__.py</span>
|   |
|   |- <span class="project-folder">models</span>
|   |   |- <span class="project-empty-file">__init__.py</span>
|   |   |- <span class="unmodified-file">token_blacklist.py</span>
|   |   |- <span class="unmodified-file">user.py</span>,
|   |   |- <span class="unmodified-file">widget.py</span>
|   |
|   |- <span class="project-folder">util</span>
|   |   |- <span class="project-empty-file">__init__.py</span>
|   |   |- <span class="unmodified-file">datetime_util.py</span>
|   |   |- <span class="unmodified-file">result.py</span>
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
|   |- <span class="work-file">test_widget_list.py</span>
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

In the previous section, we began implementing the `Widget` API. I've reproduced the table from the previous section which gives the specifications for all endpoints in the `widget_ns` namespace:

<div id="table-1" class="table-wrapper" style="margin: 0 auto 2em">
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

At this point, we have only implemented the process to create a new `widget` object. Per the specification in **Table 1**, to do so we created a new endpoint named `api.widget_list` that responds to requests sent to `/api/v1/widgets`. Clients can create a new `widget` object by sending a `POST` request to this endpoint. **Table 1** indicates that the `api.widget_list` endpoint must also support `GET` requests in order to allow clients to retrieve a list of `widget` objects.

What is the best way to send a list of complex objects to a client in an HTTP response? Before we implement the process/endpoint for retrieving a list of widgets, let's review the established best practices.

### Pagination

When a client sends a `GET` request to the `api.widget_list` endpoint, they are requesting every widget in the database. As the number of widgets increases, so does the size of the HTTP response. As the size of the response increases, the time required to send and receive the data increases, resulting in a sluggish API.

Obviously, returning every widget in the database at once would be foolish. Instead, REST APIs typically employ **pagination** to limit the number of items sent in the response to the first 10, 20, etc database items (the maximum number of items per page is controlled by the server).

Clients can navigate through the full set of database objects by including a `page` parameter and a `per_page` parameter with their request data. Combining the ability to specify the number of items that the server should send per page as well as the page number, the client can retrieve any item from the database and avoid a sluggish response.

An example of a request/response pair containing paginated data is given below:

<pre><code><span class="cmd-lineno"> 1</span>  <span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">http :5000/api/v1/widgets Authorization:"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjY4MjA3NDksImlhdCI6MTU2NjgxOTg0NCwic3ViIjoiMzUyMDg5N2EtZWQ0My00YWMwLWIzYWYtMmZjMTY3NzE5MTYwIiwiYWRtaW4iOmZhbHNlfQ.AkpscH6QoCrfHYeyJTyouanwyj4KH34f3YmzMnyKKdM"</span>
<span class="cmd-lineno"> 2</span>
<span class="cmd-lineno"> 3</span>  <span class="cmd-results"><span class="bold-text goldenrod">GET /api/v1/widgets?page=1&per_page=10 HTTP/1.1</span>
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
<span class="cmd-lineno-hl">17  <span class="purple">Link</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">&lt;http://localhost:5000/api/v1/widgets?page=1&per_page=10>; rel="self",</span></span>
<span class="cmd-lineno-hl">18    <span class="light-blue">&lt;http://localhost:5000/api/v1/widgets?page=1&per_page=10>; rel="first",</span></span>
<span class="cmd-lineno-hl">19    <span class="light-blue">&lt;http://localhost:5000/api/v1/widgets?page=2&per_page=10>; rel="next",</span></span>
<span class="cmd-lineno-hl">20    <span class="light-blue">&lt;http://localhost:5000/api/v1/widgets?page=5&per_page=10>; rel="last"</span></span>
<span class="cmd-lineno">21</span>  <span class="purple">Server</span>: <span class="light-blue">Werkzeug/0.15.5 Python/3.7.4</span>
<span class="cmd-lineno">22</span>  <span class="purple">Total-Count</span>: <span class="pink">23</span>
<span class="cmd-lineno">23</span>
<span class="cmd-lineno">24</span>  <span class="bold-text">{
<span class="cmd-lineno-hl">25    <span class="purple">"links"</span><span style="color: var(--light-gray2)">: {</span></span>
<span class="cmd-lineno-hl">26      <span class="purple">"self"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=1&per_page=10"</span><span style="color: var(--light-gray2)">,</span></span>
<span class="cmd-lineno-hl">27      <span class="purple">"first"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=1&per_page=10"</span><span style="color: var(--light-gray2)">,</span></span>
<span class="cmd-lineno-hl">28      <span class="purple">"next"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=2&per_page=10"</span><span style="color: var(--light-gray2)">,</span></span>
<span class="cmd-lineno-hl">29      <span class="purple">"last"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=5&per_page=10"</span></span>
<span class="cmd-lineno">30</span>    },
<span class="cmd-lineno">31</span>    <span class="purple">"has_prev"</span>: <span class="orange">false</span>,
<span class="cmd-lineno">32</span>    <span class="purple">"has_next"</span>: <span class="orange">true</span>,
<span class="cmd-lineno">33</span>    <span class="purple">"page"</span>: <span class="pink">1</span>
<span class="cmd-lineno">34</span>    <span class="purple">"total_pages"</span>: <span class="pink">5</span>,
<span class="cmd-lineno">35</span>    <span class="purple">"items_per_page"</span>: <span class="pink">10</span>,
<span class="cmd-lineno">36</span>    <span class="purple">"total_items"</span>: <span class="pink">23</span>,
<span class="cmd-lineno">37</span>    <span class="purple">"items"</span>: [
<span class="cmd-lineno">38</span>      {
<span class="cmd-lineno">39</span>        <span class="gray">//...</span>
<span class="cmd-lineno">40</span>        <span class="purple">"name"</span>: <span class="light-blue">"test"</span>
<span class="cmd-lineno-hl">41        <span class="purple">"link"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"http://localhost:5000/api/v1/widgets/test"</span><span style="color: var(--light-gray2)">,</span></span>
<span class="cmd-lineno">42</span>      },
<span class="cmd-lineno">43</span>      <span class="gray">//...</span>
<span class="cmd-lineno">44</span>    ]
<span class="cmd-lineno">45</span>  }</span></span></code></pre>

In this example, the database contains a total of 23 `widget` objects. If the client sends a `GET` request to `/api/v1/widgets?page=1&per_page=10`, the server response will contain the first ten objects from the database in the order that they were created. (i.e., items #1-10) The client can step through the full set of `widget` objects by continually sending `GET` requests and incrementing the `page` attribute. With `page=2` and `per_page=10`, the server response will contain the next ten objects from the database (i.e., items #11-20). With `page=3` and `per_page=10`, only three items will be sent in the response (i.e., items #21-23).

### HATEOAS

If you've spent time reading about REST APIs, you have probably encountered the term <strong>HATEOAS</strong>, which stands for <a href="https://en.wikipedia.org/wiki/HATEOAS" target="_blank">Hypertext As The Engine Of Application State</a>. This is part of Roy Fielding's formal definition of REST, and the main takeaway is that clients shouldn't need to construct URLs in order to interact with a REST API, since this ties the client to an implementation. This is bad because any change to the structure/syntax of an existing URI is a breaking change for the client.

Ideally, a REST API should provide links in the header or body of the response that direct the client to the next logical set of actions/resources based on the client's request. The navigational links in the header **(Lines 18-21)** and body of the response **(Lines 25-29)** above allow the client to browse through the collection of widgets.

The object named "items" contains the first ten (of 23 total) widget objects. Each widget contains a "link" attribute **(Line 38)** containing the URI for the widget. Thanks to the link attribute and the navigational links, the client can navigate through the API and perform CRUD actions on `widget` instances without manually entering a single endpoint URL.

`page` and `per_page` are <a href="https://en.wikipedia.org/wiki/Query_string" target="_blank">query string parameters</a>. Query string parameters can be parsed using the same techniques that we used to parse email/password values from form data in the `auth_ns` namespace, and `widget` information in the previous section.

If the client sends a `GET` request to `http://localhost:5000/api/v1/widgets` (i.e., neither `page` or `per_page` are sent with the request), what happens? Typically, default values are assumed for these parameters. The default values are configured when we create the `RequestParser` arguments for the pagination parameters.

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil"></i>
  </div>
  <div class="note-message">
    <p>While Fielding defined HATEOAS and stipulated that it is a requirement for a REST API, he did not specify the format for doing so. Depending on the project, navigational links could be provided in either the response header or body (obviously I have provided both for this demonstration). The format of the <code>Link</code> header field is defined in <a href="https://tools.ietf.org/html/rfc8288" target="_blank">RFC 8288</a>, which is a Proposed Standard that is widely employed throughout the internet (i.e., it's pretty safe to use it in your application, too).</p>
  </div>
</div>

## Retrieve Widget List

With the background info regarding pagination and HATEOAS in mind, we are ready to begin implementing the API endpoint that responds to `GET` requests sent to `/api/v1/widgets`. Per **Table 1**, this endpoint and request type allows clients to retrieve a list of `widget` objects. As before, we start by creating request parsers/API models to validate request data and serialize response data.

### `pagination_reqparser` Request Parser

When a client sends a request to retrieve a list of `widgets`, what data should we expect to be included with the request? The answer should be fairly obvious based on the information covered in the <a href="#pagination">Introduction</a>.

The request to retrieve a list of `widget` objects should include two values: the page number and number of items per page. Luckily, both of these values are integers, and there are several pre-built types in the `flask_restplus.inputs` module that convert request data to integer values.

Open `app/api/widgets/dto.py` and update the import statements to include the `flask_restplus.inputs.positive` class **(Line 6)**:

{{< highlight python "linenos=table,hl_lines=6" >}}"""Parsers and serializers for /widgets API endpoints."""
import re
from datetime import date, datetime, time, timezone

from dateutil import parser
from flask_restplus.inputs import positive, URL
from flask_restplus.reqparse import RequestParser

from app.util.datetime_util import make_tzaware, DATE_MONTH_NAME{{< /highlight >}}

Next, add the content below:

{{< highlight python "linenos=table,linenostart=69" >}}pagination_reqparser = RequestParser(bundle_errors=True)
pagination_reqparser.add_argument(
    "page",
    type=positive,
    required=False,
    default=1,
)
pagination_reqparser.add_argument(
    "per_page",
    type=positive,
    required=False,
    choices=[5, 10, 25, 50, 100],
    default=10,
){{< /highlight >}}

There are a couple of important things to note about how these arguments are configured:

<div class="code-details">
    <ul>
        <li>
            <p><strong>Lines 72, 78: </strong>By specifying <code>type=positive</code>, the value provided in the request data will be coerced to an integer. If the value represents a positive, non-zero integer, the request will succeed and the server will send the paginated list to the client. Otherwise, the server will reject the request with status code <code>HTTPStatus.BAD_REQUEST</code> (400).</p>
            <div class="note note-flex">
                <div class="note-icon">
                    <i class="fa fa-pencil"></i>
                </div>
                <div class="note-message" style="flex-flow: column wrap">
                    <p>Why did I choose <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.inputs.positive" target="_blank">the <code>flask_restplus.inputs.positive</code> class</a>? For both the <code>page</code> and <code>per_page</code> parameters, zero and negative values are invalid. Checking the parsed values to ensure they are positive numbers would be simple, but since a class already exists that performs the same check, IMO, it is wasteful to re-implement the same logic.</p>
                </div>
            </div>
        </li>
        <li>
            <p><strong>Lines 73, 79: </strong>This is the first time that we have specified a <code>RequestParser</code> argument as <code>required=False</code>. This allows the client to send a request <span class="emphasis">without</span> either parameter and the request will still succeed (e.g., <code>GET /api/v1/widgets</code> will return the same response as <code>GET /api/v1/widgets?page=1&per_page=10</code>).</p>
            <div class="note note-flex">
                <div class="note-icon">
                    <i class="fa fa-pencil"></i>
                </div>
                <div class="note-message" style="flex-flow: column wrap">
                    <p>What would happen if <code>required=True</code> and the client sends a request without either parameter? Rather than using a default value, the server would reject the request with status code <code>HTTPStatus.BAD_REQUEST</code> (400) and include an error message indicating that one or more required values were missing.</p>
                </div>
            </div>
        </li>
        <li>
            <p><strong>Lines 74, 81: </strong>The default value for each parameter can be configured with the keyword argument <code>default</code>.</p>
        </li>
        <li>
            <p><strong>Line 80: </strong>The range of valid values for the <code>page</code> parameter is any positive integer. However, the <code>per_page</code> parameter must have an upper bound since the point of employing pagination is to prevent the API from becoming sluggish due to sending/receiving a large amount of data.</p>
            <p>Flask-RESTPlus includes a pre-built type (<a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.inputs.int_range" target="_blank"><code>flask_restplus.inputs.int_range</code></a>) that will restrict values to a range of integers. This would allow the client to request any number of items per page, but I think it makes more sense to restrict the page size to a small, fixed set of choices.</p>
            <p>The list provided to the <code>choices</code> keyword defines the set of allowable values. This has an additional benefit &mdash; on the Swagger UI page, the input form for <code>per_page</code> will render a select element containing the list of choices.</p>
        </li>
    </ul>
</div>

Implementing the request parser was trivial, but constructing a response containing a list of `widget` objects is significantly more complicated. Keep in mind, <span class="bold-italics">the response must be formatted as a paginated list</span>, including navigational links and values for the current page number, number of items per page, total number of items in the collection, etc.

It is possible to create the paginated list manually from scratch and define API models to serialize the whole thing to JSON (it would also be tedious). Instead of needlessly wasting time, let's take a look at a method that will do most of the work for us.

### Flask-SQLAlchemy `paginate` Method

The Flask-SQLAlchemy extension has <a href="https://flask-sqlalchemy.palletsprojects.com/en/2.x/api/#flask_sqlalchemy.BaseQuery.paginate" target="_blank">a `paginate` method</a> that produces <a href="https://flask-sqlalchemy.palletsprojects.com/en/2.x/api/#flask_sqlalchemy.Pagination" target="_blank">`Pagination` objects</a>. The `paginate` method is a member of <a href="https://docs.sqlalchemy.org/en/13/orm/query.html#the-query-object" target="_blank">the <code>Query</code> class</a>, and I think the easiest way to understand how it works is with a demonstration in the interactive shell:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask shell</span>
<span class="cmd-results">Python 3.7.4 (default, Jul 20 2019, 23:16:09)
[Clang 10.0.1 (clang-1001.0.46.4)] on darwin
App: flask-api-tutorial [development]
Instance: /Users/aaronluna/Projects/flask-api-tutorial/instance</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">len(Widget.query.all())</span>
<span class="cmd-repl-results">6</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination = Widget.query.paginate(page=1, per_page=5)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination</span>
<span class="cmd-repl-results">&lt;flask_sqlalchemy.Pagination object at 0x10b44bf90&gt;</span></code></pre>

I created six `Widget` instances in my test environment, which is verified by the first statement `len(Widget.query.all())` returning a result of 6. Next, we create a `Pagination` object for the first page of `Widget` objects with five items per page by calling `Widget.query.paginate(page=1, per_page=5)`. The last statement verifies that we did, in fact, create a `Pagination` object.

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil"></i>
  </div>
  <div class="note-message" style="flex-flow: column wrap">
    <p>I recommend reading the <a href="https://docs.sqlalchemy.org/en/13/orm/query.html#the-query-object" target="_blank">SQLAlchemy documentation for the Query object</a>, as well as the Flask-SQLAlchemy documentation for <a href="https://flask-sqlalchemy.palletsprojects.com/en/2.x/api/#flask_sqlalchemy.Pagination" target="_blank">the <code>Pagination</code> object</a> and <a href="https://flask-sqlalchemy.palletsprojects.com/en/2.x/api/#flask_sqlalchemy.BaseQuery.paginate" target="_blank">the <code>paginate</code> method</a>. </p>
  </div>
</div>

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.pages</span>
<span class="cmd-repl-results">2</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.per_page</span>
<span class="cmd-repl-results">5</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.total</span>
<span class="cmd-repl-results">6</span></code></pre>

These three attributes will remain the same for all pages with the same `per_page` value. `pages` is the total number of pages, `per_page` is (obviously) the number of items on a single page, and `total` is the total number of items in the collection.

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.page</span>
<span class="cmd-repl-results">1</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.has_next</span>
<span class="cmd-repl-results">True</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.has_prev</span>
<span class="cmd-repl-results">False</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">len(pagination.items)</span>
<span class="cmd-repl-results">5</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.items</span>
<span class="cmd-repl-results">[&lt;Widget name=first_widget, info_url=https://www.widgethost.net&gt;, &lt;Widget name=next, info_url=https://www.thisorthat.feh&gt;, &lt;Widget name=another, info_url=https://www.wontbelong.now&gt;, &lt;Widget name=foo, info_url=https://www.foo.bar&gt;, &lt;Widget name=baz, info_url=https://www.baz.bar&gt;]</span></code></pre>

Next, we call `pagination.page` to verify that the page number matches the value specified in the `paginate` method. Since we specified `per_page=5` and there are six total items we know that there are two total pages, which is confirmed by the value of `pagination.has_next` being `True`. Also, since this is the first page we know that there is no previous page, which is why `pagination.has_prev` is `False`.

`len(pagination.items)` verifies that this page contains five `widgets`. Finally, we inspect the `widget` list directly by executing `pagination.items`. As expected, a list containing five `Widget` instances is returned.

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.items[0].name</span>
<span class="cmd-repl-results">'first_widget'</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.items[0].owner</span>
<span class="cmd-repl-results">&lt;User email=admin@test.com, public_id=475807a4-8497-4c5c-8d70-109b429bb4ef, admin=True&gt;</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.items[0].owner.email</span>
<span class="cmd-repl-results">'admin@test.com'</span></code></pre>

Let's take a look at `pagination.items[0]`, the first `widget` added to the database. First, the `name` attribute is checked, followed by `owner`. `owner` contains a `User` object that corresponds to the user that created this `Widget`. The `create_widget` function (which performs the process of creating a widget after the request has been fully validated) stores the `id` of the `User` that sent the request in the `Widget.owner_id` attribute.

<a href="/series/flask_api_tutorial/part-5/#widget-db-model">`owner_id` is defined</a> as <a href="https://docs.sqlalchemy.org/en/13/core/metadata.html#sqlalchemy.schema.Column" target="_blank">a SQLAlchemy `Column`</a> to which <a href="https://docs.sqlalchemy.org/en/13/core/constraints.html#sqlalchemy.schema.ForeignKey" target="_blank">a `ForeignKey` construct</a> has been applied and this integer value is stored in the `widget` database table. `Widget.owner` is defined as <a href="https://docs.sqlalchemy.org/en/13/orm/relationship_api.html#sqlalchemy.orm.relationship" target="_blank">a SQLAlchemy relationship</a> between the `Widget` table and the `User` table, and <span class="emphasis">is not</span> stored in the database. Whenever a `Widget` object is retrieved from the database, `Widget.owner` is populated with a `User` object thanks to the foreign-key relationship and the magic of the SQLAlchemy ORM.

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination = Widget.query.paginate(page=2, per_page=5)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.page</span>
<span class="cmd-repl-results">2</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.has_next</span>
<span class="cmd-repl-results">False</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.has_prev</span>
<span class="cmd-repl-results">True</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">len(pagination.items)</span>
<span class="cmd-repl-results">1</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination.items</span>
<span class="cmd-repl-results">[&lt;Widget name=bim, info_url=http://www.baz.bar&gt;]</span></code></pre>

Finally, we retrieve the second (and final) page of `Widget` objects with five items per page by calling `Widget.query.paginate(page=2, per_page=5)`. We then verify that this is, in fact, the second page by calling `pagination.page`. We know `pagination.has_next` should be `False` since this is the final page of `Widgets`, and `pagination.has_prev` should be `True`. `len(pagination.items)` is one since there are six total `Widgets` and items #1-5 were shown on `page=1`. Lastly, we verify that `pagination.items` contains a single `Widget` object.

Hopefully, this helps you understand the structure of the `Pagination` class and the behavior of the `paginate` method. Understanding both is crucial to implementing the remaining functionality of the `api.widget_list` endpoint. Next, we need to create an API model for the `Pagination` class which will be considerably more complex than the API model we created <a href=/series/flask_api_tutorial/part-4/#user-model-api-model">for the `User` class</a>.

### `pagination_model` API Model

In order to send a paginated list of widgets as part of an HTTP response, we need to serialize it to JSON. I explained the purpose of API Models and how Flask-RESTPlus uses them to serialize database objects in  <a href=/series/flask_api_tutorial/part-4/#user-model-api-model">Part 4</a>. If you need a refresher, please review it.

First, we need to update the import statements in `app/api/widgets/dto.py` to include the Flask-RESTPlus `Model` class, as well as a bunch of classes from the `fields` module . Add **Line 6** and **Line 7** and save the file:

{{< highlight python "linenos=table,hl_lines=6-7" >}}"""Parsers and serializers for /widgets API endpoints."""
import re
from datetime import date, datetime, time, timezone

from dateutil import parser
from flask_restplus import Model
from flask_restplus.fields import Boolean, DateTime, Integer, List, Nested, String, Url
from flask_restplus.inputs import positive, URL
from flask_restplus.reqparse import RequestParser

from app.util.datetime_util import make_tzaware, DATE_MONTH_NAME{{< /highlight >}}

Next, add the content below:

{{< highlight python "linenos=table,linenostart=86" >}}widget_owner_model = Model(
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
        "created_at_iso8601": DateTime(attribute="created_at"),
        "created_at_rfc822": DateTime(attribute="created_at", dt_format="rfc822"),
        "deadline": String(attribute="deadline_str"),
        "deadline_passed": Boolean,
        "time_remaining": String(attribute="time_remaining_str"),
        "owner": Nested(widget_owner_model),
        "link": Url("api.widget"),
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
        "has_prev": Boolean,
        "has_next": Boolean,
        "page": Integer,
        "total_pages": Integer(attribute="pages"),
        "items_per_page": Integer(attribute="per_page"),
        "total_items": Integer(attribute="total"),
        "items": List(Nested(widget_model)),
    },
){{< /highlight >}}

There is a lot to digest here. This is the first time that we are encountering API models that are composed of other API models. `pagination_model` contains a list of `widget_model` objects as well as a single `pagination_links_model` instance, Also, `widget_model` contains a single instance of `widget_owner_model`. Let's take a look at how each API model is defined and how they interact with each other.

#### `widget_owner_model` and `widget_model`

Let's work our way from the inside-out. As demonstrated in the interactive shell, the structure of a `Pagination` object is:

<pre><code>pagination -> items -> widget -> owner</code></pre>

`owner` is a `User` object. Previously, we created <a href="/series/flask_api_tutorial/part-4/#user-model-api-model">the <code>user_model</code> API model</a> to serialize a `User` object to JSON. This API model exposes every attribute of the `User` class, most of which are unnecessary in this context.

Rather than re-using `user_model`, we will create `widget_owner_model` which exposes only the `email` and `public_id` values of the `User` object:

{{< highlight python "linenos=table,linenostart=86" >}}widget_owner_model = Model(
    "Widget Owner",
    {
        "email": String,
        "public_id": String,
    },
){{< /highlight >}}

The `widget_model` has a bunch of features that we are seeing for the first time. Let's take a look at it in more depth:

{{< highlight python "linenos=table,linenostart=94" >}}widget_model = Model(
    "Widget",
    {
        "name": String,
        "info_url": String,
        "created_at_iso8601": DateTime(attribute="created_at"),
        "created_at_rfc822": DateTime(attribute="created_at", dt_format="rfc822"),
        "deadline": String(attribute="deadline_str"),
        "deadline_passed": Boolean,
        "time_remaining": String(attribute="time_remaining_str"),
        "owner": Nested(widget_owner_model),
        "link": Url("api.widget"),
    },
){{< /highlight >}}

<div class="code-details">
    <ul>
      <li>
        <p><strong>Lines 99-100: </strong>This is the first time that we are using <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.fields.DateTime" target="_blank">the <code>flask_restplus.fields.DateTime</code> class</a>, which formats a <code>datetime</code> value as a string. There are two supported formats: RFC 822 and ISO 8601. The format which is returned is determined by the <code>dt_format</code> parameter.</p>
        <p>By default, ISO 8601 format is used. Since <code>dt_format</code> is not specified, <code>created_at_iso8601</code> will use this format. On the other hand, <code>created_at_rfc822</code> specifies <code>dt_format="rfc822"</code> so the same date will be returned using RFC 822 format.</p>
        <p>What do these two formats look like? Here's an example:</p>
        <pre><code>"created_at_iso8601": "2019-09-20T04:47:50",
"created_at_rfc822": "Fri, 20 Sep 2019 04:47:50 -0000",</code></pre>
        <p>The benefit of using a standard output format is that it can be easily parsed back to the original <code>datetime</code> value. If this is not a requirement and you (like me) find these formats difficult to quickly parse visually, there are other ways to format <code>datetime</code> values within an API model.</p>
      </li>
      <li>
        <p><strong>Line 101: </strong><code>deadline_str</code> is a formatted string version of <code>deadline</code>, which is a <code>datetime</code> value. Since <code>deadline</code> is localized to UTC, <code>deadline_str</code> converts this value to the local time zone where the code is executed.</p>
        <p>Here's an example of the format used by <code>deadline_str</code>:</p>
        <pre><code>"deadline": "09/20/19 10:59:59 PM UTC-08:00",</code></pre>
        <p>I prefer this style of formatting to either ISO 8601 or RFC 822 format since it is localized to the user's timezone and is (IMO) more readable. However, if the <code>datetime</code> value will not be read by humans and/or will be provided to a function expecting either ISO 8601 or RFC 822 format, obviously use the built-in <code>flask_restplus.fields.Datetime</code> class.</p>
      </li>
      <li>
        <p><strong>Line 102: </strong>We used the <code>Boolean</code> class already (in <a href="/series/flask_api_tutorial/part-4/#user-model-api-model">the <code>user_model</code> API model</a>), so refer back to that section if you need to review how it works.</p>
      </li>
      <li>
        <p><strong>Line 103: </strong><code>time_remaining_str</code> is a formatted string version of  <code>time_remaining</code>, which is a <code>timedelta</code> value. Since Flask-RESTPlus does not include built-in types for serializing <code>timedelta</code> values, formatting <code>time_remaining</code> as a string is the only way to include it in the serialized JSON.</p>
        <p>Here's an example of the format used by <code>time_remaining_str</code>:</p>
        <pre><code>"time_remaining": "16 hours 41 minutes 42 seconds",</code></pre>
      </li>
      <li>
        <p><strong>Line 104: </strong>In order to serialize a <code>Widget</code> object and preserve the structure where <code>owner</code> is a <code>User</code> object nested within the parent <code>Widget</code> object, we use <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.fields.Nested" target="_blank">the <code>Nested</code> class</a> in conjunction with the <code>widget_owner_model</code>.</p>
        <p>Here's what the <code>widget_owner_model</code> will look like within the parent <code>Widget</code> object:</p>
        <pre><code>"owner": {
    "email": "admin@test.com",
    "public_id": "475807a4-8497-4c5c-8d70-109b429bb4ef"
},</code></pre>
        <div class="note note-flex">
            <div class="note-icon">
                <i class="fa fa-pencil" aria-hidden="true"></i>
            </div>
            <div class="note-message" style="flex-flow: column wrap">
                <p>For more information and examples of serializing complex structures to JSON, please read the <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html#complex-structures" target="_blank">Complex Structures</a> and <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html#nested-field" target="_blank">Nested Field</a> sections of the Flask-RESTPlus documentation.</p>
            </div>
        </div>
      </li>
      <li>
        <p><strong>Line 105: </strong>The <code>Widget</code> class doesn't contain an attribute named <code>link</code>, so what's going on here? I think the best explanation of the <code>fields.Url</code> class is given in <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html#url-other-concrete-fields" target="_blank">the Flask-RESTPlus documentation</a>:</p>
        <blockquote class="rfc">Flask-RESTPlus includes a special field, <code>fields.Url</code>, that synthesizes a uri for the resource that’s being requested. This is also a good example of how to add data to your response that’s not actually present on your data object.</blockquote>
        <p>By including a <code>link</code> to the URI with each <code>Widget</code>, the client can perform CRUD actions without manually constructing or storing the URI (which is an example of <a href="#hateoas">HATEOAS</a>). By default, the value returned for <code>link</code> will be a relative URI as shown below:</p>
        <pre><code>"link": "/api/v1/widgets/first_widget"</code></pre>
        <p>If the <code>link</code> should be an absolute URI (containing scheme, hostname, and port), include the keyword argument <code>absolute=True</code> (e.g., <code>Url("api.widget", absolute=True)</code>). In my local test environment, this returns the URI below for the same <code>Widget</code> resource:</p>
        <pre><code>"link": "http://localhost:5000/api/v1/widgets/first_widget"</code></pre>
        <div class="alert alert-flex">
            <div class="alert-icon">
                <i class="fa fa-exclamation-triangle"></i>
            </div>
            <div class="alert-message">
                <p>The implementation of the <code>Url</code> field in <code>widget_model</code> relies on the <code>api.widget</code> endpoint, which we haven't created at this point. This will result in an unhandled exception until the <code>api.widget</code> endpoint has been fully implemented.</p>
            </div>
        </div>
      </li>
    </ul>
</div>

I hope that all of the material we encountered for the first time in the `widget_model` and `widget_owner_model` was easy to understand. The remaining API models are much simpler, and contain only a few small bits of new information. If you're comfortable with all of the information we just covered, let's move on and finish creating the `pagination_model`.

#### `pagination_links_model` and `pagination_model`

If you go back and look at the <a href="#pagination">pagination example in the Introduction</a> , there's something important that is included in the example that <span class="emphasis">is not</span> part of the Flask-RESTPlus `Pagination` object. Here's a hint: it has to do with <a href="#hateoas">HATEOAS</a>. The answer is: **navigational links**:

{{< highlight python "linenos=table,linenostart=108" >}}pagination_links_model = Model(
    "Nav Links",
    {
        "self": String,
        "prev": String,
        "next": String,
        "first": String,
        "last": String,
    },
){{< /highlight >}}

Since all of the fields in `pagination_links_model` are serialized using the `String` class, there's nothing new to discuss in that regard.

Finally, the `widget_model` and `pagination_links_model` are integrated into the `pagination_model`:

{{< highlight python "linenos=table,linenostart=119" >}}pagination_model = Model(
    "Pagination",
    {
        "links": Nested(pagination_links_model, skip_none=True),
        "has_prev": Boolean,
        "has_next": Boolean,
        "page": Integer,
        "total_pages": Integer(attribute="pages"),
        "items_per_page": Integer(attribute="per_page"),
        "total_items": Integer(attribute="total"),
        "items": List(Nested(widget_model)),
    },
){{< /highlight >}}

There are only a few things in `pagination_model` that we are seeing for the first time:

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 122: </strong>In order to match the object structure shown in the <a href="#pagination">Introduction</a>, <code>pagination_model</code> must have a field named <code>links</code> containing navigational links that allow the client to access all <code>Widget</code> instances available in the database.</p>
        <p>Notice that we are using the <code>Nested</code> field type the same way we did in <code>widget_model</code>, the only difference is that now we are including the keyword argument <code>skip_none=True</code>. As explained in <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html#skip-none-in-nested-fields" target="_blank">the Flask-RESTPlus documentation</a>, by default, if any of the fields in <code>pagination_links_model</code> have value <code>None</code>, the JSON output will contain these fields with value <code>null</code>.</p>
        <p>There are many situations where one or more of the navigational links will be <code>None</code> (e.g., for the first page of results <code>prev</code> will always be <code>None</code>). <span class="bold-italics">By specifying</span> <code>skip_none=True</code>, <span class="bold-italics">these values will not be rendered in the JSON output</span>, making it much cleaner and reducing the size of the response.</p>
      </li>
      <li>
        <p><strong>Lines 126-128: </strong>This isn't new information, I just want to point out that I have renamed these three fields to be more descriptive. IMHO, <code>total_pages</code> is a better name than <code>pages</code>, and the same thing goes for <code>items_per_page</code>/<code>per_page</code>, as well as <code>total_items</code>/<code>total</code>.</p>
      </li>
      <li>
        <p><strong>Line 129: </strong>We have already seen examples using the <code>Nested</code> type, which allows us to create complex API models which are composed of built-in types, custom types, and other API models. However, in order to serialize the most important part of the pagination object, we need a way to marshall a list of <code>widget</code> objects to JSON.</p>
        <p>This is easily accomplished using the <code>List</code> type in conjunction with the <code>Nested</code> type. For more information on the <code>List</code> type, refer to <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html#list-field" target="_blank">the Flask-RESTPlus documentation for Response Marshalling</a>.</p>
      </li>
    </ul>
</div>

We finally covered everything necessary to create the `pagination_model` API model. Here's an example of the JSON that our API model will produce given a pagination object with <code>page=2</code>, <code>per_page=5</code>, and <code>total=7</code>:

```json
{
  "links": {
    "self": "/api/v1/widgets?page=2&per_page=5",
    "first": "/api/v1/widgets?page=1&per_page=5",
    "prev": "/api/v1/widgets?page=1&per_page=5",
    "last": "/api/v1/widgets?page=2&per_page=5"
  },
  "has_prev": true,
  "has_next": false,
  "page": 2,
  "total_pages": 2,
  "items_per_page": 5,
  "total_items": 7,
  "items": [
    {
      "name": "foo",
      "info_url": "https://www.foo.bar",
      "created_at_iso8601": "2019-11-18T14:07:20",
      "created_at_rfc822": "Mon, 18 Nov 2019 14:07:20 -0000",
      "deadline": "11/19/19 11:59:59 PM UTC-08:00",
      "deadline_passed": true,
      "time_remaining": "No time remaining",
      "owner": {
        "email": "admin@test.com",
        "public_id": "475807a4-8497-4c5c-8d70-109b429bb4ef"
      },
      "link": "/api/v1/widgets/foo"
    },
    {
      "name": "new-test-555",
      "info_url": "http://www.newtest.net",
      "created_at_iso8601": "2019-12-01T17:45:26",
      "created_at_rfc822": "Sun, 01 Dec 2019 17:45:26 -0000",
      "deadline": "12/02/19 11:59:59 PM UTC-08:00",
      "deadline_passed": false,
      "time_remaining": "1 day 14 hours 12 minutes 46 seconds",
      "owner": {
        "email": "admin@test.com",
        "public_id": "475807a4-8497-4c5c-8d70-109b429bb4ef"
      },
      "link": "/api/v1/widgets/new-test-555"
    }
  ]
}
```

### `retrieve_widget_list` Method

Next, we need to create a function that performs the following actions:

* Create a `pagination` object given the `page` and `per_page` values parsed from the request data.
* Serialize the `pagination` object to JSON using `pagination_model` and <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.marshal" target="_blank">the `flask_restplus.marshall` method</a>.
* Construct <code>dict</code> of navigational links and add links to response header and body.
* Manually construct HTTP response using <a href="https://flask.palletsprojects.com/en/1.1.x/api/#flask.json.jsonify" target="_blank">the `flask.jsonify` method</a> and send response to client.

Before we begin, open `/app/api/widgets/business.py` and make the following updates to the import statements:

{{< highlight python "linenos=table,hl_lines=4-5 8-9" >}}"""Business logic for /widgets API endpoints."""
from http import HTTPStatus

from flask import jsonify, url_for
from flask_restplus import abort, marshal

from app import db
from app.api.auth.decorator import token_required, admin_token_required
from app.api.widget.dto import pagination_model
from app.models.user import User
from app.models.widget import Widget{{< /highlight >}}

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 4: </strong>Update to include the <code>flask.url_for</code> method.</p>
      </li>
      <li>
        <p><strong>Line 5: </strong>Update to include the <code>flask_restplus.marshal</code> method.</p>
      </li>
      <li>
        <p><strong>Line 8: </strong>Update to include the <code>token_required</code> decorator.</p>
      </li>
      <li>
        <p><strong>Line 9: </strong>Update to include the <code>pagination_model</code> object.</p>
      </li>
    </ul>
</div>

Next, add the content below:

{{< highlight python "linenos=table,linenostart=31" >}}@token_required
def retrieve_widget_list(page, per_page):
    pagination = Widget.query.paginate(page, per_page, error_out=False)
    response_data = marshal(pagination, pagination_model)
    response_data["links"] = _pagination_nav_links(pagination)
    response = jsonify(response_data)
    response.headers["Link"] = _pagination_nav_header_links(pagination)
    response.headers["Total-Count"] = pagination.total
    return response


def _pagination_nav_links(pagination):
    nav_links = {}
    per_page = pagination.per_page
    this_page = pagination.page
    last_page = pagination.pages
    nav_links["self"] = url_for("api.widget_list", page=this_page, per_page=per_page)
    nav_links["first"] = url_for("api.widget_list", page=1, per_page=per_page)
    if pagination.has_prev:
        nav_links["prev"] = url_for("api.widget_list", page=this_page - 1, per_page=per_page)
    if pagination.has_next:
        nav_links["next"] = url_for("api.widget_list", page=this_page + 1, per_page=per_page)
    nav_links["last"] = url_for("api.widget_list", page=last_page, per_page=per_page)
    return nav_links


def _pagination_nav_header_links(pagination):
    url_dict = _pagination_nav_links(pagination)
    link_header = ""
    for rel, url in url_dict.items():
        link_header += f'<{url}>; rel="{rel}", '
    return link_header.strip().strip(","){{< /highlight >}}

This code implements the process of responding to a valid request for a list of widgets, please note the following:

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 31: </strong>Per <span class="bold-text">Table 1</span>, the process of retrieving a list of <code>widgets</code> can only be performed by registered users (both regular and admin users). This is enforced by decorating the <code>retrieve_widget_list</code> function with <code>@token_required</code>.</p>
      </li>
      <li>
        <p><strong>Line 32: </strong>The <code>page</code> and <code>per_page</code> parameters are passed to <code>retrieve_widget_list</code> after the <code>pagination_model</code> has parsed the values provided by the client from the request data.</p>
      </li>
      <li>
        <p><strong>Line 33: </strong><a href="#flask-sqlalchemy-paginate-method">As demonstrated in the Python interactive shell</a>, <code>pagination</code> objects are created by calling <code>Widget.query.paginate</code>, with the <code>page</code> and <code>per_page</code> values provided by the client.</p>
      </li>
      <li>
        <p><strong>Line 34: </strong>This is the first time that we are seeing <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.marshal" target="_blank">the <code>flask_restplus.marshal</code> function</a>. However, we already know how it works since we used <a href="/series/flask_api_tutorial/part-4/#getuser-resource">the <code>@marshall_with</code> decorator in Part 4</a>.</p>
        <p>There is only a single, subtle difference between these two functions/decorators. Both operate on an object and filter the object's attributes/keys against the provided API model and validate the object's data against the set of fields configured in the API model.</p>
        <p>However, <code>@marshal_with</code> operates on the value returned from the function it decorates, while <code>flask_restplus.marshal</code> operates on whatever is passed to the function as the first parameter. So why are we calling the <code>marshal</code> function directly? In <span class="bold-text">Lines 37-38</span> custom header fields are added to the response before it is sent to the client, and there is no way to add these headers using <code>@marshal_with</code>.</p>
      </li>
      <li>
        <p><strong>Line 35: </strong>Remember, the output of the <code>marshal</code> function is a <code>dict</code>. Also remember that the <code>flask_sqlalchemy.Pagination</code> class <span class="emphasis">does not</span> contain navigational links. We will discuss the <code>_pagination_nav_links</code> function shortly, but what is important to know is that it returns a <code>dict</code> that matches the fields in <code>pagination_links_model</code>. This <code>dict</code> is then added to the <code>pagination</code> object with key-name <code>links</code>, which matches the field on <code>pagination_model</code> containing <code>Nested(pagination_links_model, skip_none=True)</code>.</p>
      </li>
      <li>
        <p><strong>Line 36: </strong>After adding the navigational links to the <code>pagination</code> object, it is ready to send to the client. <a href="/series/flask_api_tutorial/part-3/#process-registration-request">We discussed the <code>flask.jsonify</code> function in Part 3</a>, please review it if you are drawing a blank trying to remember what it does.</p>
        <p>TL;DR, calling <code>jsonify(response_data)</code> converts <code>response_data</code> (which is a <code>dict</code> object) to JSON and returns <a href="https://flask.palletsprojects.com/en/1.1.x/api/#flask.Response" target="_blank">a <code>flask.Response</code> object</a> with the JSON object as the response body.</p>
      </li>
      <li>
        <p><strong>Line 37: </strong>Refer back to <a href="/series/flask_api_tutorial/part-6/#pagination">the <code>pagination</code> section</a>, and note that the example includes navigational links in both the JSON response body <span class="emphasis">AND</span> the <code>Link</code> field in the response header. We will discuss the <code>_pagination_nav_header_links</code> function very soon, but what is important to know is that it returns a string containing all valid page navigation URLs in <a href="https://tools.ietf.org/html/rfc8288#section-3" target="_blank">the format specified for the Link Header Field</a> defined in <a href="https://tools.ietf.org/html/rfc8288" target="_blank">RFC 8288</a>.</p>
      </li>
      <li>
        <p><strong>Line 38: </strong>This isn't an official best practice, but it is very common to include other metadata about the paginated list in the response header. Here, we create a field named <code>Total-Count</code> that contains the total number of <code>Widget</code> objects in the database.</p>
      </li>
      <li>
        <p><strong>Line 39: </strong>After the response object is fully configured, we return it from the <code>retrieve_widget_list</code> function before sending it to the client.</p>
      </li>
      <li>
        <p><strong>Lines 42-54: </strong>The <code>_pagination_nav_links</code> function accepts a single parameter which is assumed to be a <code>Pagination</code> instance and returns a <code>dict</code> object named <code>nav_links</code> that matches the fields in <code>pagination_links_model</code>. By default, <code>nav_links</code> contains navigation URLs for <code>self</code>, <code>first</code>, and <code>last</code> pages (even if the total number of pages is one and all navigation URLs are the same). <code>prev</code> and <code>next</code> navigation URLs are not included by default. If <code>pagination.has_prev</code>, then the <code>prev</code> page URL is included (accordingly, <code>next</code> is included if <code>pagination.has_next</code>).</p>
      </li>
      <li>
        <p><strong>Lines 57-62: </strong>Finally, the <code>_pagination_nav_header_links</code> function also accepts a single parameter which is assumed to be a <code>Pagination</code> instance, but instead of a <code>dict</code> object a string is returned containing all valid page navigation URLs in the correct format for the <code>Link</code> header field.</p>
        <p>This function calls <code>_pagination_nav_links</code> and uses the <code>dict</code> that is returned to generate the <code>Link</code> header field. This works because the keys of the <code>dict</code> object are the same as the <code>Link</code> field's <code>rel</code> parameter and the <code>dict</code> values are the page navigation URLs.</p>
      </li>
    </ul>
</div>

Now that the business logic has been implemented, we can add a method to the `api.widget_list` endpoint to handle `GET` requests which will call the `retrieve_widget_list` function.

### `WidgetList` Resource (GET Request)

{{< highlight python "linenos=table,hl_lines=8-12 14 17-20" >}}"""API endpoint definitions for /widgets namespace."""
from http import HTTPStatus

from flask_restplus import Namespace, Resource

from app.api.widget.dto import (
    create_widget_reqparser,
    pagination_reqparser,
    widget_owner_model,
    widget_model,
    pagination_links_model,
    pagination_model,
)
from app.api.widget.business import create_widget, retrieve_widget_list

widget_ns = Namespace(name="widgets", validate=True)
widget_ns.models[widget_owner_model.name] = widget_owner_model
widget_ns.models[widget_model.name] = widget_model
widget_ns.models[pagination_links_model.name] = pagination_links_model
widget_ns.models[pagination_model.name] = pagination_model{{< /highlight >}}

{{< highlight python "linenos=table,linenostart=23,hl_lines=5-14" >}}@widget_ns.route("", endpoint="widget_list")
class WidgetList(Resource):
    """Handles HTTP requests to URL: /widgets."""

    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.OK, "Retrieved widget list.", pagination_model)
    @widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    @widget_ns.expect(pagination_reqparser)
    def get(self):
        """Retrieve a list of widgets."""
        request_data = pagination_reqparser.parse_args()
        page = request_data.get("page")
        per_page = request_data.get("per_page")
        return retrieve_widget_list(page, per_page)

    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.CREATED, "Added new widget.")
    @widget_ns.response(HTTPStatus.UNAUTHORIZED, "Unauthorized.")
    @widget_ns.response(HTTPStatus.FORBIDDEN, "Administrator token required.")
    @widget_ns.response(HTTPStatus.CONFLICT, "Widget name already exists.")
    @widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    @widget_ns.response(HTTPStatus.INTERNAL_SERVER_ERROR, "Internal server error.")
    @widget_ns.expect(create_widget_reqparser)
    def post(self):
        """Create a widget."""
        widget_dict = create_widget_reqparser.parse_args()
        return create_widget(widget_dict)
{{< /highlight >}}

## Retrieve Widget

### `retrieve_widget` Method

{{< highlight python "linenos=table,linenostart=24" >}}@token_required
def retrieve_widget(name):
    widget = Widget.find_by_name(name)
    return (
        widget,
        HTTPStatus.OK
        if widget
        else abort(HTTPStatus.NOT_FOUND, f"{name} not found in database.", status="fail"),
    ){{< /highlight >}}

### `Widget` Resource (GET Request)

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
    def get(self, name):
        """Retrieve a widget."""
        return retrieve_widget(name){{< /highlight >}}

## Update Widget

### `update_widget` Method

{{< highlight python "linenos=table,linenostart=2" >}}from datetime import datetime, timezone{{< /highlight >}}

{{< highlight python "linenos=table,linenostart=50" >}}@admin_token_required
def update_widget(name, widget_dict):
    widget = Widget.find_by_name(name)
    if not widget:
        abort(HTTPStatus.NOT_FOUND, f"{name} not found in database.", status="fail")
    for k, v in widget_dict.items():
        setattr(widget, k, v)
    db.session.commit()
    return widget, HTTPStatus.OK{{< /highlight >}}

### `Widget` Resource (PUT Request)

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
    @widget_ns.expect(update_widget_reqparser)
    @widget_ns.marshal_with(widget_model)
    def put(self, name):
        """Update a widget."""
        widget_dict = update_widget_reqparser.parse_args()
        return update_widget(name, widget_dict){{< /highlight >}}

## Delete Widget

### `delete_widget` Method

{{< highlight python "linenos=table,linenostart=63" >}}@admin_token_required
def delete_widget(name):
    widget = Widget.find_by_name(name)
    if not widget:
        return "", HTTPStatus.NO_CONTENT
    db.session.delete(release_info)
    db.session.commit()
    return "", HTTPStatus.NO_CONTENT{{< /highlight >}}

### `Widget` Resource (DELETE Request)

{{< highlight python "linenos=table,linenostart=92" >}}    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.NO_CONTENT, "Widget was deleted.")
    @widget_ns.response(HTTPStatus.UNAUTHORIZED, "Unauthorized.")
    @widget_ns.response(HTTPStatus.FORBIDDEN, "Administrator token required.")
    @widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
    def delete(self, name):
        """Delete a widget."""
        return delete_widget(name){{< /highlight >}}

## Unit Tests: Create Widget

## Unit Tests: Retrieve Widget List

## Unit Tests: Retrieve Widget

## Unit Tests: Update Widget

## Unit Tests: Delete Widget
