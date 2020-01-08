---
title: "Cost Estimates for Hosting Small, Medium and Large Websites with AWS"
slug: "aws-hosting-cost-examples-linux-windows-ec2-rds"
aliases:
    - /2018/01/18/aws-hosting-cost-examples-linux-windows-ec2-rds/
date: "2018-01-18"
menu_section: "blog"
categories: ["AWS"]
---

In previous posts, I provided [an overview of what the AWS Free Usage Tier contains](/2018/01/13/aws-free-usage-tier/) and some [basic guidelines for avoiding overage charges while using the free tier](/2018/01/15/how-to-monitor-aws-free-tier-usage/) to host a small website.

In this post, I will explore the different pricing models that Amazon offers for EC2 and RDS instances and estimate the cost to host four different website configurations for one year. I decided to gather this data in order to answer the following questions:
<ul class="q-and-a">
    <li>What amount should I expect to pay to host my website with the same AWS instances when I'm no longer eligible for the free usage tier?</li>
    <li>Given the light specs of the t2.micro instance (1CPU/1GiB RAM), what would it cost to host a site that requires more capacity? Or a large web application that handles thousands of simultaneous connections?</li>
    <li>How much more would it cost to host any of these websites with a Windows/MSSQL toolchain versus the Linux/MySQL I'm currently using?</li>
    <li>How much cheaper is the Reserved Instance Rate (pay for one year of usage upfront) rather than the On-Demand Instance rate?</li>
</ul>
Thankfully, Amazon created a tool we can use to answer these questions: the <a href="http://calculator.s3.amazonaws.com/index.html">AWS Simple Monthly Calculator</a>. Calling it "simple" must be an attempt at modesty because the calculator contains a massive amount of configuration options.

To begin, let's take a look at the pricing models for EC2 and RDS instances.

## EC2 and RDS Pricing Models

Amazon has <a href="https://aws.amazon.com/ec2/pricing/?p=ps">four different pricing models</a> for EC2 and RDS instances:

* **On-Demand** rates offer the most flexibility since you can ramp up, scale down and re-locate your resources if your estimates and actual usage differ significantly. However, you'll pay for the convenience. This is the pricing model used when you exceed your monthly limit of EC2 usage included with the free tier.
* **Reserved Instance** rates require you to sign a one or three year contract for usage of a single instance type. This means that you cannot change to a more powerful instance type if you underestimated the amount of compute power or memory necessary for your website, or vice-versa (you cannot change to a less expensive instance type). You can pay for the entire year, pay for a partial amount or pay nothing upfront. Naturally, paying the full amount gives the largest discount, but signing a contract and paying nothing upfront is still cheaper than the On-Demand rate for the same instance type.
* **Spot Instances** offer much cheaper rates than On-Demand instances, but they are not applicable to our scenario of a public-facing website which requires constant availability. If  you need to train your new machine learning algorithm on a massive data set or you need to render a large 3d graphics project, spot instances allow you to access enormous CPU and GPU resources for a huge discount compared to On-Demand rates.
* **Dedicated Hosts/Instances** will not be discussed further since their benefits are unnecessary for most websites, especially a personal blog site.

Along with the pricing model and the OS/database system you utilize, the cost of an EC2 instance varies based on the region of the world where the instance is located. All of the cost estimates I gathered are for the US East region.

## Defining Our Data Set

My goal is to understand how the cost of hosting a website with AWS changes based on three different criteria:

1. OS and database type
2. Pricing model
3. Size/capacity of the website

To do so, I decided to calculate estimated costs for four OS/database variations and 3 pricing models:

<div class="table-wrapper">
    <div class="responsive">
        <table class="site-variations">
            <thead>
            <tr>
                <th scope="col" class="first-column column-header">OS/Database Combinations</th>
                <th class="column-header">&nbsp;</th>
                <th scope="col" class="last-column column-header">Pricing Models</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td class="first-column">Linux/MySQL</td>
                <td>&nbsp;</td>
                <td class="last-column">On-Demand</td>
            </tr>
            <tr>
                <td class="first-column">Windows/MySQL</td>
                <td>&nbsp;</td>
                <td class="last-column">1 Year Reserved Instance (Partial Payment Upfront)</td>
            </tr>
            <tr>
                <td class="first-column">Windows/MS SQL Bring Your Own License (BYOL)</td>
                <td>&nbsp;</td>
                <td class="last-column">1 Year Reserved Instance (Full Payment Upfront)</td>
            </tr>
            <tr>
                <td class="first-column last-row">Windows/MS SQL Standard Edition (SE)</td>
                <td class="last-row">&nbsp;</td>
                <td class="last-column last-row">&nbsp;</td>
            </tr>
            </tbody>
        </table>
    </div>
</div>

In order to show how the cost savings change as the website size/capacity is increased, I created four different configurations of EC2/RDS instances, SSD storage, monthly data transfer amounts, etc. I've summarized the different website configurations in Table 1:

