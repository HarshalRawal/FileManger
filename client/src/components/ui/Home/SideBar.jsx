import React from 'react'
import { Button } from "@/components/ui/button"
import { HardDrive, Clock, Star, Trash2 } from "lucide-react"
const SideBar = () => {
    return (
        (<div className="w-64 h-full bg-white border-r flex flex-col">
          {/* Navigation */}
          <nav className="mt-6 flex-1">
            <ul className="space-y-1 px-3">
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-medium text-blue-600"
                  size="sm">
                  <HardDrive className="mr-2 h-4 w-4" />
                  My Drive
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-gray-700" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Recent
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-gray-700" size="sm">
                  <Star className="mr-2 h-4 w-4" />
                  Starred
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-gray-700" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Trash
                </Button>
              </li>
            </ul>
          </nav>
        </div>)
      );
}

export default SideBar