import Link from "next/link";
import { categories } from "@/lib/data/categories";

export function CategoryNav() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-[1320px] gap-0.5 overflow-x-auto px-5 md:px-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <div key={cat.slug} className="group relative flex-shrink-0">
            <Link
              href={`/${cat.slug === "for-you" ? "" : cat.slug}`}
              className="flex items-center gap-1.5 whitespace-nowrap border-b-[2.5px] border-transparent px-4 py-3 text-[13.5px] font-semibold text-gray-500 transition group-hover:border-indigo-600 group-hover:text-indigo-600"
            >
              {cat.label}
            </Link>

            {cat.megaMenu && (
              <div
                className="invisible absolute left-0 top-full z-[60] grid -translate-y-1.5 grid-cols-3 gap-6 rounded-b-2xl border border-gray-200 bg-white p-6 opacity-0 shadow-2xl transition
                           group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                style={{ gridTemplateColumns: "repeat(3, 180px)" }}
              >
                {cat.megaMenu.map((col) => (
                  <div key={col.title}>
                    <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-gray-400">
                      {col.title}
                    </h4>
                    {col.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-1.5 text-[13.5px] text-gray-500 transition hover:translate-x-0.5 hover:text-indigo-600"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}