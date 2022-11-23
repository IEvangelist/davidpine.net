+++
author = "David Pine"
categories = ["CSharp", ".NET", "GitHub"]
date = "2022-11-21" # "2022-12-01"
description = "The .NET equivalent of the official GitHub actions/toolkit @actions/core project."
featured = "exploration.png"
images = ["/img/2017/03/exploration.png"]
featuredalt = ""
featuredpath = "date"
linktitle = ""
title = "Hello from the GitHub Actions Workflow .NET SDK"
type = "post"

+++

# GitHub Actions: Workflow .NET SDK

If you're unfamiliar with GitHub Actions, the **TL;DR;** is that they allow you to automate build, test, package, and deploy your code. If you want a deeper look beyond that definition, see [GitHub Docs: Actions](https://docs.github.com/actions). Just know that GitHub Actions are a powerful tool, and the team has done an amazing job of making them easy to use.

The GitHub team has a [`toolkit`](https://github.com/actions/toolkit) that they maintain, but it's written in TypeScript. I wanted to create a .NET equivalent of the `@actions/core` project. The `core` project is the one that allows you to interact with the GitHub Actions workflow. It allows you to set outputs, get inputs, and log messages. The specification of the standard I/O with the execution context is well documented, but it defines specific environment variables that you can use to interact with the workflow. Let's have a look at the possible inputs and outputs, and the formats in which they can be set.

## Commanding the workflow

{{< i fa-github >}} GitHub Action workflows rely heavily on environment variables. The following are the environment variables that are used to interact with the workflow:

- `GITHUB_ACTION`: The name of the action.
- `GITHUB_OUTPUT`: A file path to a file containing any custom data that the workflow cares to write.
- `GITHUB_PATH`: A file path to a file containing environment variables to add to the `PATH` environment variable for all subsequent steps in the current job.
- `GITHUB_STATE`: Custom user data that is persisted across workflow jobs and steps.
- `GITHUB_TOKEN`: The token used to authenticate with GitHub. This value is provided by GitHub, and contextually available to make whatever `permissions` the workflow has available to it. This value is always written to the log in a masked format.

## Outputs

The workflow can write outputs to a file. The file is written to the file path from the `GITHUB_OUTPUT` environment variable. The output in this scenario would be a JSON file that contains anything we want to serialize to and from. We're not limited by that, it is trivial in C# with the `System.IO` for reading and writing JSON, and either `System.Text.Json` or `Newtonsoft.Json` for JSON serialization of C# objects. In addition to files, any arbitrary string can be written to the log. The log is written to the standard output stream and is available to the workflow. Certain logged messages are treated as special and are parsed by the workflow. The following are the special messages that are parsed by the workflow:

| Command name | Description |
|---|---|
| `add-mask` | Registers a secret which will get masked from logs. |
| `add-path` | Prepends the input path to the `PATH` (for this action and future actions). |
| `echo` | Enables or disables the echoing of commands into stdout for the rest of the step. |
| `debug` | Writes debug message to user log. |
| `error` | Adds an error issue. |
| `warning` | Adds a warning issue. |
| `notice` | Adds a notice issue. |
| `group` | Begin an output group. |
| `endgroup` | End the output group. |

If you're seeing these commands and wondering where the `save-state` and `set-output` commands are, they have been deprecated. For more information, see [GitHub Actions: Deprecating `save-state` and `set-output` commands](https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands).

### Command format

Workflow commands are written to the standard output stream. For a command with a name of `name`, properties of `{ "key1" = "value", "key2" = "value" }`, and a message of `message`, it's formatted as follows when issued to the standard output stream:

```console
::name key1=value,key2=value::message
```

Another example is when writing a debug message to the log:One final example is the command to `set-env`:

```console
::set-env name=ENVIRONMENT_VARIABLE::value
```

### File commands

In addition to standard commands, file commands are also supported. File commands write to a file instead of the standard output stream. A file command is free to write any value to the file. The following are file-based commands:

- `set-env`: Writes the value to the file path from the `GITHUB_ENV` environment variable.
- `save-state`: Writes the value to the file path from the `GITHUB_STATE` environment variable.
- `set-output`: Writes the value to the file path from the `GITHUB_OUTPUT` environment variable.
- `add-path`: Writes the value to the file path from the `GITHUB_PATH` environment variable.
