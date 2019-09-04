---
title: "Network Utility Methods Part 2: Retrieving Local and Public IP Addresses (C# .NET Core)"
slug: "csharp-retrieve-local-public-ip-address"
aliases:
    - /2018/03/16/csharp-retrieve-local-public-ip-address/
date: "2018-03-16"
categories: ["dotnet"]
---

Let's finish off the [NetworkUtilities class from the previous post](/2018/02/24/csharp-parse-ip-address-check-cidr-range/) with a set of methods that retrieve the private (local) and public (external) IP addresses of the local machine. All source files can be downloaded individually as .cs files or as a single zip file containing the entire class at the gist link below:

<div class="center">
    <a href="https://gist.github.com/a-luna/bd93686ace9f6f22acf0a7032fc41777" class="eyeballs" target="_blank">Network Utilities: IP Parsing/Retrieving (C&#35; .NET Core 2.0) [gist.github.com]</a>
</div>

## Retrieve Local IP Address (Requires Internet)

The method below, ```GetLocalIPv4AddressRequiresInternet```, retrieves the local IP address, and does so in a fairly clever way (IMHO). Internet access is required because the method uses a ```System.Net.Socket``` object to connect to [Google's Public DNS service](https://developers.google.com/speed/public-dns/docs/intro). When the connection is made, the Socket's LocalEndPoint property contains the local IP address of our machine. Our goal of retrieving the local IP address is handled, essesntially, with just 2 lines of code:
{{< highlight csharp >}}namespace AaronLuna.Common.Network
{
    using System.Net;
    using System.Net.Sockets;

    public static partial class NetworkUtilities
    {
        public static IPAddress GetLocalIPv4AddressRequiresInternet()
        {
            var localIp = IPAddress.None;
            try
            {
                using (var socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0))
                {
                    // Connect socket to Google's Public DNS service
                    socket.Connect("8.8.8.8", 65530);
                    if (!(socket.LocalEndPoint is IPEndPoint endPoint))
                    {
                        throw new InvalidOperationException($"Error occurred casting {socket.LocalEndPoint} to IPEndPoint");
                    }
                    localIp = endPoint.Address;
                }
            }
            catch (SocketException ex)
            {
                // Handle exception
            }

            return localIp;
        }
    }
}{{< /highlight >}}

## Retrieve Local IP Address Without Internet

We have to do a bit more work if we decide that relying on an external service is not an option. Obviously, if there is only a single network adapter on our machine the task is easier but this is often not the case.

So, where do we start in this scenario? The ```System.Net.NetworkInformation``` namespace contains the static method [NetworkInterface.GetAllNetworkInterfaces](https://docs.microsoft.com/en-us/dotnet/api/system.net.networkinformation.networkinterface.getallnetworkinterfaces?view=netframework-4.7.1#System_Net_NetworkInformation_NetworkInterface_GetAllNetworkInterfaces) which returns an array of objects describing every network interface available on the current computer. Then, with this information and a LINQ query, I create a list containing all local IPv4 addresses.

You may have noticed that ```GetLocalIpAddressNoInternet``` requires a string parameter named localNetworkCidrIp. This is the LAN configuration in CIDR notation. If you are unfamiliar with CIDR notation or basic networking concepts, please read [this helpful article from DigitalOcean](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking).

In the previous post I explicitly walked through the process of checking if an IP address exists within the address space defined by a CIDR block. This process is implemented by the ```IpAddressIsInCidrRange``` method.

Each local IP address is checked to see if it exists within the LAN specified by the cidrMask, and the first matching address is returned as the local IP address:
{{< highlight csharp >}}namespace AaronLuna.Common.Network
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Net.NetworkInformation;
    using System.Net.Sockets;

    public static partial class NetworkUtilities
    {
        // This method uses the address range defined by localNetworkCidrIp to
        // determine which local IP should be used. The CIDR IP must be in correct
        // format: a.b.c.d/n. For example, if your LAN is setup to allow 254 hosts
        // and the router's address is 192.168.2.1, the correct value for
        // localNetworkCidrIp would be "192.168.2.0/24"
        public static IPAddress GetLocalIpAddressNoInternet(string localNetworkCidrIp)
        {
            var localIps = GetLocalIPv4AddressList();
            if (localIps.Count == 1)
            {
                return localIps[0];
            }

            foreach (var ip in localIps)
            {
                if (IpAddressIsInRange(ip, localNetworkCidrIp))
                {
                    return ip;
                }
            }

            // If no IP addresses match CIDR IP or none were found, return 255.255.255.255
            return IPAddress.None;
        }

        public static List<IPAddress> GetLocalIPv4AddressList()
        {
            var localIps = new List<IPAddress>();
            foreach (var nic in NetworkInterface.GetAllNetworkInterfaces())
            {
                var ips =
                    nic.GetIPProperties().UnicastAddresses
                        .Select(uni => uni.Address)
                        .Where(ip => ip.AddressFamily == AddressFamily.InterNetwork).ToList();

                localIps.AddRange(ips);
            }

            return localIps;
        }
    }
}{{< /highlight >}}

## Retrieve Public IP Address (Requires Internet)

I was unable to determine any way to get the public IP without relying on an external system, and this makes sense since the public IP is really the address of the router and not the local machine. I thought that it might be possible to get the public IP from the router itself through telnet, but the process would vary greatly for each router and I couldn't even determine if it was possible to telnet into my router without installing a custom firmware.

The method below, ```GetPublicIPv4AddressAsync```, is extremely reliable and fast. The website which tells us our public IP address does not serve up an HTML doc that requires parsing, only a string containing our public IP:
{{< highlight csharp >}}namespace AaronLuna.Common.Network
{
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;

    public static partial class NetworkUtilities
    {
        public static async Task<IPAddress> GetPublicIPv4AddressAsync()
        {
            var urlContent =
              await GetUrlContentAsStringAsync("http://ipv4.icanhazip.com/").ConfigureAwait(false);

            return ParseSingleIPv4Address(urlContent);
        }

        public static async Task<string> GetUrlContentAsStringAsync(string url)
        {
            var urlContent = string.Empty;
            try
            {
                using (var httpClient = new HttpClient())
                using (var httpResonse = await httpClient.GetAsync(url).ConfigureAwait(false))
                {
                    urlContent =
                      await httpResonse.Content.ReadAsStringAsync().ConfigureAwait(false);
                }
            }
            catch (HttpRequestException ex)
            {
                // Handle exception
            }

            return urlContent;
        }
    }
}{{< /highlight >}}

## Conclusion

I hope these methods are helpful to you, please [download the source code from github](https://gist.github.com/a-luna/bd93686ace9f6f22acf0a7032fc41777) and let me know if you have any suggestions or improvements in the comments.