<div class="table-wrapper">
    <div class="responsive">
        <table class="aws-hosting-costs table-1">
            <thead class="table-1">
            <tr>
                <td colspan="5" class="table-number">Table 1</td>
            </tr>
            <tr>
                <td colspan="5" class="table-title">Configuration Details for Example Websites</td>
            </tr>
            <tr>
                <th class="has-bottom-border-heavy">&nbsp;</th>
                <th scope="col" class="header-grouping has-emphasis has-bottom-border">Linux/MySQL</th>
                <th scope="col" class="header-grouping has-emphasis has-bottom-border">Windows/MySQL</th>
                <th scope="col" class="header-grouping has-emphasis has-bottom-border">Windows/MS SQL BYOL</th>
                <th scope="col" class="header-grouping has-emphasis has-bottom-border">Windows/MS SQL SE</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th scope="row" class="has-emphasis has-bottom-border-heavy">Free Usage Website</th>
                <td class="has-bottom-border-heavy has-right-border-light first-column">
                <ul class="unstyled-list">
                    <li>&#40;1&#41; Linux EC2 t2.micro instance</li>
                    <li>&#40;1&#41; 10GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.t2.micro MySQL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy has-right-border-light">
                <ul class="unstyled-list">
                    <li>&#40;1&#41; Windows EC2 t2.micro instance</li>
                    <li>&#40;1&#41; 10GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.t2.micro MySQL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy has-right-border-light">
                <ul class="unstyled-list">
                    <li>&#40;1&#41; Windows EC2 t2.micro instance</li>
                    <li>&#40;1&#41; 10GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.t2.small MS SQL BYOL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy last-column">
                <ul class="unstyled-list">
                    <li>&#40;1&#41; Windows EC2 t2.micro instance</li>
                    <li>&#40;1&#41; 10GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.small MS SQL Standard instance</li>
                </ul>
                </td>
            </tr>
            <tr>
                <th scope="row" class="has-emphasis has-bottom-border-heavy">Small Website</th>
                <td class="has-bottom-border-heavy has-right-border-light first-column">
                <ul class="unstyled-list">
                    <li>&#40;1&#41; Linux EC2 t2.medium instance</li>
                    <li>&#40;1&#41; 100GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.small MySQL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy has-right-border-light">
                <ul class="unstyled-list">
                    <li>&#40;1&#41; Windows EC2 t2.medium instance</li>
                    <li>&#40;1&#41; 100GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.small MySQL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy has-right-border-light">
                <ul class="unstyled-list">
                    <li>&#40;1&#41; Windows EC2 t2.medium instance</li>
                    <li>&#40;1&#41; 100GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.small MS SQL BYOL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy last-column">
                <ul class="unstyled-list">
                    <li>&#40;1&#41; Windows EC2 t2.medium instance</li>
                    <li>&#40;1&#41; 100GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.small MS SQL Standard instance</li>
                </ul>
                </td>
            </tr>
            <tr>
                <th scope="row" class="has-emphasis has-bottom-border-heavy">Mid-Size Website</th>
                <td class="has-bottom-border-heavy has-right-border-light first-column">
                <ul class="unstyled-list">
                    <li>&#40;2&#41; Linux EC2 m1.small instances</li>
                    <li>&#40;1&#41; 300GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.small MySQL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy has-right-border-light">
                <ul class="unstyled-list">
                    <li>&#40;2&#41; Windows EC2 m1.small instances</li>
                    <li>&#40;1&#41; 300GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.small MySQL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy has-right-border-light">
                <ul class="unstyled-list">
                    <li>&#40;2&#41; Windows EC2 m1.small instances</li>
                    <li>&#40;1&#41; 300GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.small MS SQL BYOL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy last-column">
                <ul class="unstyled-list">
                    <li>&#40;2&#41; Windows EC2 m1.small instances</li>
                    <li>&#40;1&#41; 300GB SSD EBS volume</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.small MS SQL Standard instance</li>
                </ul>
                </td>
            </tr>
            <tr>
                <th scrope="row" class="has-emphasis has-bottom-border-heavy">Large Web Site</th>
                <td class="has-bottom-border-heavy has-right-border-light first-column last-row">
                <ul class="unstyled-list">
                    <li>&#40;4&#41; Linux EC2 m1.small instances</li>
                    <li>&#40;4&#41; 300GB SSD EBS volumes</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.large MySQL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy has-right-border-light last-row">
                <ul class="unstyled-list">
                    <li>&#40;4&#41; Windows EC2 m1.small instances</li>
                    <li>&#40;4&#41; 300GB SSD EBS volumes</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.large MySQL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy has-right-border-light last-row">
                <ul class="unstyled-list">
                    <li>&#40;4&#41; Windows EC2 m1.small instances</li>
                    <li>&#40;4&#41; 300GB SSD EBS volumes</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.large MS SQL BYOL instance</li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy last-column last-row">
                <ul class="unstyled-list">
                    <li>&#40;4&#41; Windows EC2 m1.small instances</li>
                    <li>&#40;4&#41; 300GB SSD EBS volumes</li>
                    <li>&#40;1&#41; 20GB RDS db.m1.large MS SQL Standard instance</li>
                </ul>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</div>

## Cost Estimates

Each cell in Table 2 contains a link to a screenshot showing configuration settings from the AWS Simple Cost Calculator. If you enter the same settings shown in the **EC2** and **RDS** links, as well as the settings from the **Common** column, it should match the estimated monthly bill shown in the **Total Cost** link. The settings found in the **Common** column do not change based on the pricing model:

