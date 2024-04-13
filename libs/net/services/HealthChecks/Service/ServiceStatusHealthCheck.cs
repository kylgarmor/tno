using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace TNO.Services.HealthChecks.Service
{
    public class ServiceStatusHealthCheck : IHealthCheck
    {
        #region Variables
        private readonly IServiceManager _service;
        #endregion

        public ServiceStatusHealthCheck(IServiceManager service)
            => (_service) = (service);

        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            switch (_service.State.Status) {
                case ServiceStatus.Running:
                    return Task.FromResult(
                        HealthCheckResult.Healthy("A healthy result."));
                case ServiceStatus.Sleeping:
                    return Task.FromResult(
                        new HealthCheckResult(
                            context.Registration.FailureStatus, "An unhealthy result."));
                default:
                    return Task.FromResult(
                        HealthCheckResult.Degraded("A degraded result."));
            }
        }
    }
}
