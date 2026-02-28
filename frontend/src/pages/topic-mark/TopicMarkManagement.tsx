import { DatabaseBackup, Edit } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { TrainingClass } from '@/types/trainingClass';
import { mockGradebookResponse } from './mockGradebookData';
import { buildGradebookColumns } from './columns';
import GradebookTable from './GradebookTable';
interface TopicMarkManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingClass: TrainingClass
}
export default function TopicMarkModal({ open, onOpenChange, trainingClass }: TopicMarkManagementProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="data-[state=open]:!zoom-in-0 data-[state=open]:duration-600 flex flex-1 max-h-[calc(98dvh)] h-screen max-w-screen min-w-[94%] flex-col gap-0 p-0">
        <DialogHeader className="border-b pl-6 pr-8 pt-10 pb-4 text-left flex flex-row items-end justify-between">
          <DialogTitle>Topic Mark [{trainingClass.classCode}]</DialogTitle>
          <div className='flex gap-2'>
            <Button variant={"outline"} size={"sm"}> <Edit /> Edit</Button>
            <Button variant={"outline"} size={"sm"}> <DatabaseBackup/> Import / Export</Button>
        </div>
        </DialogHeader>

        <ScrollArea className="h-full p-6 flex-1 flex flex-col">
          <GradebookTable classId={trainingClass.id}/>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  )
}