<div class="table-wrapper">
    <div class="responsive">
        <table class="aws-hosting-costs table-2">
            <thead class="table-2">
            <tr>
                <td colspan="16" class="table-number">Table 2</td>
            </tr>
            <tr>
                <td colspan="16" class="table-title">AWS Simple Cost Calculator Settings<sup>1</sup></td>
            </tr>
            <tr>
                <th class="has-bottom-border-heavy">&nbsp;</th>
                <th class="has-bottom-border-heavy">&nbsp;</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis has-bottom-border-heavy">Linux/MySQL</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis has-bottom-border-heavy">Win/MySQL</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis has-bottom-border-heavy">Win/MS SQL BYOL</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis has-bottom-border-heavy">Win/MS SQL SE</th>
                <th scope="col" colspan="2" class="header-grouping has-emphasis has-bottom-border-heavy">Common</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy site-type">Free Usage Website</th>
                <th scope="row" class="has-bottom-border-light pricing-model">On-Demand</th>
                <td class="has-bottom-border-light first-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_linux_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_linux_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_mysql_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_win_mysql_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_mysql_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_win_mssql_byol_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_win_mssql_byol_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_win_mssql_se_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/on_demand/freetier_win_mssql_se_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy common-config" rowspan="3">
                <ul class="unstyled-list">
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/same/freetier_all_s3.jpeg">S3</a></li>
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/same/freetier_all_r53.jpeg">Route 53</a></li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy last-column" rowspan="3">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light pricing-model">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_linux_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_linux_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_mysql_partial_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_win_mysql_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_mysql_partial_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_win_mssql_byol_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_win_mssql_byol_partial_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_win_mssql_se_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_partial_upfront/freetier_win_mssql_se_partial_rds.jpeg">RDS</a></td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_linux_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_linux_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_linux_full_ec2.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_win_mysql_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_mysql_full_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_win_mssql_byol_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_mysql_full_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_win_mssql_se_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/01-freetier/paid_all_upfront/freetier_win_mssql_se_full_rds.jpeg">RDS</a></td>
            </tr>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy site-type">Small Website</th>
                <th scope="row" class="has-bottom-border-light pricing-model">On-Demand</th>
                <td class="has-bottom-border-light first-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_linux_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_linux_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_mysql_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_win_mysql_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_mysql_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_win_mssql_byol_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_win_mssql_byol_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_win_mssql_se_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/on_demand/smallwebsite_win_mssql_se_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy common-config" rowspan="3">
                <ul class="unstyled-list">
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/same/smallwebsite_all_s3.jpeg">S3</a></li>
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/same/smallwebsite_all_s3.jpeg">Route 53</a></li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy last-column" rowspan="3">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light pricing-model">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_linux_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_linux_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_mysql_partial_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_win_mysql_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_mysql_partial_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_win_mssql_byol_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_win_mssql_byol_partial_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_win_mssql_se_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_partial_upfront/smallwebsite_win_mssql_se_partial_rds.jpeg">RDS</a></td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_linux_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_linux_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_mysql_full_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_win_mysql_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_mysql_full_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_win_mssql_byol_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_win_mssql_byol_full_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_win_mssql_se_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/02-smallwebsite/paid_all_upfront/smallwebsite_win_mssql_se_full_rds.jpeg">RDS</a></td>
            </tr>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy site-type">Mid-Size Website</th>
                <th scope="row" class="has-bottom-border-light pricing-model">On-Demand</th>
                <td class="has-bottom-border-light first-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_linux_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_linux_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_mysql_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_win_mysql_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_mysql_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_win_mssql_byol_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_win_mssql_byol_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_win_mssql_se_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/on_demand/midsizewebsite_win_mssql_se_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy common-config" rowspan="3">
                <ul class="unstyled-list">
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/same/midsizewebsite_all_s3.jpeg">S3</a></li>
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/same/midsizewebsite_all_r53.jpeg">Route 53</a></li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy last-column" rowspan="3">
                <ul class="unstyled-list">
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/same/midsizewebsite_all_cf.jpeg">Cloudfront</a></li>
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/same/midsizewebsite_all_ddb.jpeg">DynamoDB</a></li>
                </ul>
                </td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light pricing-model">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_linux_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_linux_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_mysql_partial_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_win_mysql_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_mysql_partial_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_win_mssql_byol_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_win_mssql_byol_partial_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_win_mssql_se_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_partial_upfront/midsizewebsite_win_mssql_se_partial_rds.jpeg">RDS</a></td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_linux_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_linux_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_mysql_full_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_win_mysql_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_mysql_full_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_win_mssql_byol_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_win_mssql_byol_full_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_win_mssql_se_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/03-midsizewebsite/paid_all_upfront/midsizewebsite_win_mssql_se_full_rds.jpeg">RDS</a></td>
            </tr>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy site-type">Large Website</th>
                <th scope="row" class="has-bottom-border-light pricing-model">On-Demand</th>
                <td class="has-bottom-border-light first-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_linux_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_linux_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_mysql_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_win_mysql_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_mysql_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_win_mssql_byol_on_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_win_mssql_byol_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_win_mssql_se_on_sum%2C.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_win_on_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/on_demand/largewebapp_win_mssql_se_on_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy common-config last-row" rowspan="3">
                <ul class="unstyled-list">
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/same/largewebapp_all_s3.jpeg">S3</a></li>
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/same/largewebapp_all_r53.jpeg">Route 53</a></li>
                </ul>
                </td>
                <td class="has-bottom-border-heavy last-column last-row" rowspan="3">
                <ul class="unstyled-list">
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/same/largewebapp_all_cf.jpeg">Cloudfront</a></li>
                    <li class="center"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/same/largewebapp_all_ddb.jpeg">DynamoDB</a></li>
                </ul>
                </td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light pricing-model">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_linux_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_linux_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_linux_partial_sum.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_win_mysql_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_linux_partial_sum.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_win_mssql_byol_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_win_mssql_byol_partial_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_win_mssql_se_partial_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-light"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_win_partial_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-light has-right-border-light last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_partial_upfront/largewebapp_win_mssql_se_partial_rds.jpeg">RDS</a></td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column last-row"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_linux_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy last-row"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_linux_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-row last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_mysql_full_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy last-row"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_win_mysql_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy last-row"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-row last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_mysql_full_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy last-row"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_win_mssql_byol_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy last-row"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-row last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_win_mssql_byol_full_rds.jpeg">RDS</a></td>
                <td class="has-bottom-border-heavy last-row"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_win_mssql_se_full_sum.jpeg">Total Cost</a></td>
                <td class="has-bottom-border-heavy last-row"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_win_full_ec2.jpeg">EC2</a></td>
                <td class="has-bottom-border-heavy has-right-border-light last-row last-column"><a href="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/04-largewebapp/paid_all_upfront/largewebapp_win_mssql_se_full_rds.jpeg">RDS</a></td>
            </tr>
            </tbody>
            <tfoot>
            <tr>
                <td colspan="16" class="table-footer"><sup>1</sup>All cost estimates are for EC2 and RDS Instances in the US East (Virginia) region, and all RDS Instances are configured for Multi-Availability Zone deployment</td>
            </tr>
            </tfoot>
        </table>
    </div>
</div>

The screenshot in each **Total Cost** link contains both a monthly cost and a one-time upfront cost. From these, you can calculate the hosting cost for one year. This is the value shown in blue text in Table 3 and will be the basis for all cost comparisons:

