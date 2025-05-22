using CS308Backend.Models;

namespace CS308Backend.Repositories
{
    public interface IRatingRepository
    {
        Task<IEnumerable<Rating>> GetAllRatingsAsync();

        Task<IEnumerable<Rating>> GetRatingsByProductIdAsync(int id);

        Task<Rating> AddRatingAsync(Rating rating);

    }
}
