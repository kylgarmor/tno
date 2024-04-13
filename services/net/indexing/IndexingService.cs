using Microsoft.Extensions.DependencyInjection;
using Confluent.Kafka;
using TNO.Kafka;
using TNO.Kafka.Models;
using TNO.Services.Indexing.Config;
using TNO.Services.Runners;
using System.Configuration;

namespace TNO.Services.Indexing;

/// <summary>
/// IndexingService abstract class, provides a console application that runs service, and an api.
/// The IndexingService is a Kafka consumer which pulls indexing.
/// </summary>
public class IndexingService : KafkaConsumerService
{
    #region Variables
    #endregion

    #region Properties
    #endregion

    #region Constructors
    /// <summary>
    /// Creates a new instance of a IndexingService object, initializes with arguments.
    /// </summary>
    /// <param name="args"></param>
    public IndexingService(string[] args) : base(args)
    {
    }
    #endregion

    #region Methods
    /// <summary>
    /// Configure dependency injection.
    /// </summary>
    /// <param name="services"></param>
    /// <returns></returns>
    protected override IServiceCollection ConfigureServices(IServiceCollection services)
    {
        base.ConfigureServices(services);
        services
            .Configure<IndexingOptions>(this.Configuration.GetSection("Service"))
            .Configure<ProducerConfig>(this.Configuration.GetSection("Kafka:Producer"))
            .Configure<AdminClientConfig>(this.Configuration.GetSection("Kafka:Admin"))
            .AddSingleton<IKafkaAdmin, KafkaAdmin>()
            .AddTransient<IKafkaListener<string, IndexRequestModel>, KafkaListener<string, IndexRequestModel>>()
            .AddScoped<IServiceManager, IndexingManager>();

        // TODO: Figure out how to validate without resulting in aggregating the config values.
        // services.AddOptions<IndexingOptions>()
        //     .Bind(this.Configuration.GetSection("Service"))
        //     .ValidateDataAnnotations();

        return services;
    }
    
    /// <summary>
    /// Add health checks specific to this service
    /// </summary>
    /// <param name="services"></param>
    /// <returns></returns>
    protected override IServiceCollection AddCustomHealthChecks(IServiceCollection services)
    {
        base.AddCustomHealthChecks(services);

        var elasticUrl = this.Configuration["Service:ElasticsearchUri"];
        if (elasticUrl == null) throw new ConfigurationErrorsException("Elastic configuration property 'Service:ElasticsearchUri' is required'");
        var username = this.Configuration["Service:ElasticsearchUsername"];
        if (username == null) throw new ConfigurationErrorsException("Elastic configuration property 'Service:ElasticsearchUsername' is required'");
        var password = this.Configuration["Service:ElasticsearchPassword"];
        if (password == null) throw new ConfigurationErrorsException("Elastic configuration property 'Service:ElasticsearchPassword' is required'");
        services.AddHealthChecks()
            .AddElasticsearch(setup =>
                {
                    setup.UseServer(elasticUrl.ToString())
                    .UseBasicAuthentication(username, password);
                },
                tags: new[] { "ready", "detail" }
            );

        return services;
    }
    #endregion
}
