import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/UserForm.css";

const UserForm = ({ fetchUsers, editingUser, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    designation: "",
    favorites: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when editing user changes
  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        gender: editingUser.gender,
        designation: editingUser.designation,
        favorites: editingUser.favorites,
      });
    } else {
      // Reset form when not editing
      setFormData({
        name: "",
        gender: "",
        designation: "",
        favorites: [],
      });
    }
    setErrors({});
  }, [editingUser]);

  const designationOptions = [
    "Developer",
    "Designer",
    "Manager",
    "Tester",
    "DevOps",
  ];
  const favoriteOptions = [
    "Reading",
    "Sports",
    "Music",
    "Movies",
    "Travel",
    "Cooking",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (checked) {
        setFormData({
          ...formData,
          favorites: [...formData.favorites, value],
        });
      } else {
        setFormData({
          ...formData,
          favorites: formData.favorites.filter((item) => item !== value),
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field when user inputs something
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender selection is required";
      alert("Please select a gender");
    }

    // Designation validation
    if (!formData.designation) {
      newErrors.designation = "Designation is required";
    }

    // Favorites validation
    if (formData.favorites.length === 0) {
      newErrors.favorites = "At least one favorite must be selected";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      alert("Please fix the errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Update existing user
        try {
          await axios.put(
            `http://localhost:5000/api/users/${editingUser._id}`,
            formData
          );
        } catch (apiError) {
          console.error("API update error:", apiError);
          // Continue with local update even if API fails
        }

        // Update in local storage regardless of API result
        updateLocalStorage(editingUser._id || editingUser.tempId, formData);

        alert("User updated successfully!");
        // Clear editing state
        if (onCancelEdit) onCancelEdit();
      } else {
        // Create new user
        let newUser = { ...formData };

        try {
          // Try to add via API
          const response = await axios.post(
            "http://localhost:5000/api/users",
            formData
          );
          newUser = response.data; // Use the user data from API (with _id)
        } catch (apiError) {
          console.error("API create error:", apiError);
          // Generate temporary ID for local storage if API fails
          newUser.tempId = "temp_" + Date.now();
        }

        // Add to local storage
        addToLocalStorage(newUser);

        alert("User created successfully!");
        // Reset form after successful submission
        setFormData({
          name: "",
          gender: "",
          designation: "",
          favorites: [],
        });
      }

      // Refresh user list
      if (fetchUsers) fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(
        `Error ${editingUser ? "updating" : "creating"} user. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to update users in local storage
  const updateLocalStorage = (userId, userData) => {
    try {
      // Get current users from local storage
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");

      // Find and update the user
      const updatedUsers = storedUsers.map((user) =>
        user._id === userId || user.tempId === userId
          ? { ...user, ...userData }
          : user
      );

      // Save back to local storage
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    } catch (err) {
      console.error("Error updating local storage:", err);
    }
  };

  // Helper function to add a new user to local storage
  const addToLocalStorage = (newUser) => {
    try {
      // Get current users from local storage
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");

      // Add the new user
      storedUsers.push(newUser);

      // Save back to local storage
      localStorage.setItem("users", JSON.stringify(storedUsers));
    } catch (err) {
      console.error("Error adding to local storage:", err);
    }
  };

  const handleCancel = () => {
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <div className='form-container'>
      <h2>{editingUser ? "Edit User" : "Create User"}</h2>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label>User ID:</label>
          <input
            type='text'
            value={
              editingUser
                ? editingUser._id || editingUser.tempId
                : "Auto-generated"
            }
            disabled
            className='form-control'
          />
          <small>Auto-increment, Primary Key</small>
        </div>

        <div className='form-group'>
          <label>Name:</label>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleChange}
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
          />
          {errors.name && <div className='error-message'>{errors.name}</div>}
        </div>

        <div className='form-group'>
          <label>Gender:</label>
          <div className='radio-group'>
            <label>
              <input
                type='radio'
                name='gender'
                value='Male'
                checked={formData.gender === "Male"}
                onChange={handleChange}
              />
              Male
            </label>
            <label>
              <input
                type='radio'
                name='gender'
                value='Female'
                checked={formData.gender === "Female"}
                onChange={handleChange}
              />
              Female
            </label>
          </div>
          {errors.gender && (
            <div className='error-message'>{errors.gender}</div>
          )}
        </div>

        <div className='form-group'>
          <label>Designation:</label>
          <select
            name='designation'
            value={formData.designation}
            onChange={handleChange}
            className={`form-control ${errors.designation ? "is-invalid" : ""}`}
          >
            <option value=''>Select Designation</option>
            {designationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.designation && (
            <div className='error-message'>{errors.designation}</div>
          )}
        </div>

        <div className='form-group'>
          <label>Favorites:</label>
          <div className='checkbox-group'>
            {favoriteOptions.map((option) => (
              <label key={option}>
                <input
                  type='checkbox'
                  name='favorites'
                  value={option}
                  checked={formData.favorites.includes(option)}
                  onChange={handleChange}
                />
                {option}
              </label>
            ))}
          </div>
          {errors.favorites && (
            <div className='error-message'>{errors.favorites}</div>
          )}
          <small>At least one required</small>
        </div>

        <div className='form-buttons'>
          <button type='submit' className='submit-btn' disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : editingUser ? "Update" : "Submit"}
          </button>

          {editingUser && (
            <button
              type='button'
              className='cancel-btn'
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserForm;
