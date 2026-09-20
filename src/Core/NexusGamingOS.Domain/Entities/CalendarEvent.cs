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
