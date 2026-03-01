import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { TrainingClass } from '@/types/trainingClass';
import GradebookTable from './GradebookTable';
interface TopicMarkManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingClass: TrainingClass
}
export default function TopicMarkModal({ open, onOpenChange, trainingClass }: TopicMarkManagementProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
         className="
           w-screen
           h-screen
           max-h-[calc(98dvh)]
           max-w-screen
           min-w-[94%]
           min-h-[600px]
           flex flex-col
           data-[state=open]:!zoom-in-0 data-[state=open]:duration-600
         "
       >

        {/* HEADER FIXED */}
        <DialogHeader className="border-b pr-4 py-4 text-left flex flex-col gap-1">
          <DialogTitle>
            Topic Mark [{trainingClass.classCode}]
          </DialogTitle>
        </DialogHeader>


        {/* BODY SCROLL */}
        <div className="flex-1 pt-2 overflow-y-auto min-h-[300px]">
          <GradebookTable
            classId={trainingClass.id}
          />
        </div>

      </DialogContent>

    </Dialog>
  )
}
