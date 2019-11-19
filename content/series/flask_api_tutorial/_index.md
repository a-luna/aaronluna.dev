---
title: "How To: Create a Flask API with JWT-Based Authentication (Overview)"
lead: "Project Overview"
slug: "overview"
series: ["flask_api_tutorial"]
series_weight: 0
series_title: "How To: Create a Flask API with JWT-Based Authentication"
series_part: "Overview"
series_part_lead: "Project Overview"
categories: ["Flask", "Python"]
toc: false
summary: "This tutorial series provides step-by-step instructions and in-depth explanations to guide you through the process of creating a robust, production-quality REST API. The toolstack consists of Flask, Flask-RESTPlus, pyjwt, SQLAlchemy and other packages. Code quality is a major focus, with considerable time dedicated to testing (using pytest), logging and tools such as coverage, flake8 and mypy. The tutorial concludes by creating a process that continuously tnregrates (with tox, travis/circle CI, coveralls) and deploys the API (with either Github or Azure DevOps to Heroku)."
twitter:
  card: "summary"
  creator: "@aaronlunadev"
  title: "How To: Create a Flask API with JWT-Based Authentication"
  description: "Step-by-step instructions and in-depth explanations to guide you through the process of creating a robust, production-quality REST API using Flask, Flask-RESTlus, pyjwt, SQLAlchemy and more."
  image: "https://aaronluna.dev/img/flask-api-tutorial/p04-02-swagger-ui-auth.jpg"
---
## Project Overview

My goal for this tutorial is to provide a detailed guide to designing and creating a Flask API that uses JSON Web Tokens (JWT) to authenticate HTTP requests. The first three parts (which are available today) will produce a working API that fulfills the requirements listed at the end of this post.

There are many different Flask extensions and Python packages that can be used to create a web service that satisfies these requirements. The toolchain that this product utilizes includes Flask-RESTPlus, SQLAlchemy, PyJWT and pytest (this is simply my personal preference). All of the project dependancies are discussed in Part 1.

This is <span class="emphasis">NOT</span> a full-stack tutorial, creating a front-end that consumes the API is not covered. However, Flask-RESTPlus will automatically generate a Swagger UI webpage that allows anyone to send requests and inspect responses from the API. You are free to create a UI with React or Vue or (insert your preferred JS framework here).

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
    <div class="note note-flex">
      <div class="note-icon">
        <i class="fa fa-pencil" aria-hidden="true"></i>
      </div>
      <div class="note-message" style="flex-flow: column wrap">
        <p>What is the point of performing the comparison in this way? Imagine creating a widget and there's a blank field labeled "deadline". If hypothetical you had to provide a value for this field, and you entered today's date. How would you expect the widget to behave? I think the most logical design would be for the widget's deadline to change from "deadline has not passed" to "deadline passed" would be at the next stroke of midnight. For example, if you set deadline=today's date, and it's 10:00AM, you would have 16 hours until the deadline would be considered class. At 8:00PM, you would instead have 4 hours until it is considered passed.</p>
      </div>
    </div>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Widget name must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>If input validation fails either when adding a new widget or editing an existing widget, the API response must include error messages indicating the name(s) of the fields that failed validation.</p>
  </div>
</div>

Click below to start the tutorial!
