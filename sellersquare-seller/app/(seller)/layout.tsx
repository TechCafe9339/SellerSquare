import SellerSidebar from "@/components/SellerSidebar";
import ProtectedSeller from "@/components/ProtectedSeller";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedSeller>
      <div className="flex min-h-screen bg-gray-100">
        <SellerSidebar />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </ProtectedSeller>
  );
}