---
title: "Vigorish: Hybrid Python/Node.Js Web Scraper"
slug: vigorish
date: '2020-06-28'
series: ["projects"]
series_weight: 1
series_title: "Personal Projects"
menu_section: "projects"
categories: ["Python", "NodeJS", "Personal-Project"]
summary: "`vigorish` is a hybrid Python/Node.js application that scrapes MLB data from mlb.com, brooksbaseball.net and baseball-reference.com."
toc: true
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Patti Black on Unsplash"
  - name: main_menu_post_install
    src: images/main_menu_post_install.jpg
    title: Main Menu (Prerequisites Installed)
  - name: change_config_setting
    src: images/change_config_setting.jpg
    title: Config File Settings - Change Setting
  - name: env_var_menu
    src: images/env_var_menu.jpg
    title: Environment Variables Menu
  - name: npm_update_complete
    src: images/npm_update_complete.jpg
    title: Update NPM Packages - Complete
  - name: npm_update_prompt
    src: images/npm_update_prompt.jpg
    title: Update NPM Packages - Update
  - name: change_env_var_setting
    src: images/change_env_var_setting.jpg
    title: Environment Variable - Change Setting
  - name: main_menu_after_db_setup
    src: images/main_menu_after_db_setup.jpg
    title: Main Menu (After DB Has Been Setup)
  - name: change_setting_all_data_sets
    src: images/change_setting_all_data_sets.jpg
    title: Change Config Setting (All Data Sets)
  - name: main_menu_config_settings
    src: images/main_menu_config_settings.jpg
    title: Main Menu (Config File Settings Selected)
  - name: same_setting_all_data_sets
    src: images/same_setting_all_data_sets.jpg
    title: Use Same Setting For all Data Sets Prompt
  - name: change_setting_bbref_games_for_date
    src: images/change_setting_bbref_games_for_date.jpg
    title: Change Config Setting (Single Data Set)
  - name: main_menu_env_vars
    src: images/main_menu_env_vars.jpg
    title: Main Menu (Env. Variables Selected)
  - name: setup_db_complete
    src: images/setup_db_complete.jpg
    title: Initialize Database - Complete
  - name: main_menu_npm_packages
    src: images/main_menu_npm_packages.jpg
    title: Main Menu (NPM Packages Selected)
  - name: setup_db_prompt
    src: images/setup_db_prompt.jpg
    title: Initialize Database - Prompt
  - name: main_menu_setup_db
    src: images/main_menu_setup_db.jpg
    title: Main Menu (DB has not been setup)
  - name: updated_config_setting
    src: images/updated_config_setting.jpg
    title: Updated Config Setting
  - name: npm_install_complete
    src: images/npm_install_complete.jpg
    title: Install NPM Packages - Complete
  - name: current_env_var_setting
    src: images/current_env_var_setting.jpg
    title: Environment Variable - Current Setting
  - name: npm_install_prompt
    src: images/npm_install_prompt.jpg
    title: Install NPM Packages - Prompt
  - name: import_scraped_data
    src: images/import_scraped_data.jpg
    title: Import Scraped Data - Prompt
  - name: import_scraped_data_in_progress
    src: images/import_scraped_data_in_progress.jpg
    title: Import Scraped Data - In Progress
  - name: main_menu_setup_complete
    src: images/main_menu_setup_complete.jpg
    title: Main Menu (Setup Complete)
  - name: create_job_select_data_sets_1
    src: images/create_job_select_data_sets_1.jpg
    title: Create Job Step 1a - Select Data Sets
  - name: create_job_details_1
    src: images/create_job_details_1.jpg
    title: Create Job Step 2a - Edit Job Details
  - name: create_job_error_1
    src: images/create_job_error_1.jpg
    title: Start/End Date Error - Date Is Not Within Regular Season
  - name: create_job_error_2
    src: images/create_job_error_2.jpg
    title: Start/End Date Error - End Date Occurs Before Start Date
  - name: create_job_confirm_1
    src: images/create_job_confirm_1.jpg
    title: Create Job Step 3a - Confirm Job Details
  - name: create_job_select_data_sets_2
    src: images/create_job_select_data_sets_2.jpg
    title: Create Job Step 1b - Select Data Sets
  - name: create_job_details_2
    src: images/create_job_details_2.jpg
    title: Create Job Step 2b - Edit Job Details
  - name: create_job_confirm_2
    src: images/create_job_confirm_2.jpg
    title: Create Job Step 3b - Confirm Job Details
  - name: create_job_execute
    src: images/create_job_execute.jpg
    title: Create Job Step 4 - Prompt User - Execute Job Now?
  - name: execute_job_1
    src: images/execute_job_1.jpg
    title: Batch Job Execution - Batch 1 Nearly Complete
  - name: execute_job_2
    src: images/execute_job_2.jpg
    title: Batch Job Execution - Timeout Started
  - name: execute_job_3
    src: images/execute_job_3.jpg
    title: Batch Job Execution - Timeout Nearly Complete
  - name: execute_job_4
    src: images/execute_job_4.jpg
    title: Batch Job Execution - Batch 2 Started
  - name: execute_job_5
    src: images/execute_job_5.jpg
    title: Batch Job Execution - Batch 2 Nearly Complete
  - name: execute_job_6
    src: images/execute_job_6.jpg
    title: Saving HTML
  - name: execute_job_7
    src: images/execute_job_7.jpg
    title: Parsing HTML
  - name: stop_job_execution
    src: images/stop_job_execution.jpg
    title: Stop Job Execution
  - name: main_menu_view_jobs
    src: images/main_menu_view_jobs.jpg
    title: Main Menu (View All Jobs Selected)
  - name: view_jobs_incomplete
    src: images/view_jobs_incomplete.jpg
    title: View All Jobs (Incomplete Jobs Selected)
  - name: view_job_incomplete_options
    src: images/view_job_incomplete_options.jpg
    title: Incomplete Job Options
  - name: view_jobs_complete
    src: images/view_jobs_complete.jpg
    title: View All Jobs (Complete Jobs Selected)
  - name: view_jobs_incomplete_list
    src: images/view_jobs_incomplete_list.jpg
    title: Select A Job (All Incomplete)
  - name: view_jobs_complete_list
    src: images/view_jobs_complete_list.jpg
    title: Select A Job (All Completed)
  - name: view_jobs_complete_status
    src: images/view_jobs_complete_status.jpg
    title: Complete Job Options
  - name: main_menu_status_reports
    src: images/main_menu_status_reports.jpg
    title: Main Menu (Status Reports Selected)
  - name: status_report_select_type
    src: images/status_report_select_type.jpg
    title: Select Report Type
  - name: status_report_season_select_year
    src: images/status_report_season_select_year.jpg
    title: Select MLB Season to Report
  - name: status_report_select_detail
    src: images/status_report_select_detail.jpg
    title: Select Level of Detail
  - name: status_report_season_summary
    src: images/status_report_season_summary.jpg
    title: Season Status Report for 2019
  - name: status_report_single_date
    src: images/status_report_single_date.jpg
    title: Status Report for Single Date
  - name: status_report_date_range
    src: images/status_report_date_range.jpg
    title: Status Report for Date Range
