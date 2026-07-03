import AdminSidebar from "@/components/AdminSidebar";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>

      <div className="flex">

        <AdminSidebar />

        <main className="flex-1 bg-gray-100 min-h-screen p-6">
          {children}
        </main>

      </div>

    </AdminProtectedRoute>
  );
}