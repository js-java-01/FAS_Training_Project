import React, { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { topicApi, type Topic } from "@/api/topicApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutGrid,
  Search,
  RotateCcw,
  Loader2,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermissions } from "@/hooks/usePermissions";
import TopicTable from "./TopicTable";

// ── Student Topic Card Component ──────────────────────────────────────────────
function TopicCard({ topic }: { topic: Topic }) {
  const navigate = useNavigate();
  
  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group"
      onClick={() => navigate(`/topics/${topic.id}`)}
    >
      <div className="h-40 bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center relative overflow-hidden">
        {/* Nếu topic có thumbnail thì dùng img, không thì dùng icon mặc định */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/5">
          <FileText size={48} className="text-white/60" />
        </div>
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {topic.topicCode}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {topic.topicName}
        </h3>
        
        {topic.description && (
          <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1 italic">
            {topic.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Calendar size={12} />
            <span>{topic.createdDate ? new Date(topic.createdDate).toLocaleDateString() : '-'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <User size={12} />
            <span className="truncate max-w-[80px]">{topic.createdByName || 'Admin'}</span>
          </div>
        </div>

        <button
          className="w-full py-2 text-sm font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition-all mt-4 flex items-center justify-center gap-2"
        >
          View Materials
        </button>
      </div>
    </div>
  );
}

// ── Main Management Component ────────────────────────────────────────────────
export const TopicManagement: React.FC = () => {
  const { hasPermission } = usePermissions();
  const isStudentMode = !hasPermission("COURSE_UPDATE"); // Dùng chung logic permission hoặc đổi theo dự án của bạn

  // ── Student state ──────────────────────────────────────────────────────────
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE"); // Student mặc định xem Active
  const debouncedKeyword = useDebounce(keyword, 300);

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, statusFilter]);

  const loadStudentTopics = async () => {
    try {
      setLoading(true);
      const data = await topicApi.getTopics({
        page,
        size: 12,
        keyword: debouncedKeyword || undefined,
        status: statusFilter || undefined,
      });
      setTopics(data.items);
      setTotalPages(data.pagination.totalPages);
    } catch {
      toast.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStudentMode) {
      void loadStudentTopics();
    }
  }, [page, debouncedKeyword, statusFilter, isStudentMode]);

  const resetFilters = () => {
    setKeyword("");
    setStatusFilter("ACTIVE");
  };

  // ── Admin view ─────────────────────────────────────────────────────────────
  if (!isStudentMode) {
    return (
      <MainLayout pathName={{ topics: "Topic Management" }}>
        <div className="h-full flex-1 flex flex-col gap-4">
          <TopicTable />
        </div>
      </MainLayout>
    );
  }

  // ── Student view ───────────────────────────────────────────────────────────
  return (
    <MainLayout pathName={{ topics: "Topics" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">Topic Catalog</h1>
          <p className="text-sm text-gray-500">Explore knowledge categories and materials</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search topics by name or code..."
              className="pl-8 pr-3 py-1.5 text-sm border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-600"
          >
            <option value="ACTIVE">Active Topics</option>
            <option value="INACTIVE">Archived</option>
            <option value="">All Status</option>
          </select>

          <button
            onClick={resetFilters}
            title="Reset filters"
            className="p-1.5 border rounded-md hover:bg-gray-100 text-gray-500 shrink-0 transition-colors"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Loading / Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-24 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={24} />
            Loading topics...
          </div>
        ) : topics.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
            <LayoutGrid size={56} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">No topics found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-4 pr-1 custom-scrollbar">
              {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100 shrink-0">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-1.5 text-sm font-medium border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition active:scale-95"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">
                        {page + 1}
                    </span>
                    <span className="text-sm text-gray-400">of {totalPages}</span>
                </div>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-1.5 text-sm font-medium border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition active:scale-95"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default TopicManagement;