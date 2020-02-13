---
title: "AWS Free Tier: How to Monitor Usage and Avoid Overage Charges"
slug: "how-to-monitor-aws-free-tier-usage"
aliases:
    - /2018/01/15/how-to-monitor-aws-free-tier-usage/
date: "2018-01-15"
menu_section: "blog"
categories: ["AWS"]
summary: ""
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by frank mckenna on Unsplash"
  - name: img1
    src: images/aws_console.jpg
    title: Figure 1 - Services menu showing link to EC2 Dashboard in AWS Console
  - name: img2
    src: images/ec2_dashboard.jpg
    title: Figure 2 - EC2 Dashboard showing one running instance
  - name: img3
    src: images/aws_free_tier_service_by_usage.jpg
    title: Figure 3 - Top Free Tier Services by Usage table in AWS Billing Dashboard
  - name: img4
    src: images/aws_billing_month_to_date_spend_by_service.jpg
    title: Figure 4 - Month-to-Date Spend by Service in AWS Billing Dashboard, includes products which are not part of the free tier
  - name: img5
    src: images/bill_free_tier_charges.jpg
    title: Figure 5 - Bill Details in AWS Billing Dashboard
  - name: img6
    src: images/bill_data_transfer_charges.jpg
    title: Figure 6 - Data transfer charges
  - name: img7
    src: images/elastic_ip_link.jpg
    title: Figure 7 - EC2 Dashboard showing one Elastic IP allocated to my account
  - name: img8
    src: images/aws_ec2_example_unused_ip.jpg
    title: Figure 8 - An unused Elastic IP address (no value in the Instance column)
  - name: img9
    src: images/aws_ec2_how_to_release_ip.jpg
    title: Figure 9 - Click Actions -> Release addresses to release the IP address
  - name: img10
    src: images/aws_ec2_confirm_release_ip.jpg
    title: Figure 10 - Prompt confirms your decision to release the IP address
---

With Amazon&#39;s Free Usage Tier, it&#39;s very easy to generate overage charges even with the best intentions of operating entirely within the offer's limits (this is why Amazon requires a credit card when you create your account). For each individual service (EC2, RDS, S2, etc.), your usage for the month is tabulated in extremely fine detail. At first, the sheer number of items on your invoice can be intimidating. In this post, I will show what a typical bill contains for running a small Wordpress site and how to avoid overage charges and other unnecesary costs.

## Monitor Running Instances in the EC2 Dashboard

The easiest way to ensure you won't generate overrage costs with [Amazon&#39;s Free Usage Tier](https://aws.amazon.com/free/) is to keep track of how many Linux and Windows EC2 instances are running under your account.

The free tier includes 750 hours per month of Linux EC2 usage and another 750 hours per month of Windows EC2 usage (both must be either t1 or t2.micro instances). Similarly, you are allowed 750 hrs/month for an Elastic Load Balancer and 750 hrs/month for an RDS (database) instance. Together, these components will allow you to create a web application and run it continuously, free of charge.

You can see how many EC2 instances are currently running via the EC2 Dashboard within the AWS Console. Navigate to: **Services -&#62; Compute -&#62; EC2:**</p>

{{< linked_image img1 >}}

The dashboard provides a summary of various EC2 resources which are allocated to your account, including the number of running instances. In the screenshot below, you can see that I have one running server instance, one elastic IP, one volume (storage disk), one SSH key pair and three network security groups which are allocated to my account.

{{< linked_image img2 >}}

If you are continuously running **two server instances** (must be **one Linux instance and one Windows instance**), you will not be charged while your account is eligible for the free tier. Also, if you are continuously running only a single instance (either Linux or Windows) you will not be charged.

