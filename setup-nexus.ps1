Write-Host "Eski kalintilar temizleniyor..." -ForegroundColor Yellow
Remove-Item -Recurse -Force src -ErrorAction SilentlyContinue
Remove-Item -Force NexusGamingOS.sln -ErrorAction SilentlyContinue

Write-Host "NexusGamingOS Mimarisi Olusturuluyor..." -ForegroundColor Cyan

# 1. Solution ve Katmanlari Olustur
dotnet new sln -n NexusGamingOS
dotnet new classlib -o src/Core/NexusGamingOS.Domain
dotnet new classlib -o src/Core/NexusGamingOS.Application
dotnet new classlib -o src/Infrastructure/NexusGamingOS.Infrastructure
dotnet new webapi -o src/Presentation/NexusGamingOS.API

# 2. Projeleri Solution'a Dahil Et
dotnet sln add src/Core/NexusGamingOS.Domain
dotnet sln add src/Core/NexusGamingOS.Application
dotnet sln add src/Infrastructure/NexusGamingOS.Infrastructure
dotnet sln add src/Presentation/NexusGamingOS.API

# 3. Clean Architecture Bagimliliklarini Olustur
dotnet add src/Core/NexusGamingOS.Application reference src/Core/NexusGamingOS.Domain
dotnet add src/Infrastructure/NexusGamingOS.Infrastructure reference src/Core/NexusGamingOS.Application
dotnet add src/Presentation/NexusGamingOS.API reference src/Infrastructure/NexusGamingOS.Infrastructure
dotnet add src/Presentation/NexusGamingOS.API reference src/Core/NexusGamingOS.Application

# 4. Gerekli Temel Paketleri Ekle
dotnet add src/Core/NexusGamingOS.Application package MediatR
dotnet add src/Presentation/NexusGamingOS.API package Swashbuckle.AspNetCore

# 5. Klasor Yapilarini Hazirla
New-Item -ItemType Directory -Force -Path "src/Core/NexusGamingOS.Domain/Common"
New-Item -ItemType Directory -Force -Path "src/Core/NexusGamingOS.Domain/Enums"
New-Item -ItemType Directory -Force -Path "src/Core/NexusGamingOS.Domain/ValueObjects"
New-Item -ItemType Directory -Force -Path "src/Core/NexusGamingOS.Domain/Entities"
New-Item -ItemType Directory -Force -Path "src/Core/NexusGamingOS.Application/Common/Interfaces"
New-Item -ItemType Directory -Force -Path "src/Core/NexusGamingOS.Application/Events/Commands"
New-Item -ItemType Directory -Force -Path "src/Infrastructure/NexusGamingOS.Infrastructure/Persistence"

Remove-Item -Path "src/Core/NexusGamingOS.Domain/Class1.cs" -ErrorAction SilentlyContinue
Remove-Item -Path "src/Core/NexusGamingOS.Application/Class1.cs" -ErrorAction SilentlyContinue
Remove-Item -Path "src/Infrastructure/NexusGamingOS.Infrastructure/Class1.cs" -ErrorAction SilentlyContinue

# 6. Domain Katmani Dosyalari
@'
namespace NexusGamingOS.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CreatedAtUtc { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; protected set; }
    public void MarkUpdated() => UpdatedAtUtc = DateTime.UtcNow;
}
'@ | Out-File -FilePath "src/Core/NexusGamingOS.Domain/Common/BaseEntity.cs" -Encoding utf8

@'
namespace NexusGamingOS.Domain.Enums;

public enum GameType { GeneralLife = 0, Academic = 1, Work = 2, WorldOfWarcraft = 10, WoWForever = 11, Metin2 = 20, Diablo4 = 30 }
public enum EventPriority { Low = 0, Medium = 1, High = 2, RaidBoss = 3 }
public enum RpgStatType { Intellect = 0, Agility = 1, Strength = 2, Wisdom = 3, Stamina = 4 }
public enum GoalStatus { Active = 0, Completed = 1, Paused = 2, Failed = 3 }
'@ | Out-File -FilePath "src/Core/NexusGamingOS.Domain/Enums/DomainEnums.cs" -Encoding utf8

@'
namespace NexusGamingOS.Domain.ValueObjects;

public record DateRange
{
    public DateTime StartUtc { get; }
    public DateTime EndUtc { get; }
    public TimeSpan Duration => EndUtc - StartUtc;

    public DateRange(DateTime startUtc, DateTime endUtc)
    {
        if (endUtc < startUtc) throw new ArgumentException("Bitis zamani baslangictan once olamaz.");
        StartUtc = startUtc;
        EndUtc = endUtc;
    }
    public bool OverlapsWith(DateRange other) => StartUtc < other.EndUtc && EndUtc > other.StartUtc;
}
'@ | Out-File -FilePath "src/Core/NexusGamingOS.Domain/ValueObjects/DateRange.cs" -Encoding utf8

