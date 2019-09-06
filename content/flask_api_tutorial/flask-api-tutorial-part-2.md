---
title: "The Complete Guide to Creating a Flask API with JWT-Based Authentication (Part 2)"
lead: "Part 2: Database Models, Migrations and JWT Setup"
slug: "flask-api-tutorial-part-2"
date: "2019-08-12"
series: ["Flask API Tutorial"]
series_part: "Part 2"
series_part_lead: "Database Models, Migrations and JWT Setup"
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

The chart below shows the folder structure that was created in [Part 1](/flask-api-tutorial-part-1/). In this post, we will work on all files marked as <code class="work-file">NEW CODE</code>. Files that contain code from [Part 1](/flask-api-tutorial-part-1/) but will not be modified in this post are marked as <code class="unmodified-file">NO CHANGES</code>.

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
|   |   |- <span class="work-file">user.py</span>
|   |
|   |- <span class="project-folder">util</span>
|   |   |- <span class="project-empty-file">__init__.py</span>
|   |   |- <span class="work-file">result.py</span>
|   |
|   |- <span class="unmodified-file">__init__.py</span>
|   |- <span class="unmodified-file">config.py</span>
|
|- <span class="project-folder">test</span>
|   |- <span class="work-file">conftest.py</span>
|   |- <span class="unmodified-file">test_config.py</span>
|   |- <span class="work-file">test_user.py</span>
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

## Database Models and Migrations with Flask-SQLAlchemy

If you have never used SQLAlchemy (or any ORM) before, the basic concept is simple: ORMs allow you to interact with data stored in a database as high-level abstractions such as classes, instances of classes and methods rather than writing raw SQL (the ORM translates your application code into SQL commands and queries).

A common task that I rarely see covered in tutorials like this is how to manage changes that are made to a database. Changes to the database schema will usually require changing data that is already stored in the database, or **migrating** the existing data. We will use the **Flask-Migrate** extension to handle this task and explain how to setup a migration system and how to create and apply migrations.

### `User` DB Model

[In Part 1]((/flask-api-tutorial-part-1/)), we created an instance of the Flask-SQLAlchemy extension with the name `db` in the `app/__init__.py` file and initialized it in the `create_app` method. The `db` object contains functions and classes from `sqlalchemy` and `sqlalchemy.orm`.

Whenever we need to declare a new database model (i.e., create a new database table), we create a class that derives from `db.Model`. Since we are creating an API that performs user authentication, our first SQLAlchemy model will be a `User` class that stores login credentials and metadata for registered users.

Create a new file `user.py` in the `models` folder and add the content below:

{{< highlight python "linenos=table" >}}"""Class definition for User model."""
from datetime import datetime, timezone
from uuid import uuid4

from flask import current_app
from sqlalchemy.ext.hybrid import hybrid_property

from app import db, bcrypt
from app.util.datetime_util import get_local_utcoffset, make_tzaware, localized_dt_string


class User(db.Model):
    """User model for storing logon credentials and other details."""

    __tablename__ = "site_user"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(100), nullable=False)
    registered_on = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    admin = db.Column(db.Boolean, default=False)
    public_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid4()))

    def __repr__(self):
        return f"<User email={self.email}, public_id={self.public_id}, admin={self.admin}>"

    @hybrid_property
    def registered_on_str(self):
        registered_on_utc = make_tzaware(self.registered_on, use_tz=timezone.utc, localize=False)
        return localized_dt_string(registered_on_utc, use_tz=get_local_utcoffset())

    @property
    def password(self):
        raise AttributeError("password: write-only field")

    @password.setter
    def password(self, password):
        log_rounds = current_app.config.get("BCRYPT_LOG_ROUNDS")
        hash_bytes = bcrypt.generate_password_hash(password, log_rounds)
        self.password_hash = hash_bytes.decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    @classmethod
    def find_by_email(cls, email):
        return cls.query.filter_by(email=email).first()

    @classmethod
    def find_by_public_id(cls, public_id):
        return cls.query.filter_by(public_id=public_id).first(){{< /highlight >}}

The `User` class demonstrates several important concepts for creating database models in SQLAlchemy:

