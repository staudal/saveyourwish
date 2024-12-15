"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  id?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

export function DatePicker({ id, selected, onSelect }: DatePickerProps) {
  console.log("DatePicker render - selected:", selected);

  const handleClear = () => {
    console.log("Clear button clicked");
    if (onSelect) {
      console.log("Calling onSelect with undefined");
      onSelect(undefined);
    } else {
      console.log("No onSelect handler provided");
    }
  };

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal pr-10",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? format(selected, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              console.log("Calendar onSelect:", date);
              onSelect?.(date);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {selected && (
        <div
          className="absolute right-0 top-0 h-full flex items-center pr-3"
          onClick={(e) => {
            console.log("Clear div clicked");
            e.preventDefault();
            e.stopPropagation();
            handleClear();
          }}
        >
          <X
            className="h-4 w-4 hover:text-foreground text-muted-foreground cursor-pointer"
            onClick={(e) => {
              console.log("X icon clicked");
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            }}
          />
        </div>
      )}
    </div>
  );
}
