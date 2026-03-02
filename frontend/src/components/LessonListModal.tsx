import { useEffect, useState } from "react";
import { lessonApi, type Lesson } from "@/api/lessonApi";
import type { Course } from "@/types/course";
import { toast } from "sonner";
import { X, BookOpen, Loader2, Info } from "lucide-react";

interface Props {
  course: Course;
  onClose: () => void;
}

export function LessonListModal({ course, onClose }: Props) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lessonApi
      .getByCourseId(course.id)
      .then(setLessons)
      .catch(() => toast.error("Failed to load course outline"))
      .finally(() => setLoading(false));
  }, [course.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Giữ style xanh của bạn */}
        <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
               <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg uppercase tracking-tight">
                Course Outline
              </h2>
              <p className="text-blue-100 text-sm">
                {course.courseName} ({course.courseCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-4 text-blue-600" size={32} />
              <p className="animate-pulse">Fetching curriculum...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-2xl">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">No lessons published for this course yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                 <Info size={14} /> {lessons.length} Lessons in this course
               </div>
              
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1">
                      <h4 className="font-bold text-gray-800 text-base mb-1 group-hover:text-blue-600 transition-colors">
                        {lesson.lessonName}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed italic">
                        {lesson.description || "No detailed description available for this lesson."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
           >
             Close
           </button>
        </div>
      </div>
    </div>
  );
}