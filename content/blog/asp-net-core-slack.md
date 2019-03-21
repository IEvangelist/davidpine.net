+++
author = "David Pine"
categories = ["ASP.NET Core", "Slack", "CSharp"]
date = "2019-03-21"
description = "C# Slack API Integrations"
featured = "pinned-msg.png"
images = ["/img/2019/03/pinned-msg.png"]
featuredalt = ""
featuredpath = "date"
linktitle = ""
title = "ASP.NET Core - Slack Slash Commands"
type = "post"
+++

# Background

Most of us are all "slackers", meaning we truly do spend a significant amount of time using <i class="fa fa-slack" aria-hidden="true"></i> Slack.

> <p> Slack is a collaboration hub for work, no matter what work you do. It’s a place where conversations happen, decisions are made, and information is always at your fingertips. <cite><a href='https://www.slack.com' target='_blank'>www.slack.com</a></cite>

It's wildly popular in the Developer Community! In fact, almost to a fault...people are constantly sharing their "slack fatigue". I am personally a part of roughly twenty slack workspace's. One of the really cool features of slack is the ability to integrate with the tool itself through the Slack API. Imagine a plugin playground where you're free to extend the capabilities of the slack ecosystem. Look to the <a href='https://api.slack.com/' target='_blank'><i class="fa fa-slack" aria-hidden="true"></i> Slack API</a>. 

## Slash Commands

A slack "slash command" is a command that slack enables when typing a leading `/` into the chat message input. It displays an autocomplete (or pseudo Intellisense) with the available slash commands that exist in the current workspace. You add slash commands to workspace's that you're a member of via the settings. We'll cover that in more detail a bit later, let's focus on building the application now that we have an understanding of the integration capabilities.

## ASP.NET Core Web API

We're building an __ASP.NET Core Web API__ application. We'll expose a few bits of functionality for jokes, weather and `bit.ly` integration to shorten urls. The slash commands are explained below. 

 - `/joke` random nerdy Chuck Norris joke and `/joke [share]` (shares the joke in the channel)
 - `/weather [zip-code]` returns detailed weather with corresponding emoji -- from open weather API
 - `/shortenUrl [longUrl]` shortens a long URL, relies on bit.ly API

We will need to add a few configurations, services, models and routes to satisfy the desired functionality. 

### Prerequisites

The <a href='http://www.icndb.com/api/' target='_blank'>internet chuck norris database</a> is one of my goto APIs for demonstrations. It doesn't require an API key, nor anything else. However, several of the other bits of functionality require registering for the API.

 - <a href='https://www.bitly.com' target='_blank'>__Bit.ly API__</a>: sign up and get your API key
 - <a href='https://openweathermap.org/api' target='_blank'>__Open Weather API__</a>: sign up and <a href='https://home.openweathermap.org/api_keys' target='_blank'>generate an API key</a>

With these various API keys, we'll need to add a few environment variables. From the command line, execute the following commands.

```bash
setx BitlyOptions__Login [Bit.ly Login]
setx BitlyOptions__ApiKey [Bit.ly API Key]
setx OpenWeatherMapOptions__Key [Open Weather Key]
```

> <p/> <cite><strong>ProTip</strong></cite>
You will need to restart __Visual Studio__ in order for the newly added environment variables to be available.

<br/>

### Slack API - Slash Command Request

Let's take a look at an example controller, the `WeatherController`.

```cs
using System;
using System.Threading.Tasks;
using IEvangelist.Slack.SlashCommands.Configuration;
using IEvangelist.Slack.SlashCommands.Extensions;
using IEvangelist.Slack.SlashCommands.Interfaces;
using IEvangelist.Slack.SlashCommands.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace IEvangelist.Slack.SlashCommands.Controllers
{
    [ApiController, Route("api/weather")]
    public class WeatherController : ControllerBase
    {
        readonly IWeatherService _weatherService;
        readonly SlackOptions _slackOptions;

        public WeatherController(
            IWeatherService weatherService,
            IOptions<SlackOptions> slackOptions)
        {
            _weatherService = weatherService;
            _slackOptions = 
                slackOptions?.Value 
                ?? throw new ArgumentNullException(nameof(slackOptions));
        }

        [
            HttpPost,
            Consumes("application/x-www-form-urlencoded"),
            Produces("application/json")
        ]
        public async Task<ActionResult> Weather(
            [FromForm] SlackCommandRequest request)
        {
            var response = await _weatherService.GetWeatherAsync(request.Text);
            return new JsonResult(new
            {
                text = response.ToString()
            });
        }
    }
}
```

