import { DatabaseBackup, Edit } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
interface TopicMarkManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function TopicMarkModal({ open, onOpenChange }: TopicMarkManagementProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="data-[state=open]:!zoom-in-0 data-[state=open]:duration-600 flex max-h-[calc(98dvh)] h-screen max-w-screen min-w-[94%] flex-col gap-0 p-0">
        <DialogHeader className="border-b pl-6 pr-8 pt-10 pb-4 text-left flex flex-row items-end justify-between">
          <DialogTitle>Topic Mark</DialogTitle>
          <div className='flex gap-2'>
            <Button variant={"outline"} size={"sm"}> <Edit /> Edit</Button>
            <Button variant={"outline"} size={"sm"}> <DatabaseBackup/> Import / Export</Button>
        </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-6 space-y-4">
            <p>Table here...</p>
          </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  )
}
