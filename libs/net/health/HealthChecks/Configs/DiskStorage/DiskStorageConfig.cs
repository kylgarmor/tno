namespace TNO.Health.HealthChecks.Configs.DiskStorage;

/// <summary>
/// 
/// </summary>
public class DiskStorageConfig
{
    /// <summary>
    /// 
    /// </summary>
    public LinuxDiskStorage[] DiskStorageHealthChecks { get; set; } = Array.Empty<LinuxDiskStorage>();
}
