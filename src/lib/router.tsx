import {
  createContext,
  useContext,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

type RouterCtx = {
  path: string;
  navigate: (to: string) => void;
};

const RouterContext = createContext<RouterCtx | null>(null);

function currentPath() {
  return typeof window === "undefined" ? "/" : window.location.pathname;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (to: string) => {
    if (to === window.location.pathname) return;
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
}

export function usePathname() {
  return useRouter().path;
}

export function useNavigate() {
  return useRouter().navigate;
}

export function Link({
  to,
  className,
  children,
  onClick,
  ...rest
}: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export function Route({
  path,
  exact = false,
  children,
}: {
  path: string;
  exact?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const match = exact ? pathname === path : pathname === path || pathname.startsWith(path);
  if (!match) return null;
  return <>{children}</>;
}
