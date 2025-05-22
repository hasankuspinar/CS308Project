using Org.BouncyCastle.Utilities;

namespace CS308Backend.Models
{
    public class Comment
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int ProductId { get; set; }

        public string ProductComment { get; set; }
        
        public int Status { get; set; }
    }

    public enum CommentStatus
    {
        Disapproved,
        Default,
        Approved
    }
}