@'
using NexusGamingOS.Domain.Common;
using NexusGamingOS.Domain.Enums;
using NexusGamingOS.Domain.ValueObjects;

namespace NexusGamingOS.Domain.Entities;

public class CalendarEvent : BaseEntity
{
    public string Title { get; private set; } = null!;
    public string? Description { get; private set; }
    public GameType GameType { get; private set; }
    public EventPriority Priority { get; private set; }
    public DateRange TimeSlot { get; private set; } = null!;
    public string IconKey { get; private set; } = string.Empty;
    public string ColorHex { get; private set; } = "#3B82F6";

    private CalendarEvent() { }

    public CalendarEvent(string title, GameType gameType, DateRange timeSlot, string iconKey, string colorHex, EventPriority priority = EventPriority.Medium, string? description = null)
    {
        Title = title;
        GameType = gameType;
        TimeSlot = timeSlot;
        IconKey = iconKey;
        ColorHex = colorHex;
        Priority = priority;
        Description = description;
    }

    public void Reschedule(DateRange newSlot) { TimeSlot = newSlot; MarkUpdated(); }
}
'@ | Out-File -FilePath "src/Core/NexusGamingOS.Domain/Entities/CalendarEvent.cs" -Encoding utf8

# 7. Application Katmani Dosyalari
@'
using NexusGamingOS.Domain.Entities;

namespace NexusGamingOS.Application.Common.Interfaces;

public interface ICalendarRepository
{
    Task<CalendarEvent?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<CalendarEvent>> GetEventsInRangeAsync(DateTime startUtc, DateTime endUtc, CancellationToken ct = default);
    Task AddAsync(CalendarEvent calendarEvent, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
'@ | Out-File -FilePath "src/Core/NexusGamingOS.Application/Common/Interfaces/ICalendarRepository.cs" -Encoding utf8

@'
using MediatR;
using NexusGamingOS.Application.Common.Interfaces;
using NexusGamingOS.Domain.Entities;
using NexusGamingOS.Domain.Enums;
using NexusGamingOS.Domain.ValueObjects;

namespace NexusGamingOS.Application.Events.Commands;

public record CreateCalendarEventCommand(
    string Title,
    GameType GameType,
    DateTime StartUtc,
    DateTime EndUtc,
    string IconKey,
    string ColorHex,
    EventPriority Priority = EventPriority.Medium,
    string? Description = null
) : IRequest<Guid>;

public class CreateCalendarEventHandler : IRequestHandler<CreateCalendarEventCommand, Guid>
{
    private readonly ICalendarRepository _repository;

    public CreateCalendarEventHandler(ICalendarRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(CreateCalendarEventCommand request, CancellationToken cancellationToken)
    {
        var timeSlot = new DateRange(request.StartUtc, request.EndUtc);
        var calendarEvent = new CalendarEvent(
            request.Title,
            request.GameType,
            timeSlot,
            request.IconKey,
            request.ColorHex,
            request.Priority,
            request.Description
        );

        await _repository.AddAsync(calendarEvent, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return calendarEvent.Id;
    }
}
'@ | Out-File -FilePath "src/Core/NexusGamingOS.Application/Events/Commands/CreateCalendarEventCommand.cs" -Encoding utf8

# 8. Infrastructure Katmani Dosyalari (Saf C# InMemory Repository)
@'
using System.Collections.Concurrent;
using NexusGamingOS.Application.Common.Interfaces;
using NexusGamingOS.Domain.Entities;

namespace NexusGamingOS.Infrastructure.Persistence;

public class InMemoryCalendarRepository : ICalendarRepository
{
    private readonly ConcurrentDictionary<Guid, CalendarEvent> _events = new();

    public Task<CalendarEvent?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        _events.TryGetValue(id, out var calendarEvent);
        return Task.FromResult(calendarEvent);
    }

    public Task<List<CalendarEvent>> GetEventsInRangeAsync(DateTime startUtc, DateTime endUtc, CancellationToken ct = default)
    {
        var matches = _events.Values
            .Where(e => e.TimeSlot.StartUtc >= startUtc && e.TimeSlot.EndUtc <= endUtc)
            .ToList();
        return Task.FromResult(matches);
    }

    public Task AddAsync(CalendarEvent calendarEvent, CancellationToken ct = default)
    {
        _events[calendarEvent.Id] = calendarEvent;
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct = default) => Task.CompletedTask;
}
'@ | Out-File -FilePath "src/Infrastructure/NexusGamingOS.Infrastructure/Persistence/PersistenceSetup.cs" -Encoding utf8

# 9. API Katmani (Program.cs)
@'
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
'@ | Out-File -FilePath "src/Presentation/NexusGamingOS.API/Program.cs" -Encoding utf8

Write-Host "Proje basariyla olusturuldu! Derleme baslatiliyor..." -ForegroundColor Green
dotnet build