"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function DashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // FETCH TASKS
  const fetchTasks = async (
    page = meta.page,
    limit = meta.limit,
    searchQuery = search,
    status = statusFilter
  ) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/tasks?page=${page}&limit=${limit}&search=${searchQuery}&status=${status}`
      );
      setTasks(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, []);

  // Auto-fetch on search input with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTasks(1, meta.limit, search, statusFilter);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // CREATE TASK
  const handleCreateTask = async () => {
    if (!title.trim()) {
      toast.error("Task title required");
      return;
    }

    try {
      setCreating(true);
      await api.post("/tasks", { title, description });
      setTitle("");
      setDescription("");
      toast.success("Task created");
      fetchTasks(1, meta.limit);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  // UPDATE TASK
  const handleUpdateTask = async (id: string) => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await api.patch(`/tasks/${id}`, {
        title: editTitle,
        description: editDescription,
      });
      toast.success("Task updated");
      setEditingTaskId(null);
      fetchTasks(meta.page, meta.limit);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update task");
    }
  };

  // TOGGLE TASK with instant UI update
  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/tasks/${id}/toggle`);
      // Optimistically update UI
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, status: task.status === "COMPLETED" ? "PENDING" : "COMPLETED" }
            : task
        )
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update task");
    }
  };

  // DELETE TASK
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted");
      fetchTasks(meta.page, meta.limit);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  };

  // PAGINATION
  const goToPage = (page: number) => fetchTasks(page, meta.limit);
  const changeLimit = (newLimit: number) => fetchTasks(1, newLimit);

  // LOGOUT
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("accessToken");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Task Manager</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Manage your productivity efficiently
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white px-5 py-2.5 rounded-xl shadow-md"
          >
            Logout
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 flex gap-4 items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task..."
            className="border border-slate-300 rounded-lg px-4 py-2 w-full"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button
            onClick={() => fetchTasks(1, meta.limit, search, statusFilter)}
            className="bg-black text-white px-5 py-2 rounded-lg"
          >
            Apply
          </button>
        </div>

        {/* Create Task */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Create New Task</h2>
          <div className="flex flex-col gap-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description (optional)"
              rows={3}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            <button
              onClick={handleCreateTask}
              disabled={creating}
              className="bg-black hover:bg-slate-800 active:scale-95 transition-all text-white py-3 rounded-xl font-medium shadow-md disabled:opacity-60"
            >
              {creating ? "Creating..." : "Add Task"}
            </button>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="text-center py-24 text-slate-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md border border-slate-200 py-24 text-center">
            <p className="text-xl text-slate-600 font-medium">No tasks yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 flex justify-between items-start hover:shadow-2xl transition"
                >
                  <div className="w-full pr-6">
                    {editingTaskId === task.id ? (
                      <div className="space-y-4">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border rounded-xl px-4 py-2"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full border rounded-xl px-4 py-2 resize-none"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleUpdateTask(task.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTaskId(null)}
                            className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p
                          className={`text-lg font-semibold ${
                            task.status === "COMPLETED"
                              ? "line-through text-slate-400"
                              : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-slate-600 mt-2">{task.description}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-3">
                          {new Date(task.createdAt).toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>

                  {editingTaskId !== task.id && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditTitle(task.title);
                          setEditDescription(task.description || "");
                        }}
                        className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleToggle(task.id)}
                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-12 bg-white border border-slate-200 rounded-2xl shadow-md p-5">
              <div className="flex items-center gap-4">
                <button
                  disabled={meta.page === 1}
                  onClick={() => goToPage(meta.page - 1)}
                  className="px-4 py-2 rounded-lg bg-slate-200 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-sm font-medium text-slate-700">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  disabled={meta.page === meta.totalPages}
                  onClick={() => goToPage(meta.page + 1)}
                  className="px-4 py-2 rounded-lg bg-slate-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>

              <select
                value={meta.limit}
                onChange={(e) => changeLimit(Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}