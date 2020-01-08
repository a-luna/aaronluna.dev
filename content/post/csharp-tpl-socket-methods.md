---
title: "Task-based Socket Extension Methods (C# TPL)"
slug: "csharp-tpl-socket-methods"
aliases:
    - /2018/02/04/csharp-tpl-socket-methods/
date: "2018-02-04"
menu_section: "blog"
categories: ["dotnet"]
---

The **Task-based Asynchronous Pattern (TAP)** is the recommended way to write asynchronous code for .NET applications. [As I explained in my last post](/2018/01/29/parallel-async-csharp-best-practices-tpl/), TAP is intended to replace the Asynchronous Programming Model (APM) and the Event-based Asynchronous Pattern (EAP), however many classes in the .NET framework still use these older patterns. Fortunately, these can be turned into TAP-style "awaitable" methods with relative ease. By doing so, you reap the benefits that come from working with Task (and Task<T>) objects. In this post, I will convert a set of APM-style methods from the System.Net.Sockets namespace to TAP methods and provide an end-to-end example of how to use them in a generic TCP socket server.

All of the code examples in this post can be downloaded as individual .cs files at my gist link below:

<div class="center"><a href="https://gist.github.com/a-luna/e5f275de9a5b111f08b5e38be7042f04" class="eyeballs" target="_blank">Task-based Socket Extension Methods (C&#35; TPL) [gist.github.com]</a></div>

I'll go through the various Socket methods in the order they would occur for a simple scenario: Connect to a remote host and send a short text message that is received and read by the server over TCP. This code also uses a Result object for all return values. The code for the Result class will also be covered.

## Connect

We begin with the assumption that a remote end point exists, defined by an IP address and port number, that is bound and listening for incoming connetions with a TCP socket. We will refer to this side of our example as the **server**. The other side which attempts to connect to this end point by calling ```ConnectWithTimeoutAsync``` will be refered to as the **client**. ```ConnectWithTimeoutAsync``` is an extension method that wraps the BeginConnect/EndConnect methods of the Socket class and returns a Task<Result> object:
{{< highlight csharp >}}namespace AaronLuna.TplSockets
{
    using System;
    using System.Net.Sockets;
    using System.Threading.Tasks;
    using AaronLuna.Common.Result;

    public static partial class TplSocketExtensions
    {
        public static async Task<Result> ConnectWithTimeoutAsync(
            this Socket socket,
            string remoteIpAddress,
            int port,
            int timeoutMs)
        {
            try
            {
                var connectTask = Task.Factory.FromAsync(
                    socket.BeginConnect,
                    socket.EndConnect,
                    remoteIpAddress,
                    port,
                    null);

                if (connectTask == await Task.WhenAny(connectTask, Task.Delay(timeoutMs)).ConfigureAwait(false))
                {
                    await connectTask.ConfigureAwait(false);
                }
                else
                {
                    throw new TimeoutException();
                }
            }
            catch (SocketException ex)
            {
                return Result.Fail($"{ex.Message} ({ex.GetType()})");
            }
            catch (TimeoutException ex)
            {
                return Result.Fail($"{ex.Message} ({ex.GetType()})");
            }

            return Result.Ok();
        }
    }
}{{< /highlight >}}

Note that this method requires a timeout value. The timeout behavior is achieved through use of Task.WhenAny. Since the same timeout behavior has been applied to all of the socket methods (where appropriate) let's take a closer look at how this is done:
{{< highlight csharp >}}if (connectTask == await Task.WhenAny(connectTask, Task.Delay(timeoutMs)).ConfigureAwait(false))
{
    await connectTask.ConfigureAwait(false);
}
else
{
    throw new TimeoutException();
}{{< /highlight >}}

We pass 2 tasks into Task.WhenAny: connectTask and Task.Delay(timeoutMs). Whichever one of these tasks completes first will be returned. Let's say timeoutMs = 5000, which is a timeout value of five seconds. If the task returned from Task.WhenAny is connectTask, the connection was successful and we await the result. However if connectTask is not returned, that means our socket was unable to connect to the endpoint after trying for five seconds and a TimeoutException is thrown. The exception is handled by calling Result.Fail(string error), a static method which returns an instance of Result with Success = false and a string containing the Message property of the exception.

## Result Class, Explained

The Result<T> class encapsulates all information pertaining to the outcome of a task, conveniently providing an error message in case the task failed and an object instance in case the task succeeded.

I was introduced to the Result class by [this blog post](http://enterprisecraftsmanship.com/2015/03/20/functional-c-handling-failures-input-errors/) by Vladimir Khorikov, part of a series that applies Functional programming techniques to C#. He has made the code available on [github](https://github.com/vkhorikov/CSharpFunctionalExtensions), but I am still using the basic version below:
{{< highlight csharp >}}namespace AaronLuna.Common.Result
{
    public class Result
    {
        protected Result(bool success, string error)
        {
            Success = success;
            Error = error;
        }

        public bool Success { get; }
        public string Error { get; }

        public bool Failure => !Success;

        public static Result Fail(string message)
        {
            return new Result(false, message);
        }

        public static Result<T> Fail<T>(string message)
        {
            return new Result<T>(default(T), false, message);
        }

        public static Result Ok()
        {
            return new Result(true, string.Empty);
        }

        public static Result<T> Ok<T>(T value)
        {
            return new Result<T>(value, true, string.Empty);
        }

        public static Result Combine(params Result[] results)
        {
            foreach (Result result in results)
            {
                if (result.Failure)
                {
                    return result;
                }
            }

            return Ok();
        }
    }

    public class Result<T> : Result
    {
        protected internal Result(T value, bool success, string error)
            : base(success, error)
        {
            Value = value;
        }

        public T Value { get; }
    }
}{{< /highlight >}}

## Accept

Ok, back to our socket example. On the other side of our connectTask, the server is waiting for incoming connections inside the ```AcceptAsync``` method, which wraps the BeginAccept/EndAcceppt method pair:
{{< highlight csharp >}}namespace AaronLuna.TplSockets
{
    using System;
    using System.Net.Sockets;
    using System.Threading.Tasks;
    using AaronLuna.Common.Result;

    public static partial class TplSocketExtensions
    {
        public static async Task<Result<Socket>> AcceptAsync(this Socket socket)
        {
            Socket transferSocket;
            try
            {
                var acceptTask = Task<Socket>.Factory.FromAsync(socket.BeginAccept, socket.EndAccept, null);
                transferSocket = await acceptTask.ConfigureAwait(false);
            }
            catch (SocketException ex)
            {
                return Result.Fail<Socket>($"{ex.Message} ({ex.GetType()})");
            }
            catch (InvalidOperationException ex)
            {
                return Result.Fail<Socket>($"{ex.Message} ({ex.GetType()})");
            }

            return Result.Ok(transferSocket);
        }
    }
}{{< /highlight >}}

## Receive

After ```ConnectWithTimeoutAsync``` and ```AcceptAsync``` have successfully ran to completion, the server will have a new Socket instance, which is named transferSocket in the code example above. The server will use this socket to receive data from the client. I created two diferent ```ReceiveAsync``` methods, one with the same timeout behavior as ```ConnectWithTimeoutAsync``` and one without:
{{< highlight csharp >}}namespace AaronLuna.TplSockets
{
    using System;
    using System.Net.Sockets;
    using System.Threading.Tasks;
    using AaronLuna.Common.Result;

    public static partial class TplSocketExtensions
    {

        public static async Task<Result<int>> ReceiveWithTimeoutAsync(
            this Socket socket,
            byte[] buffer,
            int offset,
            int size,
            SocketFlags socketFlags,
            int timeoutMs)
        {
            int bytesReceived;
            try
            {
                var asyncResult = socket.BeginReceive(buffer, offset, size, socketFlags, null, null);
                var receiveTask = Task<int>.Factory.FromAsync(asyncResult, _ => socket.EndReceive(asyncResult));

                if (receiveTask == await Task.WhenAny(receiveTask, Task.Delay(timeoutMs)).ConfigureAwait(false))
                {
                    bytesReceived = await receiveTask.ConfigureAwait(false);
                }
                else
                {
                    throw new TimeoutException();
                }
            }
            catch (SocketException ex)
            {
                return Result.Fail<int>($"{ex.Message} ({ex.GetType()})");
            }
            catch (TimeoutException ex)
            {
                return Result.Fail<int>($"{ex.Message} ({ex.GetType()})");
            }

            return Result.Ok(bytesReceived);
        }

        public static async Task<Result<int>> ReceiveAsync(
            this Socket socket,
            byte[] buffer,
            int offset,
            int size,
            SocketFlags socketFlags)
        {
            int bytesReceived;
            try
            {
                var asyncResult = socket.BeginReceive(buffer, offset, size, socketFlags, null, null);
                bytesReceived = await Task<int>.Factory.FromAsync(asyncResult, _ => socket.EndReceive(asyncResult));
            }
            catch (SocketException ex)
            {
                return Result.Fail<int>($"{ex.Message} ({ex.GetType()})");
            }

            return Result.Ok(bytesReceived);
        }
    }
}{{< /highlight >}}

## Send

On the client side, I created an equivalent ```SendWithTimeoutAsync``` method, but did not create the version without the timeout. My reasoning for this is that a Send operation is an active process while a Receive operation is a passive one. There are situations where a socket may be waiting for a Send operation on the other side to begin, without any way to predict how long it's going to take until receiving data. In those cases a timeout would not be helpful. This is obviously not the case with a Send operation:
{{< highlight csharp >}}namespace AaronLuna.TplSockets
{
    using System;
    using System.Net.Sockets;
    using System.Threading.Tasks;
    using AaronLuna.Common.Result;

    public static partial class TplSocketExtensions
    {
        public static async Task<Result<int>> SendWithTimeoutAsync(
            this Socket socket,
            byte[] buffer,
            int offset,
            int size,
            SocketFlags socketFlags,
            int timeoutMs)
        {
            int bytesSent;
            try
            {
                var asyncResult = socket.BeginSend(buffer, offset, size, socketFlags, null, null);
                var sendBytesTask = Task<int>.Factory.FromAsync(asyncResult, _ => socket.EndSend(asyncResult));

                if (sendBytesTask != await Task.WhenAny(sendBytesTask, Task.Delay(timeoutMs)).ConfigureAwait(false))
                {
                    throw new TimeoutException();
                }

                bytesSent = await sendBytesTask;
            }
            catch (SocketException ex)
            {
                return Result.Fail<int>($"{ex.Message} ({ex.GetType()})");
            }
            catch (TimeoutException ex)
            {
                return Result.Fail<int>($"{ex.Message} ({ex.GetType()})");
            }

            return Result.Ok(bytesSent);
        }
    }
}{{< /highlight >}}

## Client/Server Example

It's time to put these pieces together and demonstrate how to use these methods and the Result objects:

{{< highlight csharp >}}namespace AaronLuna.TplSockets
{
    using System.Linq;
    using System.Net;
    using System.Net.Sockets;
    using System.Text;
    using System.Threading.Tasks;
    using AaronLuna.Common.Result;

    public class TplSocketExample
    {
        const int BufferSize = 8 * 1024;
        const int ConnectTimeoutMs = 3000;
        const int ReceiveTimeoutMs = 3000;
        const int SendTimeoutMs = 3000;

        Socket _listenSocket;
        Socket _clientSocket;
        Socket _transferSocket;

        public async Task<Result> SendAndReceiveTextMesageAsync()
        {
            _listenSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            _clientSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            _transferSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

            var serverPort = 7003;
            var ipHostInfo = Dns.GetHostEntry(Dns.GetHostName());

            var ipAddress =
            ipHostInfo.AddressList.Select(ip => ip)
             .FirstOrDefault(ip => ip.AddressFamily == AddressFamily.InterNetwork);

            var ipEndPoint = new IPEndPoint(ipAddress, serverPort);

            // Step 1: Bind a socket to a local TCP port and Listen for incoming connections
            _listenSocket.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, true);
            _listenSocket.Bind(ipEndPoint);
            _listenSocket.Listen(5);

            // Step 2: Create a Task and accept the next incoming connection (ServerAcceptTask)
            // NOTE: The call to AcceptConnectionTask is not awaited, therefore this method
            // continues executing
            var acceptTask = Task.Run(AcceptConnectionTask);

            // Step 3: With another socket, connect to the bound socket and await the result (ClientConnectTask)
            var connectResult =
                await _clientSocket.ConnectWithTimeoutAsync(
                    ipAddress.ToString(),
                    serverPort,
                    ConnectTimeoutMs).ConfigureAwait(false);

            // Step 4: Await the result of the ServerAcceptTask
            var acceptResult = await acceptTask.ConfigureAwait(false);

            // If either ServerAcceptTask or ClientConnectTask did not complete successfully,stop execution and report the error
            if (Result.Combine(acceptResult, connectResult).Failure)
            {
                return Result.Fail("There was an error connecting to the server/accepting connection from the client");
            }

            // Step 5: Store the transfer socket if ServerAcceptTask was successful
            _transferSocket = acceptResult.Value;

            // Step 6: Create a Task and recieve data from the transfer socket (ServerReceiveBytesTask)
            // NOTE: The call to ReceiveMessageAsync is not awaited, therefore this method
            // continues executing
            var receiveTask = Task.Run(ReceiveMessageAsync);

            // Step 7: Encode a string message before sending it to the server
            var messageToSend = "this is a text message from a socket";
            var messageData = Encoding.ASCII.GetBytes(messageToSend);

            // Step 8: Send the message data to the server and await the result (ClientSendBytesTask)
            var sendResult =
                await _clientSocket.SendWithTimeoutAsync(
                    messageData,
                    0,
                    messageData.Length,
                    0,
                    SendTimeoutMs).ConfigureAwait(false);

            // Step 9: Await the result of ServerReceiveBytesTask
            var receiveResult = await receiveTask.ConfigureAwait(false);

            // Step 10: If either ServerReceiveBytesTask or ClientSendBytesTask did not complete successfully,stop execution and report the error
            if (Result.Combine(sendResult, receiveResult).Failure)
            {
                return Result.Fail("There was an error sending/receiving data from the client");
            }

            // Step 11: Compare the string that was received to what was sent, report an error if not matching
            var messageReceived = receiveResult.Value;
            if (messageToSend != messageReceived)
            {
                return Result.Fail("Error: Message received from client did not match what was sent");
            }

            // Step 12: Report the entire task was successful since all subtasks were successful
            return Result.Ok();
        }

        async Task<Result<Socket>> AcceptConnectionTask()
        {
            return await _listenSocket.AcceptAsync().ConfigureAwait(false);
        }

        async Task<Result<string>> ReceiveMessageAsync()
        {
            var message = string.Empty;
            var buffer = new byte[BufferSize];

            var receiveResult =
                await _transferSocket.ReceiveWithTimeoutAsync(
                    buffer,
                    0,
                    BufferSize,
                    0,
                    ReceiveTimeoutMs).ConfigureAwait(false);

            var bytesReceived = receiveResult.Value;
            if (bytesReceived == 0)
            {
                return Result.Fail<string>("Error reading message from client, no data was received");
            }

            message = Encoding.ASCII.GetString(buffer, 0, bytesReceived);

            return Result.Ok(message);
        }
    }
}{{< /highlight >}}

## Summary

As stated at the beginning of this post, all of the source code for these extension methods and the example can be found at the gist embedded below:

<div class="center"><a href="https://gist.github.com/a-luna/e5f275de9a5b111f08b5e38be7042f04" class="eyeballs" target="_blank">Task-based Socket Extension Methods (C&#35; TPL) [gist.github.com]</a></div>
