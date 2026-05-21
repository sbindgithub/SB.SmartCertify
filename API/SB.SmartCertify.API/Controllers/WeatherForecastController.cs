using Microsoft.AspNetCore.Mvc;
using SB.SmartCertify.Infrastructure;

namespace SB.SmartCertify.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly SmartCertifyContext _smartCertifyContext;
        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(SmartCertifyContext smartCertifyContext, ILogger<WeatherForecastController> logger)
        {
            _smartCertifyContext = smartCertifyContext;
            _logger = logger;
        }

        [HttpGet(Name = "GetWeatherForecast")]
        public IActionResult Get()
        {
            //return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            //{
            //    Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            //    TemperatureC = Random.Shared.Next(-20, 55),
            //    Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            //})
            //.ToArray();

            var model=_smartCertifyContext.UserProfiles.ToList();    
            return Ok(model);
        }
    }
}
