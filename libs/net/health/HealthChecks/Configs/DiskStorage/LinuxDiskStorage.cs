namespace TNO.Health.HealthChecks.Configs.DiskStorage
{

    /// <summary>
    /// 
    /// </summary>
    public class LinuxDiskStorage
    {
        #region Properties
        /// <summary>
        /// 
        /// </summary>
        public string DrivePath { get; set; } = "";

        /// <summary>
        /// 
        /// </summary>
        public string Name { get; set; } = "";

        /// <summary>
        /// 
        /// </summary>
        public int MinimumFreeMegabytes { get; set; } = 0;
        #endregion
    }
}