There are a few noteworthy considerations here. First, the `Weather` action is an HTTP Post that consumes `application/x-www-form-urlencoded` and produces `application/json`. From the post's form, we'll deserialize into the `SlackCommandRequest` object that looks like this.

```cs
using Newtonsoft.Json;

namespace IEvangelist.Slack.SlashCommands.Models
{
    public class SlackCommandRequest
    {
        public string Token { get; set; }

        [JsonProperty("team_id")]
        public string TeamId { get; set; }

        [JsonProperty("team_domain")]
        public string TeamDomain { get; set; }

        [JsonProperty("enterprise_id")]
        public string EnterpriseId { get; set; }

        [JsonProperty("enterprise_name")]
        public string EnterpriseName { get; set; }

        [JsonProperty("channel_id")]
        public string ChannelId { get; set; }

        [JsonProperty("channel_name")]
        public string ChannelName { get; set; }

        [JsonProperty("user_id")]
        public string UserId { get; set; }

        [JsonProperty("user_name")]
        public string UserName { get; set; }

        public string Command { get; set; }

        public string Text { get; set; }

        [JsonProperty("response_url")]
        public string ResponseUrl { get; set; }

        [JsonProperty("trigger_id")]
        public string TriggerId { get; set; }
    }
}
```

This is the shape of the object that slack's API returns for all slash commands.

> <p/> <cite><strong>Disclaimer</strong></cite>
I attempted to verify the slack request, however; I couldn't get it working. See <a href='https://api.slack.com/docs/verifying-requests-from-slack' target=''>verifying requests from slack</a> for more details and <a href='https://github.com/IEvangelist/IEvangelist.Slack.SlashCommands/blob/master/IEvangelist.Slack.SlashCommands/Extensions/SlackCommandRequestExtensions.cs' target='_blank'>my attempt</a>

<br/>

### 😨 HttpClient

Our application will need to make external API calls, we will use the `HttpClient` to do this. To help alleviate the concern of socket exhaustion when using `HttpClient` the __ASP.NET Core__ has middleware for offering up an `IHttpClientFactory`. The `IHttpClientFactory` can create `HttpClient` instances using the appropriate constructor. For more details on __ASP.NET Core__ usage of `HttpClient` please see <a href='https://docs.microsoft.com/en-us/aspnet/core/fundamentals/http-requests?view=aspnetcore-2.2' target='_blank'>making HTTP requests using `IHttpClientFactory` in __ASP.NET Core__</a>.

In the `Startup.ConfigureServices` method, we'll add the `HttpClient` by invoking the `.AddHttpClient` extension. This wires up all the services for resolving an instance of `IHttpClientFactory`. Then we will add some 💪-typed clients for the `WeatherService` and `UrlService`. We configure the typed clients by specifying their base address.

#### Registering Services

As previously mentioned, we have several primary intents for this application. We register some of the services differently, but it's good to see this as it exemplifies the various capabilities.

```cs
// Joke Service
services.AddHttpClient();
services.AddTransient<IJokeService, JokeService>();

// Weather Service
services.AddHttpClient<IWeatherService, WeatherService>(
    client => client.BaseAddress = new Uri("http://api.openweathermap.org/data/2.5/weather"));

// URL Service
services.AddHttpClient<IUrlService, UrlService>(
    client => client.BaseAddress = new Uri("https://api-ssl.bitly.com/v3/"));
```

#### Example Service

