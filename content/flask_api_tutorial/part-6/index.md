---
title: "How To: Create a Flask API with JWT-Based Authentication (Part 6)"
lead: "Part 6: Widget API Continued"
slug: "part-6"
series: ["flask_api_tutorial"]
series_weight: 6
series_title: "How To: Create a Flask API with JWT-Based Authentication"
series_part: "Part 6"
series_part_lead: "Widget API Continued"
categories: ["Flask", "Python", "Tutorial-Series"]
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
|   |- <span class="work-file">test_create_widget.py</span>
|   |- <span class="work-file">test_delete_widget.py</span>
|   |- <span class="work-file">test_retrieve_widget.py</span>
|   |- <span class="work-file">test_retrieve_widget_list.py</span>
|   |- <span class="work-file">test_update_widget.py</span>
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

<pre><code><span class="cmd-lineno"> 1</span>  <span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">http :5000/api/v1/widgets?page=1&per_page=10 Authorization:"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjY4MjA3NDksImlhdCI6MTU2NjgxOTg0NCwic3ViIjoiMzUyMDg5N2EtZWQ0My00YWMwLWIzYWYtMmZjMTY3NzE5MTYwIiwiYWRtaW4iOmZhbHNlfQ.AkpscH6QoCrfHYeyJTyouanwyj4KH34f3YmzMnyKKdM"</span>
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
<span class="cmd-hl"><span class="cmd-lineno-hl">17</span>  <span class="purple">Link</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">&lt;/api/v1/widgets?page=1&per_page=10>; rel="self",</span></span>
<span class="cmd-hl"><span class="cmd-lineno-hl">18</span>  <span class="light-blue">&lt;/api/v1/widgets?page=1&per_page=10>; rel="first",</span></span>
<span class="cmd-hl"><span class="cmd-lineno-hl">19</span>  <span class="light-blue">&lt;/api/v1/widgets?page=2&per_page=10>; rel="next",</span></span>
<span class="cmd-hl"><span class="cmd-lineno-hl">20</span>  <span class="light-blue">&lt;/api/v1/widgets?page=5&per_page=10>; rel="last"</span></span>
<span class="cmd-lineno">21</span>  <span class="purple">Server</span>: <span class="light-blue">Werkzeug/0.15.5 Python/3.7.4</span>
<span class="cmd-lineno">22</span>  <span class="purple">Total-Count</span>: <span class="pink">23</span>
<span class="cmd-lineno">23</span>
<span class="cmd-lineno">24</span>  <span class="bold-text">{
<span class="cmd-hl"><span class="cmd-lineno-hl">25</span>    <span class="purple">"links"</span><span style="color: var(--light-gray2)">:{                                  </span></span>
<span class="cmd-hl"><span class="cmd-lineno-hl">26</span>    <span class="purple">"self"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"/api/v1/widgets?page=1&per_page=10"</span><span style="color: var(--light-gray2)">,</span></span>
<span class="cmd-hl"><span class="cmd-lineno-hl">27</span>    <span class="purple">"first"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"/api/v1/widgets?page=1&per_page=10"</span><span style="color: var(--light-gray2)">,</span></span>
<span class="cmd-hl"><span class="cmd-lineno-hl">28</span>    <span class="purple">"next"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"/api/v1/widgets?page=2&per_page=10"</span><span style="color: var(--light-gray2)">,</span></span>
<span class="cmd-hl"><span class="cmd-lineno-hl">29</span>    <span class="purple">"last"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"/api/v1/widgets?page=5&per_page=10"</span></span>
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
<span class="cmd-hl"><span class="cmd-lineno-hl">41</span>    <span class="purple">"link"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"/api/v1/widgets/test"</span><span style="color: var(--light-gray2)">,              </span></span>
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

```python {linenos=table,hl_lines=["6"]}
"""Parsers and serializers for /widgets API endpoints."""
import re
from datetime import date, datetime, time, timezone

from dateutil import parser
from flask_restplus.inputs import positive, URL
from flask_restplus.reqparse import RequestParser

from app.util.datetime_util import make_tzaware, DATE_MONTH_NAME
```

Next, add the content below:

```python {linenos=table,linenostart=69}
pagination_reqparser = RequestParser(bundle_errors=True)
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
)
```

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

<a href="/series/flask-api-tutorial/part-5/#widget-db-model">`owner_id` is defined</a> as <a href="https://docs.sqlalchemy.org/en/13/core/metadata.html#sqlalchemy.schema.Column" target="_blank">a SQLAlchemy `Column`</a> to which <a href="https://docs.sqlalchemy.org/en/13/core/constraints.html#sqlalchemy.schema.ForeignKey" target="_blank">a `ForeignKey` construct</a> has been applied and this integer value is stored in the `widget` database table. `Widget.owner` is defined as <a href="https://docs.sqlalchemy.org/en/13/orm/relationship_api.html#sqlalchemy.orm.relationship" target="_blank">a SQLAlchemy relationship</a> between the `Widget` table and the `User` table, and <span class="emphasis">is not</span> stored in the database. Whenever a `Widget` object is retrieved from the database, `Widget.owner` is populated with a `User` object thanks to the foreign-key relationship and the magic of the SQLAlchemy ORM.

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

Hopefully, this helps you understand the structure of the `Pagination` class and the behavior of the `paginate` method. Understanding both is crucial to implementing the remaining functionality of the `api.widget_list` endpoint. Next, we need to create an API model for the `Pagination` class which will be considerably more complex than the API model we created <a href="/series/flask-api-tutorial/part-4/#user-model-api-model">for the `User` class</a>.

### `pagination_model` API Model

In order to send a paginated list of widgets as part of an HTTP response, we need to serialize it to JSON. I explained the purpose of API Models and how Flask-RESTPlus uses them to serialize database objects in  <a href="/series/flask-api-tutorial/part-4/#user-model-api-model">Part 4</a>. If you need a refresher, please review it.

First, we need to update the import statements in `app/api/widgets/dto.py` to include the Flask-RESTPlus `Model` class, as well as a bunch of classes from the `fields` module . Add **Line 6** and **Line 7** and save the file:

```python {linenos=table,hl_lines=["6-7"]}
"""Parsers and serializers for /widgets API endpoints."""
import re
from datetime import date, datetime, time, timezone

from dateutil import parser
from flask_restplus import Model
from flask_restplus.fields import Boolean, DateTime, Integer, List, Nested, String, Url
from flask_restplus.inputs import positive, URL
from flask_restplus.reqparse import RequestParser

from app.util.datetime_util import make_tzaware, DATE_MONTH_NAME
```

Next, add the content below:

```python {linenos=table,linenostart=86}
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
)
```

There is a lot to digest here. This is the first time that we are encountering API models that are composed of other API models. `pagination_model` contains a list of `widget_model` objects as well as a single `pagination_links_model` instance, Also, `widget_model` contains a single instance of `widget_owner_model`. Let's take a look at how each API model is defined and how they interact with each other.

#### `widget_owner_model` and `widget_model`

Let's work our way from the inside-out. As demonstrated in the interactive shell, the structure of a `Pagination` object is:

<pre><code>pagination -> items -> widget -> owner</code></pre>

`owner` is a `User` object. Previously, we created <a href="/series/flask-api-tutorial/part-4/#user-model-api-model">the <code>user_model</code> API model</a> to serialize a `User` object to JSON. This API model exposes every attribute of the `User` class, most of which are unnecessary in this context.

Rather than re-using `user_model`, we will create `widget_owner_model` which exposes only the `email` and `public_id` values of the `User` object:

```python {linenos=table,linenostart=86}
widget_owner_model = Model(
    "Widget Owner",
    {
        "email": String,
        "public_id": String,
    },
)
```

The `widget_model` has a bunch of features that we are seeing for the first time. Let's take a look at it in more depth:

```python {linenos=table,linenostart=94}
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
```

<div class="code-details">
    <ul>
      <li>
        <p><strong>Lines 99-100: </strong>This is the first time that we are using <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.fields.DateTime" target="_blank">the <code>flask_restplus.fields.DateTime</code> class</a>, which formats a <code>datetime</code> value as a string. There are two supported formats: RFC 822 and ISO 8601. The format which is returned is determined by the <code>dt_format</code> parameter.</p>
        <p>By default, ISO 8601 format is used. Since <code>dt_format</code> is not specified, <code>created_at_iso8601</code> will use this format. On the other hand, <code>created_at_rfc822</code> specifies <code>dt_format="rfc822"</code> so the same date will be returned using RFC 822 format.</p>
        <p>What do these two formats look like? Here's an example:</p>
<pre class="chroma"><code class="language-json" data-lang="json"><span class="nt">"created_at_iso8601"</span><span class="p">:</span> <span class="s2">"2019-09-20T04:47:50"</span><span class="p">,</span>
<span class="nt">"created_at_rfc822"</span><span class="p">:</span> <span class="s2">"Fri, 20 Sep 2019 04:47:50 -0000"</span><span class="p">,</span></code></pre>
        <p>The benefit of using a standard output format is that it can be easily parsed back to the original <code>datetime</code> value. If this is not a requirement and you (like me) find these formats difficult to quickly parse visually, there are other ways to format <code>datetime</code> values within an API model.</p>
      </li>
      <li>
        <p><strong>Line 101: </strong><code>deadline_str</code> is a formatted string version of <code>deadline</code>, which is a <code>datetime</code> value. Since <code>deadline</code> is localized to UTC, <code>deadline_str</code> converts this value to the local time zone where the code is executed.</p>
        <p>Here's an example of the format used by <code>deadline_str</code>:</p>
<pre class="chroma"><code class="language-json" data-lang="json"><span class="nt">"deadline"</span><span class="p">:</span> <span class="s2">"09/20/19 10:59:59 PM UTC-08:00"</span><span class="p">,</span></code></pre>
        <p>I prefer this style of formatting to either ISO 8601 or RFC 822 format since it is localized to the user's timezone and is (IMO) more readable. However, if the <code>datetime</code> value will not be read by humans and/or will be provided to a function expecting either ISO 8601 or RFC 822 format, obviously use the built-in <code>flask_restplus.fields.Datetime</code> class.</p>
      </li>
      <li>
        <p><strong>Line 102: </strong>We used the <code>Boolean</code> class already (in <a href="/series/flask-api-tutorial/part-4/#user-model-api-model">the <code>user_model</code> API model</a>), so refer back to that section if you need to review how it works.</p>
      </li>
      <li>
        <p><strong>Line 103: </strong><code>time_remaining_str</code> is a formatted string version of  <code>time_remaining</code>, which is a <code>timedelta</code> value. Since Flask-RESTPlus does not include built-in types for serializing <code>timedelta</code> values, formatting <code>time_remaining</code> as a string is the only way to include it in the serialized JSON.</p>
        <p>Here's an example of the format used by <code>time_remaining_str</code>:</p>
<pre class="chroma"><code class="language-json" data-lang="json"><span class="nt">"time_remaining"</span><span class="p">:</span> <span class="s2">"16 hours 41 minutes 42 seconds"</span><span class="p">,</span></code></pre>
      </li>
      <li>
        <p><strong>Line 104: </strong>In order to serialize a <code>Widget</code> object and preserve the structure where <code>owner</code> is a <code>User</code> object nested within the parent <code>Widget</code> object, we use <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.fields.Nested" target="_blank">the <code>Nested</code> class</a> in conjunction with the <code>widget_owner_model</code>.</p>
        <p>Here's what the <code>widget_owner_model</code> will look like within the parent <code>Widget</code> object:</p>
<pre class="chroma"><code class="language-json" data-lang="json"><span class="nt">"owner"</span><span class="p">:</span> <span class="p">{</span>
    <span class="nt">"email"</span><span class="p">:</span> <span class="s2">"admin@test.com"</span><span class="p">,</span>
    <span class="nt">"public_id"</span><span class="p">:</span> <span class="s2">"475807a4-8497-4c5c-8d70-109b429bb4ef"</span><span class="p">,</span>
<span class="p">}</span></code></pre>
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
        <blockquote>Flask-RESTPlus includes a special field, <code>fields.Url</code>, that synthesizes a uri for the resource that’s being requested. This is also a good example of how to add data to your response that’s not actually present on your data object.</blockquote>
        <p>By including a <code>link</code> to the URI with each <code>Widget</code>, the client can perform CRUD actions without manually constructing or storing the URI (which is an example of <a href="#hateoas">HATEOAS</a>). By default, the value returned for <code>link</code> will be a relative URI as shown below:</p>
<pre class="chroma"><code class="language-json" data-lang="json"><span class="nt">"link"</span><span class="p">:</span> <span class="s2">"/api/v1/widgets/first_widget"</span><span class="p">,</span></code></pre>
        <p>If the <code>link</code> should be an absolute URI (containing scheme, hostname, and port), include the keyword argument <code>absolute=True</code> (e.g., <code>Url("api.widget", absolute=True)</code>). In my local test environment, this returns the URI below for the same <code>Widget</code> resource:</p>
<pre class="chroma"><code class="language-json" data-lang="json"><span class="nt">"link"</span><span class="p">:</span> <span class="s2">"http://localhost:5000/api/v1/widgets/first_widget"</span><span class="p">,</span></code></pre>
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

```python {linenos=table,linenostart=108}
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
```

Since all of the fields in `pagination_links_model` are serialized using the `String` class, there's nothing new to discuss in that regard.

Finally, the `widget_model` and `pagination_links_model` are integrated into the `pagination_model`:

```python {linenos=table,linenostart=119}
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
)
```

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
        <p><strong>Line 129: </strong>We have already seen examples using the <code>Nested</code> type, which allows us to create complex API models which are composed of built-in types, custom types, and other API models. However, in order to serialize the most important part of the pagination object, we need a way to marshal a list of <code>widget</code> objects to JSON.</p>
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
* Serialize the `pagination` object to JSON using `pagination_model` and <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.marshal" target="_blank">the `flask_restplus.marshal` method</a>.
* Construct <code>dict</code> of navigational links and add links to response header and body.
* Manually construct HTTP response using <a href="https://flask.palletsprojects.com/en/1.1.x/api/#flask.json.jsonify" target="_blank">the `flask.jsonify` method</a> and send response to client.

Before we begin, open `/app/api/widgets/business.py` and make the following updates to the import statements:

```python {linenos=table,hl_lines=["4-5","8-9"]}
"""Business logic for /widgets API endpoints."""
from http import HTTPStatus

from flask import jsonify, url_for
from flask_restplus import abort, marshal

from app import db
from app.api.auth.decorator import token_required, admin_token_required
from app.api.widgets.dto import pagination_model
from app.models.user import User
from app.models.widget import Widget
```

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

```python {linenos=table,linenostart=31}
@token_required
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
    return link_header.strip().strip(",")
```

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
        <p><strong>Line 34: </strong>This is the first time that we are seeing <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.marshal" target="_blank">the <code>flask_restplus.marshal</code> function</a>. However, we already know how it works since we used <a href="/series/flask-api-tutorial/part-4/#getuser-resource">the <code>@marshall_with</code> decorator in Part 4</a>.</p>
        <p>There is only a single, subtle difference between these two functions/decorators. Both operate on an object and filter the object's attributes/keys against the provided API model and validate the object's data against the set of fields configured in the API model.</p>
        <p>However, <code>@marshal_with</code> operates on the value returned from the function it decorates, while <code>flask_restplus.marshal</code> operates on whatever is passed to the function as the first parameter. So why are we calling the <code>marshal</code> function directly? In <span class="bold-text">Lines 37-38</span> custom header fields are added to the response before it is sent to the client, and there is no way to add these headers using <code>@marshal_with</code>.</p>
      </li>
      <li>
        <p><strong>Line 35: </strong>Remember, the output of the <code>marshal</code> function is a <code>dict</code>. Also remember that the <code>flask_sqlalchemy.Pagination</code> class <span class="emphasis">does not</span> contain navigational links. We will discuss the <code>_pagination_nav_links</code> function shortly, but what is important to know is that it returns a <code>dict</code> that matches the fields in <code>pagination_links_model</code>. This <code>dict</code> is then added to the <code>pagination</code> object with key-name <code>links</code>, which matches the field on <code>pagination_model</code> containing <code>Nested(pagination_links_model, skip_none=True)</code>.</p>
      </li>
      <li>
        <p><strong>Line 36: </strong>After adding the navigational links to the <code>pagination</code> object, it is ready to send to the client. <a href="/series/flask-api-tutorial/part-3/#process-registration-request">We discussed the <code>flask.jsonify</code> function in Part 3</a>, please review it if you are drawing a blank trying to remember what it does.</p>
        <p>TL;DR, calling <code>jsonify(response_data)</code> converts <code>response_data</code> (which is a <code>dict</code> object) to JSON and returns <a href="https://flask.palletsprojects.com/en/1.1.x/api/#flask.Response" target="_blank">a <code>flask.Response</code> object</a> with the JSON object as the response body.</p>
      </li>
      <li>
        <p><strong>Line 37: </strong>Refer back to <a href="/series/flask-api-tutorial/part-6/#pagination">the <code>pagination</code> section</a>, and note that the example includes navigational links in both the JSON response body <span class="emphasis">AND</span> the <code>Link</code> field in the response header. We will discuss the <code>_pagination_nav_header_links</code> function very soon, but what is important to know is that it returns a string containing all valid page navigation URLs in <a href="https://tools.ietf.org/html/rfc8288#section-3" target="_blank">the format specified for the Link Header Field</a> defined in <a href="https://tools.ietf.org/html/rfc8288" target="_blank">RFC 8288</a>.</p>
      </li>
      <li>
        <p><strong>Line 38: </strong>This isn't an official best practice, but it is very common to include other metadata about the paginated list in the response header. Here, we create a field named <code>Total-Count</code> that contains the total number of <code>Widget</code> objects in the database.</p>
      </li>
      <li>
        <p><strong>Line 39: </strong>After the response object is fully configured, we return it from the <code>retrieve_widget_list</code> function before sending it to the client.</p>
      </li>
      <li>
        <p><strong>Lines 42-54: </strong>The <code>_pagination_nav_links</code> function accepts a single parameter which is assumed to be a <code>Pagination</code> instance and returns a <code>dict</code> object named <code>nav_links</code> that matches the fields in <code>pagination_links_model</code>. By default, <code>nav_links</code> contains navigation URLs for <code>self</code>, <code>first</code>, and <code>last</code> pages (even if the total number of pages is one and all navigation URLs are the same). <code>prev</code> and <code>next</code> navigation URLs are not included by default. If <code>pagination.has_prev</code> is <code>True</code>, then the <code>prev</code> page URL is included (accordingly, <code>next</code> is included if <code>pagination.has_next</code> is <code>True</code>).</p>
      </li>
      <li>
        <p><strong>Lines 57-62: </strong>Finally, the <code>_pagination_nav_header_links</code> function also accepts a single parameter which is assumed to be a <code>Pagination</code> instance, but instead of a <code>dict</code> object a string is returned containing all valid page navigation URLs in the correct format for the <code>Link</code> header field.</p>
        <p>This function calls <code>_pagination_nav_links</code> and uses the <code>dict</code> that is returned to generate the <code>Link</code> header field. This works because the keys of the <code>dict</code> object are the same as the <code>Link</code> field's <code>rel</code> parameter and the <code>dict</code> values are the page navigation URLs.</p>
      </li>
    </ul>
</div>

Now that the business logic has been implemented, we can add a method to the `api.widget_list` endpoint that will call `retrieve_widget_list` after parsing/validating the request data.

### `api.widget_list` Endpoint (GET Request)

We created the `api.widget_list` endpoint <a href="/series/flask-api-tutorial/part-5/#widgetlist-resource-post-request">in Part 5</a> and implemented the function that handles `POST` requests. According to **Table 1**, this endpoint also supports `GET` requests which allows clients to retrieve lists of `widgets`.

Open `/app/api/widgets/endpoints.py` and make the following updates to the import statements:

```python {linenos=table,hl_lines=["8-12",14,"17-20"]}
"""API endpoint definitions for /widgets namespace."""
from http import HTTPStatus

from flask_restplus import Namespace, Resource

from app.api.widgets.dto import (
    create_widget_reqparser,
    pagination_reqparser,
    widget_owner_model,
    widget_model,
    pagination_links_model,
    pagination_model,
)
from app.api.widgets.business import create_widget, retrieve_widget_list
```

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 8: </strong>Update to include the <code>pagination_reqparser</code> object.</p>
      </li>
      <li>
        <p><strong>Lines 9-12: </strong>Update to include the <code>widget_owner_model</code>, <code>widget_model</code>, <code>pagination_links_model</code>, and <code>pagination_model</code> API models.</p>
      </li>
      <li>
        <p><strong>Line 14: </strong>Update to include the <code>retrieve_widget_list</code> function.</p>
      </li>
    </ul>
</div>

Next, add the highlighted lines to `endpoints.py` and save the file:

```python {linenos=table,linenostart=16,hl_lines=["2-5","15-23"]}
widget_ns = Namespace(name="widgets", validate=True)
widget_ns.models[widget_owner_model.name] = widget_owner_model
widget_ns.models[widget_model.name] = widget_model
widget_ns.models[pagination_links_model.name] = pagination_links_model
widget_ns.models[pagination_model.name] = pagination_model


@widget_ns.route("", endpoint="widget_list")
@widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
@widget_ns.response(HTTPStatus.UNAUTHORIZED, "Unauthorized.")
@widget_ns.response(HTTPStatus.INTERNAL_SERVER_ERROR, "Internal server error.")
class WidgetList(Resource):
    """Handles HTTP requests to URL: /widgets."""

    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.OK, "Retrieved widget list.", pagination_model)
    @widget_ns.expect(pagination_reqparser)
    def get(self):
        """Retrieve a list of widgets."""
        request_data = pagination_reqparser.parse_args()
        page = request_data.get("page")
        per_page = request_data.get("per_page")
        return retrieve_widget_list(page, per_page)

    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.CREATED, "Added new widget.")
    @widget_ns.response(HTTPStatus.FORBIDDEN, "Administrator token required.")
    @widget_ns.response(HTTPStatus.CONFLICT, "Widget name already exists.")
    @widget_ns.expect(create_widget_reqparser)
    def post(self):
        """Create a widget."""
        widget_dict = create_widget_reqparser.parse_args()
        return create_widget(widget_dict)
```

<div class="code-details">
    <ul>
      <li>
        <p><strong>Lines 17-20: </strong>We need to register all of the API models that we created in <code>app.api.widgets.dto</code> with the <code>widget_ns</code> namespace. This is an easy thing to forget and can be a difficult issue to debug. If the API models are not registered with the <code>widget_ns</code> namespace, the entire Swagger UI page will fail to render, displaying only a single cryptic error message: <span class="bold-italics">No API definition provided</span>.</p>
      </li>
      <li>
        <p><strong>Line 31: </strong>The <code>response</code> decorator can be configured with an API model as an optional third argument. This has no effect on the resource's behavior, but the API model is displayed on the Swagger UI page with response code 200 as an example response body.</p>
      </li>
      <li>
        <p><strong>Line 32: </strong>The <code>expect</code> decorator was explained in depth <a href="http://localhost:1313/series/flask-api-tutorial/part-3/#registeruser-resource">in Part 3</a>, please review the implementation of the function that handles <code>POST</code> requests for the <code>api.auth_register</code> endpoint if you need a refresher. Basically, applying the decorator <code>@widget_ns.expect(create_widget_reqparser)</code> to a function has two enormous effects: it specifies that <code>create_widget_reqparser</code> will be used to parse the client's request, <span class="emphasis">AND</span> it renders a form on the Swagger UI page with <code>input</code> text elements for <code>widget.name</code>, <code>widget.info_url</code>, and <code>widget.deadline</code>.</p>
      </li>
      <li>
        <p><strong>Lines 35-38: </strong>Everything here should be completely obvious to you since calling <code>parse_args</code> to get the client's request data and passing the data to our business logic is a process that we implement on (nearly) every API handler.</p>
      </li>
    </ul>
</div>

We can verify that the `api.widget_list` endpoint now supports both `GET` and `POST` requests by executing the `flask routes` command:

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">flask routes</span>
<span class="cmd-results">Endpoint             Methods    Rule
-------------------  ---------  --------------------------
api.auth_login       POST       /api/v1/auth/login
api.auth_logout      POST       /api/v1/auth/logout
api.auth_register    POST       /api/v1/auth/register
api.auth_user        GET        /api/v1/auth/user
api.doc              GET        /api/v1/ui
api.root             GET        /api/v1/
api.specs            GET        /api/v1/swagger.json
<span class="cmd-hl-border">api.widget_list      GET, POST  /api/v1/widgets</span>
restplus_doc.static  GET        /swaggerui/&lt;path:filename&gt;
static               GET        /static/&lt;path:filename&gt;</span></code></pre>

<div class="alert alert-flex">
  <div class="alert-icon">
    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
  </div>
  <div class="alert-message">
    <p>Please remember, currently an unhandled exception occurs if you attempt to execute either of the methods we have created for the <code>api.widget_list</code> endpoint since the business logic for both operations depends on the <code>api.widget</code> endpoint existing. We will create unit tests for all endpoints/CRUD operations in <span class="bold-text">Table 1</span> when they have been fully implemented.</p>
  </div>
</div>

## Retrieve Widget

At this point, we have completed two of the five CRUD processes specified in **Table 1**. Thankfully, the remaining three should be much simpler and faster to implement since many of the elements can be reused (e.g. request parsers, API models).

The two processes we completed (create a `widget`, retrieve a list of `widgets`) are accessed via the `/api/v1/widgets` endpoint, which is also called the **resource collection** endpoint. However, the remaining three processes are accessed via the **resource item** endpoint, <code>api/v1/widgets/&lt;name&gt;</code>. The `name` parameter is provided by the client and is used to perform the requested action (retrieve, update, delete) on a specific `widget` instance.

Let's start with the process that is most similar to the last one we implemented, retrieving a single `widget`. We do not need to create any request parsers or API models since the name of the `widget` is provided in the URI requested by the client, and the `widget_model` can be re-used to serialize the requested object in the response.

### `retrieve_widget` Method

The business logic for retrieving a single `widget` is very simple. First, the database is queried for `widgets` matching the `name` that was requested by the client. If a matching `widget` is found, it is serialized to JSON and sent to the client with status code 200 (`HTTPStatus.OK`). If no `widget` exists with the specified `name`, a 404 (`HTTPStatus.NOT_FOUND`) response is sent to the client.

Because this is such a common pattern in web applications, <a href="https://flask-sqlalchemy.palletsprojects.com/en/2.x/queries/#queries-in-views" target="_blank">Flask-SQLAlchemy provides the `first_or_404` method</a> which does exactly what we need. It is modeled after <a href="https://docs.sqlalchemy.org/en/13/orm/query.html#sqlalchemy.orm.query.Query.first" target="_blank">the `first` function</a> from SQLAlchemy, which returns either the first result of a query or `None`. `first_or_404` raises a 404 error instead of returning `None`.

Open `/app/api/widgets/business.py` and add the function below:

```python {linenos=table,linenostart=42}
@token_required
def retrieve_widget(name):
    return Widget.query.filter_by(name=name.lower()).first_or_404(
        description=f"{name} not found in database."
    )
```

This operation requires a valid access token, so the `@token_required` decorator is applied to the function **(Line 42)**. The `first_or_404` method **(Line 44)** accepts an optional `description` parameter which is used to include a message in the body of the HTTP response explaining why the request failed. Also, please note that the `name` value provided by the client is converted to lowercase before searching.

### `api.widget` Endpoint (GET Request)

Next, we need to create the `api.widget` endpoint. Before we do so, open `/app/api/widgets/endpoints.py` and update the import statements to include the `retrieve_widget` function **(Line 17)**:

```python {linenos=table,hl_lines=[17]}
"""API endpoint definitions for /widgets namespace."""
from http import HTTPStatus

from flask_restplus import Namespace, Resource

from app.api.widgets.dto import (
    create_widget_reqparser,
    pagination_reqparser,
    widget_owner_model,
    widget_model,
    pagination_links_model,
    pagination_model,
)
from app.api.widgets.business import (
    create_widget,
    retrieve_widget_list,
    retrieve_widget
)
```

Next, add the content below:

```python {linenos=table,linenostart=55}
@widget_ns.route("/<name>", endpoint="widget")
@widget_ns.param("name", "Widget name")
@widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
@widget_ns.response(HTTPStatus.NOT_FOUND, "Widget not found.")
@widget_ns.response(HTTPStatus.UNAUTHORIZED, "Unauthorized.")
@widget_ns.response(HTTPStatus.INTERNAL_SERVER_ERROR, "Internal server error.")
class Widget(Resource):
    """Handles HTTP requests to URL: /widgets/{name}."""

    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.OK, "Retrieved widget.", widget_model)
    @widget_ns.marshal_with(widget_model)
    def get(self, name):
        """Retrieve a widget."""
        return retrieve_widget(name)
```

The only thing that we are seeing for the first time is how to include a parameter in the endpoint path. Thankfully, Flask-RESTPlus uses the same process as Flask for URL route registration (via the `@route` decorator). <a href="https://flask.palletsprojects.com/en/1.1.x/api/#url-route-registrations" target="_blank">From the Flask documentation</a>:

<blockquote>
  <p>Variable parts in the route can be specified with angular brackets (<code>/user/&lt;username&gt;</code>). By default a variable part in the URL accepts any string without a slash however a different converter can be specified as well by using <code>/&lt;converter:name&gt;</code>.</p>
  <p>Variable parts are passed to the view function as keyword arguments.</p>
  <p>The following converters are available:</p>
  <table>
    <tr>
      <td><code>string</code></td>
      <td>accepts any text without a slash (the default)</td>
    </tr>
    <tr>
      <td><code>int</code></td>
      <td>accepts integers</td>
    </tr>
    <tr>
      <td><code>float</code></td>
      <td>like int but for floating point values</td>
    </tr>
    <tr>
      <td><code>path</code></td>
      <td>like the default but also accepts slashes</td>
    </tr>
    <tr>
      <td><code>int</code></td>
      <td>matches one of the items provided</td>
    </tr>
    <tr>
      <td><code>uuid</code></td>
      <td>accepts UUID strings</td>
    </tr>
  </table>
</blockquote>

For the `api.widget` endpoint, the `name` parameter is documented in **Lines 56-57** and is then passed to the `get` method as a parameter in **Line 68**.

We can verify that the `api.widget` endpoint has been registered and currently only responds to `GET` requests by executing the `flask routes` command:

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">flask routes</span>
<span class="cmd-results">Endpoint             Methods    Rule
-------------------  ---------  --------------------------
api.auth_login       POST       /api/v1/auth/login
api.auth_logout      POST       /api/v1/auth/logout
api.auth_register    POST       /api/v1/auth/register
api.auth_user        GET        /api/v1/auth/user
api.doc              GET        /api/v1/ui
api.root             GET        /api/v1/
api.specs            GET        /api/v1/swagger.json
<span class="cmd-hl-border">api.widget           GET        /api/v1/widgets/&lt;name&gt;</span>
api.widget_list      GET, POST  /api/v1/widgets
restplus_doc.static  GET        /swaggerui/&lt;path:filename&gt;
static               GET        /static/&lt;path:filename&gt;</span></code></pre>

## Update Widget

Working our way through **Table 1**, the next process to implement is updating a single `widget`. Clients with administrator access can perform this operation by sending a `PUT` request to the `api.widget` endpoint.

I'd like you to try and imagine the business logic that the server should perform in this situation. Did you imagine something similar to: <span class="bold-italics">retrieve the</span> <code>widget</code> <span class="bold-italics">whose name matches the URI requested by the client, parse the request data containing the updated data/values, and modify the attributes of the</span> <code>widget</code> <span class="bold-italics">using the parsed values</span>?

This is certainly a sensible, common sense answer. And the function that we implement will do the same thing in certain situations. However, <a href="https://tools.ietf.org/html/rfc7231#section-4.3.4" target="_blank">RFC 7231 (HTTP/1.1 Semantics and Content)</a> contains the formal specification for the `PUT` method. I've excerpted some of the most important parts of the spec below:

<blockquote><strong>4.3.4.  PUT</strong>
<p style="margin: 5px 0 0 10px">The PUT method requests that the state of the target resource be created or replaced with the state defined by the representation enclosed in the request message payload.
<br>...<br>
If the target resource does not have a current representation and the PUT successfully creates one, then the origin server MUST inform the user agent by sending a 201 (Created) response.  If the target resource does have a current representation and that representation is successfully modified in accordance with the state of the enclosed representation, then the origin server MUST send either a 200 (OK) or a 204 (No Content) response to indicate successful completion of the request
<br>....<br>
An origin server SHOULD verify that the PUT representation is consistent with any constraints the server has for the target resource that cannot or will not be changed by the PUT.
<br>....<br>
The fundamental difference between the POST and PUT methods is highlighted by the different intent for the enclosed representation. The target resource in a POST request is intended to handle the enclosed representation according to the resource's own semantics, whereas the enclosed representation in a PUT request is defined as replacing the state of the target resource.  Hence, the intent of PUT is idempotent and visible to intermediaries, even though the exact effect is only known by the origin server.</p>
</blockquote>

I know, the language is highly technical and much more complex than the answer to the hypothetical question I posed. Fear not, implementing the `PUT` method per the specification doesn't require much additional effort.

### `update_widget_reqparser` Request Parser

The request data sent by the client for a `PUT` request is nearly identical to the data sent for a `POST` request, with one important difference. With a `PUT` request, the `name` parameter is provided in the URI instead of the body of the request. Because of this, we can't just re-use the `create_widget_reqparser` as-is to parse a `PUT` request.

It turns out that the need to re-use portions of a request parser is such a common occurrence that <a href="https://flask-restplus.readthedocs.io/en/stable/parsing.html#parser-inheritance" target="_blank">Flask-RESTPlus provides methods to copy an existing parser, and then add/remove arguments</a>. This is extremely useful since it obviates the need to re-write every argument and duplicate a bunch of code just to slightly tweak the behavior of a request parser.

For example, open `/app/api/widgets/dto.py`, add the lines below, then save the file:

```python {linenos=table,linenostart=67}
update_widget_reqparser = create_widget_reqparser.copy()
update_widget_reqparser.remove_argument("name")
```

Now we have exactly the request parser that we need for `PUT` requests received at the `api.widgets` endpoint. The `update_widget_reqparser` is created by simply copying the `create_widget_reqparser` and removing the `name` argument. We will import and use this when we are ready to implement the `put` method handler.

### `update_widget` Method

Next, we need to create the business logic that implements the `PUT` method as specified in <a href="https://tools.ietf.org/html/rfc7231#section-4.3.4" target="_blank">RFC 7231</a>.

First, open `/app/api/widgets/business.py` and update the import statements to include the `widget_name` function from the `app.api.widgets.dto` module **(Line 9)**:

```python {linenos=table,hl_lines=[9]}
"""Business logic for /widgets API endpoints."""
from http import HTTPStatus

from flask import jsonify, url_for
from flask_restplus import abort, marshal

from app import db
from app.api.auth.decorator import token_required, admin_token_required
from app.api.widgets.dto import pagination_model, widget_name
from app.models.user import User
from app.models.widget import Widget
```

Then copy the `update_widget` function below and add it to `business.py`:

```python {linenos=table,linenostart=49}
@admin_token_required
def update_widget(name, widget_dict):
    widget = Widget.find_by_name(name.lower())
    if widget:
        for k, v in widget_dict.items():
            setattr(widget, k, v)
        db.session.commit()
        response_dict = dict(status="success", message=f"'{name}' was successfully updated")
        return response_dict, HTTPStatus.OK
    try:
        valid_name = widget_name(name.lower())
    except ValueError as e:
        abort(HTTPStatus.BAD_REQUEST, str(e), status="fail")
    widget_dict["name"] = valid_name
    return create_widget(widget_dict)
```

Let's make sure that the `update_widget` function correctly implements the `PUT` method:

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 51: </strong>The first thing we do is check the database for a <code>widget</code> with the name provided by the client. </p>
        <div class="note note-flex">
          <div class="note-icon">
            <i class="fa fa-pencil" aria-hidden="true"></i>
          </div>
          <div class="note-message" style="flex-flow: column wrap">
            <p>Remember, all <code>widget</code> names are converted to lowercase when written to the database. Because of this, we must be careful to convert the value provided by the client to lowercase before searching. You can review <a href="/series/flask-api-tutorial/part-5/#name-argument">the validation logic for the <code>widget</code> name attribute in Part 5</a>.</p>
          </div>
        </div>
      </li>
      <li>
        <p><strong>Lines 53-55: </strong>If the name provided by the client is found in the database, we save the retrieved <code>Widget</code> instance as <code>widget</code>. Next, we iterate over the items in <code>widget_dict</code> and overwrite the attributes of <code>widget</code> with the values provided by the client. Then, the updated <code>widget</code> is committed to the database.</p>
      </li>
      <li>
        <p><strong>Lines 56-57: </strong>Per the specification, if the name provided by the client already exists, and the <code>widget</code> was successfully updated using the values parsed from the request data, we can confirm that the request succeeded by sending either a 200 (<code>HTTPStatus.OK</code>) or 204 (<code>HTTPStatus.NO_CONTENT</code>) response.</p>
      </li>
      <li>
        <p><strong>Line 59: </strong>If we reach this point, it means that the database does not contain a <code>widget</code> with the name provided by the client. Before using this value to create a new <code>widget</code>, we must validate it with <a href="/series/flask-api-tutorial/part-5/#name-argument">the <code>widget_name</code> function</a> we created in the <code>app.api.widgets.dto</code> module. If it is valid, this function will return the value we passed in. If it is not valid, a <code>ValueError</code> will be thrown.</p>
      </li>
      <li>
        <p><strong>Line 61: </strong>If the name provided by the client is invalid we cannot create a new <code>widget</code>. The server rejects the request with a 400 (<code>HTTPStatus.BAD_REQUEST</code>) response containing an error message detailing why the value provided is not a valid <code>widget</code> name.</p>
      </li>
      <li>
        <p><strong>Line 62: </strong>If the name provided by the client was successfully validated by the <code>widget_name</code> function, we need to add it to the <code>widget_dict</code> object since the <code>create_widget</code> function expects to receive a <code>dict</code> object containing <code>name</code>, <code>info_url</code>, and <code>deadline</code> keys. <code>widget_dict["name"] = valid_name</code> stores the validated name. At this point, <code>widget_dict</code> is in the format expected by the <code>create_widget</code> function.</p>
      </li>
      <li>
        <p><strong>Line 63: </strong>As specified in <a href="https://tools.ietf.org/html/rfc7231#section-4.3.4" target="_blank">RFC 7231</a>, if the name provided by the client does not already exist and this <code>PUT</code> request successfully creates one, we can confirm that the request succeeded by sending a 201 (<code>HTTPStatus.CREATED</code>) response.</p>
      </li>
    </ul>
</div>

I believe that the `update_widget` function satisfies the specification for the `PUT` method as specified in <a href="https://tools.ietf.org/html/rfc7231#section-4.3.4" target="_blank">RFC 7231</a>. <span class="bold-italics">If you disagree, please let me know in the comments, I would greatly appreciate it if my understanding of the spec is faulty in any way.</span>

### `api.widget` Endpoint (PUT Request)

Before we can bring everything together and expose the `put` method handler for the `api.widget` endpoint, open `/app/api/widgets/endpoints.py` and update the import statements to include the `update_widget_reqparser` we created in `app.api.widgets.dto` **(Line 8)** and the `update_widget` function we created in `app.api.widgets.business` **(Line 19)**:

```python {linenos=table,hl_lines=[8,19]}
"""API endpoint definitions for /widgets namespace."""
from http import HTTPStatus

from flask_restplus import Namespace, Resource

from app.api.widgets.dto import (
    create_widget_reqparser,
    update_widget_reqparser,
    pagination_reqparser,
    widget_owner_model,
    widget_model,
    pagination_links_model,
    pagination_model,
)
from app.api.widgets.business import (
    create_widget,
    retrieve_widget_list,
    retrieve_widget,
    update_widget,
)
```

Next, add the highlighted lines to `endpoints.py` and save the file:

```python {linenos=table,linenostart=57,hl_lines=["17-27"]}
@widget_ns.route("/<name>", endpoint="widget")
@widget_ns.param("name", "Widget name")
@widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
@widget_ns.response(HTTPStatus.NOT_FOUND, "Widget not found.")
@widget_ns.response(HTTPStatus.UNAUTHORIZED, "Unauthorized.")
@widget_ns.response(HTTPStatus.INTERNAL_SERVER_ERROR, "Internal server error.")
class Widget(Resource):
    """Handles HTTP requests to URL: /widgets/{name}."""

    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.OK, "Retrieved widget.", widget_model)
    @widget_ns.marshal_with(widget_model)
    def get(self, name):
        """Retrieve a widget."""
        return retrieve_widget(name)

    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.OK, "Widget was updated.", widget_model)
    @widget_ns.response(HTTPStatus.CREATED, "Added new widget.")
    @widget_ns.response(HTTPStatus.FORBIDDEN, "Administrator token required.")
    @widget_ns.expect(update_widget_reqparser)
    def put(self, name):
        """Update a widget."""
        widget_dict = update_widget_reqparser.parse_args()
        return update_widget(name, widget_dict)
```

We have previously encountered and explained everything in the `put` method, so you should be comfortable moving on without explaining the design/implementation. We can verify that the `api.widget` endpoint now supports both `GET` and `PUT` requests by executing the `flask routes` command:

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">flask routes</span>
<span class="cmd-results">Endpoint             Methods    Rule
-------------------  ---------  --------------------------
api.auth_login       POST       /api/v1/auth/login
api.auth_logout      POST       /api/v1/auth/logout
api.auth_register    POST       /api/v1/auth/register
api.auth_user        GET        /api/v1/auth/user
api.doc              GET        /api/v1/ui
api.root             GET        /api/v1/
api.specs            GET        /api/v1/swagger.json
<span class="cmd-hl-border">api.widget           GET, PUT   /api/v1/widgets/&lt;name&gt;</span>
api.widget_list      GET, POST  /api/v1/widgets
restplus_doc.static  GET        /swaggerui/&lt;path:filename&gt;
static               GET        /static/&lt;path:filename&gt;</span></code></pre>

Alright, four down, one to go! The only remaining CRUD process we have not yet implemented is deleting a single `widget`.

## Delete Widget

Implementing the process to delete a single `widget` will be simple and very similar to implementing the process to retrieve a single `widget`. The only data that is sent by the client is the `name` of the `widget`, so we do not need to create a request parser for this process. Also, a successful response will not include any data in the response body, so we do not need to create any API models to serialize the response.

### `delete_widget` Method

Open `/app/api/widgets/business.py` and add the content below:

```python {linenos=table,linenostart=66}
@admin_token_required
def delete_widget(name):
    widget = Widget.query.filter_by(name=name.lower()).first_or_404(
        description=f"{name} not found in database."
    )
    db.session.delete(widget)
    db.session.commit()
    return "", HTTPStatus.NO_CONTENT
```

The `delete_widget` function relies on the Flask-SQLAlchemy `first_or_404` method which we used previously in the `retrieve_widget` function. If the database does not contain a `widget` with the `name` provided by the client, the request is rejected and a 404 (`HTTPStatus.NOT_FOUND`) response is sent. If a `widget` was successfully retrieved, however, it is deleted and the changes are committed to the database. Then, a 204 (`HTTPStatus.NO_CONTENT`) response is sent with an empty request body.

### `api.widget` Endpoint (DELETE Request)

I told you this would be easy! Open `/app/api/widgets/endpoints.py` and update the import statements to include the `delete_widget` function that we just created in `app.api.widgets.business` **(Line 20)**:

```python {linenos=table,hl_lines=[20]}
"""API endpoint definitions for /widgets namespace."""
from http import HTTPStatus

from flask_restplus import Namespace, Resource

from app.api.widgets.dto import (
    create_widget_reqparser,
    update_widget_reqparser,
    pagination_reqparser,
    widget_owner_model,
    widget_model,
    pagination_links_model,
    pagination_model,
)
from app.api.widgets.business import (
    create_widget,
    retrieve_widget_list,
    retrieve_widget,
    update_widget,
    delete_widget,
)
```

Next, add the highlighted lines to `endpoints.py` and save the file:

```python {linenos=table,linenostart=58,hl_lines=["27-33"]}
@widget_ns.route("/<name>", endpoint="widget")
@widget_ns.param("name", "Widget name")
@widget_ns.response(HTTPStatus.BAD_REQUEST, "Validation error.")
@widget_ns.response(HTTPStatus.NOT_FOUND, "Widget not found.")
@widget_ns.response(HTTPStatus.UNAUTHORIZED, "Unauthorized.")
@widget_ns.response(HTTPStatus.INTERNAL_SERVER_ERROR, "Internal server error.")
class Widget(Resource):
    """Handles HTTP requests to URL: /widgets/{name}."""

    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.OK, "Retrieved widget.", widget_model)
    @widget_ns.marshal_with(widget_model)
    def get(self, name):
        """Retrieve a widget."""
        return retrieve_widget(name)

    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.OK, "Widget was updated.", widget_model)
    @widget_ns.response(HTTPStatus.CREATED, "Added new widget.")
    @widget_ns.response(HTTPStatus.FORBIDDEN, "Administrator token required.")
    @widget_ns.expect(update_widget_reqparser)
    def put(self, name):
        """Update a widget."""
        widget_dict = update_widget_reqparser.parse_args()
        return update_widget(name, widget_dict)

    @widget_ns.doc(security="Bearer")
    @widget_ns.response(HTTPStatus.NO_CONTENT, "Widget was deleted.")
    @widget_ns.response(HTTPStatus.FORBIDDEN, "Administrator token required.")
    def delete(self, name):
        """Delete a widget."""
        return delete_widget(name)
```

We have previously encountered and explained everything in the `delete` method, so there's nothing we need to elaborate on. We can verify that the `api.widget` endpoint now supports `DELETE`, `GET` and `PUT` requests by executing the `flask routes` command:

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">flask routes</span>
<span class="cmd-results">Endpoint             Methods           Rule
-------------------  ----------------  --------------------------
api.auth_login       POST              /api/v1/auth/login
api.auth_logout      POST              /api/v1/auth/logout
api.auth_register    POST              /api/v1/auth/register
api.auth_user        GET               /api/v1/auth/user
api.doc              GET               /api/v1/ui
api.root             GET               /api/v1/
api.specs            GET               /api/v1/swagger.json
<span class="cmd-hl-border">api.widget           DELETE, GET, PUT  /api/v1/widgets/&lt;name&gt;</span>
api.widget_list      GET, POST         /api/v1/widgets
restplus_doc.static  GET               /swaggerui/&lt;path:filename&gt;
static               GET               /static/&lt;path:filename&gt;</span></code></pre>

We have finally implemented all of the API routes/CRUD processes specified in **Table 1**, but we actually have no idea if they are working correctly. At the absolute minimum, we need to create unit tests that verify the "happy path" behavior for each CRUD process. We also need unit tests that verify our request parsers are configured correctly, and requests containing invalid data are rejected.

## Unit Tests

At this point, I would like you to attempt to create as many unit tests you can think of for the Widget API endpoints/CRUD operations we implemented in this section and the previous section ([Part 5](/series/flask-api-tutorial/part-5/)). For each, dtft6r6yrfjtjd4I will provide a few tests to get you started, and demonstrate how touse the `@pytest.mark.parametrize` makes testing multiple values for a single parameter much simpler.

### `conftest.py`

```python {linenos=table}
"""Global pytest fixtures."""
import pytest

from flask_api_tutorial import create_app
from flask_api_tutorial import db as database
from flask_api_tutorial.models.user import User
from test.util import EMAIL, ADMIN_EMAIL, PASSWORD


@pytest.fixture
def app():
    app = create_app("testing")
    return app


@pytest.fixture
def db(app, client, request):
    database.drop_all()
    database.create_all()
    database.session.commit()

    def fin():
        database.session.remove()

    request.addfinalizer(fin)
    return database


@pytest.fixture
def user(db):
    user = User(email=EMAIL, password=PASSWORD)
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def admin(db):
    admin = User(email=ADMIN_EMAIL, password=PASSWORD, admin=True)
    db.session.add(admin)
    db.session.commit()
    return admin
```

### Create Widget

```python {linenos=table}
"""Unit tests for api.widget_list API endpoint."""
from datetime import date
from http import HTTPStatus

import pytest
from flask import url_for
from test.util import (
    EMAIL,
    ADMIN_EMAIL,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    DEFAULT_NAME,
    DEFAULT_URL,
    DEFAULT_DEADLINE,
    login_user,
    create_widget,
)


@pytest.mark.parametrize("widget_name", ["abc123", "widget-name", "new_widget1"])
def test_create_widget_valid_name(client, db, admin, widget_name):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token, widget_name=widget_name)
    assert response.status_code == HTTPStatus.CREATED
    assert "status" in response.json and response.json["status"] == "success"
    success = f"New widget added: {widget_name}."
    assert "message" in response.json and response.json["message"] == success
    location = f"http://localhost/api/v1/widgets/{widget_name}"
    assert "Location" in response.headers and response.headers["Location"] == location


@pytest.mark.parametrize("widget_name", ["abc!23", "widget name", "@widget"])
def test_create_widget_invalid_name(client, db, admin, widget_name):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token, widget_name=widget_name)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "message" in response.json and response.json["message"] == BAD_REQUEST
    assert "errors" in response.json and "name" in response.json["errors"]
    name_error = f"'{widget_name}' contains one or more invalid characters."
    assert name_error in response.json["errors"]["name"]


@pytest.mark.parametrize(
    "info_url",
    ["http://www.widget.info", "https://www.securewidgets.gov", "http://aaa.bbb.ccc/ddd/eee.html"],
)
def test_create_widget_valid_url(client, db, admin, info_url):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token, info_url=info_url)
    assert response.status_code == HTTPStatus.CREATED
    assert "status" in response.json and response.json["status"] == "success"
    success = f"New widget added: {DEFAULT_NAME}."
    assert "message" in response.json and response.json["message"] == success
    location = f"http://localhost/api/v1/widgets/{DEFAULT_NAME}"
    assert "Location" in response.headers and response.headers["Location"] == location


@pytest.mark.parametrize(
    "info_url", ["www.widget.info", "http://localhost:5000", "git://aaa.bbb.ccc"]
)
def test_create_widget_invalid_url(client, db, admin, info_url):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token, info_url=info_url)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "message" in response.json and response.json["message"] == BAD_REQUEST
    assert "errors" in response.json and "info_url" in response.json["errors"]
    assert f"{info_url} is not a valid URL." in response.json["errors"]["info_url"]


@pytest.mark.parametrize(
    "deadline",
    [
        date.today().strftime("%m/%d/%Y"),
        date.today().strftime("%Y-%m-%d"),
        date.today().strftime("%b %d %Y"),
    ],
)
def test_create_widget_valid_deadline(client, db, admin, deadline):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token, deadline=deadline)
    assert response.status_code == HTTPStatus.CREATED
    assert "status" in response.json and response.json["status"] == "success"
    success = f"New widget added: {DEFAULT_NAME}."
    assert "message" in response.json and response.json["message"] == success
    location = f"http://localhost/api/v1/widgets/{DEFAULT_NAME}"
    assert "Location" in response.headers and response.headers["Location"] == location


@pytest.mark.parametrize("deadline", ["1/1/1970", "2020 - 45 - 21 - 66", "someday"])
def test_create_widget_invalid_deadline(client, db, admin, deadline):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token, deadline=deadline)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "message" in response.json and response.json["message"] == BAD_REQUEST
    assert "errors" in response.json and "deadline" in response.json["errors"]


def test_create_widget_bundle_errors(client, db, admin):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(
        client,
        access_token,
        widget_name="widget name",
        info_url="www.widget.info",
        deadline="1/1/1970",
    )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "message" in response.json and response.json["message"] == BAD_REQUEST
    assert "errors" in response.json and "name" in response.json["errors"]
    assert "info_url" in response.json["errors"] and "deadline" in response.json["errors"]


def test_create_widget_already_exists(client, db, admin):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token)
    assert response.status_code == HTTPStatus.CREATED
    response = create_widget(client, access_token)
    assert response.status_code == HTTPStatus.CONFLICT
    assert "status" in response.json and response.json["status"] == "fail"
    name_conflict = f"Widget name: {DEFAULT_NAME} already exists, must be unique."
    assert "message" in response.json and response.json["message"] == name_conflict


def test_create_widget_no_token(client, db):
    request_data = f"name={DEFAULT_NAME}&info_url={DEFAULT_URL}&deadline={DEFAULT_DEADLINE}"
    response = client.post(
        url_for("api.widget_list"),
        data=request_data,
        content_type="application/x-www-form-urlencoded",
    )
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "status" in response.json and response.json["status"] == "fail"
    assert "message" in response.json and response.json["message"] == UNAUTHORIZED


def test_create_widget_no_admin_token(client, db, user):
    response = login_user(client, email=EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token)
    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "status" in response.json and response.json["status"] == "fail"
    assert "message" in response.json and response.json["message"] == FORBIDDEN
```

### Retrieve Widget List

### Retrieve Widget

### Update Widget

### Delete Widget

## Checkpoint

<div class="requirements">
  <p class="title">User Management/JWT Authentication</p>
  <div class="fa-bullet-list">
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>New users can register by providing an email address and password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>Existing users can obtain a JWT by providing their email address and password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>JWT contains the following claims: time the token was issued, time the token expires, a value that identifies the user, and a flag that indicates if the user has administrator access</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>JWT is sent in access_token field of HTTP response after successful authentication with email/password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>JWTs must expire after 1 hour (in production)</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>JWT is sent by client in Authorization field of request header</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>Requests must be rejected if JWT has been modified</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>Requests must be rejected if JWT is expired</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>If user logs out, their JWT is immediately invalid/expired</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>If JWT is expired, user must re-authenticate with email/password to obtain a new JWT</p>
  </div>
  <p class="title">API Resource: Widget List</p>
  <div class="fa-bullet-list">
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>All users can retrieve a list of all widgets</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>All users can retrieve individual widgets by name</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>Users with administrator access can add new widgets to the database</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>Users with administrator access can edit existing widgets</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>Users with administrator access can delete widgets from the database</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>The widget model contains attributes with URL, datetime, timedelta and bool data types, along with normal text fields.</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>URL and datetime values must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>The widget model contains a "name" attribute which must be a string value containing only lowercase-letters, numbers and the "-" (hyphen character) or "_" (underscore character).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>The widget model contains a "deadline" attribute which must be a datetime value where the date component is equal to or greater than the current date. The comparison does not consider the value of the time component when this comparison is performed.</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>Widget name must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>If input validation fails either when adding a new widget or editing an existing widget, the API response must include error messages indicating the name(s) of the fields that failed validation.</p>
  </div>
</div>