<div class="table-wrapper">
    <div class="responsive">
        <table class="aws-hosting-costs table-3">
            <thead class="table-3">
            <tr>
                <td colspan="14" class="table-number">Table 3</td>
            </tr>
            <tr>
                <td colspan="14" class="table-title">Cost Estimates for One Year of AWS Web Hosting<sup>1</sup></td>
            </tr>
            <tr>
                <th colspan="2">&nbsp;</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Linux/MySQL</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Win/MySQL</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Win/MS SQL BYOL</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Win/MS SQL SE</th>
            </tr>
            <tr>
                <th colspan="2" class="has-bottom-border-heavy">&nbsp;</th>
                <th class="sub-heading numeric has-bottom-border-heavy first-column first-row">Upfront</th>
                <th class="sub-heading numeric has-bottom-border-heavy first-row">1 Month</th>
                <th class="sub-heading numeric one-year-cost has-bottom-border-heavy last-column first-row">1 Year</th>
                <th class="sub-heading numeric has-bottom-border-heavy first-row">Upfront</th>
                <th class="sub-heading numeric has-bottom-border-heavy first-row">1 Month</th>
                <th class="sub-heading numeric one-year-cost has-bottom-border-heavy last-column first-row">1 Year</th>
                <th class="sub-heading numeric has-bottom-border-heavy first-row">Upfront</th>
                <th class="sub-heading numeric has-bottom-border-heavy first-row">1 Month</th>
                <th class="sub-heading numeric one-year-cost has-bottom-border-heavy last-column first-row">1 Year</th>
                <th class="sub-heading numeric has-bottom-border-heavy first-row">Upfront</th>
                <th class="sub-heading numeric has-bottom-border-heavy first-row">1 Month</th>
                <th class="sub-heading numeric one-year-cost has-bottom-border-heavy last-column first-row">1 Year</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy site-type">Free Usage Website</th>
                <th scope="row" class="has-bottom-border-light pricing-model">On-Demand</th>
                <td class="has-bottom-border-light first-column">$0</td>
                <td class="has-bottom-border-light">$40</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$480</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$44</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$528</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$83</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$996</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$956</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$11,472</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light pricing-model">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column">$132</td>
                <td class="has-bottom-border-light">$18</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$348</td>
                <td class="has-bottom-border-light">$152</td>
                <td class="has-bottom-border-light">$20</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$392</td>
                <td class="has-bottom-border-light">$330</td>
                <td class="has-bottom-border-light">$34</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$738</td>
                <td class="has-bottom-border-light">$2,890</td>
                <td class="has-bottom-border-light">$375</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$7,390</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column">$262</td>
                <td class="has-bottom-border-heavy">$7</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$346</td>
                <td class="has-bottom-border-heavy">$302</td>
                <td class="has-bottom-border-heavy">$7</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$386</td>
                <td class="has-bottom-border-heavy">$649</td>
                <td class="has-bottom-border-heavy">$7</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$733</td>
                <td class="has-bottom-border-heavy">$7,158</td>
                <td class="has-bottom-border-heavy">$7</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$7,242</td>
            </tr>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy site-type">Small Website</th>
                <th scope="row" class="has-bottom-border-light pricing-model">On-Demand</th>
                <td class="has-bottom-border-light first-column">$0</td>
                <td class="has-bottom-border-light">$133</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$1,586</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$146</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$1,752</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$197</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$2,364</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$1,002</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$12,024</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light pricing-model">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column">$366</td>
                <td class="has-bottom-border-light">$51</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$978</td>
                <td class="has-bottom-border-light">$445</td>
                <td class="has-bottom-border-light">$58</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$1,141</td>
                <td class="has-bottom-border-light">$529</td>
                <td class="has-bottom-border-light">$89</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$1,597</td>
                <td class="has-bottom-border-light">$3,039</td>
                <td class="has-bottom-border-light">$398</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$7,815</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column">$751</td>
                <td class="has-bottom-border-heavy">$18</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$967</td>
                <td class="has-bottom-border-heavy">$909</td>
                <td class="has-bottom-border-heavy">$18</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$1,125</td>
                <td class="has-bottom-border-heavy">$1,352</td>
                <td class="has-bottom-border-heavy">$18</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$1,568</td>
                <td class="has-bottom-border-heavy">$7,452</td>
                <td class="has-bottom-border-heavy">$18</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$7,668</td>
            </tr>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy site-type">Mid-Size Website</th>
                <th scope="row" class="has-bottom-border-light pricing-model">On-Demand</th>
                <td class="has-bottom-border-light first-column">$0</td>
                <td class="has-bottom-border-light">$272</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$3,264</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$317</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$3,804</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$368</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$4,416</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$1,173</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$14,076</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light pricing-model">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column">$492</td>
                <td class="has-bottom-border-light">$165</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$2,472</td>
                <td class="has-bottom-border-light">$576</td>
                <td class="has-bottom-border-light">$194</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$2,904</td>
                <td class="has-bottom-border-light">$660</td>
                <td class="has-bottom-border-light">$225</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$3,360</td>
                <td class="has-bottom-border-light">$3,170</td>
                <td class="has-bottom-border-light">$534</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$9,578</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column">$928</td>
                <td class="has-bottom-border-heavy">$127</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$2,452</td>
                <td class="has-bottom-border-heavy">$1,354</td>
                <td class="has-bottom-border-heavy">$127</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$2,878</td>
                <td class="has-bottom-border-heavy">$1,797</td>
                <td class="has-bottom-border-heavy">$127</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$3,321</td>
                <td class="has-bottom-border-heavy">$7,897</td>
                <td class="has-bottom-border-heavy">$127</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column">$9,421</td>
            </tr>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy site-type">Large Website</th>
                <th scope="row" class="has-bottom-border-light pricing-model">On-Demand</th>
                <td class="has-bottom-border-light first-column">$0</td>
                <td class="has-bottom-border-light">$927</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$11,124</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$1,017</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$12,204</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$1,200</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$14,400</td>
                <td class="has-bottom-border-light">$0</td>
                <td class="has-bottom-border-light">$2,093</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$25,116</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light pricing-model">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column">$1,478</td>
                <td class="has-bottom-border-light">$595</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$8,618</td>
                <td class="has-bottom-border-light">$1,646</td>
                <td class="has-bottom-border-light">$654</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$9,494</td>
                <td class="has-bottom-border-light">$1,980</td>
                <td class="has-bottom-border-light">$770</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$11,220</td>
                <td class="has-bottom-border-light">$4,638</td>
                <td class="has-bottom-border-light">$1,089</td>
                <td class="has-bottom-border-light has-right-border-light one-year-cost last-column">$17,706</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column last-row">$3,027</td>
                <td class="has-bottom-border-heavy last-row">$461</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column last-row">$8,559</td>
                <td class="has-bottom-border-heavy last-row">$3,879</td>
                <td class="has-bottom-border-heavy last-row">$461</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column last-row">$9,411</td>
                <td class="has-bottom-border-heavy last-row">$5,580</td>
                <td class="has-bottom-border-heavy last-row">$461</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column last-row">$11,112</td>
                <td class="has-bottom-border-heavy last-row">$11,928</td>
                <td class="has-bottom-border-heavy last-row">$461</td>
                <td class="has-bottom-border-heavy has-right-border-light one-year-cost last-column last-row">$17,460</td>
            </tr>
            </tbody>
            <tfoot>
            <tr>
                <td colspan="14" class="table-footer"><sup>1</sup>1 Year = Upfront + (1 Month * 12)</td>
            </tr>
            </tfoot>
        </table>
    </div>
