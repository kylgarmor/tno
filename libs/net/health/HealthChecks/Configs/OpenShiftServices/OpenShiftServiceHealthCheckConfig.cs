namespace TNO.Health.HealthChecks.Configs.OpenShiftServices
{

    /// <summary>
    /// 
    /// </summary>
    public class OpenShiftServiceHealthCheckConfig
    {
        /// <summary>
        /// 
        /// </summary>
        public OpenShiftService[] OpenShiftServices { get; set; } = Array.Empty<OpenShiftService>();
    }
}