<div class="code-details">
    <ul>
        <li>
            <p><strong>Line 13: </strong><code>User</code> is defined as a subclass of <code>db.Model</code>. Subclassing <code>db.Model</code> "registers" the model with SQLAlchemy, allowing the ORM to create a database table based on the column definitions in <strong>Lines 18-23</strong>.</p>
        </li>
        <li>
            <p><strong>Line 16: </strong>Flask-SQLAlchemy will automatically set the name of the database table by converting the class name (<code>User</code>) to lowercase. However, <code>user</code> is a reserved word in multiple SQL implementations (e.g., PostgreSQL, MySQL, MSSQL), and using any reserved word as a table name is a bad idea. You can override this default value by setting the <code>__tablename__</code> class attribute.</strong></p>
            <div class="note note-flex">
                <div class="note-icon">
                    <i class="fa fa-pencil" aria-hidden="true"></i>
                </div>
                <div class="note-message">
                    <p>Python class names in CamelCase will also create tablenames by converting to lowercase, with underscores inserted between each word (e.g., Python class <code>CamelCase</code> => Database table <code>camel_case</code>).</p>
                </div>
            </div>
        </li>
        <li>
            <p><strong>Lines 18-23: </strong>Use <code>db.Column</code> to define a column. Dy default, the column name will be the same as the name of the attribute you assign it to. The first argument to <code>db.Column</code> is the data type (i.e., <code>db.Integer</code>, <code>db.String(size)</code>, <code>db.Boolean</code>). There are many different <a href="https://docs.sqlalchemy.org/en/13/core/type_basics.html#generic-types" target="_blank">generic data types</a> as well as <a href="https://docs.sqlalchemy.org/en/13/core/type_basics.html#sql-standard-and-multiple-vendor-types" target="_blank">vendor-specific data types</a> available. Our <code>site_user</code> table will have the following columns:</p>
            <ul>
                <li>
                    <p><strong>id: </strong>This is the primary key for our table, specified by <code>primary_key=True</code>. We will use the <code>db.Integer</code> data type, but you could use another data type or even specify multiple columns as a primary key. Also, note that we have setup "autoincrement" behavior by specifying <code>autoincrement=True</code>. This is possible only with integer data types.</p>
                </li>
                <li>
                    <p><strong>email: </strong>Like most sites, we will use an email address to identify our users. Notice that we have set a max length of 255 characters for this column with <code>db.String(255)</code>. Obviously, this is a mandatory value for all users, which we specify with <code>nullable=False</code>. To ensure that an email address cannot be registered by more than one user, we specify <code>unique=True</code>.</p>
                </li>
                <li>
                    <p><strong>password_hash: </strong>Storing passwords in a database is poor practice. Instead, we will compute a hash of the password using Flask-Bcrypt and store the hashed value in this column. When a user attempts to authenticate, we will again use Flask-Bcrypt to compare the password provided by the user to the hashed value. This will be explained in detail later on in this post.</p>
                </li>
                <li>
                    <p><strong>registered_on: </strong>This column will contain the date and time when the user account was created. <a href="https://docs.sqlalchemy.org/en/13/core/type_basics.html#sqlalchemy.types.DateTime" target="_blank">SQLAlchemy provides many ways to store datetime values</a>, but the simplist method is to use <code>db.DateTime</code>.  Notice that we have specified a default value for this column, <code>default=lambda: datetime.now(timezone.utc)</code>. This function returns the current UTC date and time as an "aware" datetime object (i.e., <code>tzinfo=timezone.utc</code>). When a new User is added to the database, the current UTC time will be evaluated and stored as the value for <code>registered_on</code>. In this project, all datetime values are assumed to be in UTC when written to the database.</p>
                </li>
                <li>
                    <p><strong>admin: </strong>This is a flag that indicates whether a user has administrator access. Use the <code>db.Boolean</code> data type to create a column containing only TRUE/FALSE values. By default, users should not have administrator access. We specify <code>default=False</code> to ensure this behavior.</p>
                </li>
                <li>
                    <p><strong>public_id: </strong>This column will contain <a href="https://docs.python.org/3/library/uuid.html" target="_blank">UUID</a> (Universally Unique IDentifier) values. This column is defined in the same way as the email column since we are storing a string value that must be unique for all users. However, since this is a random value (i.e., not user-provided), we populate the column similarly to <code>registered_on</code>, with the result of a lambda function that is called when a new User is added to the database.</p>
                    <div class="note note-flex">
                        <div class="note-icon">
                            <i class="fa fa-pencil" aria-hidden="true"></i>
                        </div>
                        <div class="note-message">
                            <p>You may be wondering why we are using <code>default=lambda:str(uuid4())</code>, rather than <code>default=uuid4</code>. Calling <code>uuid.uuid4()</code> returns a UUID object, which must be converted to a string before it can be written to the database.</p>
                        </div>
                    </div>
                </li>
            </ul>
        </li>
        <li>
            <p><strong>Lines 28-30: </strong>The <code>@hybrid_property</code> decorator is <a href="https://docs.sqlalchemy.org/en/13/orm/extensions/hybrid.html?highlight=hybrid%20properties" target="_blank">another SQLAlchemy feature</a> that is capable of much more than what I am demonstrating here. Most often, this decorator is used to create "computed" or "virtual" columns whose value is computed from the values of one or more columns. In this instance, the <code>registered_on_str</code> column converts the datetime value stored in <code>registered_on</code> to a formatted string.</p>
        </li>
        <li>
            <p><strong>Lines 32-34: </strong>This is part of the password-hashing implementation. The <code>@property</code> decorator exposes a <code>password</code> attribute on our User class. However, this is designed as a write-only value so when a client attempts to call <code>user.password</code> and retrieve the value, an <code>AttributeError</code> is raised.</p>
        </li>
        <li>
            <p><strong>Lines 36-40: </strong>This is the setter function for the <code>password</code> <code>@property</code> which calculates the value stored in the <code>password_hash</code> column. This design only stores the hashed value and discards the actual password. Also, hashing the same password multiple times always produces a different value, so it is impossible to compare <code>password_hash</code> values to determine if multiple users have the same password.</p>
            <div class="note note-flex">
                <div class="note-icon">
                    <i class="fa fa-pencil" aria-hidden="true"></i>
                </div>
                <div class="note-message">
                    <p>We are using a value from the <code>Config</code> class, <code>BCRYPT_LOG_ROUNDS</code>. Since we have created our <code>app</code> object using the factory pattern, we must access the Flask application instance through the proxy object <code>current_app</code> (<a href="http://flask.pocoo.org/docs/1.0/appcontext/#purpose-of-the-context" target="_blank">Read this for more info</a>).</p>
                </div>
            </div>
        </li>
        <li>
            <p><strong>Lines 42-43: </strong>This <code>check_password</code> function is used when the user is attempting to login. The <code>password</code> argument passed into the function is the value provided by the user, and this is provided to the <code>bcrypt.check_password_hash</code> function along with the <code>password_hash</code> value that was created when the user registered their account. The function returns <code>True</code> if the password provided by the user matches the hash, or <code>False</code> otherwise.</p>
        </li>
        <li>
            <p><strong>Lines 45-51: </strong>These two class methods are convenience methods that provide a clean, easy-to-read way to retrieve User accounts based on the values stored in the <code>email</code> or <code>public_id</code> columns. Since these values must be unique for all Users, we know that only one or zero Users can be returned from either method.</p>
        </li>
    </ul>
</div>


Did you notice that we never defined a <code>&#95;&#95;init&#95;&#95;</code> method? That’s because SQLAlchemy adds an implicit constructor to all model classes which accepts keyword arguments for all its columns and relationships. If you decide to override the constructor for any reason, make sure to keep accepting <code>&#42;&#42;kwargs</code> and call the super constructor with those <code>&#42;&#42;kwargs</code> to preserve this behavior:

{{< highlight python >}}class User(db.Model):
    # ...
    def __init__(**kwargs):
        super(User, self).__init__(**kwargs)
        # do custom stuff{{< /highlight >}}

### Creating The First Migration