</div>

With this set of cost estimates, let's take a look at the questions from the beginning of this post:

<ul class="q-and-a">
    <li>What amount should I expect to pay to host this site with the same AWS instances when I'm no longer eligible for the free usage tier?</li>
    <p>Since this site is running on a LEMP stack, the hosting costs without the benefits of the free usage tier would be:</p>
    <div class="table-wrapper">
        <div class="responsive under-li">
            <table class="free-instance-table">
                <thead>
                <tr>
                    <th scope="col" class="first-column column-header">Pricing Model</th>
                    <th scope="col" class="numeric column-header">Upfront Cost</th>
                    <th scope="col" class="numeric column-header">Monthly Cost</th>
                    <th scope="col" class="numeric column-header">One Year Total</th>
                    <th scope="col" class="numeric last-column column-header">Monthly Avg.</th>
                </tr>
                </thead>
                <tbody>
                <tr class="data-row">
                    <td class="first-column">On-Demand</td>
                    <td class="numeric">$0</td>
                    <td class="numeric">$40</td>
                    <td class="numeric">$480</td>
                    <td class="numeric last-column">$40.00</td>
                </tr>
                <tr class="data-row">
                    <td class="first-column">1 Year Upfront (Partial)</td>
                    <td class="numeric">$132</td>
                    <td class="numeric">$18</td>
                    <td class="numeric">$348</td>
                    <td class="numeric last-column">$29.00</td>
                </tr>
                <tr class="data-row">
                    <td class="first-column last-row">1 Year Upfront (Full)</td>
                    <td class="numeric last-row">$262</td>
                    <td class="numeric last-row">$7</td>
                    <td class="numeric last-row">$346</td>
                    <td class="numeric last-column last-row">$28.83</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</ul>
<ul class="q-and-a">
    <li>Given the light specs of the t2.micro instance (1CPU/1GiB RAM), what would it cost to host a site that requires more capacity? Or a large web application that handles thousands of simultaneous connections?</li>
    <p>It would cost approximately $1600/year to host the example "Small Website" using Linux/MySQL instances with On-Demand pricing, but less than $1000/year with a 1 year contract and $366 paid upfront. This would result in a monthly hosting bill of $51, which sounds very reasonable to me.</p>
</ul>
<ul class="q-and-a">
    <li>How much more would it cost to host any of these websites with a Windows/MSSQL toolchain versus the Linux/MySQL I'm currently using?</li>
    <li>How much cheaper is it to pay partially or for an entire year of service upfront rather than the On-Demand Instance rate?</li>
    <p>The general trends from Table 3 are obvious: Committing to a year of service reduces your costs substantially, while choosing Windows or MS SQL increases costs. We want to dive further into these trends, however. Let's start by examining the savings from using  Linux/MySQL instances compared to the three Windows flavors.</p>
</ul>

## Cost Savings from Linux/MySQL

It's simple to see from Table 3 that hosting  your website with a Linux/MySQL server is the best way to go in terms of cost. This is entirely expected since Linux and MySQL are free, open-source software while Windows and MS SQL are paid, licensed software.

Before capturing the data, I underestimated how much a MS SQL license would cost and overestimated the cost of a Windows license. I was surprised by the small increase in price between Linux/MySQL and Windows/MySQL, and similarly surprised by the large increase between Windows/MS SQL BYOL and Windows/MS SQL SE. I had assumed that bringing your own license (Windows/MS SQL BYOL) would end up with a similar price to using MySQL (Windows/MySQL).

I was expecting the Windows/MS SQL Standard Edition (SE) hosting costs to be the most expensive, but approximately $11,500 for 1 year at On-Demand rates ($615/month when including the partial upfront payment at the Reserved Instance rate) was far more than I would have guessed. Keep in mind, this is for the t2.micro instance types which are included with the Free Usage Tier.

I wanted to visualize the money saved by choosing Linux/MySQL  comparted to the Windows options. I started by noting the money saved for every Windows estimate in Table 3 as compared to the Linux/MySQL estimate for the same website size and pricing model, and then calculated the savings as a percentage of the yearly cost of the Windows plan. These calculations (**$ Saved** and **% Saved**, in blue and green text, respectively) are shown in Table 4:

