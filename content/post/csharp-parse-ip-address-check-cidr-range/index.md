---
title: "Network Utility Methods Part 1: Parsing IP Addresses, Handling CIDR Ranges and Netmasks"
slug: "csharp-parse-ip-address-check-cidr-range"
aliases:
    - /2018/02/24/csharp-parse-ip-address-check-cidr-range/
date: "2018-02-24"
menu_section: "blog"
categories: ["dotnet"]
summary: "Parsing things from text is like death and taxes, it is an absolute certainty that there will be a requirement requiring you to accept a blob of text as an input, wave a magic wand, and voila! You produce a beautiful object as the output of your function. In this post, I demonstrate how to parse IPv4 addresses from text (single or all IPs in text), as well as additional helper methods that work with IP addresses."
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Thomas Jensen on Unsplash"
---

While creating the [TPL Socket extension methods](/2018/02/04/csharp-tpl-socket-methods/), I ended up with a library of networking functions and IP address parsing/retrieving methods. If you would like to download individual .cs files or a zip file containing the entire library, you can do so at the github link below:

<div class="center"><a href="https://gist.github.com/a-luna/bd93686ace9f6f22acf0a7032fc41777" class="eyeballs" target="_blank">Network Utilities: IP Parsing/Retrieving (C&#35; .NET Core 2.0) [gist.github.com]</a></div>

This library targets the .NET Core 2.0 framework and therefore can be used on Windows, MacOS and any Linux system where the framework is installed. All methods are explicitly designed for IPv4 addresses and return (or accept as parameters) ```System.Net.IPAddress``` objects.

## IPv4 Parsing

The first method, ```ParseSingleIPv4Address``` is less useful than the rest of the library since it requires the input string to already be in proper IPv4 format, "a.b.c.d". I am presenting it first because other methods in the library which process unformatted text eventually call ```ParseSingleIPv4Address``` to produce a ```System.Net.IPAddress``` object.

This method calls string.Split on the input string to produce 4 substrings containing the IP address bytes, each byte is validated to ensure it is within the allowed range (0,255). Conveniently, the IPAddress class contains a constructor that accepts a byte array.  This constructor is used to produce the IPAddress object represented by the input string.

```csharp
namespace AaronLuna.Common.Network
{
    using System;
    using System.Linq;
    using System.Net;

    public static partial class NetworkUtilities
    {
        public static IPAddress ParseSingleIPv4Address(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                throw new ArgumentException("Input string must not be null", input);
            }

            var addressBytesSplit = input.Trim().Split('.').ToList();
            if (addressBytesSplit.Count != 4)
            {
                throw new ArgumentException("Input string was not in valid IPV4 format \"a.b.c.d\"", input);
            }

            var addressBytes = new byte[4];
            foreach (var i in Enumerable.Range(0, addressBytesSplit.Count))
            {
                if (!int.TryParse(addressBytesSplit[i], out var parsedInt))
                {
                    throw new FormatException($"Unable to parse integer from {addressBytesSplit[i]}");
                }

                if (0 > parsedInt || parsedInt > 255)
                {
                    throw new ArgumentOutOfRangeException($"{parsedInt} not within required IP address range [0,255]");
                }
                addressBytes[i] = (byte)parsedInt;
            }
            return new IPAddress(addressBytes);
        }
    }
}
```

The next method parses all IPv4 addresses from a block of text using a regular expression. Each match is then fed into ```ParseSingleIPv4Address``` to produce a list of IPAddress objects. This method is much more useful than the previous since it accepts any text and produces a list of IPAddress objects.

```csharp
namespace AaronLuna.Common.Network
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Text.RegularExpressions;

    public static partial class NetworkUtilities
    {
        public static List<IPAddress> ParseIPv4Addresses(string input)
        {
            const string ipV4Pattern =
                @"(?:(?:1\d\d|2[0-5][0-5]|2[0-4]\d|0?[1-9]\d|0?0?\d)\.){3}(?:1\d\d|2[0-5][0-5]|2[0-4]\d|0?[1-9]\d|0?0?\d)";

            if (string.IsNullOrEmpty(input))
            {
                throw new ArgumentException("Input string must not be null", input);
            }

            var ips = new List<IPAddress>();
            try
            {
                var regex = new Regex(ipV4Pattern);
                foreach (Match match in regex.Matches(input))
                {
                    var ip = ParseSingleIPv4Address(match.Value);
                    ips.Add(ip);
                }
            }
            catch (RegexMatchTimeoutException ex)
            {
                // Handle exeption
            }

            return ips;
        }
    }
}
```

## Verify IP Address In CIDR Range

Another common scenario is checking if an IP address exists within a range defined in CIDR format. If you are unfamiliar with CIDR notation or networking concepts such as netmasking, [read this helpful primer](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking). One way to check if an IP address exists within a CIDR range is described below:

1. Perform a bitwise AND operation with the IP address in question and the netmask defined in the CIDR notation
2. Perform another bitwise AND operation with the CIDR address and netmask
3. If the results of 1 and 2 are the same value, the IP address is within the CIDR range

This can be easily demonstrated. Let's use the CIDR range **192.168.2.0/24**, which defines a network value **192.168.2.0** and associated netmask **255.255.255.0**. Let's check if two IP addresses are part of this address range. First, let's check **192.168.0.15**:

```bash
           192         168           0          15                     192         168           2           0
ip    : 1100 0000 - 1010 1000 - 0000 0000 - 0000 1111       cidr  : 1100 0000 - 1010 1000 - 0000 0010 - 0000 0000
           255         255         255           0                     255         255         255           0
mask  : 1111 1111 - 1111 1111 - 1111 1111 - 0000 0000       mask  : 1111 1111 - 1111 1111 - 1111 1111 - 0000 0000
-----------------------------------------------------       -----------------------------------------------------
           192         168           0           0                     192         168           2           0
        1100 0000 - 1010 1000 - 0000 0000 - 0000 0000               1100 0000 - 1010 1000 - 0000 0010 - 0000 0000
```

The results do not match, 192.168.0.0 != 192.168.2.0 which means 192.168.0.15 is not within the CIDR range defined by 192.168.2.0/24.

Next, let's check 192.168.2.2 using the same process:

```bash
           192         168           2           2                     192         168           2           0
ip    : 1100 0000 - 1010 1000 - 0000 0010 - 0000 0010       cidr  : 1100 0000 - 1010 1000 - 0000 0010 - 0000 0000
           255         255         255           0                     255         255         255           0
mask  : 1111 1111 - 1111 1111 - 1111 1111 - 0000 0000       mask  : 1111 1111 - 1111 1111 - 1111 1111 - 0000 0000
-----------------------------------------------------       -----------------------------------------------------
           192         168           2           0                     192         168           2           0
        1100 0000 - 1010 1000 - 0000 0010 - 0000 0000               1100 0000 - 1010 1000 - 0000 0010 - 0000 0000
```

This time the values match, meaning 192.168.2.2 is within the CIDR range defined by 192.168.2.0/24.

I created a method to perform the same process, ```IpAddressIsInCidrRange```. This function uses the ```ParseIPv4Addresses method``` to parse both the IP address to check and the network address from the CIDR mask. The number of bits that correspond to the network routing is also parsed from the CIDR mask and all values are validated to ensure they are within their allowed range.

```csharp
namespace AaronLuna.Common.Network
{
    using System;
    using System.Net;

    public static partial class NetworkUtilities
    {
        // true if ipAddress falls inside the range defined by cidrIp, example:
        // bool result = IsInCidrRange("192.168.2.3", "192.168.2.0/24"); // result = true
        public static bool IpAddressIsInRange(string checkIp, string cidrIp)
        {
            if (string.IsNullOrEmpty(checkIp))
            {
                throw new ArgumentException("Input string must not be null", checkIp);
            }

            var ipAddress = ParseIPv4Addresses(checkIp)[0];

            return IpAddressIsInRange(ipAddress, cidrIp);
        }

        public static bool IpAddressIsInRange(IPAddress checkIp, string cidrIp)
        {
            if (string.IsNullOrEmpty(cidrIp))
            {
                throw new ArgumentException("Input string must not be null", cidrIp);
            }

            var cidrAddress = ParseIPv4Addresses(cidrIp)[0];

            var parts = cidrIp.Split('/');
            if (parts.Length != 2)
            {
                throw new FormatException($"cidrMask was not in the correct format:\nExpected: a.b.c.d/n\nActual: {cidrIp}");
            }

            if (!Int32.TryParse(parts[1], out var netmaskBitCount))
            {
                throw new FormatException($"Unable to parse netmask bit count from {cidrIp}");
            }

            if (0 > netmaskBitCount || netmaskBitCount > 32)
            {
                throw new ArgumentOutOfRangeException($"Netmask bit count value of {netmaskBitCount} is invalid, must be in range 0-32");
            }

            var ipAddressBytes = BitConverter.ToInt32(checkIp.GetAddressBytes(), 0);
            var cidrAddressBytes = BitConverter.ToInt32(cidrAddress.GetAddressBytes(), 0);
            var cidrMaskBytes = IPAddress.HostToNetworkOrder(-1 << (32 - netmaskBitCount));

            var ipIsInRange = (ipAddressBytes &#38; cidrMaskBytes) == (cidrAddressBytes &#38; cidrMaskBytes);

            return ipIsInRange;
        }
    }
}
```

This function is used primarily within my code to check if an IP address is within one of the CIDR blocks reserved for private networks, i.e. check if a given address is a public or private IP address. I created a method named ```IpAddressIsInPrivateAddressSpace``` with overloads that accept either a string value or IPAddress object:

```csharp
namespace AaronLuna.Common.Network
{
    using System.Net;

    public static partial class NetworkUtilities
    {
        public const string CidrPrivateAddressBlockA = "10.0.0.0/8";
        public const string CidrPrivateAddressBlockB = "172.16.0.0/12";
        public const string CidrPrivateAddressBlockC = "192.168.0.0/16";

        public static bool IpAddressIsWithinPrivateAddressSpace(string ipv4string)
        {
            var checkIp = ParseIPv4Addresses(ipv4string)[0];

            return IpAddressIsInPrivateAddressSpace(checkIp);
        }

        public static bool IpAddressIsInPrivateAddressSpace(IPAddress ipAddress)
        {
            var inPrivateBlockA = IpAddressIsInCidrRange(ipAddress, CidrPrivateAddressBlockA);
            var inPrivateBlockB = IpAddressIsInCidrRange(ipAddress, CidrPrivateAddressBlockB);
            var inPrivateBlockC = IpAddressIsInCidrRange(ipAddress, CidrPrivateAddressBlockC);

            return inPrivateBlockA || inPrivateBlockB || inPrivateBlockC;
        }
    }
}
```

## Conclusion

I hope these methods are helpful to you, please [download the source code from github](https://gist.github.com/a-luna/bd93686ace9f6f22acf0a7032fc41777) and let me know if you have any suggestions or improvements in the comments. In Part 2 I will provide additional Network functions for retrieving public and local IP addresses associated with the machine executing the code, including methods which require and do not require internet access.