Whenever we make a change to our database schema (e.g., add new table, change column name, change foreign key dependencies, etc.) we need to create a migration with the Flask-Migrate extension. Each migration is stored in the migration database (which is actually just a folder named **migrations**), which also keeps track of the order that the migrations occurred. This allows us to either upgrade or downgrade our database all the way back to the database's initial state.

The Flask-Migrate extension adds a new sub-command to the Flask CLI: `flask db`. In order to create the migration database, we must run `flask db init`:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask db init</span>
<span class="cmd-results">  Creating directory /Users/aaronluna/Projects/flask-api-tutorial/migrations ... done
  Creating directory /Users/aaronluna/Projects/flask-api-tutorial/migrations/versions ... done
  Generating /Users/aaronluna/Projects/flask-api-tutorial/migrations/script.py.mako ... done
  Generating /Users/aaronluna/Projects/flask-api-tutorial/migrations/env.py ... done
  Generating /Users/aaronluna/Projects/flask-api-tutorial/migrations/README ... done
  Generating /Users/aaronluna/Projects/flask-api-tutorial/migrations/alembic.ini ... done
  Please edit configuration/connection/logging settings in '/Users/aaronluna/Projects/flask-api-tutorial/migrations/alembic.ini' before proceeding.</span></code></pre>

In order for Flask-Migrate to detect the `User` model, we must import it in the `run.py` module:

{{< highlight python "linenos=table,hl_lines=5 12" >}}"""Flask CLI/Application entry point."""
import os

from app import create_app, db
from app.models.user import User

app = create_app(os.getenv("FLASK_ENV", "development"))


@app.shell_context_processor
def shell():
    return {"db": db, "User": User}{{< /highlight >}}

There are two changes which are highlighted above:

<div class="code-details">
    <ul>
        <li>
            <p><strong>Line 5: </strong>The User class will only be detected by the Flask-Migrate extension as a new database table if this import statement exists.</p>
        </li>
        <li>
            <p><strong>Line 12: </strong>We have added the <code>User</code> object to the dictionary that is imported by the <code>flask shell</code> command. This makes this class available in the shell context without needing to be explicitly imported.</p>
        </li>
    </ul>
</div>

<div class="alert alert-flex">
  <div class="alert-icon">
    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
  </div>
  <div class="alert-message">
    <p>The changes we just made to <code>run.py</code> will be repeated whenever a new model is added. In general, whenever you add a new database model class to your project, you need to update your application entry point (in our case the <code>run.py</code> file to import the new model class before running the <code>flask db migrate</code> command.</p>
  </div>
</div>

Ok, after making the changes to `run.py` we are ready to create our first migration. To do so, we use the `flask db migrate` command. Also, I recommend adding a message describing the schema changes that will be made, as shown below:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask db migrate --message "add User model"</span>
<span class="cmd-results">INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.autogenerate.compare] Detected added table 'site_user'
  Generating /Users/aaronluna/Projects/flask-api-tutorial/migrations/versions/64e5bdaa9a49_add_user_model.py ... done</span></code></pre>

The `flask db migrate` command creates the migration script but does not apply the changes to the database. To upgrade the database and execute the migration script you must run the `flask db upgrade` command:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask db upgrade</span>
<span class="cmd-results">INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 64e5bdaa9a49, add User model</span></code></pre>

<div class="note note-flex">
  <div class="note-icon">
    <i class="fa fa-pencil" aria-hidden="true"></i>
  </div>
  <div class="note-message">
    <p>Each time the database schema changes, repeat the <code>flask db migrate</code> and <code>flask db upgrade</code> steps demonstrated above. <span class="emphasis">Remember to add a message</span> describing the schema changes when a new migration is created with <code>flask db migrate</code>.</p>
  </div>
</div>

We can verify that the `site_user` table has been created using `flask shell` and the `sqlite3` module:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask shell</span>
<span class="cmd-results">Python 3.7.4 (default, May  7 2019, 00:14:38)
[Clang 10.0.1 (clang-1001.0.46.4)] on darwin
App: app [development]
Instance: /Users/aaronluna/Projects/flask-api-tutorial/instance</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">import sqlite3</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from pathlib import Path</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">DATABASE_URL = app.config.get("SQLALCHEMY_DATABASE_URI")</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">db = sqlite3.connect(Path(DATABASE_URL).name)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">cursor = db.cursor()</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">results = cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">for row in results:</span>
<span class="cmd-repl-prompt">...</span> <span class="cmd-repl-input">    print(row)</span>
<span class="cmd-repl-prompt">...</span>
<span class="cmd-repl-results">('alembic_version',)
('site_user',)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">exit()</span></code></pre>

The query we executed retrieves all rows from the `sqlite_master` table where the `type` column contains `table`. This returned two rows: `alembic_version` and `site_user`. The latter confirms that running the upgrade successfully created the table we specified in `user.py`.

The `alembic_version` table contains a single column named `version_num` and a single row containing the version number of the most recent migration that has been executed on this database. The version number can be traced to the migration script files in the migrations folder if you are interested in discovering the low-level details of how database migrations are created.

## JSON Web Token Authentication

