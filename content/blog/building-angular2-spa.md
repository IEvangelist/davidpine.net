+++
author = "David Pine"
categories = ["ASP.NET Core"]
date = "2016-01-15"
description = ""
featured = "pic03.jpg"
featuredalt = "Pic 3"
featuredpath = "date"
linktitle = ""
draft = true
title = "Building an Angular2 SPA with ASP.NET Core"
type = "post"

+++

<h1>Overview</h1>
The purpose of this post is to establish ourselves with a working environment geared towards development on <strong>ASP.NET Core 1.0</strong> through <strong>Visual Studio 2015</strong>. I will walk through creating an <strong>Angular2 Single Page Application</strong> with <strong>MVC 6</strong>, <strong>Web <abbr title="Application Programming Interface">API</abbr> 2</strong> and <strong>TypeScript</strong>. The sample application is available {{< url-link "here " "https://github.com/IEvangelist/MvcAngular2.git" >}}on my github page.<!--more-->
<h3>A quick nod of approval before we get started</h3>
As a community of early adopters it is gratifying to see collaborations betwixt <strong>Microsoft</strong> and <strong>Google</strong>, finally "we can all get along".
<ul>
	<li><strong>{{< url-link "Angular2" "https://angular.io/" >}}</strong> is built with {{< url-link "<strong>TypeScript</strong>" "https://www.typescriptlang.org/" >}}</li>
	<li>{{< url-link "<strong>Visual Studio Code</strong> " "https://www.visualstudio.com/" >}}is built on <strong>{{< url-link "Chromium" "https://www.chromium.org/Home" >}}</strong>.</li>
</ul>
These collaborations are exciting and certainly influential - my only hope is that we see more of these collaborations and other large industry leaders follow their example!

---

