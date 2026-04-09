"use client";

import { FormEvent, useEffect, useState } from "react";
import { JOB_CATEGORIES, INDIAN_STATES, QUALIFICATIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatSalaryRange } from "@/lib/utils";

interface JobRecord {
  _id: string;
  title: string;
  description: string;
  organization: string;
  category: string;
  jobType: "government" | "private";
  state: string;
  qualification: string;
  lastDate?: string;
  salaryMin?: number;
  salaryMax?: number;
  applyLink: string;
  source: string;
  sourceType: string;
  status: "pending" | "published" | "rejected";
  createdAt: string;
}

interface BlogRecord {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  createdAt: string;
}

const initialForm = {
  title: "",
  description: "",
  organization: "",
  category: "Other",
  jobType: "government",
  state: "All India",
  qualification: "Any",
  lastDate: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "INR",
  applyLink: "",
  source: "Manual Entry",
  status: "published"
};

type JobFormState = typeof initialForm;

const initialBlogForm = {
  title: "",
  excerpt: "",
  content: ""
};

type BlogFormState = typeof initialBlogForm;

function toOptionalNumber(value: string) {
  if (!value || !value.trim()) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

function buildJobPayload(form: JobFormState) {
  return {
    ...form,
    jobType: form.jobType === "private" ? "private" : "government",
    lastDate: form.lastDate?.trim() ? form.lastDate : undefined,
    salaryMin: toOptionalNumber(form.salaryMin),
    salaryMax: toOptionalNumber(form.salaryMax)
  };
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toEditableForm(job: JobRecord): JobFormState {
  return {
    title: job.title,
    description: job.description,
    organization: job.organization,
    category: job.category,
    jobType: job.jobType || "government",
    state: job.state,
    qualification: job.qualification,
    lastDate: toDateInputValue(job.lastDate),
    salaryMin: job.salaryMin !== undefined ? String(job.salaryMin) : "",
    salaryMax: job.salaryMax !== undefined ? String(job.salaryMax) : "",
    salaryCurrency: "INR",
    applyLink: job.applyLink,
    source: job.source,
    status: job.status === "rejected" ? "pending" : job.status
  };
}

export function AdminDashboard() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState<JobFormState>(initialForm);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<JobFormState>(initialForm);
  const [blogForm, setBlogForm] = useState<BlogFormState>(initialBlogForm);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editBlogForm, setEditBlogForm] = useState<BlogFormState>(initialBlogForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);

  function formatApiFieldErrors(errors: unknown) {
    const fieldErrors = (errors as { fieldErrors?: Record<string, unknown> } | undefined)?.fieldErrors;
    if (!fieldErrors) return "";
    return Object.entries(fieldErrors)
      .filter(([, value]) => Array.isArray(value) && value.length > 0)
      .map(([key, value]) => `${key}: ${String((value as unknown[])[0])}`)
      .join(" | ");
  }

  async function loadJobs(nextStatus = statusFilter) {
    setLoading(true);
    const response = await fetch(`/api/admin/jobs?status=${nextStatus}&limit=50`);
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Could not load jobs");
      return;
    }

    setError(null);
    setJobs(data.items || []);
  }

  async function loadBlogs() {
    setBlogsLoading(true);
    const response = await fetch("/api/admin/blogs");
    const data = await response.json().catch(() => ({}));
    setBlogsLoading(false);

    if (!response.ok) {
      setError(data.message || "Could not load blogs");
      return;
    }

    setBlogs(data.items || []);
  }

  useEffect(() => {
    setSelectedJobIds([]);
    void loadJobs(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    void loadBlogs();
  }, []);

  async function onManualAdd(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/add-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildJobPayload(form))
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const details = formatApiFieldErrors(data.errors);
      setError(details ? `${data.message || "Failed to add job"} - ${details}` : data.message || "Failed to add job");
      return;
    }

    setForm(initialForm);
    const savedType = data.job?.jobType === "private" ? "Private" : "Government";
    const savedSalary = formatSalaryRange(data.job?.salaryMin, data.job?.salaryMax, "INR");
    if (data.created) {
      setMessage(`Job saved successfully. Type: ${savedType}. Salary: ${savedSalary}.`);
    } else if (data.duplicateUpdated) {
      setMessage(`Duplicate job found. Existing record updated. Type: ${savedType}. Salary: ${savedSalary}.`);
    } else {
      setMessage("Duplicate job already exists.");
    }
    void loadJobs(statusFilter);
  }

  async function onUpdateJob(event: FormEvent) {
    event.preventDefault();
    if (!editingJobId) return;

    const response = await fetch(`/api/admin/jobs/${editingJobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildJobPayload(editForm))
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const details = formatApiFieldErrors(data.errors);
      setError(details ? `${data.message || "Update failed"} - ${details}` : data.message || "Update failed");
      return;
    }

    const savedType = data.job?.jobType === "private" ? "Private" : "Government";
    const savedSalary = formatSalaryRange(data.job?.salaryMin, data.job?.salaryMax, "INR");
    setMessage(`Job updated successfully. Type: ${savedType}. Salary: ${savedSalary}.`);
    setEditingJobId(null);
    setEditForm(initialForm);
    void loadJobs(statusFilter);
  }

  async function onAddBlog(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/add-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: blogForm.title,
        excerpt: blogForm.excerpt?.trim() ? blogForm.excerpt : undefined,
        content: blogForm.content
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const details = formatApiFieldErrors(data.errors);
      setError(details ? `${data.message || "Failed to publish blog"} - ${details}` : data.message || "Failed to publish blog");
      return;
    }

    setBlogForm(initialBlogForm);
    setMessage("Blog content posted successfully.");
    void loadBlogs();
  }

  async function onUpdateBlog(event: FormEvent) {
    event.preventDefault();
    if (!editingBlogId) return;

    setMessage(null);
    setError(null);

    const response = await fetch(`/api/admin/blogs/${editingBlogId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editBlogForm.title,
        excerpt: editBlogForm.excerpt?.trim() ? editBlogForm.excerpt : undefined,
        content: editBlogForm.content
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const details = formatApiFieldErrors(data.errors);
      setError(details ? `${data.message || "Blog update failed"} - ${details}` : data.message || "Blog update failed");
      return;
    }

    setEditingBlogId(null);
    setEditBlogForm(initialBlogForm);
    setMessage("Blog updated successfully.");
    void loadBlogs();
  }

  async function deleteBlog(id: string) {
    const response = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.message || "Blog delete failed");
      return;
    }

    if (editingBlogId === id) {
      setEditingBlogId(null);
      setEditBlogForm(initialBlogForm);
    }
    setMessage("Blog deleted.");
    void loadBlogs();
  }

  async function approveJob(id: string) {
    const response = await fetch(`/api/admin/jobs/${id}/approve`, { method: "POST" });
    if (response.ok) {
      setMessage("Job approved and published.");
      void loadJobs(statusFilter);
    }
  }

  async function deleteJob(id: string) {
    const response = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    if (response.ok) {
      setMessage("Job deleted.");
      setSelectedJobIds((old) => old.filter((item) => item !== id));
      if (editingJobId === id) {
        setEditingJobId(null);
        setEditForm(initialForm);
      }
      void loadJobs(statusFilter);
    }
  }

  function toggleJobSelection(id: string, checked: boolean) {
    setSelectedJobIds((old) => {
      if (checked) {
        if (old.includes(id)) return old;
        return [...old, id];
      }
      return old.filter((item) => item !== id);
    });
  }

  function toggleAllVisible(checked: boolean) {
    if (!checked) {
      setSelectedJobIds([]);
      return;
    }
    setSelectedJobIds(jobs.map((job) => job._id));
  }

  async function deleteSelectedPendingJobs() {
    if (selectedJobIds.length === 0) return;
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/jobs/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedJobIds })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.message || "Bulk delete failed");
      return;
    }

    setMessage(`Deleted ${data.deleted ?? 0} pending jobs.`);
    setSelectedJobIds([]);
    void loadJobs(statusFilter);
  }

  async function triggerRSSSync() {
    setMessage(null);
    setError(null);
    setSyncing(true);
    const response = await fetch("/api/admin/rss-sync", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setSyncing(false);
    if (!response.ok) {
      setError(data.message || "Source sync failed");
      return;
    }
    const totals = data.summary?.totals || {};
    const processed = totals.processed ?? 0;
    const created = totals.created ?? 0;
    const skipped = totals.skipped ?? 0;
    const errors: Array<{ source?: string; reason?: string }> = totals.errors || [];

    setMessage(`Sync complete. Processed: ${processed}, Imported: ${created}, Skipped: ${skipped}, Errors: ${errors.length}`);

    if (errors.length > 0) {
      const firstFew = errors
        .slice(0, 3)
        .map((item) => `${item.source || "source"} - ${item.reason || "unknown error"}`)
        .join(" | ");
      setError(`Some sources failed: ${firstFew}`);
    }
    void loadJobs(statusFilter);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const allVisibleSelected = jobs.length > 0 && jobs.every((job) => selectedJobIds.includes(job._id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">JobAccess India - Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={triggerRSSSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Run Source Sync"}
          </Button>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Add Manual Job</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm form={form} setForm={setForm} onSubmit={onManualAdd} submitLabel="Save Job" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Post Blog Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onAddBlog}>
            <div className="space-y-2">
              <Label>Blog Title</Label>
              <Input
                value={blogForm.title}
                onChange={(event) => setBlogForm((old) => ({ ...old, title: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Short Excerpt (optional)</Label>
              <Textarea
                value={blogForm.excerpt}
                onChange={(event) => setBlogForm((old) => ({ ...old, excerpt: event.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={blogForm.content}
                onChange={(event) => setBlogForm((old) => ({ ...old, content: event.target.value }))}
                rows={8}
                required
              />
            </div>
            <div>
              <Button type="submit">Publish Blog</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {editingBlogId ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Edit Blog</CardTitle>
            <Button
              variant="ghost"
              onClick={() => {
                setEditingBlogId(null);
                setEditBlogForm(initialBlogForm);
              }}
            >
              Cancel
            </Button>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onUpdateBlog}>
              <div className="space-y-2">
                <Label>Blog Title</Label>
                <Input
                  value={editBlogForm.title}
                  onChange={(event) => setEditBlogForm((old) => ({ ...old, title: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Short Excerpt (optional)</Label>
                <Textarea
                  value={editBlogForm.excerpt}
                  onChange={(event) => setEditBlogForm((old) => ({ ...old, excerpt: event.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={editBlogForm.content}
                  onChange={(event) => setEditBlogForm((old) => ({ ...old, content: event.target.value }))}
                  rows={8}
                  required
                />
              </div>
              <div>
                <Button type="submit">Update Blog</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Manage Blogs</CardTitle>
        </CardHeader>
        <CardContent>
          {blogsLoading ? (
            <p className="text-sm text-muted-foreground">Loading blogs...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No blogs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  blogs.map((blog) => (
                    <TableRow key={blog._id}>
                      <TableCell>
                        <p className="font-medium">{blog.title}</p>
                        <p className="text-xs text-muted-foreground">/{blog.slug}</p>
                      </TableCell>
                      <TableCell>{new Date(blog.createdAt).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingBlogId(blog._id);
                            setEditBlogForm({
                              title: blog.title,
                              excerpt: blog.excerpt || "",
                              content: blog.content
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteBlog(blog._id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingJobId ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Edit Job</CardTitle>
            <Button
              variant="ghost"
              onClick={() => {
                setEditingJobId(null);
                setEditForm(initialForm);
              }}
            >
              Cancel
            </Button>
          </CardHeader>
          <CardContent>
            <JobForm form={editForm} setForm={setEditForm} onSubmit={onUpdateJob} submitLabel="Update Job" />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Manage Jobs</CardTitle>
          <div className="flex flex-wrap gap-2">
            {["pending", "published", "rejected"].map((status) => (
              <Button
                key={status}
                type="button"
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
            {statusFilter === "pending" && selectedJobIds.length > 0 ? (
              <Button type="button" variant="destructive" onClick={deleteSelectedPendingJobs}>
                Delete Selected ({selectedJobIds.length})
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading jobs...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    {statusFilter === "pending" ? (
                      <input
                        type="checkbox"
                        aria-label="Select all pending jobs"
                        checked={allVisibleSelected}
                        onChange={(e) => toggleAllVisible(e.target.checked)}
                      />
                    ) : null}
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      No jobs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job._id}>
                      <TableCell>
                        {statusFilter === "pending" ? (
                          <input
                            type="checkbox"
                            aria-label={`Select ${job.title}`}
                            checked={selectedJobIds.includes(job._id)}
                            onChange={(e) => toggleJobSelection(job._id, e.target.checked)}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.organization}</p>
                      </TableCell>
                      <TableCell>{job.jobType === "private" ? "Private" : "Government"}</TableCell>
                      <TableCell>{job.category}</TableCell>
                      <TableCell>{formatSalaryRange(job.salaryMin, job.salaryMax, "INR")}</TableCell>
                      <TableCell>
                        <Badge variant={job.status === "published" ? "success" : "outline"}>{job.status}</Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingJobId(job._id);
                            setEditForm(toEditableForm(job));
                          }}
                        >
                          Edit
                        </Button>
                        {job.status !== "published" ? (
                          <Button size="sm" onClick={() => approveJob(job._id)}>
                            Approve
                          </Button>
                        ) : null}
                        <Button size="sm" variant="destructive" onClick={() => deleteJob(job._id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface JobFormProps {
  form: JobFormState;
  setForm: React.Dispatch<React.SetStateAction<JobFormState>>;
  onSubmit: (event: FormEvent) => void;
  submitLabel: string;
}

function JobForm({ form, setForm, onSubmit, submitLabel }: JobFormProps) {
  const update = (key: keyof JobFormState) => (value: string): void => {
    setForm((old) => ({ ...old, [key]: value }));
  };

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-2 md:col-span-2">
        <Label>Title</Label>
        <Input value={form.title} onChange={(e) => update("title")(e.target.value)} required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => update("description")(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Organization</Label>
        <Input value={form.organization} onChange={(e) => update("organization")(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Apply Link</Label>
        <Input type="url" value={form.applyLink} onChange={(e) => update("applyLink")(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Last Date</Label>
        <Input type="date" value={form.lastDate} onChange={(e) => update("lastDate")(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Salary From (INR)</Label>
        <Input type="number" min="0" value={form.salaryMin} onChange={(e) => update("salaryMin")(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Salary To (INR)</Label>
        <Input type="number" min="0" value={form.salaryMax} onChange={(e) => update("salaryMax")(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.category}
          onChange={(e) => update("category")(e.target.value)}
        >
          {JOB_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Job Type</Label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.jobType}
          onChange={(e) => update("jobType")(e.target.value)}
        >
          <option value="government">Govt Job</option>
          <option value="private">Private Job</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>State</Label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.state}
          onChange={(e) => update("state")(e.target.value)}
        >
          {INDIAN_STATES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Qualification</Label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.qualification}
          onChange={(e) => update("qualification")(e.target.value)}
        >
          {QUALIFICATIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.status}
          onChange={(e) => update("status")(e.target.value)}
        >
          <option value="published">Publish now</option>
          <option value="pending">Save as pending</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Source Label</Label>
        <Input value={form.source} onChange={(e) => update("source")(e.target.value)} required />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