<div class="table-wrapper">
    <div class="responsive">
        <table class="aws-hosting-costs table-4">
            <thead class="table-4">
            <tr>
                <td colspan="14" class="table-number">Table 4</td>
            </tr>
            <tr>
                <td colspan="14" class="table-title">1 Year Cost Savings with Linux/MySQL Toolchain</td>
            </tr>
            <tr>
                <th colspan="2">&nbsp;</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Free Tier Website</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Small Website</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Mid-Size Website</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Large Website</th>
            </tr>
            <tr>
                <th colspan="2" class="has-bottom-border-heavy">&nbsp;</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th scope="row" rowspan="4" class="has-emphasis has-bottom-border-heavy">On-Demand</th>
                <th scope="row" class="has-bottom-border-light">Linux/MySQL vs</th>
                <td class="numeric has-bottom-border-light first-column">$480</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$1,586</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$3,264</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$11,124</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">Win/MySQL</th>
                <td class="numeric has-bottom-border-light first-column">$528</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$48</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">9%</td>
                <td class="numeric has-bottom-border-light">$1,752</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$166</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">10%</td>
                <td class="numeric has-bottom-border-light">$3,804</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$540</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">14%</td>
                <td class="numeric has-bottom-border-light">$12,204</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$1,080</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">9%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">Win/MS SQL BYOL</th>
                <td class="numeric has-bottom-border-light first-column">$996</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$516</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">52%</td>
                <td class="numeric has-bottom-border-light">$2,364</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$778</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">33%</td>
                <td class="numeric has-bottom-border-light">$4,416</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$1,152</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">26%</td>
                <td class="numeric has-bottom-border-light">$14,400</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$3,276</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">23%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">Win/MS SQL SE</th>
                <td class="numeric has-bottom-border-heavy first-column">$11,472</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$10,992</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">96%</td>
                <td class="numeric has-bottom-border-heavy">$12,024</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$10,438</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">87%</td>
                <td class="numeric has-bottom-border-heavy">$14,076</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$10,812</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">77%</td>
                <td class="numeric has-bottom-border-heavy">$25,116</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$13,992</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">56%</td>
            </tr>
            <tr>
                <th scope="row" rowspan="4" class="has-emphasis has-bottom-border-heavy">1 Year (Partial Upfront)</th>
                <th scope="row" class="has-bottom-border-light">Linux/MySQL vs</th>
                <td class="numeric has-bottom-border-light first-column">$348</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$978</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$2,472</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$8,618</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">Win/MySQL</th>
                <td class="numeric has-bottom-border-light first-column">$392</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$44</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">11%</td>
                <td class="numeric has-bottom-border-light">$1,141</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$163</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">14%</td>
                <td class="numeric has-bottom-border-light">$2,904</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$432</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">15%</td>
                <td class="numeric has-bottom-border-light">$9,494</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$876</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">9%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">Win/MS SQL BYOL</th>
                <td class="numeric has-bottom-border-light first-column">$738</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$390</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">53%</td>
                <td class="numeric has-bottom-border-light">$1,597</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$619</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">39%</td>
                <td class="numeric has-bottom-border-light">$3,360</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$888</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">26%</td>
                <td class="numeric has-bottom-border-light">$11,220</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$2,602</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">23%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">Win/MS SQL SE</th>
                <td class="numeric has-bottom-border-heavy first-column">$7,390</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$7,042</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">95%</td>
                <td class="numeric has-bottom-border-heavy">$7,815</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$6,837</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">88%</td>
                <td class="numeric has-bottom-border-heavy">$9,578</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$7,106</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">74%</td>
                <td class="numeric has-bottom-border-heavy">$17,706</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$9,088</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">51%</td>
            </tr>
            <tr>
                <th scope="row" rowspan="4" class="has-emphasis has-bottom-border-heavy">1 Year (All Upfront)</th>
                <th scope="row" class="has-bottom-border-light">Linux/MySQL vs</th>
                <td class="numeric has-bottom-border-light first-column">$346</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$967</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$2,562</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$8,559</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">Win/MySQL</th>
                <td class="numeric has-bottom-border-light first-column">$386</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$40</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">10%</td>
                <td class="numeric has-bottom-border-light">$1,125</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$158</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">14%</td>
                <td class="numeric has-bottom-border-light">$2,878</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$426</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">15%</td>
                <td class="numeric has-bottom-border-light">$9,411</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$852</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">9%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">Win/MS SQL BYOL</th>
                <td class="numeric has-bottom-border-light first-column">$733</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$387</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">53%</td>
                <td class="numeric has-bottom-border-light">$1,568</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$601</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">38%</td>
                <td class="numeric has-bottom-border-light">$3,321</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$869</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">26%</td>
                <td class="numeric has-bottom-border-light">$11,112</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$2,553</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">23%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">Win/MS SQL SE</th>
                <td class="numeric has-bottom-border-heavy first-column">$7,242</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$6,896</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">95%</td>
                <td class="numeric has-bottom-border-heavy">$7,668</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$6,701</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">87%</td>
                <td class="numeric has-bottom-border-heavy">$9,421</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$6,969</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">74%</td>
                <td class="numeric has-bottom-border-heavy">$17,460</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$8,901</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">51%</td>
            </tr>
            </tbody>
        </table>
    </div>
</div>

Table 4 shows that choosing Linux and MySQL to host my website is $516 cheaper each year than Windows/MS SQL BYOL. The savings are nearly $11,000 if I do not have a license for MS SQL Standard Edition.

Next, I wanted to know if these savings changed as website size increased. To visualize this, for each website configuration, I took the average of the % Saved for all pricing models and plotted the data for each OS/database configuration. See Chart 1:

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/cost_savings_linux_mysql.jpeg" width="500" link="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/cost_savings_linux_mysql.jpeg" alt="Web Host Cost Savings with Linux/MySQL" caption="Figure 1: Web Host Cost Savings with Linux/MySQL">}}

It turns out that the relative cost savings decrease as the size of your website increases. For the instance types included with the free tier, using Linux/MySQL is 95% cheaper than using MS SQL SE, but for the large website, the Linux/MySQL is only 53% cheaper.

This makes sense to me, since the large website is using EC2 instances with much greater CPU and memory capacity, as well as larger SSD volumes. These resources would represent a much larger portion of the monthly costs than the EC2 instances included with the free tier, and thus the licensing costs would be a smaller portion.

It is also interesting that the cost savings compared to Windows/MySQL do not behave in the same way as the pricing for MS SQL. I believe this shows that Amazon charges (roughly) a flat 10-15% surcharge for Windows, regardless of the instance type.

## Cost Savings from Windows/MySQL

After realizing I had underestimated how much MS SQL would increase hosting costs, I decided to calculate the cost savings for Windows/MySQL compared to the MS SQL options in the same way I had done for Linux/MySQL:

