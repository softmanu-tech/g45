import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EventData {
  _id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
}

export default function EditEventForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/leader/events/${eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        
        const result = await response.json();
        if (result.success) {
          const eventData = result.data.event;
          setEvent(eventData);
          
          // Format date for input field (YYYY-MM-DD)
          const formattedDate = new Date(eventData.date)
            .toISOString()
            .split('T')[0];
          
          setFormData({
            title: eventData.title,
            date: formattedDate,
            location: eventData.location || '',
            description: eventData.description || ''
          });
        } else {
          setError(result.error || 'Failed to load event data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch(`/api/leader/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }
      
      const result = await response.json();
      if (result.success) {
        // Redirect to events page or show success message
        router.push('/leader/events');
        router.refresh();
      } else {
        setSubmitError(result.error || 'Failed to update event');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch(`/api/leader/events/${eventId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }
      
      const result = await response.json();
      if (result.success) {
        // Redirect to events page
        router.push('/leader/events');
        router.refresh();
      } else {
        setSubmitError(result.error || 'Failed to delete event');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading event data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Edit Event</h2>
      
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb