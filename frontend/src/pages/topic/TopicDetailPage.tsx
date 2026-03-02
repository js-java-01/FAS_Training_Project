import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { topicApi } from "@/api/topicApi";
import { TopicDetail } from "./components/TopicDetail";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";

const TopicDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<any>();
  const [loading, setLoading] = useState(true);
  const { hasPermission } = usePermissions();
  
  // Kiểm tra quyền (giống Course)
  const isStudentMode = !hasPermission("COURSE_UPDATE"); 

  const loadTopic = async () => {
    try {
      setLoading(true);
      const data = await topicApi.getTopicById(id!);
      setTopic(data);
    } catch {
      toast.error("Failed to load topic detail");
      navigate("/topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadTopic();
  }, [id]);

  // Nếu là Student và bạn có trang riêng cho Student thì return ở đây
  // if (isStudentMode) return <StudentTopicDetailPage />;

  return (
    <MainLayout 
      pathName={id ? { topics: "Topic", [id]: topic?.topicName ?? "Detail" } : undefined}
      hideIcon
    >
      {loading ? (
        <div className="p-6 flex justify-center"><p>Loading...</p></div>
      ) : (
        <TopicDetail 
          topic={topic} 
          onBack={() => navigate("/topics")} 
          onRefresh={loadTopic} 
        />
      )}
    </MainLayout>
  );
};

export default TopicDetailPage;