<div class="table-wrapper">
    <div class="responsive">
        <table class="aws-hosting-costs table-5">
            <thead class="table-5">
            <tr>
                <td colspan="14" class="table-number">Table 5</td>
            </tr>
            <tr>
                <td colspan="14" class="table-title">1 Year Cost Savings with Windows/MySQL Toolchain</td>
            </tr>
            <tr>
                <th colspan="2">&nbsp;</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Free Tier Website</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Small Website</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Mid-Size Website</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Large Website</th>
            </tr>
            <tr>
                <th colspan="2" class="has-bottom-border-heavy">&nbsp;</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy">On-Demand</th>
                <th scope="row" class="has-bottom-border-light">Win/MySQL vs</th>
                <td class="numeric has-bottom-border-light first-column">$528</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$1,752</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$3,804</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$12,204</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">Win/MS SQL BYOL</th>
                <td class="numeric has-bottom-border-light first-column">$996</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$468</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">47%</td>
                <td class="numeric has-bottom-border-light">$2,364</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$612</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">26%</td>
                <td class="numeric has-bottom-border-light">$4,416</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$612</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">14%</td>
                <td class="numeric has-bottom-border-light">$14,400</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$2,196</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">15%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">Win/MS SQL SE</th>
                <td class="numeric has-bottom-border-heavy first-column">$11,472</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$10,944</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">95%</td>
                <td class="numeric has-bottom-border-heavy">$12,024</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$10,272</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">85%</td>
                <td class="numeric has-bottom-border-heavy">$14,076</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$10,272</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">73%</td>
                <td class="numeric has-bottom-border-heavy">$25,116</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$12,912</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">51%</td>
            </tr>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy">1 Year (Partial Upfront)</th>
                <th scope="row" class="has-bottom-border-light">Win/MySQL vs</th>
                <td class="numeric has-bottom-border-light first-column">$392</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$1,141</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$2,904</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$9,494</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">Win/MS SQL BYOL</th>
                <td class="numeric has-bottom-border-light first-column">$738</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$346</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">47%</td>
                <td class="numeric has-bottom-border-light">$1,597</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$456</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">29%</td>
                <td class="numeric has-bottom-border-light">$3,360</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$456</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">14%</td>
                <td class="numeric has-bottom-border-light">$11,220</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$1,726</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">15%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">Win/MS SQL SE</th>
                <td class="numeric has-bottom-border-heavy first-column">$7,390</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$6,998</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">95%</td>
                <td class="numeric has-bottom-border-heavy">$7,815</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$6,674</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">85%</td>
                <td class="numeric has-bottom-border-heavy">$9,578</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$6,674</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">70%</td>
                <td class="numeric has-bottom-border-heavy">$17,706</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$8,212</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">46%</td>
            </tr>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy">1 Year (All Upfront)</th>
                <th scope="row" class="has-bottom-border-light">Win/MySQL vs</th>
                <td class="numeric has-bottom-border-light first-column">$386</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$1,125</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$2,878</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
                <td class="numeric has-bottom-border-light">$9,411</td>
                <td class="numeric cost-savings-total has-bottom-border-light">&nbsp;</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">Win/MS SQL BYOL</th>
                <td class="numeric has-bottom-border-light first-column">$733</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$347</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">47%</td>
                <td class="numeric has-bottom-border-light">$1,568</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$443</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">28%</td>
                <td class="numeric has-bottom-border-light">$3,321</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$443</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">13%</td>
                <td class="numeric has-bottom-border-light">$11,112</td>
                <td class="numeric cost-savings-total has-bottom-border-light">$1,701</td>
                <td class="numeric cost-savings-percent has-bottom-border-light has-right-border-light last-column">15%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">Win/MS SQL SE</th>
                <td class="numeric has-bottom-border-heavy first-column">$7,242</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$6,856</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">95%</td>
                <td class="numeric has-bottom-border-heavy">$7,668</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$6,543</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">85%</td>
                <td class="numeric has-bottom-border-heavy">$9,421</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$6,543</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">69%</td>
                <td class="numeric has-bottom-border-heavy">$17,460</td>
                <td class="numeric cost-savings-total has-bottom-border-heavy">$8,049</td>
                <td class="numeric cost-savings-percent has-bottom-border-heavy has-right-border-light last-column">46%</td>
            </tr>
            </tbody>
        </table>
    </div>
</div>

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/cost_savings_windows_mysql.jpeg" width="500" link="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/cost_savings_windows_mysql.jpeg" alt="Web Host Cost Savings with Windows/MySQL" caption="Figure 2: Web Host Cost Savings with Windows/MySQL">}}

The trend for these savings looks exactly like the trend for Linux/MySQL, only shifted down by 8-10%, which makes sense since this shift would represent the flat "surcharge" I noted at the end of  the previous section.

## Cost Savings from Reserved Instance Rates

There is only one question remaining from my original list: How much cheaper is it to pay partially or for an entire year of service upfront rather than the On-Demand Instance rate? Looking at Table 3, I immediately noticed there is almost no reason to pay the full amount upfront. Across the board, the estimated cost is only $5-10 cheaper than paying the partial amount.

You can see the **% Savings** for each pricing model and website configuration in Table 6:

