import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/UserList.css";

const UserList = ({ refreshTrigger, onEditUser, searchTerm }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Fetch users from API or use local storage
  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  // Filter users when searchTerm changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.favorites.some((fav) =>
            fav.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Try to get users from local storage first
      const localUsers = localStorage.getItem("users");

      if (localUsers) {
        // If we have users in local storage, use them
        setUsers(JSON.parse(localUsers));
        setLoading(false);
      }

      // Try to fetch from API
      try {
        const response = await axios.get("http://localhost:5000/api/users");
        const fetchedUsers = response.data;

        // Update state and local storage
        setUsers(fetchedUsers);
        localStorage.setItem("users", JSON.stringify(fetchedUsers));
        setError(null);
      } catch (apiError) {
        console.error("API Error:", apiError);
        // If we already loaded data from local storage, don't show error
        if (!localUsers) {
          setError(
            "Failed to fetch users from API. Using local data if available."
          );
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Try to delete from API
        try {
          await axios.delete(`http://localhost:5000/api/users/${id}`);
        } catch (apiError) {
          console.error("API delete error:", apiError);
          // Continue with local delete even if API fails
        }

        // Delete from local state regardless of API result
        const updatedUsers = users.filter((user) => user._id !== id);
        setUsers(updatedUsers);

        // Update local storage
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        alert("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user. Please try again.");
      }
    }
  };

  const handleEdit = (user) => {
    if (onEditUser) {
      onEditUser(user);
    }
  };

  if (loading) {
    return <div className='loading'>Loading users...</div>;
  }

  if (error && users.length === 0) {
    return <div className='error'>{error}</div>;
  }

  if (users.length === 0) {
    return (
      <div className='no-users'>
        No users found. Create a new user to get started.
      </div>
    );
  }

  if (filteredUsers.length === 0 && searchTerm) {
    return (
      <div className='no-results'>No users match your search criteria.</div>
    );
  }

  const displayUsers =
    filteredUsers.length > 0 || searchTerm ? filteredUsers : users;

  return (
    <div className='user-list'>
      <h2>User List {searchTerm && <span>- Search Results</span>}</h2>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Designation</th>
            <th>Favorites</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayUsers.map((user) => (
            <tr key={user._id || user.tempId}>
              <td>{user._id || user.tempId}</td>
              <td>{user.name}</td>
              <td>{user.gender}</td>
              <td>{user.designation}</td>
              <td>{user.favorites.join(", ")}</td>
              <td>
                <div className='action-buttons'>
                  <button className='edit-btn' onClick={() => handleEdit(user)}>
                    Edit
                  </button>
                  <button
                    className='delete-btn'
                    onClick={() => handleDelete(user._id || user.tempId)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
