---
title: "Parallelism and Asynchronous Programming Best Practices in the C# Task Parallel Library (TPL)"
slug: "parallel-async-csharp-best-practices-tpl"
aliases:
    - /2018/01/29/parallel-async-csharp-best-practices-tpl/
date: "2018-01-29"
menu_section: "blog"
categories: ["dotnet"]
---

C&#35; classes contain [a mixture of three asynchronous patterns](https://docs.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/):

* [Asynchronous Programming Model (APM)](https://docs.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/asynchronous-programming-model-apm) uses the IAsyncResult interface and requires async methods to be defined as Begin*Process* and End*Process* methods (e.g., <code>BeginSend</code>/<code>EndSend</code> methods for asynchronous Socket send operations).
* [Event-based Asynchronous Pattern (EAP)](https://docs.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/event-based-asynchronous-pattern-eap) was introduced with .NET Framework 2.0 and requires that asynchronous method names end with &#34;Async&#34; and uses event types, delegates, and custom EventArgs classes.
* [Task-based Asynchronous pattern (TAP)](https://docs.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap) was introduced in .NET Framework 4.0 and Microsoft recommends that you use TAP for new projects. TAP uses Task-objects and only requires a single asynchronous method which can be "awaited", in contrast to APM and EAP which require more than one method to achieve asynchrony. Like EAP, you should end your TAP method names with "Async".

However, if you must use APM instead of TAP, do not mix <code>async</code>/<code>await</code> code with code which calls <code>Task.Result</code> and <code>Task.Wait()</code>, your code must be <code>.Result</code>/<code>.Wait()</code> all the way down (or <code>async</code>/<code>await</code> all the way down). Combining the two makes it extremely likely that you will encounter a deadlock at some point.

The sole exception to this rule <strong>used to be</strong> the static main entry method for a console app, which would not compile if defined as <code>static async Task&#60;int&#62; Main(string[] args)</code>. If your main program relied on an async method call, you had to workaround this issue with the solution below:
{{< highlight csharp >}}static int Main(string[] args)
{
  DoAsyncWork().GetAwaiter().GetResult();

  Console.WriteLine("\nPress ENTER to continue...");
  Console.Read();
  return 0;
}

static async Task DoAsyncWork()
{
  await ExpensiveComputationAsync();
}{{< /highlight >}}

However, with the release of [C&#35; 7.1](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-7-1#async-main) your Main method can now be async:
{{< highlight csharp >}}static async Task<int> Main(string[] args)
{
  await ExpensiveComputationAsync();

  Console.WriteLine("\nPress ENTER to continue...");
  Console.Read();
  return 0;
}{{< /highlight >}}

If your main method does not return a value for the exit code, you can also define a main method that returns a Task object:
{{< highlight csharp >}}static async Task Main(string[] args)
{
  await AnotherAsyncMethod();
}{{< /highlight >}}

I will give an example of a console app that uses this new language feature in a future post. Since TAP is the recommended pattern, let's focus on best practices for async code that relies on the [Task Parallelism Library (TPL)](https://docs.microsoft.com/en-us/dotnet/standard/parallel-programming/task-parallel-library-tpl).

## TPL Best Practices

<ul>
  <li class="guideline">
    Avoid using <code>Task.Factory.StartNew</code> in almost every scenario in favor of <code>Task.Run</code>
  </li>
  <p>The reasons for this are explained in <a href="https://blog.stephencleary.com/2013/08/startnew-is-dangerous.html">this blog post by Stephen Cleary</a>. The major reason to avoid <code>StartNew</code> is because it does not understand <code>async</code> delegates. Rather than the <code>Task</code> returned by <code>StartNew</code> representing the <code>async</code> delegate, it represents only the beginning of the delegate. Please read his post for more detail and examples of the pitfalls introduced by indiscriminate use of <code>StartNew</code>.</p>
  <p>Cleary also argues that the options available with <code>StartNew</code> such as <code>LongRunning</code> and <code>PreferFairness</code> should only be used after an application has been profiled to ensure these options are actually going to have a significant impact. Typically, using <code>Task.Run</code> will provide nearly the same efficiency.
</ul>

<ul>
  <li class="guideline">
    Avoid <code>async void</code> in every scenario besides event handlers
  </li>
  <p>In <a href="https://msdn.microsoft.com/en-us/magazine/jj991977.aspx">an article from MSDN Magazine</a>, Cleary gives three guidelines for using <code>async</code>/<code>await</code>. <code>async</code> methods can only have three return types: <code>Task</code>, <code>Task<T></code> and <code>void</code>. The only reason void is allowed is to enable asynchronous event handlers. <code>async</code> event handlers are necessary but can be dangerous because exceptions thrown from async void methods can't be caught in the normal way with a <code>try</code>/<code>catch</code> block. In C#, these exceptions can be caught by using the catch-all <a href="https://msdn.microsoft.com/en-us/library/system.appdomain.unhandledexception(v=vs.110).aspx">AppDomain.UnhandledException</a></p>
  <p>Another reason to avoid <code>async void</code> is that, unlike <code>Task</code> and <code>Task<T></code> objects, methods returning <code>void</code> cannot be awaited or used with methods like<code>Task.WhenAny</code> and <code>Task.WhenAll</code>. This makes it difficult to determine the status of the method and whether it has completed. Because of these issues with exception handling and status monitoring, <code>async void</code> methods are difficult to unit test. Please see the article for detailed examples.</p>
</ul>

<ul>
  <li class="guideline">
    The final guideline is to <code>await</code> the result of <code>ConfigureAwait(false)</code> whenever you can
  </li>
  <p>Doing so is especially important when you are creating a library that will be used by client code. Consider the method below which retrieves the text of a webpage:</p>
  {{< highlight csharp >}}public async Task<string> GetUrlContentAsString()
{
    using (var httpClient = new HttpClient())
    using (var httpResonse = await httpClient.GetAsync("https://aaronluna.dev"))
    {
        return await httpResonse.Content.ReadAsStringAsync();
    }
}{{< /highlight >}}
  <p>If every client would call our method like this: <code>await GetUrlContentAsString();</code>, everything would be perfect. Of course, this will not always be the case. Now, consider what would happen if a client were to do the following: </p>
  {{< highlight csharp >}}public void GetUrlContentButton_Clicked(object sender, RoutedEventArgs e)
{
    var urlContents = GetUrlContentAsString().Result;
}{{< /highlight >}}
  <p>GUI applications have a <code>SynchronizationContext</code> that permits only one chunk of code to run at a time. When the <code>await</code> completes, it attempts to execute the remainder of the <code>async</code> method within the captured context. But that context already has a thread in it, which is (synchronously) waiting for the <code>async</code> method to complete. They’re each waiting for the other, causing a deadlock.</p>
  <p>This can be fixed by adding <code>ConfigureAwait(false)</code> to our original method wherever <code>await</code> is used:</p>
  {{< highlight csharp >}}public async Task<string> GetUrlContentAsString()
{
    using (var httpClient = new HttpClient())
    using (var httpResonse = await httpClient.GetAsync("https://aaronluna.dev").ConfigureAwait(false))
    {
        return await httpResonse.Content.ReadAsStringAsync().ConfigureAwait(false);
    }
}{{< /highlight >}}
  <p>To summarize this third guideline, you should use <code>Configure­Await(false)</code> when possible. Context-free code has better performance for GUI applications and is a useful technique for avoiding deadlocks when working with a partially async codebase. If you're creating a library that’s potentially shared with desktop applications, consider using <code>ConfigureAwait(false)</code> in the library code.</p>
</ul>
