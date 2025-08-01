// Mock users (or fetch from DB if connected)
const mockUsers = [
    {
      id: 1,
      username: 'alice',
      name: 'Alice Anderson',
      birthday: new Date('1995-01-01'),
      joined: '2024-01-15',
      profile_picture: '/default-pfp.png',
      followerCount: 5,
      followingCount: 10,
    },
    {
      id: 2,
      username: 'bob',
      name: 'Bob Brown',
      birthday: new Date('1993-05-10'),
      joined: '2024-03-22',
      profile_picture: '/default-pfp.png',
      followerCount: 3,
      followingCount: 7,
    },
    // Add more users as needed
  ];
// Mock posts associated with users
const mockPosts = [
    {
        id: 1,
        userId: 1,
        content: 'Excited to join this platform!',
        timestamp: '2024-01-16T10:00:00Z',
        likes: 15,
        comments: 3,
    },
    {
        id: 2,
        userId: 1,
        content: 'Loving the community here!',
        timestamp: '2024-01-17T14:30:00Z',
        likes: 20,
        comments: 5,
    },
  
];

// Export mock data
module.exports = { mockUsers, mockPosts };