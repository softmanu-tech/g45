






// src/app/(dashboard)/leader/events/create/page.tsx
"use client"
import { CreateEventForm } from "@/components/CreateEventForm"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function CreateEventPage() {
    return (
        <div className="min-h-screen bg-blue-300 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/leader/events">
                        <Button variant="outline" size="icon" className="bg-white/80 hover:bg-white/90 border-blue-300">
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-blue-800">Create New Event</h1>
                </div>

                <CreateEventForm
                    onEventCreated={(event) => {
                        window.location.href = `/leader/events`
                    }}
                />
            </div>
        </div>
    )
}

//////////////////////////////////////////////////////