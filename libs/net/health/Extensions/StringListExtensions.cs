using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace TNO.Health.Extensions
{
  internal static class StringListExtensions
  {
    public static HealthCheckResult GetHealthState(this List<string>? instance, HealthCheckContext context)
    {
      if (instance is null || instance.Count == 0)
      {
        return HealthCheckResult.Healthy();
      }
      return new HealthCheckResult(context.Registration.FailureStatus, description: string.Join("; ", instance));
    }
  }
}