This is the implementation of the `IJokeService` which demonstrates how simple the consumption of the `HttpClient` is and how to easily call out to an external API. This pattern is essentially repeated in the implementations of the `IUrlService` and the `IWeatherService`, but they're obviously calling out to different APIs with different parameters and mapping to the appropriate response type.

```cs
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using IEvangelist.Slack.SlashCommands.Extensions;
using IEvangelist.Slack.SlashCommands.Interfaces;
using IEvangelist.Slack.SlashCommands.Models;

namespace IEvangelist.Slack.SlashCommands.Services
{
    public class JokeService : IJokeService
    {
        readonly IList<string> _positiveEmoji = new List<string>
        {
            ":smile:",
            ":smirk:",
            ":clap:",
            ":joy:",
            ":grin:",
            ":yum:",
            ":sweat_smile:",
            ":laughing:",
            ":smiley:",
            ":rolling_on_the_floor_laughing:"
        };

        readonly IHttpClientFactory _httpClientFactory;

        public JokeService(IHttpClientFactory httpClientFactory)
            => _httpClientFactory = httpClientFactory;

        public async Task<JokeResponse> GetJokeAsync()
        {
            var client = _httpClientFactory.CreateClient();
            var json = 
                await client.GetStringAsync(
                    "https://api.icndb.com/jokes/random?limitTo=[nerdy]");

            return json.To<JokeResponse>();
        }

        public string GetRandomJokeEmoji()
            => _positiveEmoji.RandomElement();
    }
}
```

This example service didn't map the `.BaseAddress` so we use a fully qualified request URL. Additionally, this services provides a method for getting a random positive emoji that we'll append to the message when we respond to the slack slash command request. 

## Putting It All Together

With the application written, published to Azure App Service and integrated with Slack - we can start using it immediately. Open the <a href='https://api.slack.com/apps' target='_blank'>Slack API Apps - Console</a> and "Create New App". Give your app a name and select the target workspace you'd like to target.

<img src='/img/2019/03/create-app.png' alt='Create App' class='shadow' />

Next, under "Features and Functionality" select "Slash Commands" to begin configuring the commands. Click "Create Command" and configure it by simply giving it a name, a URL for the API endpoint and a few other details.

<img src='/img/2019/03/create-command.png' alt='Create Command' class='shadow' />

#### Joke Command

This is the `/joke` command, it also support an optional `share` command which will share the joke with everyone in the current channel.

<img src='/img/2019/03/jokes.gif' alt='Jokes Command' class='shadow' />

#### Weather Command

This is the `/weather [zip code]` command, entering your zip code should yield a text representation of the weather as it corresponds to the given zip code.

<img src='/img/2019/03/weather.gif' alt='Weather Command' class='shadow' />

Some people have noticed that I named the app "I've Got Jokes", but it has a weather endpoint...it's not really funny weather, it has more of a "dry" sense of humor - even on a rainy day.

#### Shorten URL Command

This is the `/shortenUrl [long url]` command. Given a URL it will shorten the URL using bit.ly API. Perhaps you're curious what long URL I shortened here, well this is <a href='http://bit.ly/2FmmgyC' target='_blank'>the bit.ly 🤣</a>.

<img src='/img/2019/03/url.gif' alt='Shorten URL Command' class='shadow' />

## Conclusion

To recap we simply put together an __ASP.NET Core__ Web API application that was published up to Azure as an App Service. The endpoints are configured as we integrate with the slack API, and ta-da...magic. All of this source code is up on <a href='https://github.com/ievangelist/IEvangelist.Slack.SlashCommands' target='_blank'><i class='fa fa-github'></i> GitHub</a>. As always, feel free to star, fork and send me a pull-request!

### Additional Resources

 - <a href='https://docs.microsoft.com/en-us/visualstudio/deployment/quickstart-deploy-to-azure?view=vs-2017' target='_blank'>Deploy To Azure App Service</a>
 - <a href='https://api.slack.com/docs/verifying-requests-from-slack' target='_blank'>Verifying Slack Request</a>
 - <a href='https://api.slack.com/slash-commands' target='_blank'>Slack API - Slash Commands</a>