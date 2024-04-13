using Microsoft.Extensions.Diagnostics.HealthChecks;
using TNO.Health.Extensions;

namespace TNO.Health.HealthChecks.LinuxDiskStorage
{

    /// <summary>
    /// LinuxDiskStorageHealthCheck class, provides methods for check linux style mount point.
    /// </summary>
    public class LinuxDiskStorageHealthCheck : IHealthCheck
  {
    private readonly LinuxDiskStorageOptions _options;

    /// <summary>
    /// Add Health Checks to the dependency injection service collection.
    /// </summary>
    /// <param name="options"></param>
    public LinuxDiskStorageHealthCheck(LinuxDiskStorageOptions options)
    {
      // _options = Guard.ThrowIfNull(options);
      _options = options;
    }

    /// <summary>
    /// perform health checks on config drive paths.
    /// </summary>
    /// <param name="context"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
      try
      {
        var configuredDrives = _options.ConfiguredPaths;

        List<string>? errorList = null;
        if (configuredDrives.Count > 0)
        {
          // var drives = DriveInfo.GetDrives();

          foreach (var (DrivePath, MinimumFreeMegabytes) in configuredDrives.Values)
          {
            var driveInfo = new DriveInfo(DrivePath);

            if (driveInfo != null)
            {
              long actualFreeMegabytes = driveInfo.AvailableFreeSpace / 1024 / 1024;
              if (actualFreeMegabytes < MinimumFreeMegabytes)
              {
                (errorList ??= new()).Add(_options.FailedDescription(DrivePath, MinimumFreeMegabytes, actualFreeMegabytes));
                if (!_options.CheckAllDrives)
                {
                  break;
                }
              }
            }
            else
            {
              (errorList ??= new()).Add(_options.FailedDescription(DrivePath, MinimumFreeMegabytes, null));
              if (!_options.CheckAllDrives)
              {
                break;
              }
            }
          }
        }

        return Task.FromResult(errorList.GetHealthState(context));
      }
      catch (Exception ex)
      {
        return Task.FromResult(new HealthCheckResult(context.Registration.FailureStatus, exception: ex));
      }
    }

  }
}