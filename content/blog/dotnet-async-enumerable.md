+++
author = "David Pine"
categories = ["CSharp", ".NET", "JSON"]
date = "2023-06-19"
description = "Use the IAsyncEnumerable<T> interface to stream data from a server to a client."
featured = "streaming-apis.png"
images = ["/img/2023/06/streaming-apis.png"]
featuredalt = "..."
featuredpath = "img/2023/06"
linktitle = ""
title = "Exploring .NET streaming API scenarios"
type = "post"

+++

{{< note title="❗ IMPORTANT" >}}
The featured image was generated using [bing.com/create powered by DALL·E](https://www.bing.com/create).
{{< /note >}}

# Exploring .NET streaming API scenarios

If you're a .NET developer, chances are you're already familiar with the `IAsyncEnumerable<T>` interface. This interface was introduced in .NET Core 3.0 and is used to asynchronously iterate over a collection of data. This is a great way to stream data from a server to a client. In this post, you'll learn how to:

- Expose an ASP.NET Core Minimal API endpoint that returns `IAsyncEnumerable<T>`.
- Consume the same `IAsyncEnumerable<T>` from an ASP.NET Core Blazor WebAssembly app.

In this post, you'll explore a scenario inspired by ChatGPT's user experience that streams UI updates to the client from the server in real-time.

**TL;DR;**

If you'd rather just see the code, you can see it on the [{{< i fa-github >}} GitHub repository `https://github.com/IEvangelist/blazor-azure-openai` {{< i fa-external-link >}}](https://github.com/IEvangelist/blazor-azure-openai).

## Server

The server is an ASP.NET Core Minimal API app, that defines an endpoint that returns an `IAsyncEnumerable<T>`. This is important because when it comes to streaming data, you want to avoid buffering the entire collection in memory. Instead, you want to stream the data as it becomes available. This is exactly how `IAsyncEnumerable<T>` operates. The app will make use of a few NuGet packages:

- [📦 `Azure.AI.OpenAI`](https://www.nuget.org/packages/Azure.AI.OpenAI)
- [📦 `Microsoft.AspNetCore.Components.WebAssembly.Server`](https://www.nuget.org/packages/Microsoft.AspNetCore.Components.WebAssembly.Server)
- [📦 `Microsoft.Extensions.Azure`](https://www.nuget.org/packages/Microsoft.Extensions.Azure)
- [📦 `Microsoft.Extensions.Caching.Memory`](https://www.nuget.org/packages/Microsoft.Extensions.Caching.Memory)
- [📦 `Swashbuckle.AspNetCore`](https://www.nuget.org/packages/Swashbuckle.AspNetCore)

Here's what the project file looks like:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

    <PropertyGroup>
        <TargetFramework>net7.0</TargetFramework>
        <Nullable>enable</Nullable>
        <ImplicitUsings>enable</ImplicitUsings>
    </PropertyGroup>
    
    <ItemGroup>
        <PackageReference Version="1.0.0-beta.5"
            Include="Azure.AI.OpenAI" />
        <PackageReference Version="7.0.5"
            Include="Microsoft.AspNetCore.Components.WebAssembly.Server" />
        <PackageReference Version="1.6.3"
            Include="Microsoft.Extensions.Azure" />
        <PackageReference Version="7.0.0"
            Include="Microsoft.Extensions.Caching.Memory" />
        <PackageReference Version="6.5.0"
            Include="Swashbuckle.AspNetCore" />
    </ItemGroup>

    <ItemGroup>
        <InternalsVisibleTo Include="Azure.OpenAI.Client.EndToEndTests" />
    </ItemGroup>

    <ItemGroup>
      <ProjectReference Include="..\Client\Azure.OpenAI.Client.csproj" />
      <ProjectReference Include="..\Shared\Azure.OpenAI.Shared.csproj" />
    </ItemGroup>

</Project>
```

The _Program.cs_ file makes use of C#'s top-level programs, which is a great way to reduce boilerplate code. The `WebApplication.CreateBuilder(args)` creates an instance of `WebApplicationBuilder` and builds an app (`WebApplication`) before configuring it and running the `app` as shown in the following `Program` class:

```csharp
// Copyright (c) David Pine. All rights reserved.
// Licensed under the MIT License.

var builder = WebApplication.CreateBuilder(args);

using var app = BuildApp(builder);

ConfigureApp(app);

await app.RunAsync();
```

{{< tip title="💡 TIP" >}}
You can encapsulate the building and configuring of your app with the use of `partial` classes. Consider two additional files, _Program.Build.cs_ and _Program.Configure.cs_.
{{< /tip >}}

The _Program.Build.cs_ file contains the `BuildApp` method, which is responsible for building the app. The `BuildApp` functionality is defined as the following code:

```csharp
// Copyright (c) David Pine. All rights reserved.
// Licensed under the MIT License.

public partial class Program
{
    internal static WebApplication BuildApp(WebApplicationBuilder builder)
    {
        builder.Services.AddAzureOpenAI(builder.Configuration);

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddHttpClient();
        builder.Services.AddHttpLogging(
            options => options.LoggingFields = HttpLoggingFields.All);

        builder.Services.AddMemoryCache();
        builder.Services.AddControllersWithViews();
        builder.Services.AddRazorPages();

        return builder.Build();
    }
}
```

The preceding code, given an instance of `WebApplicationBuilder`, will:

- Adds support for Azure AI's OpenAI service with use of the official Azure .NET SDK
- Adds support for OpenAPI (not to be confused with OpenAI) Swagger
- Adds support for HTTP support with logging
- Adds support for in-memory caching
- Adds support for controllers with views
- Adds support for Razor Pages
- Returns the built `app`

The _Program.Configure.cs_ file contains the `ConfigureApp` method, which is responsible for configuring the app. The `ConfigureApp` functionality is defined as the following code:

```csharp
// Copyright (c) David Pine. All rights reserved.
// Licensed under the MIT License.

public partial class Program
{
    internal static void ConfigureApp(WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseWebAssemblyDebugging();
        }
        else
        {
            app.UseExceptionHandler("/Error");
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.UseBlazorFrameworkFiles();
        app.UseStaticFiles();
        app.UseRouting();
        app.MapRazorPages();
        app.MapControllers();
        app.MapFallbackToFile("index.html");

        app.MapAzureOpenAiApi();
    }
}
```

This code configures the given `app` by:

- Conditionally add various middleware based on the environment
  - Swagger UI and WebAssembly debugging in development
  - Exception handling and HSTS in production
- Using HTTPS redirection
- Using Blazor WebAssembly files
- Using static files
- Using routing
- Using Razor pages, controllers, and fallback to `index.html`
- And finally, mapping the Azure OpenAI API

From all of the building and configuring bits, the most important parts are the `AddAzureOpenAI` and `MapAzureOpenAiApi` extension methods. The `AddAzureOpenAI` extension method is defined as the following code:

```csharp
// Copyright (c) David Pine. All rights reserved.
// Licensed under the MIT License.

namespace Azure.OpenAI.Server.Extensions;

internal static class ServiceCollectionExtensions
{
    internal static IServiceCollection AddAzureOpenAI(
        this IServiceCollection services, IConfiguration config)
    {
        services.AddAzureClients(
            factory =>
            {
                var endpoint = config["AzureOpenAI:Endpoint"];
                ArgumentNullException.ThrowIfNull(endpoint);

                var apiKey = config["AzureOpenAI:ApiKey"];
                ArgumentNullException.ThrowIfNull(apiKey);

                factory.AddOpenAIClient(
                    new Uri(endpoint), new AzureKeyCredential(apiKey));
            });

        return services;
    }
}
```

The `AddAzureOpenAI` extension method is responsible for adding the Azure OpenAI client to the service collection using the Azure .NET SDK's `AddAzureClients` and `AddOpenAIClient` calls. The `MapAzureOpenAiApi` extension method is defined as the following code:

```csharp
// Copyright (c) David Pine. All rights reserved.
// Licensed under the MIT License.

namespace Azure.OpenAI.Server.Extensions;

internal static class EndpointRouteBuilderExtensions
{
    internal static IEndpointRouteBuilder MapAzureOpenAiApi(
        this IEndpointRouteBuilder routeBuilder)
    {
        var api = routeBuilder.MapGroup("api/openai");

        api.MapPost("chat", PostChatPromptAsync);

        return routeBuilder;
    }

    static async IAsyncEnumerable<TokenizedResponse> PostChatPromptAsync(
        OpenAIClient client, ChatPrompt prompt, IConfiguration config)
    {
        // The identifier of the model from Azure AI's OpenAI Studio 
        // (https://oai.azure.com/portal).
        // To use this streaming API, you'll need the `gpt-35-turbo` model.
        var deploymentId = config["AzureOpenAI:DeploymentId"];

        var response = await client.GetChatCompletionsStreamingAsync(
            deploymentId, new ChatCompletionsOptions
            {
                Messages =
                {
                    // Trick the AI into thinking it's "Blazor Clippy"
                    new ChatMessage(ChatRole.System, """
                        You're an AI assistant for developers, 
                        helping them write code more efficiently.
                        You're name is "Blazor Clippy".
                        You will always reply with a Markdown formatted response.
                        """),

                    // Share an example message with the user.
                    new ChatMessage(ChatRole.User, "What's your name?"),

                    // And it's response.
                    new ChatMessage(ChatRole.Assistant,
                        "Hi, my name is **Blazor Clippy**! Nice to meet you. 🤓"),

                    // Then the user's prompt.
                    new ChatMessage(ChatRole.User, prompt.Prompt)
                }
            });

        
        using StreamingChatCompletions completions = response.Value;

        await foreach (StreamingChatChoice choice in completions.GetChoicesStreaming())
        {
            await foreach (ChatMessage message in choice.GetMessageStreaming())
            {
                yield return new TokenizedResponse(message.Content);
            }
        }
    }
}
```

{{< note title="📝 NOTE" >}}
While I've hardcoded "Blazor Clippy" as the AI persona for our call to Azure AI OpenAI's ChatGPT streaming API, I'm considering adding support for other personas. If you'd like to see support for other personas, please let me know by opening an issue on GitHub — or better yet, submit a PR! Here are some ideas for personas 🎉:

- Add support for "Blazor Bot"
- Add support for "Blazor Yoda"
- Add support for "Blazor Elmo"
- Add support for "Blazor the Pirate"
- Add support for "Blazor the Rock Star"
{{< /note >}}

The `MapAzureOpenAiApi` extension method is responsible for mapping the Azure OpenAI API to the given `routeBuilder`. The `PostChatPromptAsync` method is responsible for handling the HTTP `POST` request to the `/api/openai/chat` endpoint. The `PostChatPromptAsync` method posts the user's prompt, and before doing so it configures the AI's persona and then returns the AI's response.

The SDK requires a few steps but it's fairly straightforward. The `PostChatPromptAsync` method does the following:

- Asks the `client` to get the chat completions for streaming asynchronously
  - The `deploymentId` is used to specify the model
  - The `ChatCompletionsOptions.Messages` configures messages to instruct the AI to take on a persona
- The `response.Value` acts as the available `completions`, from which the streaming API returns:
  - Multiple `choice` instances are used to stream the `message`
  - And `yield return new TokenizedResponse(message.Content);` is used to return the AI's response

The `TokenizedResponse` is a simple class that's used to return the AI's response to the client:

```csharp
// Copyright (c) David Pine. All rights reserved.
// Licensed under the MIT License.

namespace Azure.OpenAI.Shared;

/// <summary>
/// A tokenize response, wrapper around the
/// response's raw <paramref name="Content"/> value.
/// </summary>
/// <param name="Content">
/// The content provided for the given response.
/// </param>
public record class TokenizedResponse(string Content);
```

This object will be consumed by the client. Let's have a look at that next.

## Client

The client is an ASP.NET Core Blazor WebAssembly app, that consumes the `IAsyncEnumerable<T>` from the server. The _Program.cs_ file is responsible for configuring the client's `HttpClient` to use the server's base address:

```csharp
// Copyright (c) David Pine. All rights reserved.
// Licensed under the MIT License.

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(
    sp => new HttpClient
    {
        BaseAddress = new Uri(builder.HostEnvironment.BaseAddress)
    });

builder.Services.AddSingleton<AppState>();
builder.Services.AddHttpClient();
builder.Services.AddSingleton<OpenAIPromptQueue>();
builder.Services.AddLocalStorageServices();
builder.Services.AddSessionStorageServices();
builder.Services.AddSpeechSynthesisServices();
builder.Services.AddSpeechRecognitionServices();
builder.Services.AddMudServices();
builder.Services.AddLocalization();
builder.Services.AddScoped<CultureService>();
builder.Services.AddSingleton<ObjectPoolProvider, DefaultObjectPoolProvider>();
builder.Services.AddSingleton(
    sp => sp.GetRequiredService<ObjectPoolProvider>().CreateStringBuilderPool());

var host = builder.Build()
    .DetectClientCulture();

await JSHost.ImportAsync(
    moduleName: nameof(JavaScriptModule),
    moduleUrl: $"../site.js?{Guid.NewGuid()}" /* cache bust */);

await host.RunAsync();
```

The client app configures itself as follows:

- `AppState` is added
- Support for HTTP requests is added
- A custom service named `OpenAIPromptQueue` is added as a singleton
- Local and session storage services are added
- Speech synthesis and recognition services are added
- [**MudBlazor**](https://mudblazor.com) services are added
- A `CultureService` is added
- Object pools are used and expose the default `StringBuilder` pool for optimal performance
- Once the `builder` is built, the client's culture is detected (the app may restart if needed)
- The `JSHost` is used to import the `site.js` file, which defines an ES6 module that's used to expose `scrollIntoView` functionality on the client
- Finally, the `host` is run

The `JavaScriptModule` class defines the connection between the app's _site.js_ code, consider the _JavaScriptModule.cs_ file:

```csharp
// Copyright (c) David Pine. All rights reserved.
// Licensed under the MIT License.

namespace Azure.OpenAI.Client.Interop;

internal sealed partial class JavaScriptModule
{
    [JSImport("scrollIntoView", nameof(JavaScriptModule))]
    public static partial Task ScrollIntoView(string id);
}
```

The class is marked as `partial`, as well as the `ScrollIntoView` method. There is a source generator that provides the bridge between the C# and JavaScript code. This is the same idea that I've written about with my side-project named {{< i fa-bolt >}} [**Blazorators**]({{< ref "blazorators.md" >}} "Blazorators") 🤓!

The corresponding JavaScript code is defined in the _site.js_ file:

```javascript
export function scrollIntoView(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
        });
    }
}
```

This code simply exports a `scrollIntoView` function that's used to scroll the given element into view. The `id` is used to find the element, and if found, the element is scrolled into view smoothly.

The `OpenAIPromptQueue` is a custom service that's used to queue up the user's prompts and the AI's responses. The `OpenAIPromptQueue` is defined as follows:

```csharp
// Copyright (c) David Pine. All rights reserved.
// Licensed under the MIT License.

namespace Azure.OpenAI.Client.Services;

public sealed partial class OpenAIPromptQueue
{
    readonly IServiceProvider _provider;
    readonly ILogger<OpenAIPromptQueue> _logger;
    readonly ObjectPool<StringBuilder> _builderPool;
    Task? _processPromptTask = null;

    public OpenAIPromptQueue(
        IServiceProvider provider,
        ILogger<OpenAIPromptQueue> logger,
        ObjectPool<StringBuilder> builderPool) =>
        (_provider, _logger, _builderPool) = (provider, logger, builderPool);

    public void Enqueue(string prompt, Func<PromptResponse, Task> handler)
    {
        if (_processPromptTask is not null)
        {
            return;
        }

        _processPromptTask = Task.Run(async () =>
        {
            var responseBuffer = _builderPool.Get();
            responseBuffer.Clear(); // Ensure initial state is empty.

            var isError = false;
            var debugLogEnabled = _logger.IsEnabled(LogLevel.Debug);

            try
            {
                using var scope = _provider.CreateScope();
                using var client = 
                    scope.ServiceProvider.GetRequiredService<HttpClient>();

                var options = JsonSerializationDefaults.Options;
                var chatPrompt = new ChatPrompt { Prompt = prompt };
                var json = chatPrompt.ToJson(options);
                using var body = new StringContent(
                    json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync(
                    "api/openai/chat", body);
                response.EnsureSuccessStatusCode();

                using var stream = await response.Content.ReadAsStreamAsync();

                await foreach (var tokenizedResponse in
                    JsonSerializer.DeserializeAsyncEnumerable<TokenizedResponse>(
                        stream, options))
                {
                    if (tokenizedResponse is null)
                    {
                        continue;
                    }

                    responseBuffer.Append(tokenizedResponse.Content);

                    var responseText = NormalizeResponseText(
                        responseBuffer, _logger, debugLogEnabled);

                    await handler(
                        new PromptResponse(
                            prompt, responseText, false));

                    // Required for Blazor to render live updates.
                    await Task.Delay(1);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Unable to generate response: {Error}",
                    ex.Message);

                await handler(
                    new PromptResponse(
                        prompt, ex.Message, true, isError = true));
            }
            finally
            {
                if (isError is false)
                {
                    var responseText = NormalizeResponseText(
                        responseBuffer, _logger, debugLogEnabled);

                    await handler(
                        new PromptResponse(
                            prompt, responseText, true));
                }

                _builderPool.Return(responseBuffer);
                _processPromptTask = null;
            }
        });
    }

    private static string NormalizeResponseText(
        StringBuilder builder, ILogger logger, bool debugLogEnabled)
    {
        if (builder is null or { Length: 0 })
        {
            return "";
        }

        var text = builder.ToString();

        if (debugLogEnabled)
        {
            logger.LogDebug(
                "Before normalize:{Newline}{Tab}{Text}",
                Environment.NewLine, '\t', text);
        }

        text = LineEndingsRegex().Replace(text, "\n");
        text = Regex.Unescape(text);

        if (debugLogEnabled)
        {
            logger.LogDebug(
                "After normalize:{Newline}{Tab}{Text}",
                Environment.NewLine, '\t', text);
        }

        return text;
    }

    [GeneratedRegex("\\r\\n|\\n\\r|\\r")]
    private static partial Regex LineEndingsRegex();
}
```

Ignore the normalization bits, they did seem to be needed as the OpenAI responses will vary in line endings — so I felt inclined to normalize all responses, it may not be needed but I like consistency.

While this queuing class is a bit verbose, [{{< i fa-link >}} I have an official .NET API proposal in the works that should dramatically improve this streaming experience when receiving an `IAsyncEnumerable<T>` HTTP endpoint](https://github.com/dotnet/runtime/issues/87577) — I'd love 💜 your thoughts on this proposal, give me a reaction or drop a comment. In this case, we know that `T` is the `TokenizedResponse` type.

Since these convenience based-methods are not yet available at the time of writing, we have to do a bit of work to get the streaming response from the AI. The `Enqueue` method is used to queue up the user's prompt and the AI's response. The `handler` is a callback that's invoked when the AI responds. The functionality is defined as follows:

- If the `_processPromptTask` is not `null`, then we're already processing a prompt, so we can return early
- Otherwise, call `Task.Run`:
  - Get a `responseBuffer` from the `StringBuilder` pool
  - Clear the `responseBuffer` to ensure it's empty before use
  - Create a `scope` and `HttpClient` instance from the `ServiceProvider`
  - Call the HTTP `POST` endpoint to send the user's prompt to the AI
  - If the request is successful, then we can start processing the response as a stream

The real magic is mapping the `stream` to the `JsonSerializer.DeserializeAsyncEnumerable<TokenizedResponse>(stream, options)` call, which is asynchronously enumerating the `TokenizedResponse` instances as they are received in real-time. The `handler` is invoked and the UI updates as if the response is being written live into the browser.

### Example HTTP request and streaming response

If I prompt the app with the following HTTP POST request:

```http
POST /api/openai/chat HTTP/1.1
HOST: localhost:7184
Content-Type: application/json; charset=utf-8

{ "prompt": "State your name and purpose." }
```

One possible response from the AI is streamed back to the client as follows:

```json
[
    {
        "content": null
    },
    {
        "content": "My"
    },
    {
        "content": " name"
    },
    {
        "content": " is"
    },
    {
        "content": " **"
    },
    {
        "content": "Bl"
    },
    {
        "content": "azor"
    },
    {
        "content": " Cl"
    },
    {
        "content": "ippy"
    },
    {
        "content": "**"
    },
    {
        "content": " and"
    },
    {
        "content": " my"
    },
    {
        "content": " purpose"
    },
    {
        "content": " is"
    },
    {
        "content": " to"
    },
    {
        "content": " assist"
    },
    {
        "content": " developers"
    },
    {
        "content": " in"
    },
    {
        "content": " writing"
    },
    {
        "content": " code"
    },
    {
        "content": " more"
    },
    {
        "content": " efficiently"
    },
    {
        "content": "."
    },
    {
        "content": " I"
    },
    {
        "content": "'m"
    },
    {
        "content": " here"
    },
    {
        "content": " to"
    },
    {
        "content": " help"
    },
    {
        "content": " you"
    },
    {
        "content": " with"
    },
    {
        "content": " code"
    },
    {
        "content": "-related"
    },
    {
        "content": " tasks"
    },
    {
        "content": ","
    },
    {
        "content": " answer"
    },
    {
        "content": " questions"
    },
    {
        "content": ","
    },
    {
        "content": " and"
    },
    {
        "content": " provide"
    },
    {
        "content": " guidance"
    },
    {
        "content": " where"
    },
    {
        "content": " needed"
    },
    {
        "content": "."
    },
    {
        "content": " Let"
    },
    {
        "content": " me"
    },
    {
        "content": " know"
    },
    {
        "content": " how"
    },
    {
        "content": " I"
    },
    {
        "content": " can"
    },
    {
        "content": " be"
    },
    {
        "content": " of"
    },
    {
        "content": " assistance"
    },
    {
        "content": "!"
    },
    {
        "content": null
    }
]
```

Each `{ "content": "<value>" }` object is a `TokenizedResponse` instance, and the `content` property was generated. The `null` values are the AI's way of indicating the start and end of the stream response. This entire response is streamed into the user's browser in real-time, and the UI is updated as the response is received.

**Here's this specific example as rendered on the UI:**

![Here's this specific example as rendered on the UI](/img/2023/06/example.png "Here's this specific example as rendered on the UI")

The client app demonstrates several other really interesting aspects of client-side app development with .NET, I encourage you to check out the source code to see how it all works.

## In conclusion

The app has several other major features that I'm proud of, and I hope you'll enjoy seeing them. Here are a few screenshots of the app in action:

**The first example is a user prompt and AI response:**

![The first example is a user prompt and AI response](/img/2023/06/response.png "The first example is a user prompt and AI response")

**The next question being asked and the response being generated:**

![The next question being asked and the response being generated](/img/2023/06/response-two.png "The next question being asked and the response being generated")

Feel free to share this Tweet, as it was a bit of an inspiration to finish this post...I hope you enjoyed it.

{{< x user="IEvangelist" id="1668970304553582592" >}}

The major takeaways from this post are:

- You can share models between the server and the client code
- You can return `IAsyncEnumerable<T>` to stream data to the client
- You can consume the `IAsyncEnumerable<T>` on the client to stream data to the UI

Here's the [{{< i fa-github >}} GitHub repository link: `https://github.com/IEvangelist/blazor-azure-openai` {{< i fa-external-link >}}](https://github.com/IEvangelist/blazor-azure-openai)

🙌🏽 I'm also excited to see what you build with the OpenAI API. If you have any questions, please feel free to reach out to me on [Twitter](https://twitter.com/davidpine7) or [GitHub](https://github.com/IEvangelist).