<div class="table-wrapper">
    <div class="responsive">
        <table class="aws-hosting-costs table-6">
            <thead class="table-6">
            <tr>
                <td colspan="14" class="table-number">Table 6</td>
            </tr>
            <tr>
                <td colspan="14" class="table-title">Cost Savings When Paying Reserved Instance Rates</td>
            </tr>
            <tr>
                <th colspan="2">&nbsp;</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Linux/MySQL</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Win/MySQL</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Win/MS SQL BYOL</th>
                <th scope="col" colspan="3" class="header-grouping has-emphasis">Win/MS SQL SE</th>
            </tr>
            <tr>
                <th colspan="2" class="has-bottom-border-heavy">&nbsp;</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
                <th class="sub-heading numeric has-bottom-border-heavy">1 Year</th>
                <th class="sub-heading numeric cost-savings-total has-bottom-border-heavy">$ Saved</th>
                <th class="sub-heading numeric cost-savings-percent has-bottom-border-heavy">% Saved</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy">Free Usage Website</th>
                <th scope="row" class="has-bottom-border-light">On-Demand</th>
                <td class="has-bottom-border-light first-column">$480</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$528</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$996</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$11,472</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column">$348</td>
                <td class="has-bottom-border-light cost-savings-total">$132</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">28%</td>
                <td class="has-bottom-border-light">$392</td>
                <td class="has-bottom-border-light cost-savings-total">$136</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">26%</td>
                <td class="has-bottom-border-light">$738</td>
                <td class="has-bottom-border-light cost-savings-total">$258</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">26%</td>
                <td class="has-bottom-border-light">$7,390</td>
                <td class="has-bottom-border-light cost-savings-total">$4,082</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">36%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column">$346</td>
                <td class="has-bottom-border-heavy cost-savings-total">$134</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">28%</td>
                <td class="has-bottom-border-heavy">$386</td>
                <td class="has-bottom-border-heavy cost-savings-total">$142</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">27%</td>
                <td class="has-bottom-border-heavy">$733</td>
                <td class="has-bottom-border-heavy cost-savings-total">$263</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">26%</td>
                <td class="has-bottom-border-heavy">$7,242</td>
                <td class="has-bottom-border-heavy cost-savings-total">$4,230</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">37%</td>
            </tr>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy">Small Website</th>
                <th scope="row" class="has-bottom-border-light">On-Demand</th>
                <td class="has-bottom-border-light first-column">$1,586</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$1,752</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$2,364</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$12,024</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column">$978</td>
                <td class="has-bottom-border-light cost-savings-total">$608</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">38%</td>
                <td class="has-bottom-border-light">$1,141</td>
                <td class="has-bottom-border-light cost-savings-total">$611</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">35%</td>
                <td class="has-bottom-border-light">$1,597</td>
                <td class="has-bottom-border-light cost-savings-total">$767</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">32%</td>
                <td class="has-bottom-border-light">$7,815</td>
                <td class="has-bottom-border-light cost-savings-total">$4,209</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">35%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column">$967</td>
                <td class="has-bottom-border-heavy cost-savings-total">$619</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">39%</td>
                <td class="has-bottom-border-heavy">$1,125</td>
                <td class="has-bottom-border-heavy cost-savings-total">$627</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">36%</td>
                <td class="has-bottom-border-heavy">$1,568</td>
                <td class="has-bottom-border-heavy cost-savings-total">$796</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">34%</td>
                <td class="has-bottom-border-heavy">$7,668</td>
                <td class="has-bottom-border-heavy cost-savings-total">$4,356</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">36%</td>
            </tr>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy">Mid-Size Website</th>
                <th scope="row" class="has-bottom-border-light">On-Demand</th>
                <td class="has-bottom-border-light first-column">$3,264</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$3,804</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$4,416</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$14,076</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column">$2,472</td>
                <td class="has-bottom-border-light cost-savings-total">$792</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">24%</td>
                <td class="has-bottom-border-light">$2,904</td>
                <td class="has-bottom-border-light cost-savings-total">$900</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">24%</td>
                <td class="has-bottom-border-light">$3,360</td>
                <td class="has-bottom-border-light cost-savings-total">$1,056</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">24%</td>
                <td class="has-bottom-border-light">$9,578</td>
                <td class="has-bottom-border-light cost-savings-total">$4,498</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">32%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column">$2,452</td>
                <td class="has-bottom-border-heavy cost-savings-total">$6812</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">25%</td>
                <td class="has-bottom-border-heavy">$2,878</td>
                <td class="has-bottom-border-heavy cost-savings-total">$926</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">24%</td>
                <td class="has-bottom-border-heavy">$3,321</td>
                <td class="has-bottom-border-heavy cost-savings-total">$1,095</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">25%</td>
                <td class="has-bottom-border-heavy">$9,421</td>
                <td class="has-bottom-border-heavy cost-savings-total">$4,655</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">33%</td>
            </tr>
            <tr>
                <th scope="row" rowspan="3" class="has-emphasis has-bottom-border-heavy">Large Website</th>
                <th scope="row" class="has-bottom-border-light">On-Demand</th>
                <td class="has-bottom-border-light first-column">$11,124</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$12,204</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$14,400</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
                <td class="has-bottom-border-light">$25,116</td>
                <td class="has-bottom-border-light cost-savings-total">&nbsp;</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">&nbsp;</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-light">1 Year Upfront (Partial)</th>
                <td class="has-bottom-border-light first-column">$8,618</td>
                <td class="has-bottom-border-light cost-savings-total">$2,506</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">23%</td>
                <td class="has-bottom-border-light">$9,494</td>
                <td class="has-bottom-border-light cost-savings-total">$2,710</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">23%</td>
                <td class="has-bottom-border-light">$11,220</td>
                <td class="has-bottom-border-light cost-savings-total">$3,180</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">22%</td>
                <td class="has-bottom-border-light">$17,706</td>
                <td class="has-bottom-border-light cost-savings-total">$7,410</td>
                <td class="has-bottom-border-light has-right-border-light cost-savings-percent last-column">30%</td>
            </tr>
            <tr>
                <th scope="row" class="has-bottom-border-heavy">1 Year Upfront (Full)</th>
                <td class="has-bottom-border-heavy first-column">$8,559</td>
                <td class="has-bottom-border-heavy cost-savings-total">$2,565</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">23%</td>
                <td class="has-bottom-border-heavy">$9,411</td>
                <td class="has-bottom-border-heavy cost-savings-total">$2,793</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">23%</td>
                <td class="has-bottom-border-heavy">$11,112</td>
                <td class="has-bottom-border-heavy cost-savings-total">$3,288</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">23%</td>
                <td class="has-bottom-border-heavy">$17,460</td>
                <td class="has-bottom-border-heavy cost-savings-total">$7,656</td>
                <td class="has-bottom-border-heavy has-right-border-light cost-savings-percent last-column">31%</td>
            </tr>
            </tbody>
            <tfoot>
            <tr>
                <td colspan="14" class="table-footer"><sup>1</sup>1 Year = Upfront + (1 Month * 12)</td>
            </tr>
            </tfoot>
        </table>
    </div>
</div>

For some reason, Amazon does not give a larger incentive for paying the entire amount upfront. This is the case even when full upfront cost is thousands of dollars greater than the partial amount.

I again created a graph to show this by taking the average of the % Savings for all website configurations, for each OS/database combination:

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/cost_savings_reserved_rates.jpeg" width="500" link="https://s3-us-west-1.amazonaws.com/alunapublic/hosting_cost_comparisons/cost_savings_reserved_rates.jpeg" alt="Cost Savings with Reserved Instance Pricing" caption="Figure 3: Cost Savings with Reserved Instance Pricing">}}

## Summary

I hope this post helps you understand how the cost of hosting a website with AWS is impacted by the choice of OS, database type and pricing model. I know that my example websites may not be applicable to your application, causing  a significant difference in the hosting costs.

If you have any feedback for how to improve these estimates, please let me know in the comments!
