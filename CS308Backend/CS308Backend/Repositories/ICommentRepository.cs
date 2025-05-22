using CS308Backend.Models;

namespace CS308Backend.Repositories
{
    public interface ICommentRepository
    {
        Task<IEnumerable<Comment>> GetAllCommentsAsync();

        Task<IEnumerable<Comment>> GetCommentsByProductIdAsync(int id);

        Task<Comment> AddCommentAsync(Comment comment);

        Task<Comment> UpdateCommentAsync(Comment comment);
        Task<Comment> GetCommentByIdAsync(int id);
    }
}