The user authentication process that we are implementing utilizes JSON Web Tokens (JWT), which were defined in detail in [Part 1](/flask-api-tutorial-part-1/#json-web-tokens). The general workflow is given below:

<div class="steps">
  <ul>
    <li><span class="title">New User Registration</span>
      <ol>
        <li>Client sends a request with email address and password.</li>
        <li>Server verifies that email address has not already been registered. If this is true the server creates a new User object and sends a response containing a JWT in <code>access_token</code> field.</li>
        <li>Client stores <code>access_token</code>.</li>
      </ol>
    </li>
    <li><span class="title">Existing User Login</span>
      <ol>
        <li>Client sends a request with email address and password.</li>
        <li>Server retrieves the User object with the email address provided by the client.</li>
        <li>Server verifies the password is valid for the User object and sends a response containing a JWT in <code>access_token</code> field if the password is valid.</li>
        <li>Client stores <code>access_token</code>.</li>
      </ol>
    </li>
    <li><span class="title">After Successful Login/Registration</span>
      <ol>
        <li>Client sends a request with JWT in the Authorization field of the request header.</li>
        <li>If requested resource requires authorization, server decodes access token and allows client to access requested resource if token is valid.</li>
        <li>The decoded token contains an admin flag. If the requested resource requires administrator access, the server only allows the client to access the resource if admin = True.</li>
      </ol>
    </li>
  </ul>
</div>

Depending on the environment, the access token will expire after a set amount of time. When this happens, the client must login with their email and password to obtain a new token.

### <code>encode_access_token</code> Function

Let's start implementing our workflow by creating the method that will be used to generate access tokens. Since the token will be generated using attributes from a `User` instance, we will create the method as a member of the `User` class.

First, update the import statements in `user.py` to include `datetime.timedelta` and the `jwt` package:

{{< highlight python "linenos=table,hl_lines=2 5" >}}"""Class definition for User model."""
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
from flask import current_app
from sqlalchemy.ext.hybrid import hybrid_property

from app import db, bcrypt{{< /highlight >}}

Then, add the `encode_access_token` method to `user.py`:

{{< highlight python "linenos=table,linenostart=47" >}}def encode_access_token(self):
    now = datetime.now(timezone.utc)
    token_age_h = current_app.config.get("TOKEN_EXPIRE_HOURS")
    token_age_m = current_app.config.get("TOKEN_EXPIRE_MINUTES")
    expire = now + timedelta(hours=token_age_h, minutes=token_age_m)
    if current_app.config["TESTING"]:
        expire = now + timedelta(seconds=5)
    payload = dict(exp=expire, iat=now, sub=self.public_id, admin=self.admin)
    key = current_app.config.get("SECRET_KEY")
    return jwt.encode(payload, key, algorithm="HS256"){{< /highlight >}}

Let's breakdown how this method generates the access token:

<div class="code-details">
    <ul>
        <li>
            <p><strong>Lines 49-50: </strong>Using the <code>curent_app</code> proxy object, we retrieve the config settings <code>TOKEN_EXPIRE_HOURS</code> and <code>TOKEN_EXPIRE_MINUTES</code>. Remember, we defined different values for these settings for each environment (<code>development</code>, <code>testing</code>, <code>production</code>).</p>
        </li>
        <li>
            <p><strong>Line 51: </strong>We calculate the time when the token will expire based on the config settings and the current time.</p>
        </li>
        <li>
            <p><strong>Lines 52-53: </strong>All tokens generated with the <code>testing</code> config settings will expire after five seconds, allowing us to write and execute test cases where the tokens actually expire so we can verify the expected behavior.</p>
        </li>
        <li>
            <p><strong>Line 54: </strong>The payload object is where data about the token and the user is stored. The payload contains a set of key/value pairs known as "claims" (refer to <a href="/flask-api-tutorial-part-1/">Part 1</a> for more info on claims). Our token will contain the following <a href="https://tools.ietf.org/html/rfc7519#section-4.1" target="_blank">registered claims</a>:</p>
            <ul>
                <li><strong>exp: </strong>Date/time when the token will expire</li>
                <li><strong>iat: </strong>Date/time when the token was generated</li>
                <li><strong>sub: </strong>The subject of the token (i.e., the user that the token was generated for)</li>
            </ul>
            <p>Our token also contains one <a href="https://tools.ietf.org/html/rfc7519#section-4.3" target="_blank">private claim</a>:</p>
            <ul>
                <li><strong>admin: </strong>True/False value indicating whether the User has administrator access.</li>
            </ul>
            <div class="note note-flex">
                <div class="note-icon">
                    <i class="fa fa-pencil" aria-hidden="true"></i>
                </div>
                <div class="note-message">
                    <p>Since this method is in the <code>User</code> class, the values <code>self.public_id</code> and <code>self.admin</code> refer to a User object. By including these values in the token, the server does not have to perform a database query to determine if a user has administrator access when handling a request.</p>
                </div>
            </div>
        </li>
        <li>
            <p><strong>Line 55: </strong>In order to calculate the token's signature, we must retrieve the <code>SECRET_KEY</code> config setting. When creating the token, this value will be used in the algorithm that generates the cryptographic signature. We will use this same value to decode the token and ensure that the contents have not been modified.</p>
        </li>
        <li>
            <p><strong>Line 56: </strong>The <code>jwt.encode()</code> function accepts three arguments. The first two of which we have just described: the payload and the secret key. The third argument is the signing algorithm. Most applications use the <code>HS256</code> algorithm, which is short for HMAC-SHA256. The signing algorithm is what protects the payload of the JWT against tampering.</p>
        </li>
    </ul>
</div>

### Global Test Fixtures: <code>conftest.py</code>

In order to test the `encode_access_token` method, we will need a `User` object (which requires a database connection, which requires a Flask application instance, etc). In the `unittest` framework, the correct way to do this would involve creating a base test class with a setup method that creates the application instance and initializes the database. We would then create classes that inherit from the base test class, making the setup method available without duplicating the same code in each test class.

There's nothing wrong with this approach, but it's not (IMO) the best or the simplest solution. With `pytest`, we can eliminate all of the boilerplate code required for class inheritance -- we can even eliminate classes entirely. How? With [fixtures](/flask-api-tutorial-part-1/#pytest), of course!

Fixtures are functions that construct any type of object needed by a test. We can utilize them by declaring our test functions with a parameter whose name is the same as a fixture. When the name of a parameter and the name of a fixture coincide, `pytest` will execute the fixture function and pass the result to the test function.

Create a new file `conftest.py` in the `test` folder and add the content below:

{{< highlight python "linenos=table" >}}"""Global pytest fixtures."""
import pytest

from app import create_app
from app import db as database
from app.models.user import User

EMAIL = "new_user@email.com"
PASSWORD = "test1234"


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
    return user{{< /highlight >}}

`conftest.py` is a special filename that `pytest` automatically looks for and loads test fixtures from, making the fixtures available to all functions in the same folder (and sub-folders) where `conftest.py` is located. You do not need to add an import statement to any test function in order to use the `app` or `db` fixtures we have defined.

Also, the `app` fixture is a special case. The `pytest-flask` extension looks for the `app` fixture and automatically creates the `client` fixture which returns an instance of the Flask test client that we will use to test API calls. You can read more about `pytest-flask` in <a href="https://pytest-flask.readthedocs.io/en/latest/features.html" target="_blank">the official docs</a>.

Here a few more things to note about the fixtures we defined in `conftest.py`:

<div class="code-details">
    <ul>
        <li>
            <p><strong>Line 5: </strong>The <code>db</code> object imported from the <code>app</code> module (which is the Flask-SQLAlchemy extension object) is renamed to <code>database</code> since we will use the name <code>db</code> for the test fixture that injects the database object into our test functions.</p>
        </li>
        <li>
            <p><strong>Line 19: </strong>The <code>db</code> fixture is using the <code>client</code> fixture from <code>pytest-flask</code>. The <code>request</code> parameter is another special <code>pytest</code> feature that can be used as a parameter in any fixture function. The <code>request</code> object gives access to the test context where the fixture was requested.</p>
            <div class="alert alert-flex">
                <div class="alert-icon">
                    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                </div>
                <div class="alert-message">
                    <p>Do not confuse the pytest <code>request</code> object and the global Flask <code>request</code> object. The former is used by a fixture to perform any teardown/destruct process on the test object created by the fixture. The latter represents an HTTP request received by the Flask application and contains the HTML body, headers, etc. sent by the client.</p>
                </div>
            </div>
        </li>
        <li>
            <p><strong>Line 20-22: </strong>This is my preferred way to teardown/create the database used for testing. You may notice that I do not remove the database after each test run as is common practice, rather I drop all tables before beginning a new test case. This allows me to inspect the database after a failing test run since the data is still present.</p>
        </li>
        <li>
            <p><strong>Line 24-27: </strong>The <code>fin</code> function is registered with the <code>addFinalizer</code> method of the <code>pytest</code> request object. The <code>fin</code> function will execute after the test function concludes and in this case removes the database session. You will see this pattern repeated in all fixtures where some sort of teardown process is needed to free resources allocated by the fixture function.</p>
        </li>
        <li>
            <p><strong>Line 32: </strong>As demonstrated here, fixtures can incorporate other fixtures. The <code>user</code> fixture relies on the <code>db</code> fixture which relies on the <code>client</code> (i.e., <code>app</code>) fixture. It's fixtures all the way down!</p>
            <p>This fixture creates a new, regular (non-admin) <code>User</code> instance and commits the instance to the database. The <code>User</code> object is returned to the test function.</p>
        </li>
    </ul>
</div>

### Unit Test: <code>test_encode_access_token</code>

We are finally ready to write test code that verifies the `encode_access_token` method. Create a new file in the `test` folder named `test_user.py` and add the following content (ensure that `test_user.py` and `conftest.py` are in the same folder):

{{< highlight python >}}"""Unit tests for User model class."""


def test_encode_access_token(user):
    access_token = user.encode_access_token()
    assert isinstance(access_token, bytes){{< /highlight >}}

Run the `pytest` command and verify that all tests pass:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">pytest</span>
<span class="cmd-results">================================================ test session starts =================================================
platform darwin -- Python 3.7.4, pytest-5.0.1, py-1.8.0, pluggy-0.12.0 -- /Users/aaronluna/Projects/flask-api-tutorial/venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/aaronluna/Projects/flask-api-tutorial, inifile: pytest.ini
plugins: dotenv-0.4.0, clarity-0.2.0a1, flake8-1.0.4, black-0.3.7, flask-0.15.0
collected 30 items

run.py::BLACK PASSED                                                                                           [  3%]
run.py::FLAKE8 PASSED                                                                                          [  6%]
setup.py::BLACK PASSED                                                                                         [ 10%]
setup.py::FLAKE8 PASSED                                                                                        [ 13%]
app/__init__.py::BLACK PASSED                                                                                  [ 16%]
app/__init__.py::FLAKE8 PASSED                                                                                 [ 20%]
app/config.py::BLACK PASSED                                                                                    [ 23%]
app/config.py::FLAKE8 PASSED                                                                                   [ 26%]
app/api/__init__.py::BLACK PASSED                                                                              [ 30%]
app/api/__init__.py::FLAKE8 PASSED                                                                             [ 33%]
app/api/auth/__init__.py::BLACK PASSED                                                                         [ 36%]
app/api/auth/__init__.py::FLAKE8 PASSED                                                                        [ 40%]
app/api/widget/__init__.py::BLACK PASSED                                                                       [ 43%]
app/api/widget/__init__.py::FLAKE8 PASSED                                                                      [ 46%]
app/models/__init__.py::BLACK PASSED                                                                           [ 50%]
app/models/__init__.py::FLAKE8 PASSED                                                                          [ 53%]
app/models/user.py::BLACK PASSED                                                                               [ 56%]
app/models/user.py::FLAKE8 PASSED                                                                              [ 60%]
app/util/__init__.py::BLACK PASSED                                                                             [ 63%]
app/util/__init__.py::FLAKE8 PASSED                                                                            [ 66%]
test/conftest.py::BLACK PASSED                                                                                 [ 70%]
test/conftest.py::FLAKE8 PASSED                                                                                [ 73%]
test/test_config.py::BLACK PASSED                                                                              [ 76%]
test/test_config.py::FLAKE8 PASSED                                                                             [ 80%]
test/test_config.py::test_config_development PASSED                                                            [ 83%]
test/test_config.py::test_config_testing PASSED                                                                [ 86%]
test/test_config.py::test_config_production PASSED                                                             [ 90%]
test/test_user.py::BLACK PASSED                                                                                [ 93%]
test/test_user.py::FLAKE8 PASSED                                                                               [ 96%]
test/test_user.py::test_encode_access_token PASSED                                                               [100%]

============================================= 30 passed in 3.37 seconds ==============================================</span></code></pre>

### <code>decode_access_token</code> Function

Let's move on to the obvious next step in our authorization workflow: decoding tokens. We need to update the import statements in `user.py` to include the `Result` class:

{{< highlight python "linenos=table,linenostart=10" >}}from app.util.result import Result{{< /highlight >}}

Next, add the `decode_access_token` method to the `user.py` file:

{{< highlight python "linenos=table,linenostart=58" >}}@staticmethod
def decode_access_token(access_token):
    if isinstance(access_token, bytes):
        access_token = access_token.decode("ascii")
    if access_token.startswith("Bearer "):
        split = access_token.split("Bearer")
        access_token = split[1].strip()
    try:
        key = current_app.config.get("SECRET_KEY")
        payload = jwt.decode(access_token, key, algorithms=["HS256"])
        user_dict = dict(
            public_id=payload["sub"],
            admin=payload["admin"],
            token=access_token,
            expires_at=payload["exp"],
        )
        return Result.Ok(user_dict)
    except jwt.ExpiredSignatureError:
        error = "Access token expired. Please log in again."
        return Result.Fail(error)
    except jwt.InvalidTokenError:
        error = "Invalid token. Please log in again."
        return Result.Fail(error){{< /highlight >}}

There are several important things to note about this method:

<div class="code-details">
    <ul>
        <li>
            <p><strong>Line 58: </strong>The <code>@staticmethod</code> decorator indicates that this method is not bound to either a <code>User</code> instance or to the <code>User</code> class. This means that there is no practical difference between having the <code>decode_access_token</code> method defined inside the <code>User</code> class as a static method and having it defined as a regular function inside a module.</p>
            <p>The only reason to define a method as static is to group related behaviors under a shared namespace. It is simply my opinion that since the <code>encode_access_token</code> method must be bound to a <code>User</code> instance, it is both logical and more aesthetically pleasing to define the <code>decode_access_token</code> function as a member of the <code>User</code> class.</p>
        </li>
        <li>
            <p><strong>Lines 60-61: </strong>Depending on how the <code>access_token</code> was passed to the <code>decode_access_token</code> function, it could either be a byte-array or a string. Before proceeding, we convert <code>access_token</code> to a string if necessary.</p>
        </li>
        <li>
            <p><strong>Lines 62-64: </strong>We could add this validation step later, since it will be needed when we define our API routes and incorporate Flask-RESTPlus. I'm adding it now and telling you: Sometimes, the Authorization field of a request header will be prefixed with "Bearer" and sometimes it won't. We need to handle both situations when decoding access tokens.</p>
        </li>
        <li>
            <strong>Line 66: </strong>Since the token signature was calculated with the <code>SECRET_KEY</code>, we must use the same value to decode the token.
        </li>
        <li>
            <p><strong>Line 67: </strong>The <code>jwt.decode</code> function takes three arguments: the access token, the secret key, and a list of signature algorithms which the application accepts. If the access token is valid, has not been tampered with and has not expired, then the return value of the <code>jwt.decode</code> function (<code>payload</code>) is the dictionary containing the create time and expire time of the token, the user's public ID and a bool indicating if the user has administrator access.</p>
        </li>
        <li>
            <p><strong>Line 68-74: </strong>This code will only execute if the token passed all validation criteria: token format is valid, signature is valid (i.e., token has not been modified/tampered) and token is not expired. In that case, we construct a dict object containing the validated <code>access_token</code>, the timestamp when the token expires, the user's public_id and administrator flag from the <code>payload</code> object. We return the dict within a <code>Result</code> object indicating the operation was successful.</p>
        </li>
        <li>
            <p><strong>Line 75-77: </strong>This code will only execute if the token is expired. Note that we do not have to perform any of the work to verify whether the token is expired or not, that is handled by the <code>jwt.decode</code> function. If the token is expired, a <code>jwt.ExpiredSignatureError</code> is raised. Since this is an expected failure, we catch it and create a <code>Result</code> object with an error message describing the failure and return the <code>Result</code>.</p>
        </li>
        <li>
            <p><strong>Line 78-80: </strong>This code will only execute if the signature validation process fails. This would occur if the token was tampered or modified in any way, and we will create unit tests to verify this works as expected. Again, we do not have to perform any of the work to determine if the token has been tampered with, that process is handled by the <code>jwt.decode</code> function. If the signature is invalid, a <code>jwt.InvalidTokenError</code> is raised. Since this is an expected failure, we catch it and create a <code>Result</code> object with an error message describing the failure and return the <code>Result</code>.</p>
        </li>
    </ul>
</div>

### Unit Tests: Decode Access Token

We want to verify the three possible results of the `decode_access_token` method: token is valid, token is expired and token is invalid. Before we start writing any tests, place the import statements below at the top of `test_user.py`:

{{< highlight python "linenos=table" >}}"""Unit tests for User model class."""
import json
import time
from base64 import urlsafe_b64encode, urlsafe_b64decode

from app.models.user import User{{< /highlight >}}

The first test will verify the expected behavior for a valid access token. Add the `test_decode_access_token_success` method to `test_user.py`:

{{< highlight python "linenos=table,linenostart=14" >}}def test_decode_access_token_success(user):
    access_token = user.encode_access_token()
    result = User.decode_access_token(access_token)
    assert result.success
    user_dict = result.value
    assert user.public_id == user_dict["public_id"]
    assert user.admin == user_dict["admin"]{{< /highlight >}}

Please note the following verifications we are performing in this method:

<div class="code-details">
    <ul>
        <li>
            <p><strong>Line 17: </strong>The <code>decode_access_token</code> method returns a <code>Result</code> object, so we first check that <code>result.success</code> is <code>True</code>. If this is the case, we know that <code>access_token</code> is valid and was successfully decoded.</p>
        </li>
        <li>
            <p><strong>Line 18: </strong>Since <code>access_token</code> is valid, we know that <code>result.value</code> contains the <code>user_dict</code> object.</p>
        </li>
        <li>
            <p><strong>Lines 19-20: </strong>The <code>public_id</code> and <code>admin</code> values in <code>user_dict</code> should match the user that created the <code>access_token</code>.</p>
        </li>
    </ul>
</div>

Next, let's create a test that verifies what happens when we attempt to decode an expired access token. Add the `test_decode_access_token_expired` method to `test_user.py`:

{{< highlight python "linenos=table,linenostart=23" >}}def test_decode_access_token_expired(user):
    access_token = user.encode_access_token()
    time.sleep(6)
    result = User.decode_access_token(access_token)
    assert not result.success
    assert result.error == "Access token expired. Please log in again."{{< /highlight >}}

Let's go through this test and explain how we achieved the desired result:

<div class="code-details">
    <ul>
        <li>
            <p><strong>Line 25: </strong>As stated multiple times, when the <code>TestConfig</code> settings are in use, authorization tokens will expire after five seconds. Immediately after generating <code>access_token</code>, we call <code>time.sleep(6)</code> which waits for six seconds before attempting to decode the access token.</p>
        </li>
        <li>
            <p><strong>Line 27: </strong>Since we expect <code>decode_access_token</code> to return a <code>Result</code> object indicating <code>access_token</code> could not be decoded, we expect the value of <code>result.success</code> to be <code>False</code>.</p>
        </li>
        <li>
            <p><strong>Line 28: </strong>Since <code>access_token</code> was not decoded successfully, we verify that <code>result.error</code> indicates the reason for the failure is because the token is expired.</p>
        </li>
    </ul>
</div>

The last test is by far the most interesting of the three. It is trivially easy to modify part of a JWT and send it in place of the token that was generated by the server. For example, what if a user changed the <code>admin</code> claim in their token from <code>False</code> to <code>True</code>? Would they be able to access resources that require administrator access, even though they have not been granted the required access? Let's try it out!

Add the `test_decode_access_token_invalid` method to `test_user.py`:

{{< highlight python "linenos=table,linenostart=31" >}}def test_decode_access_token_invalid(user):
    access_token = user.encode_access_token()
    split = access_token.split(b".")
    payload_base64 = split[1]
    pad_len = 4 - (len(payload_base64) % 4)
    payload_base64 += pad_len * b"="
    payload_str = urlsafe_b64decode(payload_base64)
    payload = json.loads(payload_str)
    assert not payload["admin"]
    payload["admin"] = True
    payload_mod = json.dumps(payload)
    payload_mod_base64 = urlsafe_b64encode(payload_mod.encode())
    split[1] = payload_mod_base64.strip(b"=")
    access_token_mod = b".".join(split)
    assert not access_token == access_token_mod
    result = User.decode_access_token(access_token_mod)
    assert not result.success
    assert result.error == "Invalid token. Please log in again."{{< /highlight >}}

Rather than explain this test case line-by-line as done previously, I think it's easier to execute the test in the `flask shell` interpreter and print out the value of several important variables:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">flask shell</span>
<span class="cmd-results">Python 3.7.4 (default, May  7 2019, 00:14:38)
[Clang 10.0.1 (clang-1001.0.46.4)] on darwin
App: app [development]
Instance: /Users/aaronluna/Projects/flask-api-tutorial/instance</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">import json</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from base64 import urlsafe_b64encode, urlsafe_b64decode</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from app import db</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">from app.models.user import User</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">USER_EMAIL = "new_user@email.com"</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">USER_PASSWORD = "test1234"</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">user = User(email=USER_EMAIL, password=USER_PASSWORD)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">db.session.add(user)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">db.session.commit()</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">access_token = user.encode_access_token()</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">split = access_token.split(b'.')</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">print(f'access_token (original):\n  header: {split[0]}\n  payload: {split[1]}\n  signature: {split[2]}')</span>
<span class="cmd-repl-results">access_token (original):
  header: b'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9'
  <span class="highlite">payload: b'eyJleHAiOjE1NTc5NDA3MDAsImlhdCI6MTU1NzkzOTc5NSwic3ViIjoiMzhjMDMwYTAtNTdhNC00NmRjLWFjOWYtZTcwZDA0OWUzMDE2IiwiYWRtaW4iOmZhbHNlfQ'</span>
  signature: b'EvNgTtgbgxpEmJedAOwLuxf6YSq09N2GCRmQOxF2REs'</span></code></pre>

The highlighted value above is the base64-encoded payload from the original access token that was generated by the server. Next, we will decode the payload to reveal the values for the user claims.

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">payload_base64 = split[1]</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">pad_len = 4 - (len(payload_base64) % 4)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">payload_base64 += pad_len * b'='</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">payload_str = urlsafe_b64decode(payload_base64)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">payload = json.loads(payload_str)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">print(f'payload (original):\n {json.dumps(payload, indent=2)}')</span>
<span class="cmd-repl-results">payload (original):
 {
  "exp": 1557940700,
  "iat": 1557939795,
  "sub": "38c030a0-57a4-46dc-ac9f-e70d049e3016",
  <span class="highlite">"admin": false</span>
}</span></code></pre>

Please note that anybody can decode the access token's payload with the `urlsafe_b64decode` function as shown above. This is why you must never store sensitive user data (especially passwords) in a JWT.

The values stored in this token are common to most applications: the time when the token was created, the time when the token expires, a value used to identify the user, and a flag indicating the role/access level of the user.

Since anybody can edit the value of the payload before sending it back to the server, we want to ensure that the token is rejected if it has been modified. It is especially important to ensure that if the "admin" value is flipped to "True", the user is not given access to protected resources.

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">payload['admin'] = True</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">print(f'payload (modified):\n {json.dumps(payload, indent=2)}')</span>
<span class="cmd-repl-results">payload (modified):
 {
  "exp": 1557940700,
  "iat": 1557939795,
  "sub": "38c030a0-57a4-46dc-ac9f-e70d049e3016",
  <span class="highlite">"admin": true</span>
}</span></code></pre>

We have changed the "admin" value to True and printed the modified payload value to show that the value is now flipped.

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">payload_mod = json.dumps(payload)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">payload_mod_base64 = urlsafe_b64encode(payload_mod.encode())</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">split[1] = payload_mod_base64.strip(b'=')</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">print(f'access_token (modified):\n  header: {split[0]}\n  payload: {split[1]}\n  signature: {split[2]}')</span>
<span class="cmd-repl-results">access_token (modified):
  header: b'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9'
  <span class="highlite">payload: b'eyJleHAiOiAxNTU3OTQwNzAwLCAiaWF0IjogMTU1NzkzOTc5NSwgInN1YiI6ICIzOGMwMzBhMC01N2E0LTQ2ZGMtYWM5Zi1lNzBkMDQ5ZTMwMTYiLCAiYWRtaW4iOiB0cnVlfQ'</span>
  signature: b'EvNgTtgbgxpEmJedAOwLuxf6YSq09N2GCRmQOxF2REs'</span></code></pre>

We use the `urlsafe_b64encode` function to encode the modified payload and then we replace the original encoded payload with this new value. Note that the header and signature portions are the same as the original access token that was generated by the server.

<pre><code><span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">access_token_mod = b'.'.join(split)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result = User.decode_access_token(access_token_mod)</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.success</span>
<span class="cmd-repl-results">False</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">result.error</span>
<span class="cmd-repl-results">'Invalid token. Please log in again.'</span>
<span class="cmd-repl-prompt">>>></span> <span class="cmd-repl-input">exit()</span></code></pre>

As expected, the modified access token is not decoded successfully and the error message indicates that the token is invalid, which is expected if the contents of the token have been modified in any way. Therefore, our hypothetical malicious user would not be able to give himself admin access by modifying the JWT. Crisis averted!

Let's run `pytest` and make sure that all test cases pass:

<pre><code><span class="cmd-venv">(venv) flask-api-tutorial $</span> <span class="cmd-input">pytest</span>
<span class="cmd-results">================================================ test session starts =================================================
platform darwin -- Python 3.7.4, pytest-5.0.1, py-1.8.0, pluggy-0.12.0 -- /Users/aaronluna/Projects/flask-api-tutorial/venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/aaronluna/Projects/flask-api-tutorial, inifile: pytest.ini
plugins: dotenv-0.4.0, clarity-0.2.0a1, flake8-1.0.4, black-0.3.7, flask-0.15.0
collected 35 items

run.py::BLACK PASSED                                                                                           [  2%]
run.py::FLAKE8 PASSED                                                                                          [  5%]
setup.py::BLACK PASSED                                                                                         [  8%]
setup.py::FLAKE8 PASSED                                                                                        [ 11%]
app/__init__.py::BLACK PASSED                                                                                  [ 14%]
app/__init__.py::FLAKE8 PASSED                                                                                 [ 17%]
app/config.py::BLACK PASSED                                                                                    [ 20%]
app/config.py::FLAKE8 PASSED                                                                                   [ 22%]
app/api/__init__.py::BLACK PASSED                                                                              [ 25%]
app/api/__init__.py::FLAKE8 PASSED                                                                             [ 28%]
app/api/auth/__init__.py::BLACK PASSED                                                                         [ 31%]
app/api/auth/__init__.py::FLAKE8 PASSED                                                                        [ 34%]
app/api/widget/__init__.py::BLACK PASSED                                                                       [ 37%]
app/api/widget/__init__.py::FLAKE8 PASSED                                                                      [ 40%]
app/models/__init__.py::BLACK PASSED                                                                           [ 42%]
app/models/__init__.py::FLAKE8 PASSED                                                                          [ 45%]
app/models/user.py::BLACK PASSED                                                                               [ 48%]
app/models/user.py::FLAKE8 PASSED                                                                              [ 51%]
app/util/__init__.py::BLACK PASSED                                                                             [ 54%]
app/util/__init__.py::FLAKE8 PASSED                                                                            [ 57%]
app/util/result.py::BLACK PASSED                                                                               [ 60%]
app/util/result.py::FLAKE8 PASSED                                                                              [ 62%]
test/conftest.py::BLACK PASSED                                                                                 [ 65%]
test/conftest.py::FLAKE8 PASSED                                                                                [ 68%]
test/test_config.py::BLACK PASSED                                                                              [ 71%]
test/test_config.py::FLAKE8 PASSED                                                                             [ 74%]
test/test_config.py::test_config_development PASSED                                                            [ 77%]
test/test_config.py::test_config_testing PASSED                                                                [ 80%]
test/test_config.py::test_config_production PASSED                                                             [ 82%]
test/test_user.py::BLACK PASSED                                                                                [ 85%]
test/test_user.py::FLAKE8 PASSED                                                                               [ 88%]
test/test_user.py::test_encode_access_token PASSED                                                               [ 91%]
test/test_user.py::test_decode_access_token_success PASSED                                                       [ 94%]
test/test_user.py::test_decode_access_token_expired PASSED                                                       [ 97%]
test/test_user.py::test_decode_access_token_invalid PASSED                                                       [100%]

============================================= 35 passed in 9.62 seconds ==============================================</span></code></pre>

## Checkpoint

I promise that the pace will pick up, since we have again made very little progress on the API requirements. I believe it's fair to say that one item is completely implemented: <span class="italics requirements">JWT contains the following claims: time the token was issued, time the token expires, a value that identifies the user, and a flag that indicates if the user has administrator access</span>. I think we can also claim partial credit on two items: <span class="italics requirements">Requests must be rejected if JWT has been modified</span> and <span class="italics requirements">Requests must be rejected if JWT is expired</span>.

<div class="requirements">
  <p class="title">User Management/JWT Authentication</p>
  <div class="fa-bullet-list">
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>New users can register by providing an email address and password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Existing users can obtain a JWT by providing their email address and password</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star fa-bullet-icon"></span>JWT contains the following claims: time the token was issued, time the token expires, a value that identifies the user, and a flag that indicates if the user has administrator access</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>JWT is sent in access_token field of HTTP response after successful authentication with email/password</p>
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
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>The widget model contains fields with URL and datetime data types, along with normal text fields.</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>URL and datetime values must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>The widget model contains a "name" field which must be a string value containing only letters, numbers and the "-" (hyphen character) or "_" (underscore character).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>Widget name must be validated before a new widget is added to the database (and when an existing widget is updated).</p>
    <p class="fa-bullet-list-item"><span class="fa fa-star-o fa-bullet-icon"></span>If input validation fails either when adding a new widget or editing an existing widget, the API response must include error messages indicating the name(s) of the fields that failed validation.</p>
  </div>
</div>

As always, leave your feedback and questions in the comments!
