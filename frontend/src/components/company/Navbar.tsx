import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="h-16 bg-[#0B1221]/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 flex items-center max-w-md relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3" />
        <Input 
          className="bg-slate-900 border-slate-800 pl-9 text-slate-300 placeholder:text-slate-600 focus-visible:ring-blue-500" 
          placeholder="Search schemes, distributors, retailers..." 
        />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Bell className="w-5 h-5" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <User className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
