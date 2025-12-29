import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";

export default function User() {
  const { token, logout, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newUser, setNewUser] = useState({ email: "", username: "", password: "" });
  const [editUser, setEditUser] = useState({ id: "", role: "" });

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/admin/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return setLoading(false);

      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* -------------------------------
        CREATE USER (ADMIN)
  ------------------------------- */
  const handleCreateUser = async () => {
    const res = await fetch(`${API}/admin/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    });

    const data = await res.json();

    if (res.ok) {
      setShowCreateModal(false);
      setNewUser({ email: "", username: "", password: "" });
      fetchUsers();
    } else {
      alert(data.message);
    }
  };

  /* -------------------------------
        UPDATE USER ROLE
  ------------------------------- */
  const handleUpdateUser = async () => {
    const res = await fetch(`${API}/admin/update-user/${editUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: editUser.role }),
    });

    if (res.ok) {
      setShowEditModal(false);
      fetchUsers();
    }
  };

  /* -------------------------------
        DELETE USER
  ------------------------------- */
  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const res = await fetch(`${API}/admin/delete-user/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) fetchUsers();
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <button
          onClick={logout}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
        >
          Logout
        </button>
      </div>

      {/* Permission Check */}
      {user?.role !== "admin" ? (
        <div className="p-4 bg-red-100 border border-red-300 rounded text-red-700">
          <p><strong>Access Denied:</strong> Only administrators can view all users.</p>
        </div>
      ) : (
        <>
          {/* Create Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
            >
              + Create User
            </button>
          </div>

          {/* User Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden border">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-medium">All Users</h3>
            </div>

            {loading ? (
              <p className="p-4 text-gray-500">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2 text-left">Email</th>
                      <th className="border px-4 py-2 text-left">Username</th>
                      <th className="border px-4 py-2 text-left">Role</th>
                      <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="border px-4 py-2">{u.email}</td>
                        <td className="border px-4 py-2">{u.username}</td>
                        <td className="border px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="border px-4 py-2 space-x-2">
                          <button
                            onClick={() => {
                              setEditUser({ id: u.id, role: u.role });
                              setShowEditModal(true);
                            }}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-400"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteUser(u.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-3 text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ------------------ CREATE USER MODAL ------------------ */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-xl w-96">
                <h3 className="text-xl font-semibold mb-4">Create User</h3>

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded mb-2"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />

                <input
                  type="text"
                  placeholder="Username"
                  className="w-full p-2 border rounded mb-2"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                />

                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-2 border rounded mb-4"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateUser}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------ EDIT ROLE MODAL ------------------ */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-xl w-80">
                <h3 className="text-xl font-semibold mb-4">Edit User Role</h3>

                <select
                  className="w-full p-2 border rounded mb-4"
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleUpdateUser}
                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
}
    