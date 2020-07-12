---
title: "Vigorish: Hybrid Python/Node.Js Web Scraper"
lead: "User Guide"
date: '2020-06-28'
slug: "vigorish/user_guide"
type: "vigorish"
menu_section: "projects"
categories: ["Python", "NodeJS"]
summary: "`vigorish` is a hybrid Python/Node.js application that scrapes data from mlb.com, brooksbaseball.net and baseball-reference.com."
toc: true
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Patti Black on Unsplash"
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

## Usage

Congratulations! If you made it this far, you have successfully installed and configured `vigorish`! After installing Nightmare/Electron and initializing the database, the Main Menu will display three new options (**Create New Job**, **View All Jobs** and **Status Reports**):

{{< linked_image main_menu_setup_complete >}}

## Warning!

Use of vigorish must abide by the terms stated in the license. Also, in order to abide by the guidelines quoted below (from [baseball-reference.com](https://www.sports-reference.com/data_use.html)), **a delay of at least two seconds MUST always occur after a URL is scraped:**

> Please do not attempt to aggressively spider data from our web sites, as spidering violates the terms and conditions that govern your use of our web sites: [Site Terms of Use](https://www.sports-reference.com/termsofuse.html) ... If we notice excessive activity from a particular IP address we will be forced to take appropriate measures, which will include, but not be limited to, blocking that IP address. We thank you in advance for respecting our terms of use.

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
