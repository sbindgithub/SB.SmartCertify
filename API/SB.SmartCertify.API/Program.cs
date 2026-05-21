
using Microsoft.EntityFrameworkCore;
using SB.SmartCertify.Infrastructure;
using Scalar.AspNetCore;

namespace SB.SmartCertify.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            #region Configuring Services - Start
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<SmartCertifyContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("DbContext"),
                    providerOptions => { providerOptions.EnableRetryOnFailure(); });
            });
            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            #endregion Configuring Services - End

            #region Configuring middlewares - Start

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            //if (app.Environment.IsDevelopment())
            //{
                app.MapOpenApi();
                app.MapScalarApiReference(options =>
                {
                    options.WithTitle("My API");
                    options.WithTheme(ScalarTheme.BluePlanet);
                    //options.WithSidebar(false); 
                    options.HideSidebar();
                });

            app.UseSwaggerUi(options=>
            {
                options.DocumentPath = "openapi/v1.json";
            }); 

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();

            #endregion Configuring middlewares - End
        }
    }
}
