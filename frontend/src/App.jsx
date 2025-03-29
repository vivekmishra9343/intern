import { useState } from "react";
import UserForm from "./components/UserForm";
import UserList from "./components/UserList";
import "./App.css";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshUsers = () => {
    // Increment to trigger a refresh in the UserList component
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    // Scroll to the form when editing
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className='app-container'>
      <h1>User Management System</h1>
      <UserForm
        fetchUsers={refreshUsers}
        editingUser={editingUser}
        onCancelEdit={handleCancelEdit}
      />

      <div className='search-container'>
        <input
          type='text'
          placeholder='Search by name, designation...'
          value={searchTerm}
          onChange={handleSearch}
          className='search-input'
        />
      </div>

      <UserList
        refreshTrigger={refreshTrigger}
        onEditUser={handleEditUser}
        searchTerm={searchTerm}
      />
    </div>
  );
}

export default App;
