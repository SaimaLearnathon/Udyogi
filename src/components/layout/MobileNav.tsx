import { pages } from "../../config/navigation";
import { useNavigation } from "../../context/NavigationContext";

export function MobileNav() {
  const { page, goTo } = useNavigation();
  const visiblePages = pages.filter((item) => ["onboarding", "consultant", "workspace", "matching", "profile"].includes(item.id));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-base-300 bg-base-100 p-2 md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {visiblePages.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`btn btn-ghost btn-sm h-14 flex-col gap-1 text-xs ${page === item.id ? "btn-active" : ""}`}
              onClick={() => goTo(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
