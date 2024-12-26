"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  className?: string
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = React.useCallback((date: Date | undefined) => {
    onChange?.(date)
    setIsOpen(false)
  }, [onChange])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "w-full pl-3 text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(true)
          }}
        >
          {value ? format(value, "PPP") : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start" 
        side="bottom" 
        sideOffset={4}
        onClick={(e) => e.stopPropagation()}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          initialFocus
          disabled={false}
        />
      </PopoverContent>
    </Popover>
  )
} 