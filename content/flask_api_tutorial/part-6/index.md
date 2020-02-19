---
title: "How To: Create a Flask API with JWT-Based Authentication (Part 6)"
lead: "Part 6: Pagination, HATEOAS and Parameterized Testing"
slug: "part-6"
series: ["flask_api_tutorial"]
series_weight: 6
series_title: "How To: Create a Flask API with JWT-Based Authentication"
series_part: "Part 6"
series_part_lead: "Pagination, HATEOAS and Parameterized Testing"
menu_section: "tutorials"
categories: ["Flask", "Python", "Tutorial-Series"]
toc: true
summary: "Part 6 completes the implementation of the Widget API. Since one of the requirements is to allow users to retrieve a paginated list of widgets, advanced techniques for serializing objects to JSON are demonstrated. Both the widget API model and the pagination API model are complex, requiring the use of several new classes from the Flask-RESTx fields module. The update and delete processes are implemented next and unit tests for all endpoint/request type combination are created and executed."
git_release_name: "v0.6"
url_git_rel_browse: "https://github.com/a-luna/flask-api-tutorial/tree/v0.6"
url_git_rel_zip: "https://github.com/a-luna/flask-api-tutorial/archive/v0.6.zip"
url_git_rel_tar: "https://github.com/a-luna/flask-api-tutorial/archive/v0.6.tar.gz"
url_git_rel_diff: "https://github.com/a-luna/flask-api-tutorial/compare/v0.5...v0.6"
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by wong zihoo on Unsplash"
  - name: img1
    src: images/swagger.png
    title: Figure 1 - Swagger UI with all API routes
---

## Project Structure

The chart below shows the folder structure for this section of the tutorial. In this post, we will work on all files marked as <code class="work-file">NEW CODE</code>. Files that contain code from previous sections but will not be modified in this post are marked as <code class="unmodified-file">NO CHANGES</code>.

<pre class="project-structure"><div><span class="project-folder">.</span> <span class="project-structure">(project root folder)</span>
|- <span class="project-folder">src</span>
|   |- <span class="project-folder">flask_api_tutorial</span>
|       |- <span class="project-folder">api</span>
|       |   |- <span class="project-folder">auth</span>
|       |   |   |- <span class="project-empty-file">__init__.py</span>
|       |   |   |- <span class="unmodified-file">business.py</span>
|       |   |   |- <span class="unmodified-file">decorators.py</span>
|       |   |   |- <span class="unmodified-file">dto.py</span>
|       |   |   |- <span class="unmodified-file">endpoints.py</span>
|       |   |
|       |   |- <span class="project-folder">widgets</span>
|       |   |   |- <span class="project-empty-file">__init__.py</span>
|       |   |   |- <span class="work-file">business.py</span>
|       |   |   |- <span class="work-file">dto.py</span>
|       |   |   |- <span class="work-file">endpoints.py</span>
|       |   |
|       |   |- <span class="unmodified-file">__init__.py</span>
|       |
|       |- <span class="project-folder">models</span>
|       |   |- <span class="project-empty-file">__init__.py</span>
|       |   |- <span class="unmodified-file">token_blacklist.py</span>
|       |   |- <span class="unmodified-file">user.py</span>
|       |   |- <span class="unmodified-file">widget.py</span>
|       |
|       |- <span class="project-folder">util</span>
|       |   |- <span class="project-empty-file">__init__.py</span>
|       |   |- <span class="unmodified-file">datetime_util.py</span>
|       |   |- <span class="unmodified-file">result.py</span>
|       |
|       |- <span class="unmodified-file">__init__.py</span>
|       |- <span class="unmodified-file">config.py</span>
|
|- <span class="project-folder">tests</span>
|   |- <span class="project-empty-file">__init__.py</span>
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
|   |- <span class="work-file">util.py</span>
|
|- <span class="unmodified-file">.env</span>
|- <span class="unmodified-file">.gitignore</span>
|- <span class="unmodified-file">.pre-commit-config.yaml</span>
|- <span class="unmodified-file">pyproject.toml</span>
|- <span class="unmodified-file">pytest.ini</span>
|- <span class="unmodified-file">README.md</span>
|- <span class="unmodified-file">run.py</span>
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

