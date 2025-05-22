using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CS308Backend.Models;
using CS308Backend.Data;

namespace CS308Backend.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly AppDbContext _context;

        public CommentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Comment>> GetAllCommentsAsync()
        {
            return await _context.Comment.ToListAsync();
        }

        public async Task<IEnumerable<Comment>> GetCommentsByProductIdAsync(int id)
        {
            return await _context.Comment
                                 .Where(c => c.ProductId == id)
                                 .ToListAsync();
        }
        public async Task<Comment> GetCommentByIdAsync(int id)
        {
            return await _context.Comment.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Comment> AddCommentAsync(Comment comment)
        {
            _context.Comment.Add(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment> UpdateCommentAsync(Comment comment)
        {
            _context.Comment.Update(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        
    }
}
