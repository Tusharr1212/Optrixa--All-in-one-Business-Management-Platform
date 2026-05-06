using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Optrixa.Application.Behaviors;
using Optrixa.Application.Mappings;
using System.Reflection;

namespace Optrixa.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // AutoMapper 13 syntax
        services.AddSingleton(new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
        }).CreateMapper());

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        return services;
    }
}