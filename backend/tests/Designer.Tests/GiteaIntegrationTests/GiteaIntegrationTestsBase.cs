﻿using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Designer.Tests.Controllers.ApiTests;
using Designer.Tests.Fixtures;
using DotNet.Testcontainers.Builders;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Mvc.Testing.Handlers;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Designer.Tests.GiteaIntegrationTests;

[Trait("Category", "GiteaIntegrationTest")]
[Collection(nameof(GiteaCollection))]
public abstract class GiteaIntegrationTestsBase<TControllerTest> : ApiTestsBase<TControllerTest>
    where TControllerTest : class
{
    protected readonly GiteaFixture GiteaFixture;

    protected string CreatedFolderPath { get; set; }

    private CookieContainer CookieContainer { get; } = new CookieContainer();

    /// On some systems path too long error occurs if repo is nested deep in file system.
    protected override string TestRepositoriesLocation =>
        Path.Combine(Path.GetTempPath(), "altinn", "tests", "repos");


    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (!disposing)
        {
            return;
        }

        DeleteDirectoryIfExists(CreatedFolderPath);
    }

    protected static void DeleteDirectoryIfExists(string directoryPath)
    {
        if (string.IsNullOrWhiteSpace(directoryPath) || !Directory.Exists(directoryPath))
        {
            return;
        }

        var directory = new DirectoryInfo(directoryPath)
        {
            Attributes = FileAttributes.Normal
        };

        foreach (var info in directory.GetFileSystemInfos("*", SearchOption.AllDirectories))
        {
            info.Attributes = FileAttributes.Normal;
        }

        directory.Delete(true);
    }

    protected override void ConfigureTestServices(IServiceCollection services)
    {

    }

    protected GiteaIntegrationTestsBase(WebApplicationFactory<Program> factory, GiteaFixture giteaFixture) : base(factory)
    {
        GiteaFixture = giteaFixture;
    }

    protected override HttpClient GetTestClient()
    {
        string configPath = GetConfigPath();

        var client = Factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, conf) =>
            {
                conf.AddJsonFile(configPath);
                conf.AddJsonStream(GenerateGiteaOverrideConfigStream());
            });

            builder.ConfigureTestServices(ConfigureTestServices);
        }).CreateDefaultClient(new GiteaAuthDelegatingHandler(GiteaFixture.GiteaUrl), new CookieContainerHandler(CookieContainer));
        return client;
    }

    protected Stream GenerateGiteaOverrideConfigStream()
    {
        string reposLocation = new Uri(TestRepositoriesLocation).AbsolutePath;
        string templateLocationPath = Path.Combine(CommonDirectoryPath.GetSolutionDirectory().DirectoryPath, "..", "testdata", "AppTemplates", "AspNet");
        string templateLocation = new Uri(templateLocationPath).AbsolutePath;
        string configOverride = $@"
              {{
                    ""ServiceRepositorySettings"": {{
                        ""RepositoryLocation"": ""{reposLocation}"",
                        ""ApiEndPointHost"": ""localhost"",
                        ""GiteaLoginUrl"": ""{GiteaFixture.GiteaUrl + "user/login"}"",
                        ""ApiEndPoint"": ""{GiteaFixture.GiteaUrl + "api/v1/"}"",
                        ""RepositoryBaseURL"": ""{GiteaFixture.GiteaUrl[..^1]}""
                    }},
                    ""GeneralSettings"": {{
                        ""TemplateLocation"": ""{templateLocation}"",
                        ""DeploymentLocation"": ""{templateLocation}/deployment"",
                        ""AppLocation"": ""{templateLocation}/App""
                    }}
              }}
            ";
        var configStream = new MemoryStream(Encoding.UTF8.GetBytes(configOverride));
        configStream.Seek(0, SeekOrigin.Begin);
        return configStream;
    }
    protected async Task CreateAppUsingDesigner(string org, string repoName)
    {
        CreatedFolderPath = $"{TestRepositoriesLocation}/{GiteaConstants.TestUser}/{org}/{repoName}";
        // Create repo with designer
        using HttpRequestMessage httpRequestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            $"designer/api/repos/create-app?org={org}&repository={repoName}");

        using HttpResponseMessage response = await HttpClient.SendAsync(httpRequestMessage);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    protected static string GetCommitInfoJson(string text, string org, string repository) =>
        @$"{{
                    ""message"": ""{text}"",
                    ""org"": ""{org}"",
                    ""repository"": ""{repository}""
                }}";

    protected static string GenerateCommitJsonPayload(string text, string message) =>
        @$"{{
                 ""author"": {{
                     ""email"": ""{GiteaConstants.AdminEmail}"",
                     ""name"": ""{GiteaConstants.AdminUser}""
                 }},
                 ""committer"": {{
                     ""email"": ""{GiteaConstants.AdminEmail}"",
                     ""name"": ""{GiteaConstants.AdminUser}""
                 }},
                 ""content"": ""{Convert.ToBase64String(Encoding.UTF8.GetBytes(text))}"",
                 ""dates"": {{
                     ""author"": ""{DateTime.Now:O}"",
                     ""committer"": ""{DateTime.Now:O}""
                 }},
                 ""message"": ""{message}"",
                 ""signoff"": true
            }}";
}