<h1>Prerequisites</h1>
There are several things that you'll need before we dive into writing code. We should take a moment to familiarize ourselves with some of the new core concepts as well as ensuring that we have our <abbr title="Integrated Development Environment">IDE</abbr> correctly installed and configured.
<h2>Install Visual Studio 2015</h2>
<img class=" size-full wp-image-20 alignleft" style="background-color:#5c2d91;border:10px solid #5C2D91;border-radius:10px;" src="https://ievangelistblog.files.wordpress.com/2015/12/vs2015.png" alt="vs2015" width="105" height="105" />It all starts with your favorite <abbr title="Integrated Development Environment">IDE</abbr>, mine being <strong>VS</strong> (of course, if that wasn't obvious). You can download the community version of it {{< url-link "here" "https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx" >}}.  The nice thing about the community version is that it is entirely free!  Once you have it installed you're ready to begin setting up your web solution. Finally, as a prerequisite you should at the very least be familiar with <strong>.NET MVC</strong>.
<h3>A few noteworthy mentions</h3>
<h4><strong>project.json</strong></h4>
The <code>project.json</code> is the replacement for the <code>*.csproj</code> file.  The main difference is the file format - you've probably been noticing the shift away from <strong>XML</strong> and the movement to the preferred <strong>JSON</strong> format as it is superior.
<h4><strong>wwwroot</strong></h4>
The <strong>wwwroot</strong> folder now acts as the directory in which your web site will be served from.  Instead of your entire solution directory acting as the file structure, now this single folder and its sub directories act as the root of the application.
<h4><strong>npm</strong></h4>
<img class=" size-thumbnail wp-image-26 alignleft" src="https://ievangelistblog.files.wordpress.com/2015/12/npm-logo.png?w=150" alt="npm-logo" width="150" height="58" />While <strong>Node.js</strong> and its corresponding package manager, namely "<strong>npm</strong>" are part of the install for <strong>Visual Studio 2015</strong> - it installs with <code>1.4.9</code> which is unfortunately an outdated version .  <strong>Angular2</strong> might play nicer with a later version of <strong>npm</strong>.
<blockquote><strong>" Node.js'</strong> package ecosystem, <a>npm</a>, is the largest ecosystem of open source libraries in the world!</blockquote>
Let's address this now, so that we do not run into issues once we start writing code. Install the latest version of <strong>Node.js</strong> {{< url-link "here" "https://nodejs.org/en/" >}}. Once installed navigate to the following directory:
<pre>C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\IDE\Extensions\Microsoft\Web Tools\External\</pre>
Open the <code>npm.cmd</code> file in your favorite text editor (running as <em>Administrator</em>) and replace the contents of this file with the following:
<pre><code>@"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" %*</code></pre>
Now <strong>Visual Studio 2015</strong> will utilize the <strong>npm</strong> version that was installed from the aforementioned steps.

---

<h1>ASP.NET Core 1.0</h1>
At this point you are probably wondering, "what is <strong>ASP.NET Core 1.0</strong> and what happened to <strong>ASP.NET 5</strong>?". These are both great questions, and to answer them ASP.NET 5 has been renamed more appropriately. Since it was completely rewritten from the ground up, why not rename and version it? For the remainder of this tutorial, if you happen to see reference to <strong>ASP.NET 5</strong> think of it as <strong>ASP.NET Core 1.0</strong> and use them interchangeably for now. But don't take my word for it, check out Scott Hanselman's post "{{< url-link "ASP.NET 5 is dead" "https://www.hanselman.com/blog/ASPNET5IsDeadIntroducingASPNETCore10AndNETCore10.aspx" >}}".
<blockquote>" <strong>ASP.NET 5</strong> is a new open-source and cross-platform framework for building modern cloud-based Web applications using .NET.</blockquote>
<h3>.NET 4.6.*</h3>
With {{< url-link ".NET 4.6" "https://msdn.microsoft.com/en-us/library/ms171868(v=vs.110).aspx" >}} you get {{< url-link "C# 6" "https://msdn.microsoft.com/en-us/magazine/dn802602.aspx" >}}.  C# 6 is something that I have personally been looking forward to. I'm not sure I share the same level of excitement as I did with <strong>.NET 4.5</strong> and its {{< url-link "asynchronous programming" "https://msdn.microsoft.com/en-us/library/hh191443.aspx" >}} model support, but excited nonetheless!  Additionally, we are now going to start harnessing <strong>ASP.NET Core 1.0</strong>.
<blockquote>" <strong>ASP.NET 5</strong> applications are built/ran using the new <a class="reference internal" href="https://docs.asp.net/en/latest/dnx/overview.html" target="_blank">.NET Execution Environment (DNX)</a>, and every <strong>ASP.NET 5</strong> project is a <strong>DNX</strong> project.</blockquote>
<h3>DN*</h3>
<strong>DNX</strong> is an acronym that stands for <strong>.NET Execution Environment</strong>. It is basically just an <strong>SDK</strong> within the context of <strong>Visual Studio</strong>, but also acts as the runtime environment in which your <strong>ASP.NET Core 1.0</strong> applications execute.

Accompanying <strong>DNX</strong> is the <strong>DNU</strong> and <strong>DNVM</strong> CLI's.
<ul>
	<li>DNU, .NET Utility</li>
	<li>DNVM, .NET Version Manager</li>
</ul>
For more details on these command line interfaces please visit {{< url-link "here" "https://docs.asp.net/en/latest/dnx/commands.html" >}}.

---

<h1>Code</h1>
We should be familiar enough with some of the core concepts such that we can finally begin by creating a new <strong>ASP.NET Core 1.0</strong> web application. From within <strong>Visual Studio 2015</strong>, select <code>File → New → Project</code>.  Then from within the New Project dialog navigate and select <code>Installed → Templates → Visual C# → Web → ASP.NET Web Application</code> - select "Ok".

<img class="alignnone size-full wp-image-290" src="https://ievangelistblog.files.wordpress.com/2016/01/new-proj.png" alt="new-proj" width="941" height="653" />

<strong>Visual Studio 2015</strong> now groups templates by .NET Framework version, notice <strong>ASP.NET 5</strong> applications are separated and beneath <strong>.NET Framework 4.6.1</strong>. Additionally, notice when you select the <strong>ASP.NET 5</strong> templates that the <strong>MVC</strong> and <strong>Web API</strong> check-boxes are disabled - the reason being that they are now unified in <strong>ASP.NET Core 1.0</strong>.

Personally, I'm thrilled that there is no longer a need to have <strong>Web API</strong> controllers inherit <code>ApiController</code> and <strong>MVC</strong> controllers inherit <code>Controller</code> - more about this later...
<blockquote>" There can be only one.</blockquote>
Yes, that is a <em>Highlander</em> reference! But it's actually appropriate because there should be only one <code>Controller</code> - not to mention the seemingly countless other duplicate classes that overlapped with <code>System.Web.Http</code> and <code>System.Web.Mvc</code>.

<img class="alignnone size-full wp-image-285" src="https://ievangelistblog.files.wordpress.com/2016/01/new-proj-2.png" alt="new-proj-2" width="786" height="613" />

Select the "Empty" template, and let's continue - your solution should now resemble the figure below:

<img class="alignnone size-full wp-image-289" src="https://ievangelistblog.files.wordpress.com/2016/01/default-structure.jpg" alt="default-structure" width="239" height="228" />

We can delete the <code>Project_Readme.html</code> file as it is not needed. Now let's add some standard <strong>MVC</strong> scaffolding, you should have the following for our starting point:

<img class="alignnone size-full wp-image-315" src="https://ievangelistblog.files.wordpress.com/2016/01/mvc-structure.jpg" alt="mvc-structure" width="281" height="405" />

All that is needed from the previous step was the folder structure and several built-in templates.
<table>
<thead>
<tr>
<th align="right">Folder</th>
<th align="left">Add New Item Step</th>
</tr>
</thead>
<tbody>
<tr>
<td align="right">Controllers</td>
<td align="left"><code>DNX → Server-side → MVC Controller Class</code></td>
</tr>
<tr>
<td align="right"> Views</td>
<td align="left"><code>DNX → Server-side → MVC View Start Page</code></td>
</tr>
<tr>
<td align="right"> Views</td>
<td align="left"><code>DNX → Server-side → MVC View Imports Page</code></td>
</tr>
<tr>
<td align="right"> Views\Home</td>
<td align="left"><code>DNX → Server-side → MVC View Page</code></td>
</tr>
<tr>
<td align="right"> Views\Shared</td>
<td align="left"><code>DNX → Server-side → MVC View Layout Page</code></td>
</tr>
</tbody>
</table>
Of the multiple items we have added at this point, there are only three that we need to alter from the default template provided. First the <code>_ViewImports.cshtml</code>, it should resemble the content below - and simply enables tag helpers.

[gist]d31a916d83c42bdc67a2[/gist]

Secondly, the <code>_Layout.cshtml</code> that references our script tags and invokes the <code>boot</code> JavaScript to bootstrap our <strong>Angular2</strong> component.

[gist]84a3309caafb07748248[/gist]

Finally, the <code>Index.cshtml</code> which is rendered as the body of the layout and introduces an <code>app</code> element that will be detailed later.

[gist]117fa6317dbd29a3e9a5[/gist]

Now let's get our <em>webroot</em> structure solidified, expand the <code>wwwroot</code> folder and add the folders depicted below. We will add to these later.

<img class="alignnone size-full wp-image-352" src="https://ievangelistblog.files.wordpress.com/2016/01/wwwroot-structure.jpg" alt="wwwroot-structure.JPG" width="272" height="374" />

Open the <code>project.json</code> file and let's paste in the following <strong>JSON</strong>. This will pull in the required dependencies we need for our starter application. The 'dependencies' are simply {{< url-link "NuGet" "https://www.nuget.org/" >}} package references - be sure to paste everything defined below.

[gist]998ea37b948e26d9602f[/gist]

If you're familiar with {{< url-link "OWIN" "https://www.asp.net/aspnet/overview/owin-and-katana/getting-started-with-owin-and-katana" >}} then the next steps will be very straightforward. Open the <code>Startup.cs</code> file., and let's paste in some more source and discuss its purpose.

[gist]950cb27342a2f6bb93de[/gist]

You might have noticed that in addition to a <code>public void Configure</code> method there is now a <code>public void ConfigureServices</code> method as well. Additionally, the <code>Configure</code> method now expects two new parameters, <code> IHostingEnvironment</code> and <code>ILoggerFactory</code>.

The typical usage pattern is that you invoke an <code>Add*</code> extension method in the <code>ConfigureServices</code> operation to add a service for consumption, while in the <code>Configure</code> operation you invoke the corresponding <code>Use*</code> extension method.

[gist]7f193525af0686cce5e6[/gist]

The pattern becomes obvious when you study the `ConfigureServices` source, notice how we are adding <strong>Glimpse</strong> and <strong>MVC</strong> to the <code>IServiceCollection</code>.
<blockquote>" Glimpse provides real time diagnostics &amp; insights to the fingertips of hundreds of thousands of developers daily.</blockquote>
As you see below, within the <code>Configure</code> method now invokes the two corresponding methods - <code>UseGlimpse</code> and <code>UseMvc</code>.

[gist]e821cd35852a87709b1c[/gist]
<h2>Avoid crossing your eyes while dotting your "t's"</h2>
In other words, pay attention to what it is that you're doing. A lot of what we have done thus far was simple <strong>MVC</strong> related and server-side, let's now shift the attention to the client-side and how <strong>Angular2</strong>, <strong>TypeScript</strong>,<strong> Task Runners</strong> and <strong>npm</strong> will play a role.
<h3>Dependencies</h3>
While <strong>NuGet</strong> serves up our external executable packages, <strong>npm</strong> is responsible for managing our <strong>CSS</strong> and <strong>JavaScript</strong> dependencies. Being that we're developing an <strong>Angular2</strong> application we'll need to pull in <strong>Angular2</strong> as a dependency - in order to do that let's take a look at the <code>package.json</code>, but first we need to create one.

Right click on project and select <code>Add → New Item</code>. From the Add New Item dialog select <code>Installed → Client-side → NPM Configuration File</code>. This will add the <code>package.json</code> file, replace its contents with the following:

[gist]7f7b6f1bbf8adbf1c295[/gist]

Note the different types of dependencies from the highlighted source above, one set of dependencies is explicitly for development only - meaning it is not part of what is served to clients in response to a web request. Among these development dependencies you'll notice gulp a lot.
<h3>Task Runners</h3>
With the introduction of <strong>Visual Studio 2015</strong> the notion of Task Runners is now supported. The <em>Task Runner Explorer</em> is a new window in which your task runner file tasks can be bound to <abbr title="Integrated Development Environment">IDE</abbr> events.
<h4><strong>Gulp</strong></h4>
<img class="alignleft size-thumbnail wp-image-52" style="background-color:#cf4646;border:10px solid #CF4646;border-radius:10px;" src="https://ievangelistblog.files.wordpress.com/2015/12/gulp-white-text.png?w=150" alt="gulp-white-text" width="150" height="91" />
<strong>Gulp</strong> is one of two task runners now fully integrated and supported in the <abbr title="Integrated Development Environment">IDE</abbr>. <strong>Gulp</strong> is a pre-processor for content delivery and if you're familiar with the concept of <strong>MVC</strong> bundling, this is pretty much the same thing. Multiple files are input and the files are checked for errors, minified and delivered as a single file to the client.

Let's add the following <code>gulpfile.js</code> to our project, <code>Add → New Item</code>. From the Add New Item dialog select <code>Installed → Client-side → Gulp Configuration File</code>.

[gist]7785bf3fbd642f092f09[/gist]

Most (if not all) of the <strong>Gulp</strong> source code should be easy to read and comprehend. We are simply defining several tasks that can be bound to <abbr title="Integrated Development Environment">IDE</abbr> events. We require several <abbr title=" JavaScript">JS</abbr> libraries that were referenced in our <code>devDependencies</code>, then we simply author the desired functionality into each named task by utilizing the fluent <abbr title="Application Programming Interface">API</abbr> that <strong>Gulp</strong> provides for chaining methods together.

There are four events that you can tether tasks to, three of which are technically build-events and the other is not.
<table>
<thead>
<tr>
<th align="right">Event</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td align="right"><code>Before Build</code></td>
<td align="left">Executes bound gulp task(s) before compilation</td>
</tr>
<tr>
<td align="right"><code>After Build</code></td>
<td align="left">Executes bound gulp task(s) after compilation</td>
</tr>
<tr>
<td align="right"><code>Clean</code></td>
<td align="left">Executes bound gulp task(s) after the Clean finishes</td>
</tr>
<tr>
<td align="right"><code>Project Open</code></td>
<td align="left">Executes bound gulp task(s) while project is opening</td>
</tr>
</tbody>
</table>
We have bound our <code>default</code> task to the "Before Build" event. These tasks copy over the dependencies our application relies on to run.
<h2>Angular2</h2>
<strong>Angular2</strong> is simply the second version of the <strong>AngularJS</strong>.
<blockquote>" Angular is a development platform for building mobile and desktop web applications.</blockquote>
In our <code>wwwroot</code> we expect the following folder structure, where the <code>wwwroot\app</code> is the only place in which we manually manipulate source code. The other folders should be left alone as our <strong>Gulp</strong> task will copy over our dependencies as needed into the other directories.
<pre>.
├── app [ working directory ]
│    └── components
├── css
├── fonts
├── images
└── js
    └── angular2
</pre>
Let's start by adding our <code>boot.ts</code> file. This file will bootstrap our main entry point for <strong>Angular2</strong> to initialize and act on. Additionally this will define our Router and Http Providers. The <strong>MVC</strong> <code>_Layout.cshtml</code> has a script tag that invokes this file.

[gist]58cbc3cceba0e2efdd92[/gist]

We will now need to define our <code>AppComponent</code>, add a new <strong>TypeScript</strong> file namely <code>app.component.ts</code> to the <code>wwwroot\app</code> directory. It should contain the following:

[gist]3c456e6b3f77a02ca845[/gist]

With our <code>AppComponent</code> created, we'll need to create our <code>app.html</code>. This will serve as the template for the menu structure and view-port if you will of our application. There is a direct correlation that I need to call attention to, for each <code>RouteDefinition</code> there is a menu item in our HTML that is rendered. When a route-link is clicked <strong>Angular2</strong> loads the component declared in the route definition and renders its HTML in place of the <code>route-outlet</code> tag.

[gist]3add69db05a014d2de2c[/gist]
<h3>Static HTML 'templateUrl'</h3>
For this sample application, I will demonstrate how to utilize static <code>.html</code> and <strong>MVC</strong> partial view pre-processing for our <strong>Angular2</strong> component "templateUrl's". Additionally, I'll demonstrate a simply <strong>Web <abbr title="Application Programming Interface">API</abbr> 2</strong> call as well. You may have noticed that we have several components that we have references to within the <code>app.component</code> that we have yet to create, let's do that now.

First add <code>static.component.ts</code> and <code>static.html</code> under the <code>wwwroot\app\components</code> directory.

[gist]7e7bce34b2d16557b686[/gist]

Notice the <code>selector</code> and <code>templateUrl</code>? The <code>selector</code> is actually the <abbr title="Cascading Style Sheets">CSS</abbr> selector <strong>Angular2</strong> uses to find the <abbr title="  Document Object Model">DOM</abbr> element in which the <code>templateUrl</code> will replace once rendered. Here is the <code>.html</code>, as you can see very simple.

[gist]c4625e98b879011cfb4d[/gist]
<h3>MVC Partial View 'templateUrl'</h3>
We can utilize the power of <strong>MVC's</strong> pre-processing capabilities and have a <code>Controller</code> who is responsible for serving up partial views. This is great since we can then utilize <strong>MVC</strong> templating in conjunction with <strong>Angular2</strong> templating.  Add yet another new <strong>TypeScript</strong> file named <code>mvc.component.ts</code>.

[gist]8130a550a30e7181c217[/gist]

Notice that our syntax has changed ever so slightly for the <code>templateUrl</code>, this is actually pointing to an <strong>MVC</strong> partial view that we're going to create right now. Create a new folder under <code>Views</code>, name it "Partial". Then add a new <em>MVC View Page</em>, naming it <code>Message.cshtml</code>.

[gist]0596d5adc6e651484db6[/gist]

The markup is nearly identical, but the implementation is vastly different. We'll need the corresponding <code>Controller</code> to serve up these requests. Add a <code>PartialController</code> with two entry points, the second of which will become obvious in our next step.

[gist]7512b9203cdd74f716f5[/gist]

I love the one-liner syntax that a simple lambda expression provides with C# 6!
<h3>Web API 2 and Angular2's Http</h3>
Adding another <em>MVC View Page</em> to our newly created <code>Views\Partial</code> directory, let's call it <code>Numbers.cshtml</code>. The markup has several key bindings to an <strong>Angular2</strong> component that we will need to define.

[gist]e4b79567577c824282ba[/gist]

Back over in our <code>wwwroot\app\components</code>, we will need to obviously add our <code>api.component.ts</code> but also an <code>api.service.ts</code> that will encapsulate our <strong>Web <abbr title="Application Programming Interface">API</abbr> 2</strong> call via <strong>Angular2's Http</strong> library.

[gist]6a75373f90845cfe3467[/gist]

Our <code>ApiComponent</code> gets injected with an instance of our <code>ApiService</code> and defines a few simple members that are bound to the <code>Numbers.cshtml</code> markup.

[gist]1606dcd3c85423e51bc6[/gist]

I'm simply ecstatic that there was a change to move away from the <code>Promise</code> model to the <code>Observable</code> model instead. Anytime I get to work with {{< url-link "Reactive Programming" "https://en.wikipedia.org/wiki/Reactive_programming" >}} paradigm, I learn something new. <strong>Angular2's Http</strong> library is based on the observable programming model and relies on <strong>RxJS</strong>. I invite you to read how <strong>Angular2</strong> works with <code>observables</code> {{< url-link "here" "https://angular.io/docs/ts/latest/api/http/Http-class.html" >}} but simply put, you subscribe to the <code>Observable</code> passing it the <code>observerOrNext</code> (and optionally <code>error</code> and <code>complete</code>) functions.

All we need now is a <strong>Web <abbr title="Application Programming Interface">API</abbr> 2</strong> controller that will serve up the <em>HttpGet</em> that <code>ApiService</code> expects at "api/random". Fortunately for us this has been dramatically simplified with <strong>ASP.NET Core 1.0</strong>. No more woes with <code>System.Web.Mvc</code> vs. <code>System.Web.Http</code>.
<blockquote>" Now, you can create a single web application that handles the Web UI and data services without needing to reconcile differences in these programming frameworks.</blockquote>
[gist]84e0b851d3da42099680[/gist]

Notice that there is no <code>ApiController</code> inheritance, and both the <abbr title="Model View Controller">MVC</abbr> and Web <abbr title="Application Programming Interface">API</abbr> controllers are simply inheriting from <code>Controller</code>.

---

<h1>Conclusion</h1>
You should be able to clone {{< url-link "the repository" "https://github.com/IEvangelist/MvcAngular2.git" >}} locally, build it and play around. I encourage you to do so and hope that you find the sample source fun and the tutorial surrounding it useful. Today we discussed some of the capabilities of <strong>ASP.NET Core 1.0 (previously known as ASP.NET 5)</strong>, <strong>MVC 6</strong>, <strong>Web <abbr title="Application Programming Interface">API</abbr> 2</strong>, <strong>Angular2</strong> and <strong>TypeScript</strong>. I leave you with one question, "tomorrow, what will you do with it?".

<img class="alignnone size-full wp-image-779" src="https://ievangelistblog.files.wordpress.com/2016/01/index.png" alt="index" width="1010" height="554" />

<img class="alignnone size-full wp-image-780" src="https://ievangelistblog.files.wordpress.com/2016/01/sub.png" alt="sub" width="1191" height="554" />

<img class="alignnone size-full wp-image-781" src="https://ievangelistblog.files.wordpress.com/2016/01/numbers.png" alt="numbers" width="1225" height="890" />
<h2>References</h2>
<ul>
	<li>{{< url-link "https://angular.io/" "https://angular.io/" >}}</li>
	<li>{{< url-link "https://reactivex.io/" "https://reactivex.io/" >}}</li>
	<li>{{< url-link "https://docs.asp.net/en/latest/conceptual-overview/aspnet.html" "https://docs.asp.net/en/latest/conceptual-overview/aspnet.html" >}}</li>
	<li>{{< url-link "https://docs.asp.net/en/latest/dnx/overview.html" "https://docs.asp.net/en/latest/dnx/overview.html" >}}</li>
	<li>{{< url-link "https://weblogs.asp.net/scottgu/introducing-asp-net-5" "https://weblogs.asp.net/scottgu/introducing-asp-net-5" >}}</li>
	<li>{{< url-link "https://nodejs.org/en/" "https://nodejs.org/en/" >}}</li>
	<li>{{< url-link "https://en.wikipedia.org/wiki/Highlander_(film)" "https://en.wikipedia.org/wiki/Highlander_(film)" >}}</li>
	<li>{{< url-link "https://getglimpse.com/" "https://getglimpse.com/" >}}</li>
	<li>{{< url-link "https://github.com/angular/angular" "https://github.com/angular/angular" >}}</li>
</ul>