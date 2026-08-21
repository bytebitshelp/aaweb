import { useEffect, useState } from 'react'
import { Calendar, Plus, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase, fetchPublicWorkshops } from '../../lib/supabase'

const emptyForm = {
  name: '',
  description: '',
  date: '',
  image_url: '',
  is_upcoming: true,
}

const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const WorkshopManager = () => {
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const loadWorkshops = async () => {
    try {
      setLoading(true)
      const data = await fetchPublicWorkshops()
      setWorkshops(data || [])
    } catch (error) {
      toast.error(error.message || 'Could not load workshops')
      setWorkshops([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkshops()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (workshop) => {
    setEditingId(workshop.id)
    setForm({
      name: workshop.name || '',
      description: workshop.description || '',
      date: toLocalInput(workshop.date),
      image_url: workshop.image_url || '',
      is_upcoming: Boolean(workshop.is_upcoming),
    })
    setShowForm(true)
  }

  const payload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
    image_url: form.image_url.trim() || null,
    is_upcoming: Boolean(form.is_upcoming),
  })

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.description.trim() || !form.date) {
      toast.error('Name, description, and date are required')
      return
    }

    setSaving(true)
    try {
      const body = payload()
      const query = editingId
        ? supabase.from('workshops').update(body).eq('id', editingId)
        : supabase.from('workshops').insert([body])

      const { error } = await query
      if (error) throw error

      toast.success(editingId ? 'Workshop updated' : 'Workshop added')
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await loadWorkshops()
    } catch (error) {
      toast.error(error.message || 'Could not save workshop. Check RLS policies for workshops.')
    } finally {
      setSaving(false)
    }
  }

  const toggleUpcoming = async (workshop) => {
    const { error } = await supabase
      .from('workshops')
      .update({ is_upcoming: !workshop.is_upcoming })
      .eq('id', workshop.id)

    if (error) {
      toast.error(error.message || 'Could not update status')
      return
    }
    toast.success(workshop.is_upcoming ? 'Moved to past events' : 'Marked as upcoming')
    loadWorkshops()
  }

  const deleteWorkshop = async (workshop) => {
    if (!window.confirm(`Delete “${workshop.name}”?`)) return
    const { error } = await supabase.from('workshops').delete().eq('id', workshop.id)
    if (error) {
      toast.error(error.message || 'Could not delete workshop')
      return
    }
    toast.success('Workshop deleted')
    loadWorkshops()
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Workshops & events</h3>
          <p className="text-sm text-gray-500">These appear on the public Workshops page</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-1" /> Add workshop
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="p-6 border-b bg-cream/60 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{editingId ? 'Edit workshop' : 'New workshop'}</h4>
            <button type="button" onClick={() => setShowForm(false)} className="p-1 hover:bg-white rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Watercolor for beginners"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date & time *</label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                rows={3}
                className="input-field"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What students will learn"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                className="input-field"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_upcoming}
                onChange={(e) => setForm({ ...form, is_upcoming: e.target.checked })}
              />
              Upcoming (shown in the current events list)
            </label>
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create workshop'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="p-8 text-center text-gray-500">Loading workshops…</p>
      ) : workshops.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No workshops yet. Add your first event.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">Event</th>
                <th className="px-6 py-3 text-left">When</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {workshops.map((workshop) => (
                <tr key={workshop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {workshop.image_url ? (
                        <img src={workshop.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{workshop.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{workshop.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {workshop.date ? new Date(workshop.date).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${workshop.is_upcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {workshop.is_upcoming ? 'Upcoming' : 'Past'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-3 text-sm">
                      <button onClick={() => openEdit(workshop)} className="text-forest-green inline-flex items-center gap-1">
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => toggleUpcoming(workshop)} className="text-gray-700">
                        {workshop.is_upcoming ? 'Mark past' : 'Mark upcoming'}
                      </button>
                      <button onClick={() => deleteWorkshop(workshop)} className="text-red-600 inline-flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default WorkshopManager
