using Confluent.Kafka;
using Npgsql;
using TNO.Health.HealthChecks.LinuxDiskStorage;
using TNO.Health.HealthChecks.Configs.DiskStorage;
using TNO.Health.HealthChecks.Configs.OpenShiftServices;
using System.Configuration;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using HealthChecks.UI.Client;

namespace TNO.API.Extensions
{
    /// <summary>
    /// ServiceCollectionExtensions static class, provides extension methods for ServiceCollection objects.
    /// </summary>
    public static class HealthChecksExtensions
    {
        /// <summary>
        /// Add Health Checks to the dependency injection service collection.
        /// </summary>
        /// <param name="services"></param>
        /// <param name="config"></param>
        /// <returns></returns>
        public static IServiceCollection AddApiHealthChecks(this IServiceCollection services, IConfiguration config)
        {
            var kafkaProducerConfig = new ProducerConfig();
            config.GetSection("Kafka:Producer").Bind(kafkaProducerConfig);
            services.AddHealthChecks()
                .AddKafka(
                    kafkaProducerConfig,
                    topic: "healthchecks-topic",
                    name: "kafka health",
                    tags: new[] { "ready", "detail" }
                );

            var postgresBuilder = new NpgsqlConnectionStringBuilder(config["ConnectionStrings:TNO"]);
            var userId = config["DB_POSTGRES_USERNAME"];
            var pwd = config["DB_POSTGRES_PASSWORD"];
            postgresBuilder.Username = userId;
            postgresBuilder.Password = pwd;
            services.AddHealthChecks()
                .AddNpgSql(
                    postgresBuilder.ConnectionString,
                    tags: new[] { "ready", "detail" }
                );

            var elasticUrl = config.GetValue<string>("Elastic:Url");
            if (elasticUrl == null) throw new ConfigurationErrorsException("Elastic configuration property 'Elastic:Url' is required'");
            var username = Environment.GetEnvironmentVariable("ELASTIC_USERNAME") ?? throw new ConfigurationErrorsException("Elastic environment variable 'ELASTIC_USERNAME' is required.");
            var password = Environment.GetEnvironmentVariable("ELASTIC_PASSWORD") ?? throw new ConfigurationErrorsException("Elastic environment variable 'ELASTIC_PASSWORD' is required.");
            services.AddHealthChecks()
                .AddElasticsearch(setup =>
                    {
                        setup.UseServer(elasticUrl.ToString())
                        .UseBasicAuthentication(username, password);
                    },
                    tags: new[] { "ready", "detail" }
                );

            var diskStorageConfig = new DiskStorageConfig();
            config.GetSection("HealthChecks").Bind(diskStorageConfig);
            diskStorageConfig.DiskStorageHealthChecks.ToList().ForEach(
                dsc =>
                {
                    services.AddHealthChecks()
                    .AddLinuxDiskStorageHealthCheck(
                        x => x.AddDrive(dsc.DrivePath, dsc.MinimumFreeMegabytes),
                        name: $"Disk Storage: {dsc.Name}",
                        tags: new[] { "ready", "detail" }
                    );
                }
            );

            var openShiftServiceHealthCheckConfig = new OpenShiftServiceHealthCheckConfig();
            config.GetSection("HealthChecks").Bind(openShiftServiceHealthCheckConfig);
            openShiftServiceHealthCheckConfig.OpenShiftServices.ToList().ForEach(
                osc =>
                {
                    var healthCheckUrl = osc.HealthCheckUrlOverride ?? $"http://{osc.ServiceName}:{osc.HealthCheckPortOverride}{osc.HealthCheckPathOverride ?? "/health/ready/detail"}";
                    services.AddHealthChecks()
                        .AddUrlGroup(
                            new Uri(healthCheckUrl),
                            name: $"Service: {osc.Name}",
                            tags: new[] { "detail" }
                        );
                });

            return services;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="app"></param>
        public static void ConfigureHealthCheckEndPoints(this IApplicationBuilder app)
        {
            app.UseHealthChecks("/health/live", new HealthCheckOptions()
            {
                Predicate = (_) => false
            });
            app.UseHealthChecks("/health/ready", new HealthCheckOptions
            {
                Predicate = (check) => check.Tags.Contains("ready"),
            });
            // app.UseHealthChecks("/health-details",
            //     new HealthCheckOptions
            //     {
            //         ResponseWriter = async (context, report) =>
            //         {
            //             var result = JsonSerializer.Serialize(
            //                 new
            //                 {
            //                     status = report.Status.ToString(),
            //                     monitors = report.Entries.Select(e => new { key = e.Key, value = Enum.GetName(typeof(HealthStatus), e.Value.Status) })
            //                 });
            //             context.Response.ContentType = MediaTypeNames.Application.Json;
            //             await context.Response.WriteAsync(result);
            //         }
            //     }
            // );
            app.UseHealthChecks("/health/ready/detail", new HealthCheckOptions
            {
                Predicate = (check) => check.Tags.Contains("detail"),
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

        }
    }
}
