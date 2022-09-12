using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace PizzaOrderProcessor.Controllers
{
    public class PizzaOrderController : Controller
    {

        private static readonly string[] OrderStatus = { "received", "acknowledged", "preparing", "ready", "delivered" };

        public static IEnumerable<Pizza>? _pizzas;

        public static string? temp;

        public static readonly Pizza samplePizza = new() { Name="SamplePizza",Count=0,Price=0 };

        private readonly ILogger<WeatherForecastController> _logger;


        public PizzaOrderController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        [Route("/PizzaOrder")]
        //public IEnumerable<Pizza> Index()
        public string Index()
        {
            if (temp == null)
            {
                IEnumerable<Pizza> samplePizzas = new Pizza[] { samplePizza, samplePizza, samplePizza };
                //return samplePizzas ;
                return "no order yet";
            }
            //return _pizzas.ToArray();
            return temp;
        }

        [HttpPost]
        [Route("/PizzaOrder/ReceiveOrder")]
        public void getOrder([FromBody] JsonObject[] items)
        {
            foreach (var item in items)
            {
                temp += item.ToString();
            }
            //_pizzas = new Pizza[pizzas.Length];
            //foreach (var pizza in pizzas)
            //{
            //    Console.WriteLine("Name: "+pizza.Name + " Price: "+ pizza.Price + "Count: " + pizza.Count);
            //    _pizzas.Append(pizza);
            //}
        }
    }
}
