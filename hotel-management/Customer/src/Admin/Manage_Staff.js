import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000";

function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Receptionist",
    shift: "Morning",
    password: ""
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      const res = await fetch(`${API}/api/admin/staff`);
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await fetch(`${API}/api/admin/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      setForm({ name: "", email: "", phone: "", role: "Receptionist", shift: "Morning", password: "" });
      setShowForm(false);
      fetchStaff();
    } catch (err) {
      console.error("Error creating staff:", err);
    }
  }

  async function disableStaff(id) {
    if (!window.confirm("Are you sure you want to disable this staff?")) return;
    await fetch(`${API}/api/admin/staff/${id}`, { method: "DELETE" });
    fetchStaff();
  }

  // Filter staff based on search input
  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col sticky top-0 h-screen">
        <h1 className="text-2xl font-bold mb-10 text-indigo-400">AdminPanel</h1>
        <nav className="space-y-2">
          {["Dashboard", "Manage Room", "Manage Booking", "Manage User", "Manage Staff", "Manage Cheif" , "Waiter"].map((item) => (
            <Link
              key={item}
              to={`/admin/${item.toLowerCase().replace(" ", "-")}`}
              className={`block px-4 py-3 rounded-xl text-sm transition-all ${
                item === "Manage Staff" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Staff Management</h2>
            <p className="text-slate-500">View, search, and add members to your team.</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200"
          >
            + Add New Staff
          </button>
        </div>

        {/* SEARCH & TABLE CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* SEARCH BAR */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-semibold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Staff Details</th>
                  <th className="px-6 py-4">Shift</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((s) => (
                  <tr key={s._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm text-indigo-600">#{s.staffId}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.role} • {s.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 font-medium">{s.shift}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block ${
                        s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {s.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => disableStaff(s._id)}
                        disabled={!s.isActive}
                        className={`font-bold text-sm underline decoration-2 underline-offset-4 transition-all ${
                          s.isActive ? "text-rose-500 hover:text-rose-700" : "text-slate-300 no-underline cursor-not-allowed"
                        }`}
                      >
                        {s.isActive ? "Disable Staff" : "Disabled"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStaff.length === 0 && (
              <div className="p-10 text-center text-slate-400">No staff members found matching "{searchTerm}"</div>
            )}
          </div>
        </div>

        {/* MODAL OVERLAY */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
              onClick={() => setShowForm(false)}
            ></div>
            
            {/* Modal Box */}
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative shadow-2xl scale-up-center border border-slate-100">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Add New Member</h3>
                <p className="text-slate-500 text-sm">Fill in the details to register a new staff member.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Role</label>
                    <select name="role" value={form.role} onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option>Receptionist</option>
                      <option>Housekeeping</option>
                      <option>Manager</option>
                      <option>Maintenance</option>
                      <option>Manage Chef</option>
                      <option>Waiter</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Shift</label>
                    <select name="shift" value={form.shift} onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option>Morning</option>
                      <option>Evening</option>
                      <option>Night</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-transform active:scale-95"
                  >
                    Register Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageStaff;