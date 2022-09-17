using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using PizzaOrderProcessor.models;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

const string stateStoreBaseUrl = "http://localhost:3500/v1.0/state/cosmosdb-state";
var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

if (app.Environment.IsDevelopment()) {app.UseDeveloperExceptionPage();}

// Register Dapr pub/sub subscriptions
app.MapGet("/dapr/subscribe", () => {
    var sub = new DaprSubscription("servicebus-pubsub", "order", "order");
    Console.WriteLine("Dapr pub/sub is subscribed to: " + sub);
    return Results.Json(new DaprSubscription[]{sub});
});

// Get order by orderId
app.MapGet("/order/{orderId}", (string orderId) => {
    // fetch order from cosmosdb state store by orderId
    var resp = httpClient.GetStringAsync($"{stateStoreBaseUrl}/{orderId.ToString()}");
    var order = JsonSerializer.Deserialize<Order>(resp.Result)!;
    return Results.Ok(order);
});

// Update order status by orderId
app.MapPost("/order/status", (DaprData<OrderStatus> requestData) => {
    var orderStatus = requestData.Data;
    // fetch order from cosmosdb state store by orderId
    var resp = httpClient.GetStringAsync($"{stateStoreBaseUrl}/{orderStatus.OrderId.ToString()}");
    var order = JsonSerializer.Deserialize<Order>(resp.Result)!;
    // update order status
    order.Status = orderStatus.Status;
    // post the updated order to cosmosdb state store
    var orderInfoJson = JsonSerializer.Serialize(
        new[] {
            new {
                key = order.OrderId.ToString(),
                value = order
            }
        }
    );
    var state = new StringContent(orderInfoJson, Encoding.UTF8, "application/json");
    httpClient.PostAsync(stateStoreBaseUrl, state);
    return Results.Ok(order);
});

// Post order
app.MapPost("/order", (DaprData<Order> requestData) => {
    var order = requestData.Data;
    order.Status ??= "created";
    // write the order information into state store
    var orderInfoJson = JsonSerializer.Serialize(
        new[] {
            new {
                key = order.OrderId.ToString(),
                value = order
            }
        }
    );
    // write into cosmosdb
    var state = new StringContent(orderInfoJson, Encoding.UTF8, "application/json");
    httpClient.PostAsync(stateStoreBaseUrl, state);
    Console.WriteLine("Saving Order: " + order);
    
    return Results.Ok();
});

await app.RunAsync();

public record DaprData<T> ([property: JsonPropertyName("data")] T Data);