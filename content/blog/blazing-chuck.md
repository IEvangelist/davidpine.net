+++
author = "David Pine"
categories = ["WebAssembly", "WASM", "Blazor", "CSharp"]
date = "2018-08-20"
description = "A Practical WebAssembly Application In C#"
images = ["/img/2018/08/ast.png"]
featured = "ast.png"
featuredalt = ""
featuredpath = "date"
linktitle = ""
title = "Writing a Blazor App"
type = "post"
+++

Every time a developer encounters a new technology it's in our nature to explore it. This is the case with WebAssembly, and Microsoft's vision of the world in Blazor. Blazor is single page application framework that sits atop of WebAssembly, but it's still considered an experiment. I had the chance to interview Steve Sanderson about WebAssembly and Blazor -- I shared <a href="{{< relref "webassembly-interview.md" >}}" target="_blank">that post earlier this month</a>. Now, I'd like to explore Blazor with you a bit more.

# Blazor

There are plenty of resources for learning Blazor, here are two of my favorite:

 - <a href="https://blazor.net/" target="_blank">blazor.net</a>
 - <a href="https://learn-blazor.com/" target="_blank">learn-blazor.com</a>

# A Practical Application

Are you tired of the "TODO" application, I know I am?! I decided to go beyond the typical demonstration apps from the templates and the "TODO" apps that are so prevalent today - instead, we'll write an application that will hopefully put a smile on your face! I call it "Blazing Chuck"...

I have been using <a href="http://www.icndb.com" target="_blank">The Internet Chuck Norris Database"</a> in my demos for as long as I can remember. Who doesn't love a good _nerdy_ joke? We will make some calls using the `HttpClient` to __GET__ a nerdy Chuck Norris based joke - like I said before, extremely practical application <i class="fa fa-smile-o" aria-hidden="true"></i>.

If you'd rather have a look at the <i class="fa fa-github" aria-hidden="true"></i> GitHub project yourself, <a href="https://github.com/IEvangelist/IEvangelist.Blazing.Chuck" target="_blank">check it out here</a>. Please give me a <i class="fa fa-star" aria-hidden="true"></i> star, or <i class="fa fa-code-fork" aria-hidden="true"></i> fork it, or send along a pull request to help me make this example project even better.

# Boring Parts

## `Program.cs`

Our Blazor applications entry point is the `Main` method of the `Program.cs`. Here we simply create our host builder, using the Blazor `Startup` class and run.

```csharp
using Microsoft.AspNetCore.Blazor.Hosting;

namespace IEvangelist.Blazing.Chuck
{
    public class Program
    {
        public static void Main(string[] args)
            => CreateHostBuilder(args).Build().Run();

        public static IWebAssemblyHostBuilder CreateHostBuilder(string[] args)
            => BlazorWebAssemblyHost.CreateDefaultBuilder()
                                    .UseBlazorStartup<Startup>();
    }
}
```

## `Startup.cs`

Our startup logic should look very familiar to those who have been developing with __ASP.NET Core__ as it uses the same nomenclature we've all grown accustomed to. We have a `ConfigureServices` where we add services to our `IServiceCollection` instance for our application. We will need to add CORS, for cross-origin resource sharing. These services can be used later by dependency injection. We also have our `Configure` method, which allows us to add various things to our application. In this specific case we add the `App` Razor page.

```csharp
using Microsoft.AspNetCore.Blazor.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace IEvangelist.Blazing.Chuck
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
            => services.AddCors(
                options =>
                    options.AddDefaultPolicy(
                        builder =>
                            builder.AllowAnyOrigin()
                                   .AllowAnyMethod()
                                   .AllowAnyHeader()
                                   .AllowCredentials()));

        public void Configure(IBlazorApplicationBuilder app) 
            => app.AddComponent<App>(nameof(app));
    }
}
```

# Less Boring Parts

## `wwwroot/index.html`

Let's take a look at this simple markup file. The `<head>` element doesn't contain anything special or unusual, let's checkout the `<body>`. We have a link to my <a href="https://github.com/IEvangelist/IEvangelist.Blazing.Chuck" target="_blank"><i class="fa fa-github" aria-hidden="true"></i> GitHub project</a>, which sits in the top right hand corner of the screen.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width">
    <title>IEvangelist.Blazing.Chuck</title>
    <base href="/" />
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet" />
    <link href="css/site.css" rel="stylesheet" />
