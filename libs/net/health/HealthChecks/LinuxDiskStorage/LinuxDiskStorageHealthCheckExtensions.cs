using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;

namespace TNO.Health.HealthChecks.LinuxDiskStorage
{
    /// <summary>
    /// 
    /// </summary>
    public static class LinuxDiskStorageHealthCheckExtensions
    {
        private const string HEALTH_CHECK_NAME = "linuxdiskstorage";

        /// <summary>
        /// Add a health check for disk storage.
        /// </summary>
        /// <param name="builder">The <see cref="IHealthChecksBuilder"/>.</param>
        /// <param name="setup">The action method to configure the health check parameters.</param>
        /// <param name="name">The health check name. Optional. If <c>null</c> the type name 'linuxdiskstorage' will be used for the name.</param>
        /// <param name="failureStatus">
        /// The <see cref="HealthStatus"/> that should be reported when the health check fails. Optional. If <c>null</c> then
        /// the default status of <see cref="HealthStatus.Unhealthy"/> will be reported.
        /// </param>
        /// <param name="tags">A list of tags that can be used to filter sets of health checks. Optional.</param>
        /// <param name="timeout">An optional <see cref="TimeSpan"/> representing the timeout of the check.</param>
        /// <returns>The specified <paramref name="builder"/>.</returns>
        public static IHealthChecksBuilder AddLinuxDiskStorageHealthCheck(
            this IHealthChecksBuilder builder,
            Action<LinuxDiskStorageOptions>? setup,
            string? name = default,
            HealthStatus? failureStatus = default,
            IEnumerable<string>? tags = default,
            TimeSpan? timeout = default)
        {
            var options = new LinuxDiskStorageOptions();
            setup?.Invoke(options);

            return builder.Add(new HealthCheckRegistration(
                name ?? HEALTH_CHECK_NAME,
                sp => new LinuxDiskStorageHealthCheck(options),
                failureStatus,
                tags,
                timeout));
        }
    }
}
