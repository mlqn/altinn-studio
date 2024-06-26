﻿using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Designer.Tests.Utils;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using SharedResources.Tests;
using Xunit;

namespace Designer.Tests.Controllers.PreviewController
{
    public class LayoutSettingsTests : PreviewControllerTestsBase<LayoutSettingsTests>, IClassFixture<WebApplicationFactory<Program>>
    {
        public LayoutSettingsTests(WebApplicationFactory<Program> factory) : base(factory)
        {
        }

        [Fact]
        public async Task Get_LayoutSettings_Ok()
        {
            string expectedLayoutSettings = TestDataHelper.GetFileFromRepo(Org, AppV3, Developer, "App/ui/Settings.json");

            string dataPathWithData = $"{Org}/{AppV3}/api/layoutsettings";
            using HttpRequestMessage httpRequestMessage = new(HttpMethod.Get, dataPathWithData);

            using HttpResponseMessage response = await HttpClient.SendAsync(httpRequestMessage);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            string responseBody = await response.Content.ReadAsStringAsync();
            JsonUtils.DeepEquals(expectedLayoutSettings, responseBody).Should().BeTrue();
        }
    }
}