However, if you are continuously using two instances of Linux or two instances of Windows, you will eventually incur charges at [the rate for your specific region, instance type and OS type](https://aws.amazon.com/ec2/pricing/on-demand/) when you have exceeded 750 total hours of use. Two Linux (or Windows) servers running 24 hours a day would exceed this limit after 15 days.

Thankfully, the instance types that are availabe at no cost (t1 and t2.micro) are the cheapest to operate (but also the lowest in terms of CPU/RAM). The table below shows how much you would be charged for running these instances after exceeding the free tier limit:

<div class ="table-wrapper">
  <div class="responsive">
    <table class="pricing-table-1">
      <thead>
        <tr>
          <td colspan="4" class="table-number">Table 1</td>
        </tr>
        <tr>
          <td colspan="4" class="table-title">Overage Pricing for EC2 Instance Types Included with Free Tier</td>
        </tr>
        <tr>
          <th class="first-column column-header">Instance Type</th>
          <th scope="col" class="numeric column-header">Hourly Rate<sup>1</sup></th>
          <th scope="col" class="numeric column-header">Daily Rate<sup>2</sup></th>
          <th scope="col" class="numeric last-column column-header">Monthly Rate<sup>3</sup></th>
        </tr>
      </thead>
      <tbody>
        <tr class="data-row">
          <td class="first-column">Linux t1.micro</td>
          <td class="numeric">$0.0250</td>
          <td class="numeric">$0.60</td>
          <td class="numeric  last-column">$18.25</td>
        </tr>
        <tr class="data-row">
          <td class="first-column">Linux t2.micro</td>
          <td class="numeric">$0.0138</td>
          <td class="numeric">$0.33 </td>
          <td class="numeric  last-column">$10.07</td>
        </tr>
        <tr class="data-row">
          <td class="first-column">Windows t1.micro</td>
          <td class="numeric">$0.0350</td>
          <td class="numeric">$0.84</td>
          <td class="numeric  last-column">$25.55</td>
        </tr>
        <tr class="data-row">
          <td class="first-column last-row">Windows t2.micro</td>
          <td class="numeric last-row">$0.0184</td>
          <td class="numeric last-row">$0.44</td>
          <td class="numeric last-column last-row">$13.43</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" class="table-footer">Note: Hourly rates are for On-Demand EC2 instances in US West (N. California) Region</td>
        </tr>
        <tr>
          <td colspan="4" class="table-footer"><sup>1</sup>Source: <a href="https://aws.amazon.com/ec2/pricing/on-demand/">https://aws.amazon.com/ec2/pricing/on-demand/</a></td>
        </tr>
        <tr>
          <td colspan="4" class="table-footer"><sup>2</sup>Daily Rate = Hourly Rate * 24</td>
        </tr>
        <tr>
          <td colspan="4" class="table-footer"><sup>3</sup>Monthly Rate = (Daily Rate * 365) / 12</td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>

## Monitor Current Charges in the Billing Dashboard

As mentioned in [my previous post](/2018/01/13/aws-free-usage-tier/), the amount of [AWS products that offer a free version](https://aws.amazon.com/free/?awsf.undefined=*default) is staggering. To prevent unexpected charges from your month-long spree of creating VR environments and pseudo-sentient chatbots, you should make a habit of frequently checking your current bill in the AWS Console.

You can open the **Billing &#38; Cost Management Dashboard** by clicking the **Billing** link under the Services menu. This page contains various tables and graphs that show how your usage is tracking agianst the limits of the free tier.

**Top Free Tier Services by Usage** is a list of the services you have used the most this month and a projection of how much of the free allotment you are on track to consume:

{{< linked_image img3 >}}

Unfortunately, I am on track to use more than the 750 hours of EC2 Linux usage that is included with the free tier. By my calculations, I will be responsible for roughly 250 excess hours of t2.micro On-Demand usage, which comes out to a whopping $3.45. Thankfully, I am on track to stay within the free tier limits for everything else since I am projected to use 82.6% percent of the alloted RDS - Storage free tier usage, and less than that for all other services.

**Month-to-Date Spend by Service** contains a summary of all charges, including services which are not part of the free tier. The $0.51 charges for Route 53 are related to DNS record sets and lookups for this domain, which was registered through Route 53.

{{< linked_image img4 >}}

Clicking the **Bill Details** button generates a complete report of your usage for all AWS products in all regions. This is the best place to look if you want to know how each service is metered and how much your usage will cost.

For instance, here is how I managed to incur $0.91 in charges even though I intended to stay within the limits of the free tier:

{{< linked_image img5 >}}

I've highlighted three areas which encompass the total charges. The Route 53 charges of $0.51 can be ignored since this service is not part of the free tier, $0.50 is the monthly charge for managing the record sets for this domain amd $0.01 is for handling DNS queries for the same.

The Elastic IP charges of $0.36 demonstrate a usage scenario that is easy to avoid. The description states that these charges are for &#34;Elastic IP address not attached to a running instance&#34;. I must have stopped or terminated an EC2 instance that had a public IP address attached to it without releasing the IP address from my account.

The last charge of $0.04 appears to be related to data transfer between my EC2 instances. I&#39;m not sure how this could have been avoided and will investigate further. Here is the detail for this charge:

{{< linked_image img6 >}}

## Release Unused Elastic IPs to Avoid Free Tier Charges

As mentioned earlier, you can easily avoid being charged for unused IP addresses. The number of running instances and the number of elastic IP addresses allocated to your account are listed in the EC2 Dashboard:

{{< linked_image img7 >}}

If you have any IP addresses which are not attached to a running EC2 instance, you will be charged as shown in Figure 5. By clicking **1 Elastic IPs** (or, **Elastic IPs** under Network &#38; Security in the left-hand menu), you can manage the IP addresses allocated to your account:

{{< linked_image img8 >}}

If you have an unassociated IP address as shown in Figure 8, simply click **Actions -&#62; Release addresses** to remove it from your account:

{{< linked_image img9 >}}

You will be prompted to confirm that you really do want to remove the IP from your account:

{{< linked_image img10 >}}

## Summary

There are a few easy guidelines you can follow in order to avoid unnecessary charges when using the AWS free tier:

* **Monitor the number of and type of running EC2 instances**
  * You can run continuously 1 Linux instance and 1 Windows instance (but NOT 2 Linux or 2 Windows) without incurring any charges

* **Only launch t1.micro or t2.micro EC2 instances**
  * All other instance types are NOT included with the Free Tier and can generate substantial charges if left running.

* **Only create a single db.t2.micro RDS instance**
  * The free tier includes 750 hrs/month of RDS, same as the EC2 Linux and Windows limit

* **Release any Elastic IP addresses that are not attached to a running instance**
  * You will incur an hourly charge for any IP address that is not attached to a running EC2 instance.

* **Delete any snapshots or AMIs that are absolutely not vital**
  * This was not covered in this article, but charges will incur for having these under your account. These resources can be monitored in the EC2 Dashboard.
