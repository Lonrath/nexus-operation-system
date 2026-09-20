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
