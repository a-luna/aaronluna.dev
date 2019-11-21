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
<span class="cmd-lineno-hl">18    <span class="light-blue">&lt;http://localhost:5000/api/v1/widgets?page=2&per_page=10>; rel="next",</span></span>
<span class="cmd-lineno-hl">19    <span class="light-blue">&lt;http://localhost:5000/api/v1/widgets?page=1&per_page=10>; rel="first",</span></span>
<span class="cmd-lineno-hl">20    <span class="light-blue">&lt;http://localhost:5000/api/v1/widgets?page=5&per_page=10>; rel="last"</span></span>
<span class="cmd-lineno">21</span>  <span class="purple">Server</span>: <span class="light-blue">Werkzeug/0.15.5 Python/3.7.4</span>
<span class="cmd-lineno">22</span>  <span class="purple">Total-Count</span>: <span class="pink">23</span>
<span class="cmd-lineno">23</span>
<span class="cmd-lineno">24</span>  <span class="bold-text">{
<span class="cmd-lineno-hl">25    <span class="purple">"links"</span><span style="color: var(--light-gray2)">: {</span></span>
<span class="cmd-lineno-hl">26      <span class="purple">"self"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=1&per_page=10"</span><span style="color: var(--light-gray2)">,</span></span>
<span class="cmd-lineno-hl">27      <span class="purple">"next"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=2&per_page=10"</span><span style="color: var(--light-gray2)">,</span></span>
<span class="cmd-lineno-hl">28      <span class="purple">"first"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=1&per_page=10"</span><span style="color: var(--light-gray2)">,</span></span>
<span class="cmd-lineno-hl">29      <span class="purple">"last"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"http://localhost:5000/api/v1/widgets?page=5&per_page=10"</span></span>
<span class="cmd-lineno">30</span>    },
<span class="cmd-lineno">31</span>    <span class="purple">"page"</span>: <span class="pink">1</span>
<span class="cmd-lineno">33</span>    <span class="purple">"total_pages"</span>: <span class="pink">5</span>,
<span class="cmd-lineno">33</span>    <span class="purple">"items_per_page"</span>: <span class="pink">10</span>,
<span class="cmd-lineno">34</span>    <span class="purple">"total_items"</span>: <span class="pink">23</span>,
<span class="cmd-lineno">35</span>    <span class="purple">"items"</span>: [
<span class="cmd-lineno">36</span>      {
<span class="cmd-lineno">37</span>        <span class="gray">//...</span>
<span class="cmd-lineno">38</span>        <span class="purple">"name"</span>: <span class="light-blue">"test"</span>
<span class="cmd-lineno-hl">39        <span class="purple">"link"</span><span style="color: var(--light-gray2)">:</span> <span class="light-blue">"http://localhost:5000/api/v1/widgets/test"</span><span style="color: var(--light-gray2)">,</span></span>
<span class="cmd-lineno">40</span>      },
<span class="cmd-lineno">41</span>      <span class="gray">//...</span>
<span class="cmd-lineno">42</span>    ]
<span class="cmd-lineno">43</span>  }</span></span></code></pre>

In this example, the database contains a total of 23 `widget` objects. If the client sends a `GET` request to `/api/v1/widgets?page=1&per_page=10`, the server response will contain the first ten objects from the database in the order that they were created. (i.e., items #1-10) The client can step through the full set of `widget` objects by continually sending `GET` requests and incrementing the `page` attribute. With `page=2` and `per_page=10`, the server response will contain the next ten objects from the database (i.e., items #11-20). With `page=3` and `per_page=10`, only three items will be sent in the response (i.e., items #21-23).

### HATEOAS

If you've spent time reading about REST APIs, you have probably encountered the term <strong>HATEOAS</strong>, which stands for <strong>Hypertext As The Engine Of Application State</strong>. This is part of Roy Fielding's formal definition of REST, and the main takeaway is that clients shouldn't need to construct URLs in order to interact with a REST API, since this ties the client to an implementation. This is bad because any change to the structure/syntax of an existing URI is a breaking change for the client.

Ideally, a REST API should provide links in the header or body of the response that direct the client to the next logical set of actions/resources based on the client's request. The navigational links in the header **(Lines 18-21)** and body of the response **(Lines 25-29)** above allow the client to browse through the collection of widgets.

The object named "items" contains the first ten (of 23 total) widget objects. Each widget contains a "link" attribute **(Line 38)** containing the URI for the widget. Thanks to the link attribute and the navigational links, the client can navigate through the API and perform CRUD actions on `widget` instances without manually entering a single endpoint URL.

`page` and `per_page` are <a href="https://en.wikipedia.org/wiki/Query_string" target="_blank">query string parameters</a>. Query string parameters can be parsed using the same techniques that we used to parse email/password values from form data in the `auth_ns` namespace, and `widget` information in the previous section.

If the client sends a `GET` request to `http://localhost:5000/api/v1/widgets` (i.e., neither `page` or `page_num` are sent with the request), what happens? Typically, default values are assumed for these parameters. The default values are configured when we create the `RequestParser` arguments for the pagination parameters.

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil" aria-hidden="true"></i>
  </div>
  <div class="note-message">
    <p>While Fielding defined HATEOAS and stipulated that it is a requirement for a REST API, he did not specify the format for doing so. Depending on the project, navigational links could be provided in either the response header or body (obviously I have provided both for this demonstration). The format of the <code>Link</code> header field is defined in <a href="https://tools.ietf.org/html/rfc8288" target="_blank">RFC 8288</a>, which is a Proposed Standard that is widely employed throughout the internet (i.e., it's pretty safe to use it in your application, too).</p>
  </div>
</div>

## Retrieve Widget List

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
        "created_at": String(attribute="created_at_str"),
        "deadline_passed": Boolean,
        "deadline": String(attribute="deadline_str"),
        "time_remaining": String(attribute="time_remaining_str"),
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
from app.api.widget.dto import pagination_model
from app.api.auth.decorator import token_required, admin_token_required{{< /highlight >}}

{{< highlight python "linenos=table,linenostart=14" >}}@token_required
def retrieve_widget_list(page_num, per_page):
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

{{< highlight python >}}from app.api.widget.dto import (
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
    def get(self):
        """Get a list of all widgets."""
        request_data = pagination_reqparser.parse_args()
        page_num = request_data.get("page")
        per_page = request_data.get("per_page")
        return retrieve_widget_list(page_num, per_page){{< /highlight >}}

## Retrieve Widget

### `retrieve_widget` Method

{{< highlight python "linenos=table,linenostart=24" >}}@token_required
def retrieve_widget(name):
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
    def put(self, name):
        """Update an existing widget."""
        request_data = widget_reqparser.parse_args()
        widget_dict = {k: v for k, v in request_data.items()}
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

### `Widget` Resource (HTTP DELETE)

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

## Unit Tests: Delete aaWidget
