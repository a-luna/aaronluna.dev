---
title: "Casting and Type Conversion Best Practices in C#"
slug: "casting-type-conversion-best-practices-c-sharp"
aliases:
    - /2018/01/19/casting-type-conversion-best-practices-c-sharp/
date: "2018-01-19"
menu_section: "blog"
categories: ["dotnet"]
---

Type casting or type converting is a common occurrance in C&#35;, and as the language has evolved new methods and operators have been introduced that handle type conversion in varying ways.

Over the years, I have built up my own set of best practices and decided to get them out of my head with the goal of soliciting feedback and hopefully refining them further. Before laying them out, I'll cover the basics of type casting and type conversion in C&#35;.

* **Type Casting vs Type Conversion**
  * "Casting" is only valid for reference types, value types are __converted__
  * The cast operator attempts to cast an object to a specific type, and throws an exception if it fails
  * Although `(long)some_integer` has the same syntax as a cast operation, the integer is actually being converted to a long

* **Upcasting vs Downcasting**
  * Upcasting = Derived Class &#61;&#62; Base Class
    * Upcasting is implicit (cast operator is not required)
      <p>`Animal animal = dog;`</p>
  * Downcasting = Base Class &#61;&#62; Derived Class
    * Downcasting requires a cast operator (explicit)
      <p>`Dog dog = (Dog)animal;`</p>

* **is vs as Operators**
  * The `is` operator checks the compatibility of an object with a given type and returns the result as a Boolean (True Or False)
  * The `as` operator attempts to cast an object to a specific type, and returns null if it fails

## Casting/Type Conversion Best Practices

If 'randomObject' really 'should' be an instance 'TargetType', i.e. if it's not, that means there's a bug, then casting is the right solution. Throwing an exception immediately means that no more work is done under incorrect assumptions, and the exception correctly shows the type of bug. **(cast only)**

{{< highlight cs >}}
// This will throw an exception if randomObject is non-null
// and refers to an object of an incompatible type.
//"Cast only" is the best method if that's the behavior you want.
TargetType convertedRandomObject = (TargetType) randomObject;
{{< /highlight >}}

If `randomObject` **might** be an instance of `TargetType` and `TargetType` is a reference type, then use **as-and-null-check:**

{{< highlight cs >}}
TargetType convertedRandomObject = randomObject as TargetType;
if (convertedRandomObject != null)
{
    // Do stuff with convertedRandomObject
}
{{< /highlight >}}

If `randomObject` **might** be an instance `TargetType` and `TargetType` is a value type, then we can't use `as` with `TargetType` itself, but we can use a nullable type:

{{< highlight cs >}}
TargetType? convertedRandomObject = randomObject as TargetType?;
if (convertedRandomObject != null)
{
    // Do stuff with convertedRandomObject.Value
}
{{< /highlight >}}

If you really don't need the converted value, but you just need to know whether `randomObject` **is** an instance of `TargetType`, then use the `is` operator . In this case it doesn't matter whether `TargetType` is a reference type or a value type.

Don't do this:

{{< highlight cs >}}
// Bad code - checks type twice for no reason
if (randomObject is TargetType)
{
    TargetType foo = (TargetType) randomObject;
    // Do something with foo
}
{{< /highlight >}}

**is-and-cast** (or **is-and-as**) are both potentially unsafe, as the type of `randomObject` may change due to another thread between the test and the cast (e.g., `randomObject` is a field or property rather than a local variable)

**as-and-null-check** gives a better separation of concerns. We have one statement which attempts a conversion, and then one statement which uses the result. The **is-and-cast** or **is-and-as** performs a test and **then** another attempt to convert the value.

However, all of the above guidelines are moot with C# 7.0, where [pattern matching](https://docs.microsoft.com/en-us/dotnet/csharp/pattern-matching) has largely replaced the as operator. It is now possible to write:

{{< highlight cs >}}
if (randomObject is TargetType tt)
{
    // Use tt here
}
{{< /highlight >}}

This new construct enables cleaner syntax and eliminates the possibility of `randomObject`'s type being changed by another thread and resolves the issue where `randomObject`'s type is needlessly checked twice.
