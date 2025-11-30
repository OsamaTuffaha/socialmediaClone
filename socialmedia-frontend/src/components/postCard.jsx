const PostCard = ({ username, avatarUrl, caption }) => {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "10px",
        maxWidth: "400px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
        <img
          src={avatarUrl}
          alt={username}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: "8px",
          }}
        />
        <strong>{username}</strong>
      </div>
      <p>{caption}</p>
    </div>
  );
};

export default PostCard;