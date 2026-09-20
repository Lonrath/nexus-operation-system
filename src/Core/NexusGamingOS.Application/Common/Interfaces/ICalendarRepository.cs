using NexusGamingOS.Domain.Entities;

namespace NexusGamingOS.Application.Common.Interfaces;

public interface ICalendarRepository
{
    Task<CalendarEvent?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<CalendarEvent>> GetEventsInRangeAsync(DateTime startUtc, DateTime endUtc, CancellationToken ct = default);
    Task AddAsync(CalendarEvent calendarEvent, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