</head>
<body>
    <a href="https://github.com/IEvangelist/IEvangelist.Blazing.Chuck" target="_blank">
        <img style="position: absolute; top: 0; right: 0; border: 0;"
             src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"
             alt="Fork me on GitHub">
    </a>

    <app class="grid">
        <div class="grid-content">
            <div class="grid-center">
                <div class="loading">
                    <h1>Loading...</h1>
                    <h1>Please wait.</h1>
                    <div class="spinner">
                        <div class="rect1"></div>
                        <div class="rect2"></div>
                        <div class="rect3"></div>
                        <div class="rect4"></div>
                        <div class="rect5"></div>
                    </div>
                </div>
            </div>
        </div>
    </app>

    <script src="_framework/blazor.webassembly.js"></script>
</body>
</html>
```

Then we have a familiar `<app>` element -- while it is a non-standard element it has become common nomenclature for single page applications. Think of it as a target for where your SPA aims to render! The contents are irrelevant, right?! That is not entirely true...you've probably become accustomed to SPA applications initially displaying a "Loading..." screen that is simply black text on a white background. This is a bit boring, no?!

I've made mine more flashy and consistent with the rest of the application.

> <p/> <cite><strong>ProTip</strong></cite>
> Your application is represented on the initial request, make the most of it!

Here is what my loading application looks like:

<style>
#content .grid h1 {
    color: whitesmoke;
}
.grid {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background-image: linear-gradient(180deg, rgb(5, 39, 103) 0%, #3a0647 70%);
    display: grid;
    width: 100%;
    height: 350px;
    align-items: center;
    text-align: center;
    overflow: hidden;
}
.grid-content {
    grid-template-areas: 
        '. center center center .'
        '. center center center .'
        '. joke joke joke btn';
}
.loading {
    margin: auto;
}
.grid-center {
    padding-top: 50px;
    grid-area: center;
    align-content: center;
}
.spinner {
    margin: 100px auto;
    width: 100px;
    height: 80px;
    text-align: center;
    font-size: 10px;
}

.spinner > div {
    background-color: azure !important;
    height: 100%;
    width: 12px;
    display: inline-block;
    -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
    animation: sk-stretchdelay 1.2s infinite ease-in-out;
}

.spinner .rect2 {
    -webkit-animation-delay: -1.1s;
    animation-delay: -1.1s;
}

.spinner .rect3 {
    -webkit-animation-delay: -1.0s;
    animation-delay: -1.0s;
}

.spinner .rect4 {
    -webkit-animation-delay: -0.9s;
    animation-delay: -0.9s;
}

.spinner .rect5 {
    -webkit-animation-delay: -0.8s;
    animation-delay: -0.8s;
}

@-webkit-keyframes sk-stretchdelay {
    0%, 40%, 100% {
        -webkit-transform: scaleY(0.4)
    }

    20% {
        -webkit-transform: scaleY(1.0)
    }
}

@keyframes sk-stretchdelay {
    0%, 40%, 100% {
        transform: scaleY(0.4);
        -webkit-transform: scaleY(0.4);
    }

    20% {
        transform: scaleY(1.0);
        -webkit-transform: scaleY(1.0);
    }
}

</style>

<div class="grid">
    <div class="grid-content">
        <div class="grid-center">
            <div class="loading">
                <h1>Loading...</h1>
                <h1>Please wait.</h1>
                <div class="spinner">
                    <div class="rect1"></div>
                    <div class="rect2"></div>
                    <div class="rect3"></div>
                    <div class="rect4"></div>
                    <div class="rect5"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<br/>

# Intriguing Parts

### `Index.cshtml`

This file is getting larger, and it's probably time that I break it into smaller components. I say that realizing that it is only 46 lines long, but still -- having mixed some __C#__ into some __HTML__ doesn't really feel right to me. Perhaps I'm a bit biased, but I'm arguably one of the __C#__ languages biggest fans. I've been conflicted about this for a while, and I've felt the same when I see templating markup in __Angular__ and even more so with __React's JSX__. Here it is, in its entirety.

```
@page "/"
@inject HttpClient Http

<div class="grid-center">
    <img id="chuck" class="center glow @((_isLoading ? "shaking" : ""))"
         src="/img/chuck-norris.png" />
</div>

<div class="grid-joke">
    <div class="alert alert-danger" role="alert">
        @if (_isLoading) {
            <h1 class="hg-font">...</h1>
        } else {
            <h1 class="hg-font">@_joke.value.joke</h1>
        }
    </div>
