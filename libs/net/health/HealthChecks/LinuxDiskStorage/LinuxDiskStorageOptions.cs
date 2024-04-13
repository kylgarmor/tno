namespace TNO.Health.HealthChecks.LinuxDiskStorage
{
  /// <summary>
  /// DiskStorageOptions class, provides methods for adding drive paths to monitor.
  /// </summary>
  public class LinuxDiskStorageOptions
  {
    internal Dictionary<string, (string DrivePath, long MinimumFreeMegabytes)> ConfiguredPaths { get; } = new();

    /// <summary>
    /// Add a drive path to monitor.
    /// </summary>
    /// <param name="drivePath"></param>
    /// <param name="minimumFreeMegabytes"></param>
    /// <returns></returns>
    public LinuxDiskStorageOptions AddDrive(string drivePath, long minimumFreeMegabytes = 1)
    {
      ConfiguredPaths.Add(drivePath, (drivePath, minimumFreeMegabytes));
      return this;
    }

    /// <summary>
    /// 
    /// </summary>
    public bool CheckAllDrives { get; set; }

    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    public LinuxDiskStorageOptions WithCheckAllDrives()
    {
      CheckAllDrives = true;
      return this;
    }

    /// <summary>
    /// Allows to set custom description of the failed disk check.
    /// </summary>
    public ErrorDescription FailedDescription = (drivePath, minimumFreeMegabytes, actualFreeMegabytes)
        => actualFreeMegabytes == null
            ? $"Configured drive {drivePath} is not present on system"
            : $"Minimum configured megabytes for disk {drivePath} is {minimumFreeMegabytes:n0} but actual free space is {actualFreeMegabytes:n0} megabytes";

    /// <summary>
    /// Allows to set custom description of the failed disk check.
    /// </summary>
    public delegate string ErrorDescription(string drivePath, long minimumFreeMegabytes, long? actualFreeMegabytes);
  }
}
