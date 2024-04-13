namespace TNO.Health.HealthChecks.Configs.OpenShiftServices
{

    /// <summary>
    /// 
    /// </summary>
    public class OpenShiftService
    {
        #region Properties
        /// <summary>
        /// 
        /// </summary>
        public string ServiceName { get; set; } = "";

        /// <summary>
        /// 
        /// </summary>
        public string Name { get; set; } = "";

        /// <summary>
        /// 
        /// </summary>
        public int HealthCheckPortOverride { get; set; } = 8081;

        /// <summary>
        /// 
        /// </summary>
        public string? HealthCheckPathOverride { get; set; }

        /// <summary>
        /// Only used for local testing
        /// </summary>
        public string? HealthCheckUrlOverride { get; set; }
        #endregion
    }
}