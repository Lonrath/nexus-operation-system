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