</div>
<div class="grid-btn">
    <button type="button" disabled="@_disabled"
            class="btn btn-warning btn-lg hg-font fixed-button"
            onclick="@GetJokeAsync">
        Kick Chuck?!
    </button>
    <div class="thanks">
        Special thanks to our friends at <a href="http://www.icndb.com/" target="_blank">ICNDB</a>
        and <a href="http://tobiasahlin.com/spinkit/" target="_blank">SpinKit by Tobias Ahlin</a>!
    </div>
    <div class="">
        <code>
            <pre style="color: azure !important;">Debug: Shift + Alt + D</pre>
        </code>
    </div>
</div>

@functions {
    Result _joke;
    bool _isLoading = true;
    string _disabled => _isLoading ? "disabled" : null;

    protected override Task OnInitAsync() => GetJokeAsync();

    private async Task GetJokeAsync() {
        _isLoading = true;
        _joke =
            await Http.GetJsonAsync<Result>(
                "https://api.icndb.com/jokes/random?limitTo=[nerdy]");
        _isLoading = false;
    }
}
```

I want to break up this explanation a bit, we'll start with the directives. 

## Directives

### `@page`

This works with the Blazor router, and specifies the client side route. Our route for the index page is simply `"/"`. We could have multiple routes if we wanted but our application is rather simple.

### `@inject`

Next, the `@inject` directive. This directive instructs our dependency injection framework to "inject" the desired type as an instance into our component. We then have access to it wherever we'd like to consume it.

### `@functions`

Functions can exist anywhere in the `*.cshtml` file, however it is most common and best practice to place them at the bottom of the file. These "functions" will serve as the __C#__ source code for the component. In our example we `override` the `Task` returning `OnInitAsync` method. This is one of several <a href="https://learn-blazor.com/pages/lifecycle-methods/" target="_blank">lifecycle methods</a>. We express our `override` as the invocation of the `GetJokeAsync` method. The `GetJokeAsync` method toggles the `_isLoading` flag, and makes an `async` call to the "Internet Chuck Norris Database" API. We use the `HttpClient` that has been injected into our component instance to call the `GetJsonAsync` function given the URL and type-parameter of our `Result` object. The `Result` object contains the __C#__ representation of the returned JSON result, which has the joke.

# Markup

The markup is very simple. There is nothing exciting here, a few simple examples of how to use various binding approaches. We can conditionally bind a `class` on an `img` element for example, this is demonstrated when we're requesting a joke. Likewise, we can conditionally show an ellipsis when we're loading else we will display the resulting punch-line from our API result.

We bind to the `onclick` of our "Kick Chuck" `button` element. When this element is clicked, the framework will invoke our `GetJokeAsync` function. We then fetch a new joke, toggle the `_isLoading` bit and then render the updates to the markup. One thing that you may notice is that the actual `html` that is sent to your browser doesn't have an event handler for the button click - what is the magic you speak of?!

This is where our `<script src="_framework/blazor.webassembly.js"></script>` comes in. There is a bit of framework magic that attaches event listeners, etc. This bit of __JavaScript__ manages event delegation, attaching, removing, as well as a slue of other various DOM relates interactions that tether our __.NET__ components to their __WebAssembly__ counterparts.

For more details on how this is implemented, please have a look at the <a href="https://github.com/aspnet/Blazor/tree/master/src/Microsoft.AspNetCore.Blazor.Browser.JS/src" target="_blank">Microsoft.AspNetCore.Blazor.Browser.JS <i class="fa fa-github" aria-hidden="true"></i> project</a>.

### A Word On Interpreted Mode

When developing your Blazor applications, you'll be using "interpreted mode". Interpreted mode will take your `*.dlls` on the client, and dynamically load then via the Mono Runtime. The Mono Runtime is compiled to WebAssembly, and represented by the `mono.wasm` file. This entire process, is actually really fast! 

## Debugging C# In Chrome DevTools

Debugging is only available within Chrome and is very limited. 

<div class="iframe_container">
    <iframe src="https://www.youtube.com/embed/_mjCddc21Eo" frameborder="0" allowfullscreen></iframe>
</div>

<br />

# "Blazing Chuck!"

Here it is, the moment you've been waiting for. Putting all the pieces together, and you have "Blazing Chuck". Go forth, and <a href="http://ievangelistblazingchuck.azurewebsites.net/" target="_blank">"kick chuck"</a>. Disclaimer, this actually doesn't work well (or at all) on mobile -- for best results explore on a desktop... more to come once I figure out the issue with that.

# Thanks

Special thanks to our friends at <a href="http://www.icndb.com/" target="_blank">ICNDB</a> for their amazingly hilarious and free API. Also, <a href="http://tobiasahlin.com/spinkit/" target="_blank">SpinKit by Tobias Ahlin</a> for the simple HTML and CSS loading indicator!