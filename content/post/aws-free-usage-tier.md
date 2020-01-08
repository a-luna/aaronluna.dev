---
title: "AWS Free Usage Tier: An Incredibly Useful and Generous Offering"
slug: "aws-free-usage-tier"
aliases:
    - /2018/01/13/aws-free-usage-tier/
date: "2018-01-13"
menu_section: "blog"
categories: ["AWS"]
---

For the past 2 months, I have been learning Linux server administration, PHP/JavaScript and other skills such as DevOps tools/processes. By far, the most valuable resource I have used to develop these skills is the Amazon Web Services (AWS) Free Usage Tier that is offered to anyone for a period of one year. Well, anyone with a credit card to be more precise.

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/compare_cloud_costs/aws_product_categories.jpeg" width="700" link="https://aws.amazon.com/free/" alt="AWS Product Categories" caption="Figure 1: List of AWS product categories, vast and varied">}}

AWS comprises an overwhelming number of products and services. Take a look at [the list here](https://aws.amazon.com/free/). Besides the expected categories like "compute", "database", or "developer tools", the free tier also provides access to many services that I was unaware of:

* [Voice and Chat Textbot Builders](https://aws.amazon.com/lex/?ft=n)
* [Deep learning-based facial image recognition](https://aws.amazon.com/rekognition/?ft=n)
* [Virtual Reality (VR) and Augmented Reality (AR) development platform](https://aws.amazon.com/sumerian/?ft=n)
* A variety of AI products such as [natural language processing](https://aws.amazon.com/comprehend/?ft=n), [language translation](https://aws.amazon.com/translate/?ft=n), [text-to-speech](https://aws.amazon.com/polly/?ft=n) and [vice versa](https://aws.amazon.com/transcribe/?ft=n)

However, &#34;free&#34; in this sense does not mean unlimited. Each service has a defined limit which when exceeded will begin billing at the service&#39;s normal rate (the limit for most services resets each month). The overage is invoiced monthly and charged to the credit card you provided at signup.

Many of the products remain &#34;free&#34; after the 1 year term is over. The most useful of which (to me) is the [CodeCommit](https://aws.amazon.com/codecommit/) service. I built and deployed a [Gogs](https://gogs.io) EC2 instance which I planned to use as a private code repository for my personal projects. I quickly took it down when I learned that AWS offers the service completely free-to-use, forever, for up to 5 user accounts. There are monthly limits on the size of your repositories and frequency of git requests, but these will never be reached by my usage.

Amazon provides this free tier to allow users to gain experience with the AWS platform, with the obvious goal of encouraging adoption of their products in large-scale applications and organizations the user belongs to. On each AWS product page, Amazon boasts of such customers: the WaPo utilizes the [Comprehend](https://aws.amazon.com/comprehend/customers/) service, NASA has leveraged [Lex](https://aws.amazon.com/lex/?ft=n) and Zillow uses [Lambda](https://aws.amazon.com/lex/?ft=n).

Just as impresively, I used multiple Amazon services to host this website. I registered my domain and configured the associated record sets through [Route 53](https://aws.amazon.com/route53/) (This product does not have a free offering). I installed the Wordpress core on a t2.micro [EC2 instance](https://aws.amazon.com/ec2/) and deployed the Wordpress database on an [RDS instance](https://aws.amazon.com/rds/). I store site assets such as image files in a [S3 bucket](https://aws.amazon.com/s3/). My RDS instance can only communicate with the Wordpress EC2 server and is isolated from any outside web traffic thanks to [custom subnet configurations](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Tutorials.WebServerDB.CreateVPC.html)made in my [Virtual Private Cloud](https://aws.amazon.com/vpc/) (VPC).

In my next post, I will give recommendations on how to manage billing for your AWS account and how to avoid going over the free tier limits when hosting a website.
