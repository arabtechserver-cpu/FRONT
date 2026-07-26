// Admin layout - bypasses MainLayout completely so the admin dashboard
// can render its own sidebar and chrome without nesting conflicts.
export default function AdminLayout({ children }) {
  return <>{children}</>;
}
