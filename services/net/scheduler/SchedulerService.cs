using Microsoft.Extensions.DependencyInjection;
using TNO.Services.Runners;
using TNO.Services.Scheduler.Config;

namespace TNO.Services.Scheduler;

/// <summary>
/// SchedulerService abstract class, provides a console application that runs service, and an api.
/// </summary>
public class SchedulerService : BaseService
{
    #region Variables
    #endregion

    #region Properties
    #endregion

    #region Constructors
    /// <summary>
    /// Creates a new instance of a SchedulerService object, initializes with arguments.
    /// </summary>
    /// <param name="args"></param>
    public SchedulerService(string[] args) : base(args)
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
            .Configure<SchedulerOptions>(this.Configuration.GetSection("Service"))
            .AddScoped<IServiceManager, SchedulerManager>();

        // TODO: Figure out how to validate without resulting in aggregating the config values.
        // services.AddOptions<SchedulerOptions>()
        //     .Bind(this.Configuration.GetSection("Service"))
        //     .ValidateDataAnnotations();

        AddCustomHealthChecks(services);

        return services;
    }

    /// <summary>
    /// Add health checks specific to this service
    /// </summary>
    /// <param name="services"></param>
    /// <returns></returns>
    protected virtual IServiceCollection AddCustomHealthChecks(IServiceCollection services)
    {
        services.AddHealthChecks().AddCheck<HealthChecks.Service.ServiceStatusHealthCheck>(
            name:"Service Baseline",
            tags: new[] { "ready", "detail" }
        );
        
        services.AddHealthChecks()
            .AddUrlGroup(
                new Uri($"{this.Configuration["Service:ApiUrl"]}/health"),
                name: "MMI API",
                tags: new[] { "ready", "detail" }
            );

        return services;
    }
    #endregion
}