{{< info_box >}}
While Fielding defined HATEOAS and stipulated that it is a requirement for a REST API, he did not specify the format for doing so. Depending on the project, navigational links could be provided in either the response header or body (obviously I have provided both for this demonstration). The format of the `Link` header field is defined in [RFC 8288](https://tools.ietf.org/html/rfc8288), which is a Proposed Standard that is widely employed throughout the internet (i.e., it's pretty safe to use it in your application, too).
{{< /info_box >}}

## Retrieve Widget List

With the background info regarding pagination and HATEOAS in mind, we are ready to begin implementing the API endpoint that responds to `GET` requests sent to `/api/v1/widgets`. Per **[Table 1](#table-1)**, this endpoint and request type allows clients to retrieve a list of `widget` objects. As before, we start by creating request parsers/API models to validate request data and serialize response data.

### `pagination_reqparser` Request Parser

When a client sends a request to retrieve a list of `widgets`, what data should we expect to be included with the request? The answer should be fairly obvious based on the information covered in the <a href="#pagination">Introduction</a>.

The request to retrieve a list of `widget` objects should include two values: the page number and number of items per page. Luckily, both of these values are integers, and there are several pre-built types in the `flask_restplus.inputs` module that convert request data to integer values.

Open `src/flask_api_tutorial/api/widgets/dto.py` and update the import statements to include the `flask_restplus.inputs.positive` class **(Line 6)**:

```python {linenos=table,hl_lines=["6"]}
"""Parsers and serializers for /widgets API endpoints."""
import re
from datetime import date, datetime, time, timezone

from dateutil import parser
from flask_restx.inputs import positive, URL
from flask_restx.reqparse import RequestParser

from flask_api_tutorial.util.datetime_util import make_tzaware, DATE_MONTH_NAME

```

Next, add the content below:

```python {linenos=table,linenostart=70}
pagination_reqparser = RequestParser(bundle_errors=True)
pagination_reqparser.add_argument("page", type=positive, required=False, default=1)
pagination_reqparser.add_argument(
    "per_page", type=positive, required=False, choices=[5, 10, 25, 50, 100], default=10
)
```

By specifying `type=positive`, the value provided in the request data will be coerced to an integer. If the value represents a positive, non-zero integer, the request will succeed and the server will send the paginated list to the client. Otherwise, the server will reject the request with status code 400 `HTTPStatus.BAD_REQUEST`.

{{< info_box >}}
Why did I choose [the `flask_restplus.inputs.positive` class](https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.inputs.positive)? For both the `page` and `per_page` parameters, zero and negative values are invalid. Checking the parsed values to ensure they are positive numbers would be simple, but since a class already exists that performs the same check, IMO, it is wasteful to re-implement the same logic.
{{< /info_box >}}

This is the first time that we have specified a `RequestParser` argument as `required=False`. This allows the client to send a request **without** either parameter and the request will still succeed (e.g., `GET /api/v1/widgets` will return the same response as `GET /api/v1/widgets?page=1&per_page=10`).

{{< info_box >}}
What would happen if `required=True` and the client sends a request without either parameter? Rather than using a default value, the server would reject the request with status code `HTTPStatus.BAD_REQUEST` (400) and include an error message indicating that one or more required values were missing.
{{< /info_box >}}

The range of valid values for the `page` parameter is any positive integer. However, the `per_page` parameter must have an upper bound since the point of employing pagination is to prevent the API from becoming sluggish due to sending/receiving a large amount of data.

Flask-RESTx includes a pre-built type (<a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.inputs.int_range" target="_blank"><code>flask_restplus.inputs.int_range</code></a>) that will restrict values to a range of integers. This would allow the client to request any number of items per page, but I think it makes more sense to restrict the page size to a small, fixed set of choices.

The list provided to the `choices` keyword defines the set of allowable values. This has an additional benefit &mdash; on the Swagger UI page, the input form for `per_page` will render a select element containing the list of choices.

Implementing the request parser was trivial, but constructing a response containing a list of `widget` objects is significantly more complicated. Keep in mind, <span class="bold-italics">the response must be formatted as a paginated list</span>, including navigational links and values for the current page number, number of items per page, total number of items in the collection, etc.

It is possible to create the paginated list manually from scratch and define API models to serialize the whole thing to JSON (it would also be tedious). Instead of needlessly wasting time, let's take a look at a method that will do most of the work for us.

### Flask-SQLAlchemy `paginate` Method

The Flask-SQLAlchemy extension provides <a href="https://flask-sqlalchemy.palletsprojects.com/en/2.x/api/#flask_sqlalchemy.BaseQuery.paginate" target="_blank">a `paginate` method</a> that produces <a href="https://flask-sqlalchemy.palletsprojects.com/en/2.x/api/#flask_sqlalchemy.Pagination" target="_blank">`Pagination` objects</a>. The `paginate` method is a member of <a href="https://docs.sqlalchemy.org/en/13/orm/query.html#the-query-object" target="_blank">the <code>Query</code> class</a>, and I think the easiest way to understand how it works is with a demonstration in the interactive shell:

<pre><code><span class="cmd-venv">(venv) flask_api_tutorial $</span> <span class="cmd-input">flask shell</span>
<span class="cmd-results">Python 3.7.4 (default, Jul 20 2019, 23:16:09)
[Clang 10.0.1 (clang-1001.0.46.4)] on darwin
App: flask-api-tutorial [development]
Instance: /Users/aaronluna/Projects/flask_api_tutorial/instance</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">len(Widget.query.all())</span>
<span class="cmd-repl-results">6</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination = Widget.query.paginate(page=1, per_page=5)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pagination</span>
<span class="cmd-repl-results">&lt;flask_sqlalchemy.Pagination object at 0x10b44bf90&gt;</span></code></pre>

I created six `Widget` instances in my test environment, which is verified by the first statement `len(Widget.query.all())` returning a result of 6. Next, we create a `Pagination` object for the first page of `Widget` objects with five items per page by calling `Widget.query.paginate(page=1, per_page=5)`. The last statement verifies that we did, in fact, create a `Pagination` object.

{{< info_box >}}
I recommend reading the [SQLAlchemy documentation for the Query object](https://docs.sqlalchemy.org/en/13/orm/query.html#the-query-object), as well as the Flask-SQLAlchemy documentation for [the `Pagination` object](https://flask-sqlalchemy.palletsprojects.com/en/2.x/api/#flask_sqlalchemy.Pagination) and [the `paginate` method](https://flask-sqlalchemy.palletsprojects.com/en/2.x/api/#flask_sqlalchemy.BaseQuery.paginate).
{{< /info_box >}}

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

Hopefully, this helps you understand the structure of the `Pagination` class and the behavior of the `paginate` method. Understanding both is crucial to implementing the `api.widget_list` endpoint. Next, we need to create an API model for the `Pagination` class which will be considerably more complex than the API model we created <a href="/series/flask-api-tutorial/part-4/#user-model-api-model">for the `User` class</a>.

### `pagination_model` API Model

In order to send a paginated list of widgets as part of an HTTP response, we need to serialize it to JSON. I explained the purpose of API Models and how Flask-RESTx uses them to serialize database objects in <a href="/series/flask-api-tutorial/part-4/#user-model-api-model">Part 4</a>. If you need a refresher, please review it.

First, we need to update the import statements in `src/flask_api_tutorial/api/widgets/dto.py` to include the Flask-RESTx `Model` class, as well as a bunch of classes from the `fields` module . Add **Line 6** and **Line 7** and save the file:

```python {linenos=table,hl_lines=["6-7"]}
"""Parsers and serializers for /widgets API endpoints."""
import re
from datetime import date, datetime, time, timezone

from dateutil import parser
from flask_restx import Model
from flask_restx.fields import Boolean, DateTime, Integer, List, Nested, String, Url
from flask_restx.inputs import positive, URL
from flask_restx.reqparse import RequestParser

from flask_api_tutorial.util.datetime_util import make_tzaware, DATE_MONTH_NAME

```

Next, add the content below:

```python {linenos=table,linenostart=86}
widget_owner_model = Model("Widget Owner", {"email": String, "public_id": String})

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
    {"self": String, "prev": String, "next": String, "first": String, "last": String},
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
        <p><strong>Line 103: </strong><code>time_remaining_str</code> is a formatted string version of  <code>time_remaining</code>, which is a <code>timedelta</code> value. Since Flask-RESTx does not include built-in types for serializing <code>timedelta</code> values, formatting <code>time_remaining</code> as a string is the only way to include it in the serialized JSON.</p>
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
{{< info_box >}}
For more information and examples of serializing complex structures to JSON, please read the [Complex Structures](https://flask-restplus.readthedocs.io/en/stable/marshalling.html#complex-structures) and [Nested Field](https://flask-restplus.readthedocs.io/en/stable/marshalling.html#nested-field) sections of the Flask-RESTx documentation.
{{< /info_box >}}
      </li>
      <li>
        <p><strong>Line 105: </strong>The <code>Widget</code> class doesn't contain an attribute named <code>link</code>, so what's going on here? I think the best explanation of the <code>fields.Url</code> class is given in <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html#url-other-concrete-fields" target="_blank">the Flask-RESTx documentation</a>:</p>
        <blockquote>Flask-RESTx includes a special field, <code>fields.Url</code>, that synthesizes a uri for the resource that’s being requested. This is also a good example of how to add data to your response that’s not actually present on your data object.</blockquote>
        <p>By including a <code>link</code> to the URI with each <code>Widget</code>, the client can perform CRUD actions without manually constructing or storing the URI (which is an example of <a href="#hateoas">HATEOAS</a>). By default, the value returned for <code>link</code> will be a relative URI as shown below:</p>
<pre class="chroma"><code class="language-json" data-lang="json"><span class="nt">"link"</span><span class="p">:</span> <span class="s2">"/api/v1/widgets/first_widget"</span><span class="p">,</span></code></pre>
        <p>If the <code>link</code> should be an absolute URI (containing scheme, hostname, and port), include the keyword argument <code>absolute=True</code> (e.g., <code>Url("api.widget", absolute=True)</code>). In my local test environment, this returns the URI below for the same <code>Widget</code> resource:</p>
<pre class="chroma"><code class="language-json" data-lang="json"><span class="nt">"link"</span><span class="p">:</span> <span class="s2">"http://localhost:5000/api/v1/widgets/first_widget"</span><span class="p">,</span></code></pre>
{{< alert_box >}}
The implementation of the `Url` field in `widget_model` relies on the `api.widget` endpoint, which we haven't created at this point. This will result in an unhandled exception until the `api.widget` endpoint has been fully implemented.
{{< /alert_box >}}
      </li>
    </ul>
</div>

I hope that all of the material we encountered for the first time in the `widget_model` and `widget_owner_model` was easy to understand. The remaining API models are much simpler, and contain only a few small bits of new information. If you're comfortable with all of the information we just covered, let's move on and finish creating the `pagination_model`.

#### `pagination_links_model` and `pagination_model`

If you go back and look at the <a href="#pagination">pagination example in the Introduction</a> , there's something important that is included in the example that <span class="emphasis">is not</span> part of the Flask-RESTx `Pagination` object. Here's a hint: it has to do with <a href="#hateoas">HATEOAS</a>. The answer is: **navigational links**:

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
        <p>Notice that we are using the <code>Nested</code> field type the same way we did in <code>widget_model</code>, the only difference is that now we are including the keyword argument <code>skip_none=True</code>. As explained in <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html#skip-none-in-nested-fields" target="_blank">the Flask-RESTx documentation</a>, by default, if any of the fields in <code>pagination_links_model</code> have value <code>None</code>, the JSON output will contain these fields with value <code>null</code>.</p>
        <p>There are many situations where one or more of the navigational links will be <code>None</code> (e.g., for the first page of results <code>prev</code> will always be <code>None</code>). <span class="bold-italics">By specifying</span> <code>skip_none=True</code>, <span class="bold-italics">these values will not be rendered in the JSON output</span>, making it much cleaner and reducing the size of the response.</p>
      </li>
      <li>
        <p><strong>Lines 126-128: </strong>This isn't new information, I just want to point out that I have renamed these three fields to be more descriptive. IMHO, <code>total_pages</code> is a better name than <code>pages</code>, and the same thing goes for <code>items_per_page</code>/<code>per_page</code>, as well as <code>total_items</code>/<code>total</code>.</p>
      </li>
      <li>
        <p><strong>Line 129: </strong>We have already seen examples using the <code>Nested</code> type, which allows us to create complex API models which are composed of built-in types, custom types, and other API models. However, in order to serialize the most important part of the pagination object, we need a way to marshal a list of <code>widget</code> objects to JSON.</p>
        <p>This is easily accomplished using the <code>List</code> type in conjunction with the <code>Nested</code> type. For more information on the <code>List</code> type, refer to <a href="https://flask-restplus.readthedocs.io/en/stable/marshalling.html#list-field" target="_blank">the Flask-RESTx documentation for Response Marshalling</a>.</p>
      </li>
    </ul>
</div>

### `pagination_model` JSON Example

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

- Create a `pagination` object given the `page` and `per_page` values parsed from the request data.
- Serialize the `pagination` object to JSON using `pagination_model` and <a href="https://flask-restplus.readthedocs.io/en/stable/api.html#flask_restplus.marshal" target="_blank">the `flask_restplus.marshal` method</a>.
- Construct <code>dict</code> of navigational links and add links to response header and body.
- Manually construct HTTP response using <a href="https://flask.palletsprojects.com/en/1.1.x/api/#flask.json.jsonify" target="_blank">the `flask.jsonify` method</a> and send response to client.

Before we begin, open `src/flask_api_tutorial/api/widgets/business.py` and make the following updates to the import statements:

```python {linenos=table,hl_lines=["4-5","8-9"]}
"""Business logic for /widgets API endpoints."""
from http import HTTPStatus

from flask import jsonify, url_for
from flask_restx import abort, marshal

from flask_api_tutorial import db
from flask_api_tutorial.api.auth.decorators import token_required, admin_token_required
from flask_api_tutorial.api.widgets.dto import pagination_model
from flask_api_tutorial.models.user import User
from flask_api_tutorial.models.widget import Widget

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
        nav_links["prev"] = url_for(
            "api.widget_list", page=this_page - 1, per_page=per_page
        )
    if pagination.has_next:
        nav_links["next"] = url_for(
            "api.widget_list", page=this_page + 1, per_page=per_page
        )
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
        <p><strong>Line 31: </strong>Per <span class="bold-text"><a href="#table-1">Table 1</a></span>, the process of retrieving a list of <code>widgets</code> can only be performed by registered users (both regular and admin users). This is enforced by decorating the <code>retrieve_widget_list</code> function with <code>@token_required</code>.</p>
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
        <p><strong>Lines 42-58: </strong>The <code>_pagination_nav_links</code> function accepts a single parameter which is assumed to be a <code>Pagination</code> instance and returns a <code>dict</code> object named <code>nav_links</code> that matches the fields in <code>pagination_links_model</code>. By default, <code>nav_links</code> contains navigation URLs for <code>self</code>, <code>first</code>, and <code>last</code> pages (even if the total number of pages is one and all navigation URLs are the same). <code>prev</code> and <code>next</code> navigation URLs are not included by default. If <code>pagination.has_prev</code> is <code>True</code>, then the <code>prev</code> page URL is included (accordingly, <code>next</code> is included if <code>pagination.has_next</code> is <code>True</code>).</p>
      </li>
      <li>
        <p><strong>Lines 61-66: </strong>Finally, the <code>_pagination_nav_header_links</code> function also accepts a single parameter which is assumed to be a <code>Pagination</code> instance, but instead of a <code>dict</code> object a string is returned containing all valid page navigation URLs in the correct format for the <code>Link</code> header field.</p>
        <p>This function calls <code>_pagination_nav_links</code> and uses the <code>dict</code> that is returned to generate the <code>Link</code> header field. This works because the keys of the <code>dict</code> object are the same as the <code>Link</code> field's <code>rel</code> parameter and the <code>dict</code> values are the page navigation URLs.</p>
      </li>
    </ul>
</div>

Now that the business logic has been implemented, we can add a method to the `api.widget_list` endpoint that will call `retrieve_widget_list` after parsing/validating the request data.

### `api.widget_list` Endpoint (GET Request)

We created the `api.widget_list` endpoint <a href="/series/flask-api-tutorial/part-5/#widgetlist-resource-post-request">in Part 5</a> and implemented the function that handles `POST` requests. According to **[Table 1](#table-1)**, this endpoint also supports `GET` requests which allows clients to retrieve lists of `widgets`.

Open `src/flask_api_tutorial/api/widgets/endpoints.py` and make the following updates to the import statements:

```python {linenos=table,hl_lines=["8-12",14,"17-20"]}
"""API endpoint definitions for /widgets namespace."""
from http import HTTPStatus

from flask_restx import Namespace, Resource

from flask_api_tutorial.api.widgets.dto import (
    create_widget_reqparser,
    pagination_reqparser,
    widget_owner_model,
    widget_model,
    pagination_links_model,
    pagination_model,
)
from flask_api_tutorial.api.widgets.business import create_widget, retrieve_widget_list

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
<span class="cmd-hl-gold">api.widget_list      GET, POST  /api/v1/widgets</span>
restplus_doc.static  GET        /swaggerui/&lt;path:filename&gt;
static               GET        /static/&lt;path:filename&gt;</span></code></pre>

{{< alert_box >}}
Please remember, currently an unhandled exception occurs if you attempt to execute either of the methods we have created for the `api.widget_list` endpoint since the business logic for both operations depends on the `api.widget` endpoint existing. We will create unit tests for all endpoints/CRUD operations in **[Table 1](#table-1)** when they have been fully implemented.
{{< /alert_box >}}

## Retrieve Widget

At this point, we have completed two of the five CRUD processes specified in **[Table 1](#table-1)**. Thankfully, the remaining three should be much simpler and faster to implement since many of the elements can be reused (e.g. request parsers, API models).

The two processes we completed (create a `widget`, retrieve a list of `widgets`) are accessed via the `/api/v1/widgets` endpoint, which is also called the **resource collection** endpoint. However, the remaining three processes are accessed via the **resource item** endpoint, <code>api/v1/widgets/&lt;name&gt;</code>. The `name` parameter is provided by the client and is used to perform the requested action (retrieve, update, delete) on a specific `widget` instance.

Let's start with the process that is most similar to the last one we implemented, retrieving a single `widget`. We do not need to create any request parsers or API models since the name of the `widget` is provided in the URI requested by the client, and the `widget_model` can be re-used to serialize the requested object in the response.

### `retrieve_widget` Method

The business logic for retrieving a single `widget` is very simple. First, the database is queried for `widgets` matching the `name` that was requested by the client. If a matching `widget` is found, it is serialized to JSON and sent to the client with status code 200 (`HTTPStatus.OK`). If no `widget` exists with the specified `name`, a 404 (`HTTPStatus.NOT_FOUND`) response is sent to the client.

Because this is such a common pattern in web applications, <a href="https://flask-sqlalchemy.palletsprojects.com/en/2.x/queries/#queries-in-views" target="_blank">Flask-SQLAlchemy provides the `first_or_404` method</a> which does exactly what we need. It is modeled after <a href="https://docs.sqlalchemy.org/en/13/orm/query.html#sqlalchemy.orm.query.Query.first" target="_blank">the `first` function</a> from SQLAlchemy, which returns either the first result of a query or `None`. `first_or_404` raises a 404 error instead of returning `None`.

Open `src/flask_api_tutorial/api/widgets/business.py` and add the function below:

```python {linenos=table,linenostart=42}
@token_required
def retrieve_widget(name):
    return Widget.query.filter_by(name=name.lower()).first_or_404(
        description=f"{name} not found in database."
    )
```

This operation requires a valid access token, so the `@token_required` decorator is applied to the function **(Line 42)**. The `first_or_404` method **(Line 44)** accepts an optional `description` parameter which is used to include a message in the body of the HTTP response explaining why the request failed. Also, please note that the `name` value provided by the client is converted to lowercase before searching.

### `api.widget` Endpoint (GET Request)

Next, we need to create the `api.widget` endpoint. Before we do so, open `src/flask_api_tutorial/api/widgets/endpoints.py` and update the import statements to include the `retrieve_widget` function **(Line 17)**:

```python {linenos=table,hl_lines=[17]}
"""API endpoint definitions for /widgets namespace."""
from http import HTTPStatus

from flask_restx import Namespace, Resource

from flask_api_tutorial.api.widgets.dto import (
    create_widget_reqparser,
    pagination_reqparser,
    widget_owner_model,
    widget_model,
    pagination_links_model,
    pagination_model,
)
from flask_api_tutorial.api.widgets.business import (
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

The only thing that we are seeing for the first time is how to include a parameter in the endpoint path. Thankfully, Flask-RESTx uses the same process as Flask for URL route registration (via the `@route` decorator). <a href="https://flask.palletsprojects.com/en/1.1.x/api/#url-route-registrations" target="_blank">From the Flask documentation</a>:

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
<span class="cmd-hl-gold">api.widget           GET        /api/v1/widgets/&lt;name&gt;</span>
api.widget_list      GET, POST  /api/v1/widgets
restplus_doc.static  GET        /swaggerui/&lt;path:filename&gt;
static               GET        /static/&lt;path:filename&gt;</span></code></pre>

## Update Widget

Working our way through **[Table 1](#table-1)**, the next process to implement is updating a single `widget`. Clients with administrator access can perform this operation by sending a `PUT` request to the `api.widget` endpoint.

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

It turns out that the need to re-use portions of a request parser is such a common occurrence that <a href="https://flask-restplus.readthedocs.io/en/stable/parsing.html#parser-inheritance" target="_blank">Flask-RESTx provides methods to copy an existing parser, and then add/remove arguments</a>. This is extremely useful since it obviates the need to re-write every argument and duplicate a bunch of code just to slightly tweak the behavior of a request parser.

For example, open `src/flask_api_tutorial/api/widgets/dto.py`, add the lines below, then save the file:

```python {linenos=table,linenostart=72}
update_widget_reqparser = create_widget_reqparser.copy()
update_widget_reqparser.remove_argument("name")

```

Now we have exactly the request parser that we need for `PUT` requests received at the `api.widgets` endpoint. The `update_widget_reqparser` is created by simply copying the `create_widget_reqparser` and removing the `name` argument. We will import and use this when we are ready to implement the `put` method handler.

### `update_widget` Method

Next, we need to create the business logic that implements the `PUT` method as specified in <a href="https://tools.ietf.org/html/rfc7231#section-4.3.4" target="_blank">RFC 7231</a>.

First, open `src/flask_api_tutorial/api/widgets/business.py` and update the import statements to include the `widget_name` function from the `app.api.widgets.dto` module **(Line 9)**:

```python {linenos=table,hl_lines=[9]}
"""Business logic for /widgets API endpoints."""
from http import HTTPStatus

from flask import jsonify, url_for
from flask_restx import abort, marshal

from flask_api_tutorial import db
from flask_api_tutorial.api.auth.decorators import token_required, admin_token_required
from flask_api_tutorial.api.widgets.dto import pagination_model, widget_name
from flask_api_tutorial.models.user import User
from flask_api_tutorial.models.widget import Widget

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
        message = f"'{name}' was successfully updated"
        response_dict = dict(status="success", message=message)
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
{{< info_box >}}
Remember, all `widget` names are converted to lowercase when written to the database. Because of this, we must be careful to convert the value provided by the client to lowercase before searching. You can review [the validation logic for the `widget` name attribute in Part 5](/series/flask-api-tutorial/part-5/#name-argument).
{{< /info_box >}}
      </li>
      <li>
        <p><strong>Lines 53-55: </strong>If the name provided by the client is found in the database, we save the retrieved <code>Widget</code> instance as <code>widget</code>. Next, we iterate over the items in <code>widget_dict</code> and overwrite the attributes of <code>widget</code> with the values provided by the client. Then, the updated <code>widget</code> is committed to the database.</p>
      </li>
      <li>
        <p><strong>Lines 56-57: </strong>Per the specification, if the name provided by the client already exists, and the <code>widget</code> was successfully updated using the values parsed from the request data, we can confirm that the request succeeded by sending either a 200 (<code>HTTPStatus.OK</code>) or 204 (<code>HTTPStatus.NO_CONTENT</code>) response.</p>
      </li>
      <li>
        <p><strong>Line 60: </strong>If we reach this point, it means that the database does not contain a <code>widget</code> with the name provided by the client. Before using this value to create a new <code>widget</code>, we must validate it with <a href="/series/flask-api-tutorial/part-5/#name-argument">the <code>widget_name</code> function</a> we created in the <code>app.api.widgets.dto</code> module. If it is valid, this function will return the value we passed in. If it is not valid, a <code>ValueError</code> will be thrown.</p>
      </li>
      <li>
        <p><strong>Line 62: </strong>If the name provided by the client is invalid we cannot create a new <code>widget</code>. The server rejects the request with a 400 (<code>HTTPStatus.BAD_REQUEST</code>) response containing an error message detailing why the value provided is not a valid <code>widget</code> name.</p>
      </li>
      <li>
        <p><strong>Line 63: </strong>If the name provided by the client was successfully validated by the <code>widget_name</code> function, we need to add it to the <code>widget_dict</code> object since the <code>create_widget</code> function expects to receive a <code>dict</code> object containing <code>name</code>, <code>info_url</code>, and <code>deadline</code> keys. <code>widget_dict["name"] = valid_name</code> stores the validated name. At this point, <code>widget_dict</code> is in the format expected by the <code>create_widget</code> function.</p>
      </li>
      <li>
        <p><strong>Line 64: </strong>As specified in <a href="https://tools.ietf.org/html/rfc7231#section-4.3.4" target="_blank">RFC 7231</a>, if the name provided by the client does not already exist and this <code>PUT</code> request successfully creates one, we can confirm that the request succeeded by sending a 201 (<code>HTTPStatus.CREATED</code>) response.</p>
      </li>
    </ul>
</div>

I believe that the `update_widget` function satisfies the specification for the `PUT` method as specified in <a href="https://tools.ietf.org/html/rfc7231#section-4.3.4" target="_blank">RFC 7231</a>. <span class="bold-italics teal">If you disagree, please let me know in the comments, I would greatly appreciate it if my understanding of the spec is faulty in any way.</span>

### `api.widget` Endpoint (PUT Request)

Before we can bring everything together and expose the `put` method handler for the `api.widget` endpoint, open `src/flask_api_tutorial/api/widgets/endpoints.py` and update the import statements to include the `update_widget_reqparser` we created in `app.api.widgets.dto` **(Line 8)** and the `update_widget` function we created in `app.api.widgets.business` **(Line 19)**:

```python {linenos=table,hl_lines=[8,19]}
"""API endpoint definitions for /widgets namespace."""
from http import HTTPStatus

from flask_restx import Namespace, Resource

from flask_api_tutorial.api.widgets.dto import (
    create_widget_reqparser,
    update_widget_reqparser,
    pagination_reqparser,
    widget_owner_model,
    widget_model,
    pagination_links_model,
    pagination_model,
)
from flask_api_tutorial.api.widgets.business import (
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
<span class="cmd-hl-gold">api.widget           GET, PUT   /api/v1/widgets/&lt;name&gt;</span>
api.widget_list      GET, POST  /api/v1/widgets
restplus_doc.static  GET        /swaggerui/&lt;path:filename&gt;
static               GET        /static/&lt;path:filename&gt;</span></code></pre>

Alright, four down, one to go! The only remaining CRUD process we have not yet implemented is deleting a single `widget`.

## Delete Widget

Implementing the process to delete a single `widget` will be simple and very similar to implementing the process to retrieve a single `widget`. The only data that is sent by the client is the `name` of the `widget`, so we do not need to create a request parser for this process. Also, a successful response will not include any data in the response body, so we do not need to create any API models to serialize the response.

### `delete_widget` Method

Open `src/flask_api_tutorial/api/widgets/business.py` and add the content below:

```python {linenos=table,linenostart=67}
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

I told you this would be easy! Open `src/flask_api_tutorial/api/widgets/endpoints.py` and update the import statements to include the `delete_widget` function that we just created in `app.api.widgets.business` **(Line 20)**:

```python {linenos=table,hl_lines=[20]}
"""API endpoint definitions for /widgets namespace."""
from http import HTTPStatus

from flask_restx import Namespace, Resource

from flask_api_tutorial.api.widgets.dto import (
    create_widget_reqparser,
    update_widget_reqparser,
    pagination_reqparser,
    widget_owner_model,
    widget_model,
    pagination_links_model,
    pagination_model,
)
from flask_api_tutorial.api.widgets.business import (
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
<span class="cmd-hl-gold">api.widget           DELETE, GET, PUT  /api/v1/widgets/&lt;name&gt;</span>
api.widget_list      GET, POST         /api/v1/widgets
restplus_doc.static  GET               /swaggerui/&lt;path:filename&gt;
static               GET               /static/&lt;path:filename&gt;</span></code></pre>

We have finally implemented all of the API routes/CRUD processes specified in **[Table 1](#table-1)**, but we actually have no idea if they are working correctly. At the absolute minimum, we need to create unit tests that verify the "happy path" behavior for each CRUD process. We also need unit tests that verify our request parsers are configured correctly, and requests containing invalid data are rejected.

## Unit Tests

At this point, I would like you to attempt to create as many unit tests you can think of for the Widget API endpoints/CRUD operations we implemented in this section and the previous section ([Part 5](/series/flask-api-tutorial/part-5/)). For each, I will provide a few tests to get you started, and demonstrate how the `@pytest.mark.parametrize` decorator makes testing multiple values for a single parameter much simpler.

### util.py

First, open `tests/util.py` and update the import statements to include the `datetime.date` module **(Line 2)**, and also add the string values highlighted below:

```python {linenos=table,hl_lines=[2,7,"10-11","14-16"]}
"""Shared functions and constants for unit tests."""
from datetime import date

from flask import url_for

EMAIL = "new_user@email.com"
ADMIN_EMAIL = "admin_user@email.com"
PASSWORD = "test1234"
BAD_REQUEST = "Input payload validation failed"
UNAUTHORIZED = "Unauthorized"
FORBIDDEN = "You are not an administrator"
WWW_AUTH_NO_TOKEN = 'Bearer realm="registered_users@mydomain.com"'

DEFAULT_NAME = "some-widget"
DEFAULT_URL = "https://www.fakesite.com"
DEFAULT_DEADLINE = date.today().strftime("%m/%d/%y")

```

Next, add the `create_widget` function to `util.py` and save the file:

```python {linenos=table,linenostart=47}
def create_widget(
    test_client,
    access_token,
    widget_name=DEFAULT_NAME,
    info_url=DEFAULT_URL,
    deadline_str=DEFAULT_DEADLINE,
):
    return test_client.post(
        url_for("api.widget_list"),
        headers={"Authorization": f"Bearer {access_token}"},
        data=f"name={widget_name}&info_url={info_url}&deadline={deadline_str}",
        content_type="application/x-www-form-urlencoded",
    )
```

This function uses the Flask test client to send a `POST` request to the `api.widget_list` endpoint, which is responsible for creating new widgets. The function requires two parameters: the `test_client` and an `access_token`. The remaining three parameters are optional since they have default values, and it should be obvious what these three values are used for. `widget_name`, `info_url` and `deadline_str` are the values that will be used for the `name`, `info_url` and `deadline` values of the new widget object.

### `conftest.py`

We also need to update `conftest.py` with a new fixture. First, update the import statements to include the `ADMIN_EMAIL` value from `tests.util`:

```python {linenos=table,hl_lines=[7]}
"""Global pytest fixtures."""
import pytest

from flask_api_tutorial import create_app
from flask_api_tutorial import db as database
from flask_api_tutorial.models.user import User
from tests.util import EMAIL, ADMIN_EMAIL, PASSWORD

```

Next, add the `admin` test fixture and save the file:

```python {linenos=tables,linenostart=37}
@pytest.fixture
def admin(db):
    admin = User(email=ADMIN_EMAIL, password=PASSWORD, admin=True)
    db.session.add(admin)
    db.session.commit()
    return admin

```

This fixture creates a new user with administrator privileges, which will be needed to create new widgets (it will also be needed to modify and delete widgets). We have previously used the `user` fixture in test cases where a `User` object was needed, and the `admin` fixture will be used in the same way.

### Create Widget

Create a new file named `test_create_widget.py` in `tests`, enter the content below and save the file:

```python {linenos=table}
"""Unit tests for POST requests sent to api.widget_list API endpoint."""
from http import HTTPStatus

import pytest
from tests.util import ADMIN_EMAIL, login_user, create_widget


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

```

This is the first time we are using the `@pytest.mark.parameterize` decorator, which is used to parameterize an argument to a test function. In the `test_create_widget_valid_name` function, we are parameterizing the `widget_name` argument, and the test will be executed three times; once for each value defined for `widget_name`. For example, this is the output from pytest if we were to execute just this single test function:

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">pytest tests/test_create_widget.py</span>
<span class="cmd-results">================================================= test session starts ==================================================
platform darwin -- Python 3.7.5, pytest-5.3.3, py-1.8.1, pluggy-0.13.1 -- /Users/aaronluna/Projects/flask_api_tutorial/venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/aaronluna/Projects/flask_api_tutorial, inifile: pytest.ini
plugins: dotenv-0.4.0, clarity-0.2.0a1, flake8-1.0.4, black-0.3.7, flask-0.15.0
collected 5 items

tests/test_create_widget.py::BLACK PASSED                                                                        [ 20%]
tests/test_create_widget.py::FLAKE8 PASSED                                                                       [ 40%]
<span class="cmd-hl-gold">tests/test_create_widget.py::test_create_widget_valid_name[abc123] PASSED                                        [ 60%]</span>
<span class="cmd-hl-gold">tests/test_create_widget.py::test_create_widget_valid_name[widget-name] PASSED                                   [ 80%]</span>
<span class="cmd-hl-gold">tests/test_create_widget.py::test_create_widget_valid_name[new_widget1] PASSED                                   [100%]</span>

=================================================== warnings summary ===================================================
tests/test_create_widget.py::test_create_widget_valid_name[abc123]
  /Users/aaronluna/Projects/flask_api_tutorial/venv/lib/python3.7/site-packages/flask_restplus/model.py:8: DeprecationWarning: Using or importing the ABCs from 'collections' instead of from 'collections.abc' is deprecated since Python 3.3,and in 3.9 it will stop working
    from collections import OrderedDict, MutableMapping

-- Docs: https://docs.pytest.org/en/latest/warnings.html
============================================= 5 passed, 1 warning in 0.57s =============================================</span></code></pre>

You can see the three tests executed by the parameterized test highlighted above. `pytest` helpfully includes the values used to parameterize the test in brackets after the name of the test. This function is designed to verify the response to a successful request to create a new widget, so the three values used for parameterization are all valid widget names, per the specs we followed. An obvious next step would be to create a `test_create_widget_invalid_name` test case, but I will leave that to you.

{{< info_box >}}
You can find more information on the `@pytest.mark.parameterize` decorator in [the official pytest documents](https://docs.pytest.org/en/latest/parametrize.html).
{{< /info_box >}}

Creating valid/invalid values for the `info_url` argument should be straightforward, and you should definitely create parameterized test cases for both successful/rejected requests that isolate the `info_url` value. However, testing the `deadline_str` value is more complex. In the same file, `test_create_widget.py`, update the import statements to include the `datetime.date` and `datetime.timedelta` modules **(Line 2)**, as well as the `DEFAULT_NAME` value from `tests.util` **(Line 7)**:

```python {linenos=table,hl_lines=[2,7]}
"""Unit tests for api.widget_list API endpoint."""
from datetime import date, timedelta
from http import HTTPStatus

import pytest

from tests.util import ADMIN_EMAIL, DEFAULT_NAME, login_user, create_widget
```

Why is the `deadline` attribute more difficult to test than `widget_name` or `info_url`? Remember, `deadline` is a string value that is parsed to a datetime value which must not be in the past. We could use hard-coded values that won't be in the past 100 years from now, but that is a pretty hacky way to test our code.

What approach can we use that would be better than hard-coded strings? Enter the content below and save the file:

```python {linenos=table,linenostart=24,hl_lines=["4-6"]}
@pytest.mark.parametrize(
    "deadline_str",
    [
        date.today().strftime("%m/%d/%Y"),
        date.today().strftime("%Y-%m-%d"),
        (date.today() + timedelta(days=3)).strftime("%b %d %Y"),
    ],
)
def test_create_widget_valid_deadline(client, db, admin, deadline_str):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token, deadline_str=deadline_str)
    assert response.status_code == HTTPStatus.CREATED
    assert "status" in response.json and response.json["status"] == "success"
    success = f"New widget added: {DEFAULT_NAME}."
    assert "message" in response.json and response.json["message"] == success
    location = f"http://localhost/api/v1/widgets/{DEFAULT_NAME}"
    assert "Location" in response.headers and response.headers["Location"] == location

```

In the first two highlighted lines above **(Lines 27-28)**, we call the `datetime.strftime` method on objects created with `datetime.date.today`. This generates a string value that always represents the current date, even if this test case is executed 10,000 years from now. `datetime.strftime` accepts a string value that can be configured to generate a string in any format, containing any combination of values such as month, year, hour, time zone, etc.

The third highlighted line **(Line 29)** utilizes a `timedelta` object to generate a date three days in the future (we obviously want to test dates other than the current date). Run `pytest tests/test_create_widget.py` to execute these test cases:

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">pytest tests/test_create_widget.py</span>
<span class="cmd-results">=============================================== test session starts ================================================
platform darwin -- Python 3.7.5, pytest-5.3.3, py-1.8.1, pluggy-0.13.1 -- /Users/aaronluna/Projects/flask_api_tutorial/venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/aaronluna/Projects/flask_api_tutorial, inifile: pytest.ini
plugins: dotenv-0.4.0, clarity-0.2.0a1, flake8-1.0.4, black-0.3.7, flask-0.15.0
collected 8 items

tests/test_create_widget.py::BLACK PASSED                                                                    [ 12%]
tests/test_create_widget.py::FLAKE8 PASSED                                                                   [ 25%]
tests/test_create_widget.py::test_create_widget_valid_name[abc123] PASSED                                    [ 37%]
tests/test_create_widget.py::test_create_widget_valid_name[widget-name] PASSED                               [ 50%]
tests/test_create_widget.py::test_create_widget_valid_name[new_widget1] PASSED                               [ 62%]
<span class="cmd-hl-teal">tests/test_create_widget.py::test_create_widget_valid_deadline[01/29/2020] PASSED                            [ 75%]
tests/test_create_widget.py::test_create_widget_valid_deadline[2020-01-29] PASSED                            [ 87%]
tests/test_create_widget.py::test_create_widget_valid_deadline[Feb 01 2020] PASSED                           [100%]</span>

================================================= warnings summary =================================================
tests/test_create_widget.py::test_create_widget_valid_name[abc123]
  /Users/aaronluna/Projects/flask_api_tutorial/venv/lib/python3.7/site-packages/flask_restplus/model.py:8: DeprecationWarning: Using or importing the ABCs from 'collections' instead of from 'collections.abc' is deprecated since Python 3.3,and in 3.9 it will stop working
    from collections import OrderedDict, MutableMapping

-- Docs: https://docs.pytest.org/en/latest/warnings.html
=========================================== 8 passed, 1 warning in 0.87s ===========================================</span></code></pre>

We can easily see what values were used to test the `deadline` value in the results above. For the first two parameterized values, the current date was converted to string values `01/29/2020` and `2020-01-29`, which succeeded in creating a new widget object in the database. Finally, `Feb 01 2020` was used to verify that a date in the future is a valid value for `deadline`.

{{< info_box >}}
Did you notice that we used three different date formats for the `deadline_str` test parameter, and all three were successful? This is due to the validation performed by the `future_date_from_string` function, specifically by the `dateutil.parser.parse` function.
{{< /info_box >}}

Before we create test cases for rejected requests, update the import statements to include the `BAD_REQUEST` value from `tests.util` **(Line 7)**:

```python {linenos=table,hl_lines=[7]}
"""Unit tests for api.widget_list API endpoint."""
from datetime import date, timedelta
from http import HTTPStatus

import pytest

from tests.util import ADMIN_EMAIL, BAD_REQUEST, DEFAULT_NAME, login_user, create_widget

```

Then, add the `test_create_widget_invalid_deadline` function and save the file:

```python {linenos=table,linenostart=45,hl_lines=["4-6"]}
@pytest.mark.parametrize(
    "deadline_str",
    [
        "1/1/1970",
        (date.today() - timedelta(days=3)).strftime("%Y-%m-%d"),
        "a long time ago, in a galaxy far, far away",
    ],
)
def test_create_widget_invalid_deadline(client, db, admin, deadline_str):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token, deadline_str=deadline_str)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "message" in response.json and response.json["message"] == BAD_REQUEST
    assert "errors" in response.json and "deadline" in response.json["errors"]

```

Unlike the parameters in the "happy" path test case, we can use hardcoded strings to verify that invalid `deadline` values are rejected by the API. The first parameterized value is `1/1/1970` **\*(Line 48)**, which will be parsed as a valid `datetime` value by `dateutil.parser`, but must be rejected since it has already passed.

Next, we construct a string value for a date three days in the past using a `timedelta` object **(Line 49)**. This is the same technique we used in the "happy" path to construct dates in the future. The third parameter is a string that is not a formatted `datetime` value, and should obviously be rejected by `datetuil.parser` **(Line 50)**.

Run `pytest tests/test_create_widget.py` to execute these test cases:

<pre><code><span class="cmd-prompt">flask-api-tutorial $</span> <span class="cmd-input">pytest tests/test_create_widget.py</span>
<span class="cmd-results">=============================================== test session starts ================================================
platform darwin -- Python 3.7.5, pytest-5.3.3, py-1.8.1, pluggy-0.13.1 -- /Users/aaronluna/Projects/flask_api_tutorial/venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/aaronluna/Projects/flask_api_tutorial, inifile: pytest.ini
plugins: dotenv-0.4.0, clarity-0.2.0a1, flake8-1.0.4, black-0.3.7, flask-0.15.0
collected 11 items

tests/test_create_widget.py::BLACK PASSED                                                                    [  9%]
tests/test_create_widget.py::FLAKE8 PASSED                                                                   [ 18%]
tests/test_create_widget.py::test_create_widget_valid_name[abc123] PASSED                                    [ 27%]
tests/test_create_widget.py::test_create_widget_valid_name[widget-name] PASSED                               [ 36%]
tests/test_create_widget.py::test_create_widget_valid_name[new_widget1] PASSED                               [ 45%]
tests/test_create_widget.py::test_create_widget_valid_deadline[01/29/2020] PASSED                            [ 54%]
tests/test_create_widget.py::test_create_widget_valid_deadline[2020-01-29] PASSED                            [ 63%]
tests/test_create_widget.py::test_create_widget_valid_deadline[Feb 01 2020] PASSED                           [ 72%]
<span class="cmd-hl-purple">tests/test_create_widget.py::test_create_widget_invalid_deadline[1/1/1970] PASSED                            [ 81%]
tests/test_create_widget.py::test_create_widget_invalid_deadline[2020-01-26] PASSED                          [ 90%]
tests/test_create_widget.py::test_create_widget_invalid_deadline[a long time ago, in a galaxy far, far away] PASSED [100%]</span>

================================================= warnings summary =================================================
tests/test_create_widget.py::test_create_widget_valid_name[abc123]
  /Users/aaronluna/Projects/flask_api_tutorial/venv/lib/python3.7/site-packages/flask_restplus/model.py:8: DeprecationWarning: Using or importing the ABCs from 'collections' instead of from 'collections.abc' is deprecated since Python 3.3,and in 3.9 it will stop working
    from collections import OrderedDict, MutableMapping

-- Docs: https://docs.pytest.org/en/latest/warnings.html
========================================== 11 passed, 1 warning in 0.97s ===========================================</span></code></pre>

{{< info_box >}}
Don't be confused by the `PASSED` result for these three test cases. This does not mean that the request succeeded and a new widget was created, since the `assert` statements verify that the status code of the response is 400 `HTTPStatus.BAD_REQUEST` **(Line 58)**, and that the response includes an error message indicating that the value of the `deadline` attribute was invalid **(Line 60)**.
{{< /info_box >}}

Hopefully, these three parameterized test cases are illustrative and enable you to create the remaining necessary test cases for the `widget_name` and `info_url` attributes.

There are plenty of other requirements and expected behaviors that need test coverage other than the input validation performed on the client's request data. I'll show you two more test cases for the create widget operation, but **you must attempt to create other test cases on your own for any remaining functionality**.

First, we should verify that it isn't possible to create a widget if a widget with the same name has already been created. We can easily write a test case to check this scenario. Add the test case below (`test_create_widget_already_exists`) to `test_create_widget.py` and save the file:

```python {linenos=table,linenostart=63}
def test_create_widget_already_exists(client, db, admin):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token)
    assert response.status_code == HTTPStatus.CREATED
    response = create_widget(client, access_token)
    assert response.status_code == HTTPStatus.CONFLICT
    name_conflict = f"Widget name: {DEFAULT_NAME} already exists, must be unique."
    assert "message" in response.json and response.json["message"] == name_conflict
```

The main thing that we need to verify is that the HTTP response code from the server is 409 (`HTTPStatus.CONFLICT`) **(Line 70)**, indicating that the new widget was not created due to a conflict with an existing widget. This is also verified in the error message sent in the server's response **(Lines 72-73)**.

So far, in every test case for the create widget process we used the admin user account. However, we absolutely must verify that users without administrator access cannot create new widgets. Before we begin, we need to update the import statements to include the `EMAIL` **(Line 8)** and `FORBIDDEN` **(Line 11)** string values from `tests.util`:

```python {linenos=table,hl_lines=[8,11]}
"""Unit tests for api.widget_list API endpoint."""
from datetime import date, timedelta
from http import HTTPStatus

import pytest

from tests.util import (
    EMAIL,
    ADMIN_EMAIL,
    BAD_REQUEST,
    FORBIDDEN,
    DEFAULT_NAME,
    login_user,
    create_widget,
)
```

Next, add the test case below (`test_create_widget_no_admin_token`) to `test_create_widget.py` and save the file:

```python {linenos=table,linenostart=84}
def test_create_widget_no_admin_token(client, db, user):
    response = login_user(client, email=EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token)
    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "message" in response.json and response.json["message"] == FORBIDDEN

```

As in the previous test case, the main thing we need to verify is that the HTTP status code of the response is 403 (`HTTPStatus.FORBIDDEN`) **(Line 89)**, and that the error message indicates that request was rejected since the user does not have administrator privileges **(Line 91)**.

Let's verify that all of our test cases are still passing by running `tox`:

<pre><code class="tox"><span class="cmd-venv">(venv) flask_api_tutorial $</span> <span class="cmd-input">tox</span>
<span class="cmd-results">GLOB sdist-make: /Users/aaronluna/Projects/flask_api_tutorial/setup.py
py37 inst-nodeps: /Users/aaronluna/Projects/flask_api_tutorial/.tox/.tmp/package/1/flask-api-tutorial-0.1.zip
py37 installed: alembic==1.3.2,aniso8601==8.0.0,appdirs==1.4.3,attrs==19.3.0,bcrypt==3.1.7,black==19.10b0,certifi==2019.11.28,cffi==1.13.2,chardet==3.0.4,Click==7.0,entrypoints==0.3,flake8==3.7.9,Flask==1.1.1,flask-api-tutorial==0.1,Flask-Bcrypt==0.7.1,Flask-Cors==3.0.8,Flask-Migrate==2.5.2,flask-restplus==0.13.0,Flask-SQLAlchemy==2.4.1,idna==2.8,importlib-metadata==1.4.0,itsdangerous==1.1.0,Jinja2==2.10.3,jsonschema==3.2.0,Mako==1.1.0,MarkupSafe==1.1.1,mccabe==0.6.1,more-itertools==8.1.0,packaging==20.0,pathspec==0.7.0,pluggy==0.13.1,py==1.8.1,pycodestyle==2.5.0,pycparser==2.19,pydocstyle==5.0.2,pyflakes==2.1.1,PyJWT==1.7.1,pyparsing==2.4.6,pyrsistent==0.15.7,pytest==5.3.3,pytest-black==0.3.7,pytest-clarity==0.2.0a1,pytest-dotenv==0.4.0,pytest-flake8==1.0.4,pytest-flask==0.15.0,python-dateutil==2.8.1,python-dotenv==0.10.3,python-editor==1.0.4,pytz==2019.3,regex==2020.1.8,requests==2.22.0,six==1.14.0,snowballstemmer==2.0.0,SQLAlchemy==1.3.12,termcolor==1.1.0,toml==0.10.0,typed-ast==1.4.1,urllib3==1.25.7,wcwidth==0.1.8,Werkzeug==0.16.0,zipp==1.0.0
py37 run-test-pre: PYTHONHASHSEED='396877841'
py37 run-test: commands[0] | pytest
================================================= test session starts =================================================
platform darwin -- Python 3.7.5, pytest-5.3.3, py-1.8.1, pluggy-0.13.1 -- /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/bin/python
cachedir: .tox/py37/.pytest_cache
rootdir: /Users/aaronluna/Projects/flask_api_tutorial, inifile: pytest.ini
plugins: dotenv-0.4.0, clarity-0.2.0a1, flake8-1.0.4, black-0.3.7, flask-0.15.0
collected 90 items

run.py::BLACK SKIPPED                                                                                           [  1%]
run.py::FLAKE8 SKIPPED                                                                                          [  2%]
setup.py::BLACK SKIPPED                                                                                         [  3%]
setup.py::FLAKE8 SKIPPED                                                                                        [  4%]
src/flask_api_tutorial/__init__.py::BLACK SKIPPED                                                               [  5%]
src/flask_api_tutorial/__init__.py::FLAKE8 SKIPPED                                                              [  6%]
src/flask_api_tutorial/config.py::BLACK SKIPPED                                                                 [  7%]
src/flask_api_tutorial/config.py::FLAKE8 SKIPPED                                                                [  8%]
src/flask_api_tutorial/api/__init__.py::BLACK SKIPPED                                                           [ 10%]
src/flask_api_tutorial/api/__init__.py::FLAKE8 SKIPPED                                                          [ 11%]
src/flask_api_tutorial/api/auth/__init__.py::BLACK SKIPPED                                                      [ 12%]
src/flask_api_tutorial/api/auth/__init__.py::FLAKE8 SKIPPED                                                     [ 13%]
src/flask_api_tutorial/api/auth/business.py::BLACK SKIPPED                                                      [ 14%]
src/flask_api_tutorial/api/auth/business.py::FLAKE8 SKIPPED                                                     [ 15%]
src/flask_api_tutorial/api/auth/decorators.py::BLACK SKIPPED                                                     [ 16%]
src/flask_api_tutorial/api/auth/decorators.py::FLAKE8 SKIPPED                                                    [ 17%]
src/flask_api_tutorial/api/auth/dto.py::BLACK SKIPPED                                                           [ 18%]
src/flask_api_tutorial/api/auth/dto.py::FLAKE8 SKIPPED                                                          [ 20%]
src/flask_api_tutorial/api/auth/endpoints.py::BLACK SKIPPED                                                     [ 21%]
src/flask_api_tutorial/api/auth/endpoints.py::FLAKE8 SKIPPED                                                    [ 22%]
src/flask_api_tutorial/api/widgets/__init__.py::BLACK SKIPPED                                                   [ 23%]
src/flask_api_tutorial/api/widgets/__init__.py::FLAKE8 SKIPPED                                                  [ 24%]
src/flask_api_tutorial/api/widgets/business.py::BLACK SKIPPED                                                   [ 25%]
src/flask_api_tutorial/api/widgets/business.py::FLAKE8 SKIPPED                                                  [ 26%]
src/flask_api_tutorial/api/widgets/dto.py::BLACK SKIPPED                                                        [ 27%]
src/flask_api_tutorial/api/widgets/dto.py::FLAKE8 SKIPPED                                                       [ 28%]
src/flask_api_tutorial/api/widgets/endpoints.py::BLACK SKIPPED                                                  [ 30%]
src/flask_api_tutorial/api/widgets/endpoints.py::FLAKE8 SKIPPED                                                 [ 31%]
src/flask_api_tutorial/models/__init__.py::BLACK SKIPPED                                                        [ 32%]
src/flask_api_tutorial/models/__init__.py::FLAKE8 SKIPPED                                                       [ 33%]
src/flask_api_tutorial/models/token_blacklist.py::BLACK SKIPPED                                                 [ 34%]
src/flask_api_tutorial/models/token_blacklist.py::FLAKE8 SKIPPED                                                [ 35%]
src/flask_api_tutorial/models/user.py::BLACK SKIPPED                                                            [ 36%]
src/flask_api_tutorial/models/user.py::FLAKE8 SKIPPED                                                           [ 37%]
src/flask_api_tutorial/models/widget.py::BLACK SKIPPED                                                          [ 38%]
src/flask_api_tutorial/models/widget.py::FLAKE8 SKIPPED                                                         [ 40%]
src/flask_api_tutorial/util/__init__.py::BLACK SKIPPED                                                          [ 41%]
src/flask_api_tutorial/util/__init__.py::FLAKE8 SKIPPED                                                         [ 42%]
src/flask_api_tutorial/util/datetime_util.py::BLACK SKIPPED                                                     [ 43%]
src/flask_api_tutorial/util/datetime_util.py::FLAKE8 SKIPPED                                                    [ 44%]
src/flask_api_tutorial/util/result.py::BLACK SKIPPED                                                            [ 45%]
src/flask_api_tutorial/util/result.py::FLAKE8 SKIPPED                                                           [ 46%]
tests/__init__.py::BLACK SKIPPED                                                                                [ 47%]
tests/__init__.py::FLAKE8 SKIPPED                                                                               [ 48%]
tests/conftest.py::BLACK SKIPPED                                                                                [ 50%]
tests/conftest.py::FLAKE8 SKIPPED                                                                               [ 51%]
tests/test_auth_login.py::BLACK SKIPPED                                                                         [ 52%]
tests/test_auth_login.py::FLAKE8 SKIPPED                                                                        [ 53%]
tests/test_auth_login.py::test_login PASSED                                                                     [ 54%]
tests/test_auth_login.py::test_login_email_does_not_exist PASSED                                                [ 55%]
tests/test_auth_logout.py::BLACK SKIPPED                                                                        [ 56%]
tests/test_auth_logout.py::FLAKE8 SKIPPED                                                                       [ 57%]
tests/test_auth_logout.py::test_logout PASSED                                                                   [ 58%]
tests/test_auth_logout.py::test_logout_token_blacklisted PASSED                                                 [ 60%]
tests/test_auth_register.py::BLACK SKIPPED                                                                      [ 61%]
tests/test_auth_register.py::FLAKE8 SKIPPED                                                                     [ 62%]
tests/test_auth_register.py::test_auth_register PASSED                                                          [ 63%]
tests/test_auth_register.py::test_auth_register_email_already_registered PASSED                                 [ 64%]
tests/test_auth_register.py::test_auth_register_invalid_email PASSED                                            [ 65%]
tests/test_auth_user.py::BLACK SKIPPED                                                                          [ 66%]
tests/test_auth_user.py::FLAKE8 SKIPPED                                                                         [ 67%]
tests/test_auth_user.py::test_auth_user PASSED                                                                  [ 68%]
tests/test_auth_user.py::test_auth_user_no_token PASSED                                                         [ 70%]
tests/test_auth_user.py::test_auth_user_expired_token PASSED                                                    [ 71%]
tests/test_config.py::BLACK SKIPPED                                                                             [ 72%]
tests/test_config.py::FLAKE8 SKIPPED                                                                            [ 73%]
tests/test_config.py::test_config_development PASSED                                                            [ 74%]
tests/test_config.py::test_config_testing PASSED                                                                [ 75%]
tests/test_config.py::test_config_production PASSED                                                             [ 76%]
tests/test_create_widget.py::BLACK PASSED                                                                       [ 77%]
tests/test_create_widget.py::FLAKE8 PASSED                                                                      [ 78%]
tests/test_create_widget.py::test_create_widget_valid_name[abc123] PASSED                                       [ 80%]
tests/test_create_widget.py::test_create_widget_valid_name[widget-name] PASSED                                  [ 81%]
tests/test_create_widget.py::test_create_widget_valid_name[new_widget1] PASSED                                  [ 82%]
tests/test_create_widget.py::test_create_widget_valid_deadline[02/10/2020] PASSED                               [ 83%]
tests/test_create_widget.py::test_create_widget_valid_deadline[2020-02-10] PASSED                               [ 84%]
tests/test_create_widget.py::test_create_widget_valid_deadline[Feb 13 2020] PASSED                              [ 85%]
tests/test_create_widget.py::test_create_widget_invalid_deadline[1/1/1970] PASSED                               [ 86%]
tests/test_create_widget.py::test_create_widget_invalid_deadline[2020-02-07] PASSED                             [ 87%]
tests/test_create_widget.py::test_create_widget_invalid_deadline[a long time ago, in a galaxy far, far away] PASSED [ 88%]
tests/test_create_widget.py::test_create_widget_already_exists PASSED                                           [ 90%]
tests/test_create_widget.py::test_create_widget_no_admin_token PASSED                                           [ 91%]
tests/test_user.py::BLACK SKIPPED                                                                               [ 92%]
tests/test_user.py::FLAKE8 SKIPPED                                                                              [ 93%]
tests/test_user.py::test_encode_access_token PASSED                                                             [ 94%]
tests/test_user.py::test_decode_access_token_success PASSED                                                     [ 95%]
tests/test_user.py::test_decode_access_token_expired PASSED                                                     [ 96%]
tests/test_user.py::test_decode_access_token_invalid PASSED                                                     [ 97%]
tests/util.py::BLACK SKIPPED                                                                                    [ 98%]
tests/util.py::FLAKE8 SKIPPED                                                                                   [100%]

================================================== warnings summary ===================================================
src/flask_api_tutorial/api/auth/business.py::BLACK
  /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/lib/python3.7/site-packages/flask_restplus/model.py:8: DeprecationWarning: Using or importing the ABCs from 'collections' instead of from 'collections.abc' is deprecated since Python 3.3,and in 3.9 it will stop working
    from collections import OrderedDict, MutableMapping

-- Docs: https://docs.pytest.org/en/latest/warnings.html
=============================================== short test summary info ===============================================
SKIPPED [30] /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/lib/python3.7/site-packages/pytest_black.py:59: file(s) previously passed black format checks
SKIPPED [30] /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/lib/python3.7/site-packages/pytest_flake8.py:106: file(s) previously passed FLAKE8 checks
===================================== 30 passed, 60 skipped, 1 warning in 15.11s ======================================
_______________________________________________________ summary _______________________________________________________
  py37: commands succeeded
  congratulations :)</span></code></pre>

<span class="bold-italics teal">Please do not assume that these test cases are sufficient for the create widget operation, there are many requirements that have not been verified by the test cases I provided. You absolutely must attempt to identify these gaps and create all necessary test cases.</span>

{{< info_box >}}
For the remaining CRUD operations I will be providing far fewer test cases since many of the test requirements must be repeated for each. Yes, testing is always (and I mean ALWAYS) repetitive. You might as well just accept it, keep your head down and write test cases until your body refuses to cooperate.
{{< /info_box >}}

### Retrieve Widget List

In order to test the retrieve widget list operation, we need to create a function that uses the Flask test client to send a `GET` request to the `api.widget_list` endpoint. Remember, this endpoint expects the client's request to include pagination query parameters (i.e., `page` and `per_page`), refer back to [this section](#retrieve_widget_list-method) if you need to review how this was implemented.

Open `tests/util.py`, add the content below and save the file:

```python {linenos=tabe,linenostart=62}
def retrieve_widget_list(test_client, access_token, page=None, per_page=None):
    return test_client.get(
        url_for("api.widget_list", page=page, per_page=per_page),
        headers={"Authorization": f"Bearer {access_token}"},
    )
```

Hopefully the `retrieve_widget_list` function above makes sense to you since it is very similar (and much simpler than) the `create_widget` function we used to test the create widget operation.

I'm only going to provide a single test case for the retrieve widget list operation. Before you get all mopey, this test case is quite thorough. In fact, it is so thorough, I had to add comments explaining what is being tested and verified. Create a new file named `test_retrieve_widget_list.py` in the `tests` folder and add the content below:

```python {linenos=table}
"""Test cases for GET requests sent to the api.widget_list API endpoint."""
from datetime import date, timedelta
from http import HTTPStatus

from tests.util import ADMIN_EMAIL, login_user, create_widget, retrieve_widget_list


NAMES = [
    "widget1",
    "second_widget",
    "widget-thrice",
    "tetraWIDG",
    "PENTA-widg-GON-et",
    "hexa_widget",
    "sep7",
]

URLS = [
    "http://www.one.com",
    "https://www.two.net",
    "https://www.three.edu",
    "http://www.four.dev",
    "http://www.five.io",
    "https://www.six.tech",
    "https://www.seven.dot",
]

DEADLINES = [
    date.today().strftime("%m/%d/%y"),
    (date.today() + timedelta(days=3)).strftime("%m/%d/%y"),
    (date.today() + timedelta(days=5)).strftime("%m/%d/%y"),
    (date.today() + timedelta(days=10)).strftime("%m/%d/%y"),
    (date.today() + timedelta(days=17)).strftime("%m/%d/%y"),
    (date.today() + timedelta(days=23)).strftime("%m/%d/%y"),
    (date.today() + timedelta(days=78)).strftime("%m/%d/%y"),
]


def test_retrieve_paginated_widget_list(client, db, admin):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]

    # ADD SEVEN WIDGET INSTANCES TO DATABASE
    for i in range(0, len(NAMES)):
        response = create_widget(
            client,
            access_token,
            widget_name=NAMES[i],
            info_url=URLS[i],
            deadline_str=DEADLINES[i],
        )
        assert response.status_code == HTTPStatus.CREATED

    # REQUEST PAGINATED LIST OF WIDGETS: 5 PER PAGE, PAGE #1
    response = retrieve_widget_list(client, access_token, page=1, per_page=5)
    assert response.status_code == HTTPStatus.OK

    # VERIFY PAGINATION ATTRIBUTES FOR PAGE #1
    assert "has_prev" in response.json and not response.json["has_prev"]
    assert "has_next" in response.json and response.json["has_next"]
    assert "page" in response.json and response.json["page"] == 1
    assert "total_pages" in response.json and response.json["total_pages"] == 2
    assert "items_per_page" in response.json and response.json["items_per_page"] == 5
    assert "total_items" in response.json and response.json["total_items"] == 7
    assert "items" in response.json and len(response.json["items"]) == 5

    # VERIFY ATTRIBUTES OF WIDGETS #1-5
    for i in range(0, len(response.json["items"])):
        item = response.json["items"][i]
        assert "name" in item and item["name"] == NAMES[i]
        assert "info_url" in item and item["info_url"] == URLS[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL

    # REQUEST PAGINATED LIST OF WIDGETS: 5 PER PAGE, PAGE #2
    response = retrieve_widget_list(client, access_token, page=2, per_page=5)
    assert response.status_code == HTTPStatus.OK

    # VERIFY PAGINATION ATTRIBUTES FOR PAGE #2
    assert "has_prev" in response.json and response.json["has_prev"]
    assert "has_next" in response.json and not response.json["has_next"]
    assert "page" in response.json and response.json["page"] == 2
    assert "total_pages" in response.json and response.json["total_pages"] == 2
    assert "items_per_page" in response.json and response.json["items_per_page"] == 5
    assert "total_items" in response.json and response.json["total_items"] == 7
    assert "items" in response.json and len(response.json["items"]) == 2

    # VERIFY ATTRIBUTES OF WIDGETS #6-7
    for i in range(5, response.json["total_items"]):
        item = response.json["items"][i - 5]
        assert "name" in item and item["name"] == NAMES[i]
        assert "info_url" in item and item["info_url"] == URLS[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL

    # REQUEST PAGINATED LIST OF WIDGETS: 10 PER PAGE, PAGE #1
    response = retrieve_widget_list(client, access_token, page=1, per_page=10)
    assert response.status_code == HTTPStatus.OK

    # VERIFY PAGINATION ATTRIBUTES FOR PAGE #1
    assert "has_prev" in response.json and not response.json["has_prev"]
    assert "has_next" in response.json and not response.json["has_next"]
    assert "page" in response.json and response.json["page"] == 1
    assert "total_pages" in response.json and response.json["total_pages"] == 1
    assert "items_per_page" in response.json and response.json["items_per_page"] == 10
    assert "total_items" in response.json and response.json["total_items"] == 7
    assert "items" in response.json and len(response.json["items"]) == 7

    # VERIFY ATTRIBUTES OF WIDGETS #1-7
    for i in range(0, len(response.json["items"])):
        item = response.json["items"][i]
        assert "name" in item and item["name"] == NAMES[i]
        assert "info_url" in item and item["info_url"] == URLS[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL

    # REQUEST PAGINATED LIST OF WIDGETS: DEFAULT PARAMETERS
    response = retrieve_widget_list(client, access_token)
    assert response.status_code == HTTPStatus.OK

    # VERIFY PAGINATION ATTRIBUTES FOR PAGE #1
    assert "has_prev" in response.json and not response.json["has_prev"]
    assert "has_next" in response.json and not response.json["has_next"]
    assert "page" in response.json and response.json["page"] == 1
    assert "total_pages" in response.json and response.json["total_pages"] == 1
    assert "items_per_page" in response.json and response.json["items_per_page"] == 10
    assert "total_items" in response.json and response.json["total_items"] == 7
    assert "items" in response.json and len(response.json["items"]) == 7

    # VERIFY ATTRIBUTES OF WIDGETS #1-7
    for i in range(0, len(response.json["items"])):
        item = response.json["items"][i]
        assert "name" in item and item["name"] == NAMES[i]
        assert "info_url" in item and item["info_url"] == URLS[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL

```

Wow, that test case is a doozy! Let's take a look at what exactly is being tested since there's a lot going on here:

<div class="code-details">
    <ul>
      <li>
        <p><strong>Lines 8-36: </strong>These three lists contain the data required to create seven widget instances. Each item in each list is unique, in order to create test data that is as realistic as possible. This also makes the verifications that we perform more effective since we prevent any "false positive" results from occurring.</p>
      </li>
      <li>
        <p><strong>Lines 45-53: </strong>The seven widget instances are added to the database. Why seven? <a href="#pagination_reqparser-request-parser">When we created the <code>pagination_reqparser</code></a>, we defined that the only valid values for the <code>per_page</code> parameter are <code>[5, 10, 25, 50, 100]</code>. Creating seven widget instances and requesting a paginated list with <code>per_page=5</code> allows us to verify that our pagination logic is working correctly since the expected result is that the seven widget instances will generate two pages: the first with a total of five widgets, and the second with a total of two widgets.</p>
      </li>
      <li>
        <p><strong>Lines 56-57: </strong>We use the <code>retrieve_widget_list</code> function that we created in <code>tests.util</code> to send a request for the first page of widgets with <span class="bold-text">5 items per page</span> (<code>page=1, per_page=5</code>), and verify that the HTTP status code of the response is 200 <code>HTTPStatus.OK</code>.</p>
      </li>
      <li>
        <p><strong>Lines 60-65: </strong>Since the request was sucessful, we know that <code>response.json</code> contains the pagination object. If you need to remind yourself how this object is structured, <a href="#pagination_model-json-example">click here</a>.</p>
        <p>We verify that the pagination object correctly represents the <span class="bold-text">first page of two total pages</span> of widgets containing five widgets per page. For example, <code>has_prev</code> should be <code>False</code>, <code>has_next</code> should be <code>True</code>, <code>page</code> should be equal to <code>1</code>, etc.</p>
      </li>
      <li>
        <p><strong>Line 66: </strong>Next, we verify that <code>items</code> (which is the list of widgets on page 1) contains five elements.</p>
      </li>
      <li>
        <p><strong>Lines 69-75: </strong>After verifying the pagination attributes, we verify that the widgets retrieved from the database contain the exact values for <code>widget_name</code>, <code>info_url</code> and <code>deadline_str</code> that were taken from the <code>NAMES</code>, <code>URLS</code> and <code>DEADLINES</code> lists when we created the first five widget instances and added them to the database. This is done in a simple, compact way with a <code>for</code> loop.</p>
      </li>
      <li>
        <p><strong>Lines 78-79: </strong>After verifying all data on page 1, we send a request for the second page of widgets with <span class="bold-text">5 items per page</span> (<code>page=2, per_page=5</code>), which should return a response with status code 200 (<code>HTTPStatus.OK</code>).</p>
      </li>
      <li>
        <p><strong>Lines 82-87: </strong>Next, we verify that the pagination object correctly represents the <span class="bold-text">second page of two total pages</span> of widgets containing five widgets per page. For example, <code>has_prev</code> should be <code>True</code>, <code>has_next</code> should be <code>False</code>, <code>page</code> should be equal to <code>2</code>, etc.</p>
      </li>
      <li>
        <p><strong>Line 88: </strong>Since there are seven total widgets in the database and page 1 contained #1-5, we expect that <code>items</code> on page 2 will contain two elements (i.e., widgets #6-7)</p>
      </li>
      <li>
        <p><strong>Lines 91-97: </strong>In the same way that we did for page 1, we verify that the widgets retrieved from the database contain the exact values for <code>widget_name</code>, <code>info_url</code> and <code>deadline_str</code> that were taken from the <code>NAMES</code>, <code>URLS</code> and <code>DEADLINES</code> lists when we created the final two widget instances and added them to the database.</p>
        <p>At this point, we have verified that our pagination scheme is working correctly when a client requests a list of widgets with five items per page. Let's see if everything is working as expected with a larger <code>per_page</code> value.</p>
      </li>
      <li>
        <p><strong>Lines 100-101: </strong>We send a request for the first page of widgets with <span class="bold-text">10 items per page</span> (<code>page=1, per_page=10</code>), and verify that the HTTP status code of the response is 200 <code>HTTPStatus.OK</code>.</p>
      </li>
      <li>
        <p><strong>Lines 104-109: </strong>We verify that the pagination object correctly represents the <span class="bold-text">first page of one total page</span> of widgets containing ten widgets per page. For example, <code>has_prev</code> should be <code>False</code>, <code>has_next</code> should be <code>False</code>, <code>page</code> should be equal to <code>1</code>, etc.</p>
      </li>
      <li>
        <p><strong>Lines 110: </strong>Next, we verify that <code>items</code> (which is the list of widgets on page 1) contains seven elements.</p>
      </li>
      <li>
        <p><strong>Lines 113-119: </strong>This should look familiar to you by now. We verify that the widgets retrieved from the database contain the exact values for <code>widget_name</code>, <code>info_url</code> and <code>deadline_str</code> that were taken from the <code>NAMES</code>, <code>URLS</code> and <code>DEADLINES</code> lists when we created all seven widget instances and added them to the database.</p>
      </li>
      <li>
        <p><strong>Lines 122-141: </strong>I'm going to summarize the rest of the test case since it is nearly identical to the <code>page=1, per_page=10</code> results that we just explained. When requesting the list of widgets in <span class="bold-text">Line 122</span>, no values are specified for <code>page</code> and <code>per_page</code>. Since we specified that default values of <code>page=1</code> and <code>per_page=10</code> will be used when the request does not contain either value, we perform the same verifications which we just explained for <span class="bold-text">Lines 103-119</span>.</p>
      </li>
    </ul>
</div>

Are you still with me? I know that this section has been quite tedious but bear with me! The end is in sight, and when we get there you will have a fully-featured REST API with a satisfactory level of test-coverage. Just imagine how excited you will be.

### Retrieve Widget

Hopefully you can figure out what we need to do at this point, since we did the same thing for the previous two sets of test cases: create a function that sends a request to the API endpoint responsible for handling the current operation, with the correct HTTP method type. Since we now are testing the retrieve widget operation, we need to use the Flask test client to send a `GET` request to the `api.widget` endpoint, specifying the name of the widget we wish to retrieve in the URL path.

Open `tests/util.py` and add the content below:

```python {linenos=table,linenostart=69}
def retrieve_widget(test_client, access_token, widget_name):
    return test_client.get(
        url_for("api.widget", name=widget_name),
        headers={"Authorization": f"Bearer {access_token}"},
    )
```

This is very similar to the `retrieve_widget_list` function that we created in the same file so it should be easy to understand. Create a new file named `test_retrieve_widget.py` in the `tests` folder and add everything you see below:

```python {linenos=table}
"""Test cases for GET requests sent to the api.widget API endpoint."""
from http import HTTPStatus

from tests.util import (
    ADMIN_EMAIL,
    EMAIL,
    DEFAULT_NAME,
    DEFAULT_URL,
    DEFAULT_DEADLINE,
    login_user,
    create_widget,
    retrieve_widget,
)


def test_retrieve_widget_non_admin_user(client, db, admin, user):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token)
    assert response.status_code == HTTPStatus.CREATED

    response = login_user(client, email=EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = retrieve_widget(client, access_token, widget_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.OK

    assert "name" in response.json and response.json["name"] == DEFAULT_NAME
    assert "info_url" in response.json and response.json["info_url"] == DEFAULT_URL
    assert "deadline" in response.json and DEFAULT_DEADLINE in response.json["deadline"]
    assert "owner" in response.json and "email" in response.json["owner"]
    assert response.json["owner"]["email"] == ADMIN_EMAIL


def test_retrieve_widget_does_not_exist(client, db, user):
    response = login_user(client, email=EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = retrieve_widget(client, access_token, widget_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert (
        "message" in response.json
        and f"{DEFAULT_NAME} not found in database" in response.json["message"]
    )
```

The first test case, `test_retrieve_widget_non_admin_user`, is a basic happy-path scenario with one small wrinkle. This operation requires a valid access token, but does not require administrator privileges. So, while the request to create a new widget is sent by the `admin` user **(Line 20)**, the request to retrieve the same widget is sent by the regular non-admin `user` **(Line 26)**. After that request succeeds, we verify the attributes of the retrieved widget match the values used to create it.

The second test case, `test_retrieve_widget_does_not_exist`, is a very simple unhappy-path scenario. The first four lines **(Lines 37-40)** are exactly the same as **Lines 23-26** in the previous test case. Why is this noteworthy? Because in this case, we are attempting to retrieve a widget with `name="some-widget"` before it has been created and added to the database. We expect to receive a response with status code 404 (`HTTPStatus.NOT_FOUND`), and an error message explaining that there is no widget with that name in the database **(Lines 41-45)**.

### Update Widget

You know the routine by now, open `tests/utils.py`, add the `update_widget` function and save the file:

```python {linenos=table,linenostart=76}
def update_widget(test_client, access_token, widget_name, info_url, deadline_str):
    return test_client.put(
        url_for("api.widget", name=widget_name),
        headers={"Authorization": f"Bearer {access_token}"},
        data=f"info_url={info_url}&deadline={deadline_str}",
        content_type="application/x-www-form-urlencoded",
    )
```

`update_widget` is (obviously) the function that we will use to send a `PUT` request to the `api.widget` endpoint. Next, create a new file named `test_update_widget.py` in `tests`, enter the content below and save the file:

```python {linenos=table}
"""Test cases for GET requests sent to the api.widget API endpoint."""
from datetime import date, timedelta
from http import HTTPStatus

from tests.util import (
    ADMIN_EMAIL,
    DEFAULT_NAME,
    login_user,
    create_widget,
    retrieve_widget,
    update_widget,
)

UPDATED_URL = "https://www.newurl.com"
UPDATED_DEADLINE = (date.today() + timedelta(days=5)).strftime("%m/%d/%y")


def test_update_widget(client, db, admin):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token)
    assert response.status_code == HTTPStatus.CREATED

    response = update_widget(
        client,
        access_token,
        widget_name=DEFAULT_NAME,
        info_url=UPDATED_URL,
        deadline_str=UPDATED_DEADLINE,
    )
    assert response.status_code == HTTPStatus.OK
    response = retrieve_widget(client, access_token, widget_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.OK

    assert "name" in response.json and response.json["name"] == DEFAULT_NAME
    assert "info_url" in response.json and response.json["info_url"] == UPDATED_URL
    assert "deadline" in response.json and UPDATED_DEADLINE in response.json["deadline"]
    assert "owner" in response.json and "email" in response.json["owner"]
    assert response.json["owner"]["email"] == ADMIN_EMAIL

```

This is the normal, happy-path scenario for updating an existing widget. After logging in with an admin user and creating a widget **(Lines 19-23)**, we update the values for `info_url` and `deadline_str` **(Lines 25-30)**. Next, we send a request to retrieve the same widget from the database **(Line 33)** so that we can verify that the `info_url` and `deadline_str` values were successfully updated **(Lines 37-38)**.

{{< alert_box >}}
Please keep in mind the level of detail and attention that was paid to [the formal definition of a `PUT` request earlier in this section](#update_widget). The test coverage for the update widget operation should be designed to verify that our implementation adheres to the requirements from [Section 4.3.4 of RFC 7321](https://tools.ietf.org/html/rfc7231#section-4.3.4).
{{< /alert_box >}}

### Delete Widget

There is only a single, remaining CRUD operation in **[Table 1](#table-1)** that we need to create test coverage for: delete widget. Without further ado, open `tests/utils.py`, add the `delete_widget` function and save the file:

```python {linenos=table,linenostart=85}
def delete_widget(test_client, access_token, widget_name):
    return test_client.delete(
        url_for("api.widget", name=widget_name),
        headers={"Authorization": f"Bearer {access_token}"},
    )
```

`delete_widget` is the function that we will use to send a `DELETE` request to the `api.widget` endpoint. Next, create a new file named `test_delete_widget.py` in `tests`, enter the content below and save the file:

```python {linenos=table}
"""Test cases for GET requests sent to the api.widget API endpoint."""
from http import HTTPStatus

from tests.util import (
    ADMIN_EMAIL,
    EMAIL,
    DEFAULT_NAME,
    FORBIDDEN,
    login_user,
    create_widget,
    retrieve_widget,
    delete_widget,
)


def test_delete_widget(client, db, admin):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token)
    assert response.status_code == HTTPStatus.CREATED
    response = delete_widget(client, access_token, widget_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.NO_CONTENT
    response = retrieve_widget(client, access_token, widget_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_delete_widget_no_admin_token(client, db, admin, user):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_widget(client, access_token)
    assert response.status_code == HTTPStatus.CREATED

    response = login_user(client, email=EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = delete_widget(client, access_token, widget_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "message" in response.json and response.json["message"] == FORBIDDEN

```

The first test case, `test_delete_widget`, is a basic happy-path scenario. The admin user creates a widget, then sends the request to delete the same widget **(Lines 17-22)**. If the delete request was successful, we expect the response to have a status code of 204 (`HTTPStatus.NO_CONTENT`) **(Line 23)**. To verify that the widget was deleted in another way, the admin user sends a request to retrieve a widget with name equal to the name of the widget which was deleted **(Line 24)**. In this case, we expect the response to have a status code of 404 (`HTTPStatus.NOT_FOUND`) **(Line 25)**.

The second test case, `test_delete_widget_no_admin_token`, is a very simple unhappy-path scenario. The first five lines **(Lines 29-33)** are exactly the same as **Lines 17-21** in the previous test case. However, this test case differs because now we login as the non-admin user and send a request to delete the widget which was created previously **(Lines 35-38)**. However, since this operation can only be performed by admin users, we expect the response to have a status code of 403 (`HTTPStatus.FORBIDDEN`), and for the response to contain a field named **message** explaining that the requested operation can only be performed by users with administrator privileges **(Lines 39-4`)**.

Let's verify that all of our test cases are still passing by running `tox`:

<pre><code class="tox"><span class="cmd-venv">(venv) flask_api_tutorial $</span> <span class="cmd-input">tox</span>
<span class="cmd-results">GLOB sdist-make: /Users/aaronluna/Projects/flask_api_tutorial/setup.py
py37 recreate: /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37
py37 installdeps: black, flake8, pydocstyle, pytest, pytest-black, pytest-clarity, pytest-dotenv, pytest-flake8, pytest-flask
py37 inst: /Users/aaronluna/Projects/flask_api_tutorial/.tox/.tmp/package/1/flask-api-tutorial-0.1.zip
py37 installed: alembic==1.4.0,aniso8601==8.0.0,appdirs==1.4.3,attrs==19.3.0,bcrypt==3.1.7,black==19.10b0,certifi==2019.11.28,cffi==1.14.0,chardet==3.0.4,Click==7.0,entrypoints==0.3,flake8==3.7.9,Flask==1.1.1,flask-api-tutorial==0.1,Flask-Bcrypt==0.7.1,Flask-Cors==3.0.8,Flask-Migrate==2.5.2,flask-restx==0.1.1,Flask-SQLAlchemy==2.4.1,idna==2.8,importlib-metadata==1.5.0,itsdangerous==1.1.0,Jinja2==2.11.1,jsonschema==3.2.0,Mako==1.1.1,MarkupSafe==1.1.1,mccabe==0.6.1,more-itertools==8.2.0,packaging==20.1,pathspec==0.7.0,pluggy==0.13.1,py==1.8.1,pycodestyle==2.5.0,pycparser==2.19,pydocstyle==5.0.2,pyflakes==2.1.1,PyJWT==1.7.1,pyparsing==2.4.6,pyrsistent==0.15.7,pytest==5.3.5,pytest-black==0.3.8,pytest-clarity==0.3.0a0,pytest-dotenv==0.4.0,pytest-flake8==1.0.4,pytest-flask==0.15.1,python-dateutil==2.8.1,python-dotenv==0.11.0,python-editor==1.0.4,pytz==2019.3,regex==2020.1.8,requests==2.22.0,six==1.14.0,snowballstemmer==2.0.0,SQLAlchemy==1.3.13,termcolor==1.1.0,toml==0.10.0,typed-ast==1.4.1,urllib3==1.25.8,wcwidth==0.1.8,Werkzeug==0.16.1,zipp==2.2.0
py37 run-test-pre: PYTHONHASHSEED='2239596822'
py37 run-test: commands[0] | pytest
=============================================== test session starts ================================================
platform darwin -- Python 3.7.6, pytest-5.3.5, py-1.8.1, pluggy-0.13.1 -- /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/bin/python
cachedir: .tox/py37/.pytest_cache
rootdir: /Users/aaronluna/Projects/flask_api_tutorial, inifile: pytest.ini
plugins: clarity-0.3.0a0, black-0.3.8, dotenv-0.4.0, flask-0.15.1, flake8-1.0.4
collected 106 items

run.py::FLAKE8 PASSED                                                                                        [  0%]
run.py::BLACK PASSED                                                                                         [  1%]
setup.py::FLAKE8 PASSED                                                                                      [  2%]
setup.py::BLACK PASSED                                                                                       [  3%]
src/flask_api_tutorial/__init__.py::FLAKE8 PASSED                                                            [  4%]
src/flask_api_tutorial/__init__.py::BLACK PASSED                                                             [  5%]
src/flask_api_tutorial/config.py::FLAKE8 PASSED                                                              [  6%]
src/flask_api_tutorial/config.py::BLACK PASSED                                                               [  7%]
src/flask_api_tutorial/api/__init__.py::FLAKE8 PASSED                                                        [  8%]
src/flask_api_tutorial/api/__init__.py::BLACK PASSED                                                         [  9%]
src/flask_api_tutorial/api/exceptions.py::FLAKE8 PASSED                                                      [ 10%]
src/flask_api_tutorial/api/exceptions.py::BLACK PASSED                                                       [ 11%]
src/flask_api_tutorial/api/auth/__init__.py::FLAKE8 PASSED                                                   [ 12%]
src/flask_api_tutorial/api/auth/__init__.py::BLACK PASSED                                                    [ 13%]
src/flask_api_tutorial/api/auth/business.py::FLAKE8 PASSED                                                   [ 14%]
src/flask_api_tutorial/api/auth/business.py::BLACK PASSED                                                    [ 15%]
src/flask_api_tutorial/api/auth/decorators.py::FLAKE8 PASSED                                                  [ 16%]
src/flask_api_tutorial/api/auth/decorators.py::BLACK PASSED                                                   [ 16%]
src/flask_api_tutorial/api/auth/dto.py::FLAKE8 PASSED                                                        [ 17%]
src/flask_api_tutorial/api/auth/dto.py::BLACK PASSED                                                         [ 18%]
src/flask_api_tutorial/api/auth/endpoints.py::FLAKE8 PASSED                                                  [ 19%]
src/flask_api_tutorial/api/auth/endpoints.py::BLACK PASSED                                                   [ 20%]
src/flask_api_tutorial/api/widgets/__init__.py::FLAKE8 PASSED                                                [ 21%]
src/flask_api_tutorial/api/widgets/__init__.py::BLACK PASSED                                                 [ 22%]
src/flask_api_tutorial/api/widgets/business.py::FLAKE8 PASSED                                                [ 23%]
src/flask_api_tutorial/api/widgets/business.py::BLACK PASSED                                                 [ 24%]
src/flask_api_tutorial/api/widgets/dto.py::FLAKE8 PASSED                                                     [ 25%]
src/flask_api_tutorial/api/widgets/dto.py::BLACK PASSED                                                      [ 26%]
src/flask_api_tutorial/api/widgets/endpoints.py::FLAKE8 PASSED                                               [ 27%]
src/flask_api_tutorial/api/widgets/endpoints.py::BLACK PASSED                                                [ 28%]
src/flask_api_tutorial/models/__init__.py::FLAKE8 PASSED                                                     [ 29%]
src/flask_api_tutorial/models/__init__.py::BLACK PASSED                                                      [ 30%]
src/flask_api_tutorial/models/token_blacklist.py::FLAKE8 PASSED                                              [ 31%]
src/flask_api_tutorial/models/token_blacklist.py::BLACK PASSED                                               [ 32%]
src/flask_api_tutorial/models/user.py::FLAKE8 PASSED                                                         [ 33%]
src/flask_api_tutorial/models/user.py::BLACK PASSED                                                          [ 33%]
src/flask_api_tutorial/models/widget.py::FLAKE8 PASSED                                                       [ 34%]
src/flask_api_tutorial/models/widget.py::BLACK PASSED                                                        [ 35%]
src/flask_api_tutorial/util/__init__.py::FLAKE8 PASSED                                                       [ 36%]
src/flask_api_tutorial/util/__init__.py::BLACK PASSED                                                        [ 37%]
src/flask_api_tutorial/util/datetime_util.py::FLAKE8 PASSED                                                  [ 38%]
src/flask_api_tutorial/util/datetime_util.py::BLACK PASSED                                                   [ 39%]
src/flask_api_tutorial/util/result.py::FLAKE8 PASSED                                                         [ 40%]
src/flask_api_tutorial/util/result.py::BLACK PASSED                                                          [ 41%]
tests/__init__.py::FLAKE8 PASSED                                                                             [ 42%]
tests/__init__.py::BLACK PASSED                                                                              [ 43%]
tests/conftest.py::FLAKE8 PASSED                                                                             [ 44%]
tests/conftest.py::BLACK PASSED                                                                              [ 45%]
tests/test_auth_login.py::FLAKE8 PASSED                                                                      [ 46%]
tests/test_auth_login.py::BLACK PASSED                                                                       [ 47%]
tests/test_auth_login.py::test_login PASSED                                                                  [ 48%]
tests/test_auth_login.py::test_login_email_does_not_exist PASSED                                             [ 49%]
tests/test_auth_logout.py::FLAKE8 PASSED                                                                     [ 50%]
tests/test_auth_logout.py::BLACK PASSED                                                                      [ 50%]
tests/test_auth_logout.py::test_logout PASSED                                                                [ 51%]
tests/test_auth_logout.py::test_logout_token_blacklisted PASSED                                              [ 52%]
tests/test_auth_register.py::FLAKE8 PASSED                                                                   [ 53%]
tests/test_auth_register.py::BLACK PASSED                                                                    [ 54%]
tests/test_auth_register.py::test_auth_register PASSED                                                       [ 55%]
tests/test_auth_register.py::test_auth_register_email_already_registered PASSED                              [ 56%]
tests/test_auth_register.py::test_auth_register_invalid_email PASSED                                         [ 57%]
tests/test_auth_user.py::FLAKE8 PASSED                                                                       [ 58%]
tests/test_auth_user.py::BLACK PASSED                                                                        [ 59%]
tests/test_auth_user.py::test_auth_user PASSED                                                               [ 60%]
tests/test_auth_user.py::test_auth_user_no_token PASSED                                                      [ 61%]
tests/test_auth_user.py::test_auth_user_expired_token PASSED                                                 [ 62%]
tests/test_config.py::FLAKE8 PASSED                                                                          [ 63%]
tests/test_config.py::BLACK PASSED                                                                           [ 64%]
tests/test_config.py::test_config_development PASSED                                                         [ 65%]
tests/test_config.py::test_config_testing PASSED                                                             [ 66%]
tests/test_config.py::test_config_production PASSED                                                          [ 66%]
tests/test_create_widget.py::FLAKE8 PASSED                                                                   [ 67%]
tests/test_create_widget.py::BLACK PASSED                                                                    [ 68%]
tests/test_create_widget.py::test_create_widget_valid_name[abc123] PASSED                                    [ 69%]
tests/test_create_widget.py::test_create_widget_valid_name[widget-name] PASSED                               [ 70%]
tests/test_create_widget.py::test_create_widget_valid_name[new_widget1] PASSED                               [ 71%]
tests/test_create_widget.py::test_create_widget_valid_deadline[02/16/2020] PASSED                            [ 72%]
tests/test_create_widget.py::test_create_widget_valid_deadline[2020-02-16] PASSED                            [ 73%]
tests/test_create_widget.py::test_create_widget_valid_deadline[Feb 19 2020] PASSED                           [ 74%]
tests/test_create_widget.py::test_create_widget_invalid_deadline[1/1/1970] PASSED                            [ 75%]
tests/test_create_widget.py::test_create_widget_invalid_deadline[2020-02-13] PASSED                          [ 76%]
tests/test_create_widget.py::test_create_widget_invalid_deadline[a long time ago, in a galaxy far, far away] PASSED [ 77%]
tests/test_create_widget.py::test_create_widget_already_exists PASSED                                        [ 78%]
tests/test_create_widget.py::test_create_widget_no_admin_token PASSED                                        [ 79%]
tests/test_delete_widget.py::FLAKE8 PASSED                                                                   [ 80%]
tests/test_delete_widget.py::BLACK PASSED                                                                    [ 81%]
tests/test_delete_widget.py::test_delete_widget PASSED                                                       [ 82%]
tests/test_delete_widget.py::test_delete_widget_no_admin_token PASSED                                        [ 83%]
tests/test_retrieve_widget.py::FLAKE8 PASSED                                                                 [ 83%]
tests/test_retrieve_widget.py::BLACK PASSED                                                                  [ 84%]
tests/test_retrieve_widget.py::test_retrieve_widget_non_admin_user PASSED                                    [ 85%]
tests/test_retrieve_widget.py::test_retrieve_widget_does_not_exist PASSED                                    [ 86%]
tests/test_retrieve_widget_list.py::FLAKE8 PASSED                                                            [ 87%]
tests/test_retrieve_widget_list.py::BLACK PASSED                                                             [ 88%]
tests/test_retrieve_widget_list.py::test_retrieve_paginated_widget_list PASSED                               [ 89%]
tests/test_update_widget.py::FLAKE8 PASSED                                                                   [ 90%]
tests/test_update_widget.py::BLACK PASSED                                                                    [ 91%]
tests/test_update_widget.py::test_update_widget PASSED                                                       [ 92%]
tests/test_user.py::FLAKE8 PASSED                                                                            [ 93%]
tests/test_user.py::BLACK PASSED                                                                             [ 94%]
tests/test_user.py::test_encode_access_token PASSED                                                          [ 95%]
tests/test_user.py::test_decode_access_token_success PASSED                                                  [ 96%]
tests/test_user.py::test_decode_access_token_expired PASSED                                                  [ 97%]
tests/test_user.py::test_decode_access_token_invalid PASSED                                                  [ 98%]
tests/util.py::FLAKE8 PASSED                                                                                 [ 99%]
tests/util.py::BLACK PASSED                                                                                  [100%]

================================================= warnings summary =================================================
src/flask_api_tutorial/api/exceptions.py::FLAKE8
  /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/lib/python3.7/site-packages/flask_restx/model.py:12: DeprecationWarning: Using or importing the ABCs from 'collections' instead of from 'collections.abc' is deprecated since Python 3.3,and in 3.9 it will stop working
    from collections import OrderedDict, MutableMapping

src/flask_api_tutorial/api/exceptions.py::FLAKE8
  /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/lib/python3.7/site-packages/flask_restx/api.py:28: DeprecationWarning: The import 'werkzeug.cached_property' is deprecated and will be rebmoved in Werkzeug 1.0. Use 'from werkzeug.utils import cached_property' instead.
    from werkzeug import cached_property

src/flask_api_tutorial/api/exceptions.py::FLAKE8
  /Users/aaronluna/Projects/flask_api_tutorial/.tox/py37/lib/python3.7/site-packages/flask_restx/swagger.py:12: DeprecationWarning: Using or importing the ABCs from 'collections' instead of from 'collections.abc' is deprecated since Python 3.3,and in 3.9 it will stop working
    from collections import OrderedDict, Hashable

-- Docs: https://docs.pytest.org/en/latest/warnings.html
========================================= 106 passed, 3 warnings in 30.00s =========================================
_____________________________________________________ summary ______________________________________________________
  py37: commands succeeded
  congratulations :)</span></code></pre>

As you can see, thanks to `pytest` and various plugins, we have a faily robust test suite as well as automated enforcement of our code formatter (`black`) and linter (`flake8`) for all files inside the `src` and `tests` folders.

## Swagger UI

It's been a while since we looked at the Swagger UI page, and it has changed considerably due to the API endpoints and models we created in this section. Fire up the development server with the `flask run` command and navigate to http://localhost:5000/api/v1/ui. You should see the page shown below:

{{< linked_image img1 >}}

You should spend some time testing all of the endpoints. If you need a refresher on requesting and retrieiving an access token, and how to use the access token to send a request for a protected resource, refer to [this step-by-step explanation in Part 4](/series/flask-api-tutorial/part-4/#swagger-ui)

## Checkpoint

At long last, we have implemented all of the required features for this project. However, that does not mean that

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
  <p class="title complete">API Resource: Widget List</p>
  <div class="fa-bullet-list">
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>All users can retrieve a list of all widgets</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>All users can retrieve individual widgets by name</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>Users with administrator access can add new widgets to the database</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>Users with administrator access can edit existing widgets</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>Users with administrator access can delete widgets from the database</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>The widget model contains attributes with URL, datetime, timedelta and bool data types, along with normal text fields.</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>URL and datetime values must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>The widget model contains a "name" attribute which must be a string value containing only lowercase-letters, numbers and the "-" (hyphen character) or "_" (underscore character).</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>The widget model contains a "deadline" attribute which must be a datetime value where the date component is equal to or greater than the current date. The comparison does not consider the value of the time component when this comparison is performed.</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>Widget name must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item complete"><span class="fa fa-star fa-bullet-icon"></span>If input validation fails either when adding a new widget or editing an existing widget, the API response must include error messages indicating the name(s) of the fields that failed validation.</p>
  </div>
</div>
