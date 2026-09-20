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
