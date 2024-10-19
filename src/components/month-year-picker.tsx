import * as React from "react"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Component() {
  const [date, setDate] = React.useState<Date>()
  const [year, setYear] = React.useState(new Date().getFullYear())
  const [month, setMonth] = React.useState(new Date().getMonth())
  const [open, setOpen] = React.useState(false)

  const years = Array.from({ length: 10 }, (_, i) => year - 5 + i)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const handleYearChange = (selectedYear: string) => {
    setYear(parseInt(selectedYear))
    updateDate(parseInt(selectedYear), month)
  }

  const handleMonthChange = (selectedMonth: string) => {
    const monthIndex = months.indexOf(selectedMonth)
    setMonth(monthIndex)
    updateDate(year, monthIndex)
  }

  const updateDate = (year: number, month: number) => {
    const newDate = new Date(year, month)
    setDate(newDate)
  }

  const handleConfirm = () => {
    if (date) {
      // You can perform any action here with the selected date
      console.log("Selected date:", date)
    }
    setOpen(false) // Close the popover
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          onClick={() => setOpen(true)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMMM yyyy") : <span>Pick a month/year</span>}
          <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex space-x-4">
            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={months[month]} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleConfirm}
            className="w-full"
          >
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
