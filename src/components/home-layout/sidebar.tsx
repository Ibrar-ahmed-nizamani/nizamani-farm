import Link from "next/link";
import { Tractor, FileText, MilkIcon } from "lucide-react";

const menuItems = [
  { icon: MilkIcon, label: "Milk", href: "/milk" },
  { icon: Tractor, label: "Tractor", href: "/tractor" },
  { icon: FileText, label: "Tractor Accounting", href: "/accounting/tractor" },
];

export function Sidebar() {
  return (
    <aside className="w-60 bg-gray-100 min-h-screen p-4">
      <h2 className="text-xl font-semibold mb-6">Farm Management</h2>
      <nav>
        <ul className="space-y-3">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex items-center gap-3 text-gray-700 hover:text-black"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
