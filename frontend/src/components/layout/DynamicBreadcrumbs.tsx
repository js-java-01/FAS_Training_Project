import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useLocation } from "react-router-dom";
import { useActiveModuleGroups } from "@/hooks/useSidebarMenus";
import { iconMap } from "@/constants/iconMap";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";

type Props = {
  pathTitles?: Record<string, string>;
  hasPage?: boolean;
  ignorePaths?: string[];
};

function formatPath(path: string) {
  return path
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DynamicBreadcrumbs({
  pathTitles,
  hasPage = true,
  ignorePaths = [],
}: Props) {
  const location = useLocation();

  const paths = location.pathname
    .split("/")
    .filter(Boolean)
    .filter(
      (p) =>
        !ignorePaths.map((x) => x.toLowerCase()).includes(p.toLowerCase())
    );

  const { data: moduleGroups } = useActiveModuleGroups();

  const allModules = useMemo(() => {
    return moduleGroups?.flatMap((group) => group.modules) ?? [];
  }, [moduleGroups]);

  if (paths.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumb>
        <BreadcrumbList className="flex items-center text-base md:text-xl text-muted-foreground">
          {paths.map((path, index) => {
            const href = "/" + paths.slice(0, index + 1).join("/");
            const isLast = index === paths.length - 1;
            const title = pathTitles?.[path] ?? formatPath(path);

            const matchedModule = allModules.find(
              (module) => module.url === href
            );

            const iconKey: keyof typeof iconMap =
              matchedModule?.icon && matchedModule.icon in iconMap
                ? matchedModule.icon
                : "menu";

            const Icon = iconMap[iconKey];

            return (
              <BreadcrumbItem key={href} className="flex items-center">
                {index > 0 && (
                  <BreadcrumbSeparator className="mx-3">
                    <ChevronRight size={18} />
                  </BreadcrumbSeparator>
                )}

                {isLast || !hasPage ? (
                  <BreadcrumbPage className="flex items-center gap-2 font-semibold text-foreground">
                    <Icon className="h-5 w-5" />
                    <span>{title}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    asChild
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <Link to={href}>
                      <Icon className="h-5 w-5" />
                      {title}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
