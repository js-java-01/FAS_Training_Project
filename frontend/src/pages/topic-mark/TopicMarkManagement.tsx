import { DatabaseBackup, Edit } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
        <DialogHeader className="border-b px-4 pt-6 pb-4 text-left flex flex-row items-end justify-between">
          <DialogTitle>Topic Mark [{trainingClass.classCode}]</DialogTitle>
          <div className='flex gap-2'>
            <Button variant={"outline"} size={"sm"}> <Edit /> Edit</Button>
            <Button variant={"outline"} size={"sm"}> <DatabaseBackup/> Import / Export</Button>
        </div>
        </DialogHeader>


        {/* BODY SCROLL */}
        <div className="flex-1 pt-2 overflow-y-auto min-h-[300px]">
          <GradebookTable classId={trainingClass.id} />
        </div>

      </DialogContent>
    </Dialog>
  )
}
