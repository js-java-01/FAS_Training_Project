import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { topicApi } from "@/api/topicApi";
import { TopicDetail } from "../components/TopicDetail";
import { toast } from "sonner";

const TopicDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<any>();
  const [loading, setLoading] = useState(true);

  const loadTopic = async () => {
    try {
      const data = await topicApi.getTopicById(id!);
      setTopic(data);
    } catch {
      toast.error("Failed to load topic");
      navigate("/topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) loadTopic(); }, [id]);

  return (
    <MainLayout pathName={id ? { topics: "Topic", [id]: topic?.topicName ?? "Detail" } : undefined}>
      {loading ? <div className="p-6">Loading...</div> : <TopicDetail topic={topic} onBack={() => navigate("/topics")} onRefresh={loadTopic} />}
    </MainLayout>
  );
};
export default TopicDetailPage;