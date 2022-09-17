using System.Text.Json.Serialization;

namespace PizzaOrderProcessor.models;

public class OrderStatus {
    [property: JsonPropertyName("orderId")] public int OrderId { get; set; }
    [property: JsonPropertyName("status")] public  string? Status{ get; set; } 
}