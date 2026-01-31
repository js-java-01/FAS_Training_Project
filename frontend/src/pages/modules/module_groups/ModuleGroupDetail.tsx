import { MainLayout } from "@/components/layout/MainLayout.tsx";
import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs.tsx";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { b64DecodeUnicode } from "@/utils/base64.utils.ts";
import type { Menu } from "@/types/menu.ts";
import { FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { mockMenus } from "@/mocks/mockMenus.mock.ts";
import { motion, easeOut } from "framer-motion";

export default function ModuleGroupDetail() {
  const { id } = useParams<{ id: string }>();
  const [moduleGroup, setModuleGroup] = useState<Menu | null>(null);

  const parentId = id ? b64DecodeUnicode(id) : null;

  useEffect(() => {
    if (!parentId) return;

    const found = mockMenus.find((m) => m.id === parentId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModuleGroup(found ?? null);
  }, [parentId]);

  // motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: easeOut } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.995, y: 6 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.26, ease: easeOut },
    },
  };

  return (
    <MainLayout
      breadcrumb={
        <DynamicBreadcrumbs
          pathTitles={{
            moduleGroups: "Module Groups",
            ...(moduleGroup && id ? { [id]: moduleGroup.name } : {}),
          }}
        />
      }
    >
      <motion.div className={"grid grid-cols-1 gap-4"} initial="hidden" animate="visible" variants={containerVariants}>
        <div>
          <div className={"flex flex-row gap-2 items-center"}>
            <FolderOpen />
            <h1 className={"font-semibold"}>Module Group Details</h1>
          </div>
          <p className={"text-gray-500 text-[15px]"}>Overview and update history for this module group</p>
        </div>

        <div className={"grid grid-cols-[auto_1fr] gap-4"}>
          <motion.div variants={cardVariants} className="w-full">
            <Card className={"grid bg-muted min-w-[500px]"}>
              <CardHeader className={"flex flex-row gap-4 items-center"}>
                <div className={"bg-gray-200 rounded-4xl p-4 w-fit border border-gray-300 text-gray-500"}>
                  <FolderOpen />
                </div>
                <div>
                  <h1 className={"font-semibold text-lg"}>
                    {moduleGroup?.name ?? "Không đủ dữ liệu để xác minh"}
                  </h1>
                  <p className={"text-gray-500"}>ID: {moduleGroup?.id ?? "Không đủ dữ liệu để xác minh"}</p>
                </div>
              </CardHeader>

              <CardContent>
                {/* Description */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Description</h4>
                  <p className="text-sm text-gray-600">
                    {moduleGroup?.description ?? "Không đủ dữ liệu để xác minh"}
                  </p>
                </div>

                {/* Basic info row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h5 className="text-xs font-medium text-gray-600">Order</h5>
                    <div className="text-sm text-gray-700">
                      {moduleGroup?.displayOrder ?? "Không đủ dữ liệu để xác minh"}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-600">Status</h5>
                    <div className="text-sm text-gray-700">
                      {typeof moduleGroup?.isActive === "boolean"
                        ? moduleGroup!.isActive
                          ? "Active"
                          : "Inactive"
                        : "Không đủ dữ liệu để xác minh"}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-600">Created At</h5>
                    <div className="text-sm text-gray-700">
                      {moduleGroup?.createdAt ? new Date(moduleGroup.createdAt).toLocaleString() : "Không đủ dữ liệu để xác minh"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
