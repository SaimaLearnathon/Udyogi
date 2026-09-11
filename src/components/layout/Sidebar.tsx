import { pages } from "../../config/navigation";
import { useNavigation } from "../../context/NavigationContext";

export function Sidebar() {
  const { page, goTo } = useNavigation();

  return (
    <aside className="hidden w-64 border-r border-base-300 bg-base-100 p-4 md:block">
      <div className="mb-8">
        <p className="text-2xl font-bold">Uddogi</p>
        <p className="text-sm text-base-content/60">ধারণা থেকে দল গঠন</p>
      </div>
      <nav className="space-y-1">
        {pages.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`btn btn-ghost w-full justify-start ${page === item.id ? "btn-active" : ""}`}
              onClick={() => goTo(item.id)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
