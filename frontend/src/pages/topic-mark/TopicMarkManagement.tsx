import {DatabaseBackup, Edit } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { TrainingClass } from '@/types/trainingClass';
import GradebookTable from './GradebookTable';
import { useState } from 'react';
interface TopicMarkManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingClass: TrainingClass
}
export default function TopicMarkModal({ open, onOpenChange, trainingClass }: TopicMarkManagementProps) {
  const [isEditing, setIsEditing] = useState(false)

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
          <div className="flex items-end justify-between">
            <DialogTitle>
              Topic Mark [{trainingClass.classCode}]
            </DialogTitle>

            <div className="flex gap-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                <Edit className="mr-1 h-4 w-4" />
                {isEditing ? "Done" : "Edit"}
              </Button>

              <Button variant="outline" size="sm">
                <DatabaseBackup className="mr-1 h-4 w-4" />
                Import / Export
              </Button>
            </div>
          </div>

          {isEditing && (
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
               <Badge variant={"outline"} className='text-xs'>Editing Mode</Badge> Enter = Save • Esc = Cancel • Click outside = Auto save
            </p>
          )}
        </DialogHeader>


        {/* BODY SCROLL */}
        <div className="flex-1 pt-2 overflow-y-auto min-h-[300px]">
          <GradebookTable
            classId={trainingClass.id}
            isEditing={isEditing}
          />
        </div>

      </DialogContent>
    </Dialog>
  )
}
