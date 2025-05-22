namespace CS308Backend.Models
{
    public class Rating
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int ProductId { get; set; }

        public double ProductRating { get; set; }

    }
}
