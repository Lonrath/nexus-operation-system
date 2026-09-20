using MediatR;
using NexusGamingOS.Application.Common.Interfaces;
using NexusGamingOS.Application.Events.Commands;
using NexusGamingOS.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<ICalendarRepository, InMemoryCalendarRepository>();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateCalendarEventCommand).Assembly));

builder.Services.AddCors(opt => opt.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.MapPost("/api/events", async (CreateCalendarEventCommand command, ISender sender) =>
{
    var id = await sender.Send(command);
    return Results.Created($"/api/events/{id}", new { Id = id });
});

app.MapGet("/api/events", async (DateTime start, DateTime end, ICalendarRepository repo) =>
{
    var events = await repo.GetEventsInRangeAsync(start, end);
    return Results.Ok(events);
});

app.Run();
