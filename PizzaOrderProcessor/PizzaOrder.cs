namespace PizzaOrderProcessor
{
    public class Pizza
    {
        public string? Name { get; set; }

        public double ? Price { get; set; }

        public int Count { get; set; }
    }



    public class PizzaOrder
    { 

        public IEnumerable<Pizza>? TotalOrder { get; set; }

        public int ID { get; set; }

        public string ?status { get; set; }
    }
}