---

## vigorish

`vigorish` is a hybrid Python/Node.js application that scrapes MLB data from mlb.com, brooksbaseball.net and baseball-reference.com.

My goal is to capture as much data as possible &mdash; ranging from PitchFX measurements at the most granular level to play-by-play data (play descriptions, substitutions, manager challenges, etc) and individual player pitch/bat stats at the highest level.

Use of vigorish must abide by the terms stated in the license. Also, in order to abide by the guidelines quoted below (from [baseball-reference.com](https://www.sports-reference.com/data_use.html)), **a delay of at least two seconds MUST always occur after a URL is scraped:**

> Please do not attempt to aggressively spider data from our web sites, as spidering violates the terms and conditions that govern your use of our web sites: [Site Terms of Use](https://www.sports-reference.com/termsofuse.html) ... If we notice excessive activity from a particular IP address we will be forced to take appropriate measures, which will include, but not be limited to, blocking that IP address. We thank you in advance for respecting our terms of use.

## Requirements

-   Python 3.6+
-   Node.js 10+ (Tested with Node.js 11-13)
-   Xvfb
-   AWS account (optional but recommended, used to store scraped data in S3)

Since `vigorish` uses the `dataclass` decorator, Python 3.6+ is required (`dataclass` was introduced in Python 3.7, however a [backport](https://pypi.org/p/dataclasses/) exists for 3.6).

All web scraping is performed by [Nightmare](https://github.com/segmentio/nightmare), which is a browser automation tool similar to Selenium/PhantomJS. Nightmare is a nodejs module based on [Electron](http://electron.atom.io/)/[Chromium](https://www.chromium.org/Home), requiring Node.js 4+. However, my scraping functions use async iterators (a ES2018 feature), which is only supported in Node.js 10+, so that is the minimum supported version. (I have only tested with versions 11-14).

`vigorish` runs Nightmare in "headless" mode, i.e., without any graphical UI. Regardless, Electron/Chromium will not function if a display driver cannot be located. Therefore, on Linux systems, you must install a virtual display driver (Windows and Mac systems obviously have a display driver installed). By far, the most popular virtual display driver for Linux systems is <a href="https://en.wikipedia.org/wiki/Xvfb">Xvfb</a>. This document explains all steps necessary to install Xvfb and all required dependencies.

## Install Prerequisites

First, install a recent, stable version of Node.js (i.e., v10-13), along with npm. I'll provide instructions for Ubuntu, but they should be easily adaptable to any Linux-distro.

### Node.js

While you can install Node.js using the default package repository on your system, the versions that are available tend to be outdated. On Ubuntu, you can add a PPA (personal package archive) maintained by NodeSource which always contains the latest versions of Node.js.

The command below will download the installation script for the NodeSource PPA containing the latest v12.x version and run the script after it has been downloaded (if you would like to download a different version, simply replace `12.x` with `8.x`, `10.x`, etc.). You must have sudo privileges to execute the installation script:

```bash
$ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
```

The script will add the NodesSource PPA and update your local package cache. After the package listing is refreshed, install the `nodejs` package using the command below:

```bash
$ sudo apt install nodejs
```

The version of node you specified and npm should both be installed. Verify that the versions installed are correct:

```bash
$ node --version
v12.16.2
```

```bash
$ npm --version
6.14.2
```

Finally, install the `build-essential` package since some of the packages needed for `vigorish` require compiling from source:

```bash
$ sudo apt install build-essential
```

### Xvfb

An X server must be installed in order to use Electron in headless mode. [The most popular X server for UNIX-like systems is Xvfb](https://www.x.org/releases/X11R7.6/doc/man/man1/Xvfb.1.xhtml). `Xvfb` enables a system without display hardware to run graphical applications.

Install `Xvfb` and its dependencies using the command below:

```bash
sudo apt install -y xvfb x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps clang libdbus-1-dev libgtk2.0-dev libnotify-dev libgnome-keyring-dev libgconf2-dev libasound2-dev libcap-dev libcups2-dev libxtst-dev libxss1 libnss3-dev gcc-multilib g++-multilib
```

### pipx

The recommended way to install `vigorish` is [with pipx](https://github.com/pipxproject/pipx). On Ubuntu with Python 3.7 aliased to `python3.7`, you can install `pipx` with the commands below:

```bash
$ python3.7 -m pip install --user pipx
$ python3.7 -m pipx ensurepath
```

After executing the two commands above, logout and log back in. To setup tab completions, run this command and follow the instructions for your shell:

```bash
$ pipx completions
```

Logout and login again in order for the changes to take effect.

Why should you use `pipx` to install `vigorish`? If you are brand new to Python, you may not be aware of all the little annoyances that come along with installing packages from pip. If you use your system Python installation, very quickly you will encounter unresolvable dependency issues. Eventually, you will fall into the habit of creating a new virtual environment whenever you install an application to isolate all of the required packages and their specific versions from your system install.

While creating unique virtual environments works, it can be annoying and confusing to manage applications that are intended to be installed globally in this manner. `pipx` is the solution to this problem. [From the README](https://github.com/pipxproject/pipx/blob/master/README.md):

> You can globally install an application by running
>
> `pipx install PACKAGE`
>
> This automatically creates a virtual environment, installs the package, and adds the package's associated applications (entry points) to a location on your `PATH`. For example, `pipx install pycowsay` makes the `pycowsay` command available globally, but sandboxes the pycowsay package in its own virtual environment.

It is similarly easy to update and remove Python applications with `pipx`. Check out the `README` for install instructions for Mac and usage examples.

## Install

If you followed the instructions to install `pipx`, you can install `vigorish` with the command below:

```bash
$ pipx install vigorish
```

If you did not install `pipx`, follow the steps below to install `vigorish`:

1. Create a new directory for `vigorish` and navigate to it:

    ```bash
    $ mkdir vigorish && cd vigorish
    ```

2. Create a new Python 3.6+ virtual environment:

    ```bash
    $ python3.7 -m venv venv --prompt vig
    ```

3. Activate the virtual environment:

    ```bash
    $ source venv/bin/activate
    ```

4. Update `pip`, `setuptools` and `wheel` packages to the latest versions:

    ```bash
    (vig) $ pip install --upgrade pip setuptools wheel
    ```

5. Finally, install `vigorish` using `pip`:

    ```bash
    (vig) $ pip install vigorish
    ```

### Verify Install

If you installed `vigorish` within a virtual environment, activate the environment and run the `vig` command. If you installed `vigorish` with `pipx`, simply run `vig`. If the install succeeded, the help documentation for the CLI should be displayed:

```bash
(vig) $ vig
Usage: vig [OPTIONS] COMMAND [ARGS]...

  Entry point for the CLI application.

Options:
  --help  Show this message and exit.

Commands:
  scrape  Scrape MLB data from websites.
  setup   Populate database with initial player, team and season data.
  status  Report progress of scraped data, by date or MLB season.
  ui      Menu-driven TUI powered by Bullet.
```

Next, run `vig ui` and verify that the UI displays:

{{< linked_image main_menu_post_install >}}

If both the CLI help screen and the UI are displayed, the installation was successful! However, you can not begin scraping data just yet. You need to perform a few additional configuration steps first.

## Config/Setup

There are quite a few settings that determine how `vigorish` scrapes data, where scraped HTML/JSON is stored, etc. The majority of these settings are stored in a JSON file, and the rest are stored in a file named `.env`

When you launch the UI or run any CLI command, `vigorish` looks for a folder named `~/.vig` and creates the directory if it does not exist. Next, it looks for `.env` in the `~/.vig` folder. If this file does not exist, a default `.env` is created with the following values:

```ini
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
CONFIG_FILE={YOUR_HOME_FOLDER}/.vig/vig.config.json
DATABASE_URL=sqlite:///{YOUR_HOME_FOLDER}/.vig/vig.db
```

{{< alert_box >}}
`{YOUR_HOME_FOLDER}` is not a real value that you should use or will see in your_ `.env` _file. It is a placeholder for the path of the current user's home folder.
{{< /alert_box >}}

These values are **Environment Variables**. They are loaded into the environment using the `python-dotenv` package, and their values can be accessed from code with the `os.getenv` function.

Next, `vigorish` uses the value of `CONFIG_FILE` to read the contents of `vig.config.json`. Just like `.env`, if this file does not exist a default config file is created. Let's go back and discuss how to manage the values in `.env` before we discuss the settings available in `vig.config.json`.

### Environment Variables

Run `vig ui` and use the arrow keys to select **Settings/Admin** from the main menu and press <kbd>Enter</kbd>. Then, select **Environment Variables** from the menu options:

{{< linked_image main_menu_env_vars >}}

Press <kbd>Enter</kbd> and you should see the menu below:

{{< linked_image env_var_menu >}}

The first three settings in this list must be set if you wish to store scraped HTML/JSON documents in an S3 bucket. If you do not want to use this feature, you have the option to store scraped HTML in a local folder or to not store HTML files at all. JSON files must be stored in a local folder if you do not wish to store them in a S3 bucket.

The remaining environment variables are rather self-explanatory. If you wish to change the location/filename of `vig.config.json`, select **CONFIG_FILE**. If you wish to change the location/filename of the SQLite database, select **DATABASE_URL** .

Selecting any item in this list will show the current value of the environment variable. For example, if you select **CONFIG_FILE** you will see the menu below:

{{< linked_image current_env_var_setting >}}

You can return to the list of environment variables by selecting **NO**. If you select **YES**, you will be prompted to enter a new value.

Next, you will be asked to confirm the new value is correct before it is applied. If it is not correct, selecting **NO** will prompt you to re-enter the new value. Selecting **CANCEL** will keep the current value and return to the previous menu:

{{< linked_image change_env_var_setting >}}

{{< alert_box >}}
If you change the value of either **CONFIG_FILE** or **DATABASE_URL**, `vigorish` will automatically exit to ensure that the new settings/SQLite file are used, rather than the previous, discarded settings/database.
{{< /alert_box >}}

Please enter your AWS credentials if you plan on using the S3 storage feature. If you would like to change the location/name of the `vig.config.json` file and/or SQLite database file, please do so now. When complete, return to the Main Menu.

### Config File Settings

Next, select **Config File Settings** from the **Admin/Settings** Menu:

{{< linked_image main_menu_config_settings >}}

Press <kbd>Enter</kbd> and you should see the menu below:

{{< autoplay_video video="config_menu" >}}

The **Config File Settings** menu allows the user to view or modify the current value of any setting defined in `vig.config.json`. Please note the small up/down arrows that appear at various times in the video above. Whenever a menu contains more than eight items, it will be rendered as a scrolling menu. The arrows indicate that there are additional menu items that can be accessed by navigating through the list.

To make navigating the UI easier, options to return to the previous menu are added to the beginning **AND** end of the scroll menu (as opposed to normal menus which only have the return option at the end of the list).

We will cover the purpose/effect of each config setting shortly. Selecting a config setting (press <kbd>Enter</kbd>) displays the setting name, data type, description and current setting as shown below:

{{< linked_image change_config_setting >}}

Within this menu, you are asked if you would like to change the current setting. In the screenshot above, the `Json Storage` setting has a current value of `ALL_DATA_SETS..: BOTH`. Most settings can be configured per data set **OR** or the same value can be used for all data sets.

If you choose to change the current setting, you are asked if you would like to use the same setting for all data sets:

{{< linked_image same_setting_all_data_sets >}}

Selecting **YES** will prompt you to select a new value:

{{< linked_image change_setting_all_data_sets >}}

In this case, the data type of the setting is an `Enum`. For this data type, you can select a new value from a list of all possible values (all other data types (`str`, `numeric`, `Path`) will be typed in directly).

Going back one step, if you selected **NO** when asked if you would like to use the same setting for all data sets, you will be asked to enter a new value for the setting five times, once for each data set that can be scraped using vigorish.

The prompt for a single data type is shown below:

{{< linked_image change_setting_bbref_games_for_date >}}

After entering values for all data types, you can verify that the new value was applied by selecting the setting you modified from the **Config File Settings** menu. If you chose to set separate values for each data set, you will see something similar to the screenshot below:

{{< linked_image updated_config_setting >}}

With a fresh install, the following default settings are used:

#### Same setting for all data sets

-   **`STATUS_REPORT`**: `SEASON_SUMMARY`
-   **`S3_BUCKET`**: `your-bucket`
    -   This is a placeholder value, you must set this to the name of a S3 bucket that your AWS account has permission to create/read/delete objects.
-   **`SCRAPE_CONDITION`**: `ONLY_MISSING_DATA`
-   **`URL_SCRAPE_DELAY`**: `Delay is random (3-6 seconds)`
-   **`BATCH_JOB_SETTINGS`**: `Batch size is random (50-80 URLs)`
-   **`HTML_STORAGE`**: `NONE`
    -   By default, scraped HTML is **NOT STORED** since this will consume storage space very quickly. However, I frequently make changes to the parser functions and it is extremely useful and 100x quicker to store the HTML and run the updated parsers against local copies of scraped HTML. The owners of the scraped sites surely appreciate it as well.
-   **`HTML_LOCAL_FOLDER_PATH`**: `html_storage/{year}/{data_set}/`
    -   All settings that are `data_type` = `Path` recognize the two placeholder strings `{year}` and `{data_set}`. The path that is generated substitutes values in place of the placeholders using the date that the game occurred on and the data set being scraped.
-   **`HTML_S3_FOLDER_PATH`**: `{year}/{data_set}/html/`
-   **`JSON_STORAGE`**: `LOCAL_FOLDER`
    -   Be default, JSON files containing parsed data are only stored in the local file system. If you would like to store JSON files in S3 or both S3 and the local file system, you must enter your AWS credentials in the **Environment Variables** menu and then update this setting.
-   **`JSON_LOCAL_FOLDER_PATH`:** `json_storage/{year}/{data_set}/`
-   **`JSON_S3_FOLDER_PATH`**: `{year}/{data_set}`
-   **`SCRAPED_DATA_COMBINE_CONDITION`**: `ONLY_MISSING_DATA`
-   **`COMBINED_DATA_STORAGE`**: `LOCAL_FOLDER`
-   **`COMBINED_DATA_LOCAL_FOLDER_PATH`:** `json_storage/{year}/combined_data`
-   **`JSON_S3_FOLDER_PATH`**: `{year}/combined_data`
    <br>

#### Different setting for each data set

-   **`BATCH_SCRAPE_DELAY`**
    -   `BBREF_GAMES_FOR_DATE`: `Delay is random (5-10 minutes)`
    -   `BROOKS_GAMES_FOR_DATE`: `Delay is random (30-45 minutes)`
    -   `BBREF_BOXSCORES`: `Delay is random (5-10 minutes)`
    -   `BROOKS_PITCH_LOGS`: `Delay is random (30-45 minutes)`
    -   `BROOKS_PITCHFX`: `Delay is random (30-45 minutes)`

I arrived at these settings through trial and error. I know that it takes much longer to scrape data from brooksbaseball.net with a 30-45 minute delay every 50-80 URLs, but I have never been banned with this configuration. Without the batch delay, I was always blocked within an hour or two.

Please make any changes you wish at this point. When you have everything setup to your liking, return to the Main Menu.

{{< alert_box >}}
You may notice that the URL delay time is a configurable setting. This setting must be enabled and the delay time must be greater than two seconds. _**If the setting is disabled or if you attempt to use a delay of two seconds or shorter, you will be unable to start any scrape job.**_
{{< /alert_box >}}

### Install Nightmare/Electron (NPM Packages)

Next, select **Node Packages** from the **Admin/Settings** Menu:

{{< linked_image main_menu_npm_packages >}}

Press <kbd>Enter</kbd> and you will be prompted to install all node dependencies:

{{< linked_image npm_install_prompt >}}

Select **YES** to begin the installation. You will see the output from npm, and when complete simply press any key to continue:

{{< linked_image npm_install_complete >}}

After successful installation, the **NPM Packages** menu will instead ask if you would like to update the installed npm packages:

{{< linked_image npm_update_prompt >}}

Select **YES** to check for updates. If any are available, they will be updated automatically and the output from npm will be displayed as shown below:

{{< linked_image npm_update_complete >}}

### Initialize SQLite Database

Finally, select **Setup Database** from the Main Menu:

{{< linked_image main_menu_setup_db >}}

Press <kbd>Enter</kbd> and you will be prompted to initialize the SQLite database:

{{< linked_image setup_db_prompt >}}

Select **YES** to begin the initialization process. After all tables have been populated with initial data, press any key.

{{< linked_image setup_db_complete >}}

If you are re-installing `vigorish` or moving an existing installation to a different system, you may have scraped data that you would like to import. You will be prompted to do this after the database has been installed:

{{< linked_image import_scraped_data >}}

If you select **YES**, any data within the path specified by the **JSON_LOCAL_FOLDER_PATH** config setting will be imported. The import process will look for yearly data as shown below:

{{< linked_image import_scraped_data_in_progress >}}

After all of the data within your local cache folder has been added to the database, you will automatically be returned to the Main Menu.

## Usage

Congratulations! If you made it this far, you have successfully installed and configured `vigorish`! After installing Nightmare/Electron and initializing the database, the Main Menu will display three new options (**Create New Job**, **View All Jobs** and **Status Reports**):

{{< linked_image main_menu_setup_complete >}}

### Create New Job

After selecting **Create New Job** from the Main Menu, you are prompted to select the data sets you wish to scrape. Currently, `vigorish` allows you to collect five data sets from two different web sites:

{{< linked_image create_job_select_data_sets_1 >}}

Since this prompt allows you to select multiple items, it behaves differently than other prompts. To select a data set, highlight it and press <kbd>Space</kbd>. A checkmark will appear next to the data set indicating that it has been selected (you can deselect a selected item by pressing <kbd>Space</kbd> as well). When you are satisfied with your selections, press <kbd>Enter</kbd> to move on to the next step.

Next, you will be prompted to enter the start and end dates you wish to scrape and a name for this job:

{{< linked_image create_job_details_1 >}}

If the values you provided for the start/end dates are valid, you will be prompted to enter a name for this job. As mentioned in the prompt, this value is optional. You can bypass this prompt simply by pressing <kbd>Enter</kbd>.

Even if you have entered two valid dates for the start/end dates, you may receive an error message and be prompted to re-enter both dates. For example, both dates must have the same year and must be within the MLB regular season for that year. If you enter a date before or after the regular season, the error message will tell you the valid date range:

{{< linked_image create_job_error_1 >}}

Another error occurs when you enter a end date that is before the start date. Obviously, the end date needs to be a date after (or the same date as) the start date. If that occurs, you will see an error similar to this:

{{< linked_image create_job_error_2 >}}

The next screen will display a summary of the job details, and asks you to confirm that they are correct:

{{< linked_image create_job_confirm_1 >}}

If you need to change anything, select **NO** as shown in the screen above and press <kbd>Enter</kbd>. You will be returned to the menu to select the data sets to scrape. Helpfully, the data sets that you selected are already checked. If you do not need to change the selected data sets, simply press <kbd>Enter</kbd> to move on to the next menu.

In the example below, all data sets are now selected:

{{< linked_image create_job_select_data_sets_2 >}}

In the next menu, the start/end dates and job_name are also helpfully pre-populated for you. The value for **Start Date** is unchanged (5/2/2019), and the value for **End Date** has been changed to 6/9/2019. Also, the **Job Name** which previously was not provided has been changed to "new_job":

{{< linked_image create_job_details_2 >}}

After updating these values, you are again asked to confirm the job details. Note that the values for **Job Name**, **End Date** and **Data Sets** have changed:

{{< linked_image create_job_confirm_2 >}}

After confirming the job details are correct, you are asked if you would like to begin executing this job:

{{< linked_image create_job_execute >}}

If you select **NO**, you will be returned to the Main Menu. If you select **YES**, the job will begin executing.

### Job Execution

Although you can scrape each data set individually, it is recommended that you scrape all of them together. Why? For any date, the following conditions must be met in order to scrape each data set:

<div id="table-1" class="table-wrapper">
  <div class="responsive">
    <table class="tutorial">
      <thead>
        <tr>
          <td colspan="2" class="table-number">Table 1</td>
        </tr>
        <tr>
          <td colspan="2" class="table-title">Requirement to Scrape Each Data Set</td>
        </tr>
        <tr>
          <th class="first-column column-header">Data Set</th>
          <th class="last-column column-header">Must Be Scraped for Same Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="first-column left">Games for Date (bbref.com)</td>
          <td class="last-column"></td>
        </tr>
        <tr>
          <td class="first-column left">Games for Date (brooksbaseball.net)</td>
          <td class="last-column">Games for Date (bbref.com)</td>
        </tr>
        <tr>
          <td class="first-column left">Boxscores (bbref.com)</td>
          <td class="last-column">Games for Date (bbref.com)</td>
        </tr>
        <tr>
          <td class="first-column left">Pitch Logs for Game (brooksbaseball.net)</td>
          <td class="last-column">Games for Date (brooksbaseball.net)</td>
        </tr>
        <tr>
          <td class="first-column left">PitchFX Logs (brooksbaseball.net)</td>
          <td class="last-column">Pitch Logs for Game (brooksbaseball.net)</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

These requirements dictate that data sets must be scraped in (nearly) the exact order that they are listed in **Table 1**. The only flexibility is that **Games for Date (brooksbaseball.net)** and **Boxscores (bbref.com)** can either be scraped second or third. As for the remaining data sets, **Games for Date (bbref.com)** must always be scraped first, **Pitch Logs for Game (brooksbaseball.net)** must always be scraped fourth and **PitchFX Logs (brooksbaseball.net)** must always be scraped last.

Job execution is performed in the following manner:

<ul class="requirements teal">
  <li style="font-weight: 700">For each selected data set
    <ul class="requirements teal">
      <li style="font-weight: 700">For each date in the range Start Date - End Date
        <ol class="requirements teal" style="font-weight: 400">
          <li>Build list of all URLs for this data set on this date</li>
          <li>Identify URLs which can be skipped if already scraped</li>
          <li>Retrieve cached HTML from local folder and/or S3 bucket</li>
          <li>Scrape HTML for URLs that are not cached</li>
          <li>Save scraped HTML to local folder and/or S3 bucket</li>
          <li>Parse domain objects from HTML and write to JSON file</li>
          <li>Save parsed JSON to local folder and/or S3 bucket</li>
        </ol>
      </li>
    </ul>
  </li>
</ul>

You can see an example of a job where all data sets are selected in the images below. After successfully scraping the first three data sets, the fourth data set (Pitch Logs for Game) is in progress. Batch scraping is enabled, and the screenshot below is taken when the first of two URL batches is almost complete:

{{< linked_image execute_job_1 >}}

After the first batch is complete, a timeout occurs. As shown below, the time remaining is displayed and the top progress bar goes from full to empty along with the time remaining:

{{< linked_image execute_job_2 >}}

Here, the timeout is almost over. The top progress bar is nearly empty:

{{< linked_image execute_job_3 >}}

When the timeout ends, the second batch is scraped. Notice that the number of URLs in the current batch is shown, as well as the overall total number of URLs scraped, and the number of URLs scraped in this batch:

{{< linked_image execute_job_4 >}}

Here the second (and final) batch is nearly complete:

{{< linked_image execute_job_5 >}}

When all URLs for this data set have been scraped, the next step is to save the scraped HTML to local folder and/or S3 based on your configuration settings:

{{< linked_image execute_job_6 >}}

Finally, the scraped HTML is parsed and the data parsed from the HTML is written to a JSON file. The JSON is saved to local folder and/or S3 based on your configuration settings:

{{< linked_image execute_job_7 >}}

Jobs can be cancelled by pressing <kbd>Ctrl+C</kbd>. This will cause the message shown below to display:

{{< linked_image stop_job_execution >}}

This can be very useful for long-running jobs since you will not lose any of the progress made, and you can easily resume executing the job at a later time.

### View All Jobs

Since most jobs will take a considerable amount of time to finish, `vigorish` makes it easy to pause and resume execution. To view the status of all jobs (incomplete and complete), select **View All Jobs** from the Main Menu:

{{< linked_image main_menu_view_jobs >}}

The next screen divides all jobs into two categories: Incomplete and Complete. First, let's take a look at the list of Incomplete jobs:

{{< linked_image view_jobs_incomplete >}}

The name used to identify each job is the optional **Job Name** value. If you did not provide a name, the **ID** will be used to identify the job (**ID** is a randomly generated 4-digit hex string):

{{< linked_image view_jobs_incomplete_list >}}

If you select a job from the list, you will see a summary of the job details and be prompted to either execute the job, cancel the job or do nothing and return to the previous menu. This prompt only appears for incomplete jobs.

{{< linked_image view_job_incomplete_options >}}

If we return to the initial **View All Jobs** menu, we can see the difference by selecting the completed jobs:

{{< linked_image view_jobs_complete >}}

The completed jobs are displayed in a list exactly as the incomplete jobs were:

{{< linked_image view_jobs_complete_list >}}

However, if we select a completed job, there is no prompt shown:

{{< linked_image view_jobs_complete_status >}}

As you can see, if an error occurs while a job is running, it is logged and can be viewed in this menu.

### Status Reports

My goal with `vigorish` was to collect all pitching data for a single season, so having the ability to track my progress towards that goal and identify any missing pieces of data is important. You can view the status of your scrape effort in many different ways using the **Status Reports** item in the Main Menu:

{{< linked_image main_menu_status_reports >}}

You can select from three types of reports. The first option, **Season**, is selected in the screenshot below:

{{< linked_image status_report_select_type >}}

In order to report on an entire MLB Season, you must specify which season to report on:

{{< linked_image status_report_season_select_year >}}

Finally, select the level of detail for the report:

{{< linked_image status_report_select_detail >}}

The **Season Summary** report is useful for understanding the overall progress you have made with all data sets:

{{< linked_image status_report_season_summary >}}

The screenshot below is an example of a **Single Date** report:

{{< linked_image status_report_single_date >}}

And this screenshot is an example of a **Date Range** report:

{{< linked_image status_report_date_range >}}
